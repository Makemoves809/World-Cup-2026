/**
 * Best-effort live goal-scorer lookup from two free sources. football-data.org
 * (the primary results/scores feed) doesn't carry this on its free tier — see
 * the header comment in update-data.ts — so this is a separate, optional
 * layer that's only ever called while a match is actually in progress (see
 * the throttled caller in update-data.ts), never as a backfill sweep.
 *
 * Neither source below is a documented, guaranteed-stable API for this
 * competition, so every step here is defensive: a wrong assumption about the
 * response shape yields no scorers, never a thrown error. Expect this to need
 * adjustment once it's actually run against a live match.
 *
 * - API-Football (api-sports.io): free tier, 100 requests/day, needs an
 *   API_FOOTBALL_KEY. Tried first when the key is set.
 * - ESPN's unofficial site API: no key, no documented limit, but can change
 *   shape or start blocking without notice. Used as a fallback when
 *   API-Football isn't configured or comes back empty.
 */

export interface RawGoal {
  teamName: string;
  scorer: string;
  assist: string | null;
  minute: number | null;
  extra: number | null;
  /** "REGULAR" | "OWN" | "PENALTY" */
  type: string;
}

export interface EventLookupCache {
  apiFootballFixtureId?: number;
  espnEventId?: string;
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

/** Loose team-name match: normalized equality or one containing the other. */
export function namesMatch(a: string, b: string): boolean {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

async function getJson(url: string, headers?: Record<string, string>): Promise<any> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

/* ----- API-Football (api-sports.io) ----- */

const API_FOOTBALL_BASE = "https://v3.football.api-sports.io";
/** League id API-Football uses for the FIFA World Cup. */
const API_FOOTBALL_WC_LEAGUE = 1;
const API_FOOTBALL_SEASON = 2026;

async function fetchApiFootballGoals(
  key: string,
  homeTeam: string,
  awayTeam: string,
  dateISO: string,
  cache: EventLookupCache
): Promise<{ goals: RawGoal[]; fixtureId?: number } | null> {
  const headers = { "x-apisports-key": key };
  let fixtureId = cache.apiFootballFixtureId;

  if (!fixtureId) {
    const base = new Date(dateISO);
    const candidateDates = [0, -1, 1].map((offset) => {
      const d = new Date(base);
      d.setUTCDate(d.getUTCDate() + offset);
      return d.toISOString().slice(0, 10);
    });
    for (const date of candidateDates) {
      const data = await getJson(
        `${API_FOOTBALL_BASE}/fixtures?league=${API_FOOTBALL_WC_LEAGUE}&season=${API_FOOTBALL_SEASON}&date=${date}`,
        headers
      );
      const fixtures: any[] = data?.response ?? [];
      const hit = fixtures.find((f) => {
        const a = f?.teams?.home?.name ?? "";
        const b = f?.teams?.away?.name ?? "";
        return (
          (namesMatch(a, homeTeam) && namesMatch(b, awayTeam)) ||
          (namesMatch(a, awayTeam) && namesMatch(b, homeTeam))
        );
      });
      if (hit?.fixture?.id) {
        fixtureId = hit.fixture.id;
        break;
      }
    }
    if (!fixtureId) return null;
  }

  const eventsData = await getJson(
    `${API_FOOTBALL_BASE}/fixtures/events?fixture=${fixtureId}`,
    headers
  );
  const events: any[] = eventsData?.response ?? [];
  const goals: RawGoal[] = events
    .filter((e) => e?.type === "Goal")
    .map((e) => ({
      teamName: e?.team?.name ?? "",
      scorer: e?.player?.name ?? "Unknown",
      assist: e?.assist?.name ?? null,
      minute: e?.time?.elapsed ?? null,
      extra: e?.time?.extra ?? null,
      type:
        e?.detail === "Own Goal" ? "OWN" : e?.detail === "Penalty" ? "PENALTY" : "REGULAR",
    }));

  return { goals, fixtureId };
}

/* ----- ESPN (unofficial site API) ----- */

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";

const yyyymmdd = (d: Date) =>
  `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;

/**
 * Find the ESPN event id for a match. Tries the UTC kickoff date first, then
 * the day either side (ESPN's scoreboard is sometimes indexed by US local
 * date rather than UTC, which can be off by one for a late-night/early-
 * morning kickoff), and checks team order both ways (a neutral-site knockout
 * match's home/away label can differ from football-data.org's).
 */
async function findEspnEventId(homeTeam: string, awayTeam: string, dateISO: string): Promise<string | null> {
  const base = new Date(dateISO);
  const candidateDates = [0, -1, 1].map((offset) => {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + offset);
    return yyyymmdd(d);
  });

  for (const date of candidateDates) {
    const data = await getJson(`${ESPN_BASE}/scoreboard?dates=${date}`);
    const events: any[] = data?.events ?? [];
    const hit = events.find((ev) => {
      const competitors = ev?.competitions?.[0]?.competitors ?? [];
      const a = competitors[0]?.team?.displayName ?? "";
      const b = competitors[1]?.team?.displayName ?? "";
      return (
        (namesMatch(a, homeTeam) && namesMatch(b, awayTeam)) ||
        (namesMatch(a, awayTeam) && namesMatch(b, homeTeam))
      );
    });
    if (hit?.id) return hit.id;
  }
  return null;
}

/**
 * Scorer name extraction. Confirmed against a real event from production
 * (France's penalty vs Paraguay, 4 Jul 2026): ESPN's keyEvents put the
 * scorer at `participants[0].athlete.displayName`, not `athletesInvolved`
 * (that field doesn't exist on real events — the original guess here was
 * wrong). Keeps `athletesInvolved` as a fallback in case some event types
 * use a different shape, then a text-narrative parse as a last resort, and
 * logs the raw event once per match if all three miss so a real gap is
 * debuggable from the Action logs rather than a silent "Unknown".
 */
function extractScorerName(d: any, logged: Set<string>, matchKey: string): string {
  const athlete = d?.athletesInvolved?.[0];
  const direct =
    d?.participants?.[0]?.athlete?.displayName ??
    athlete?.displayName ??
    athlete?.shortName ??
    athlete?.fullName ??
    athlete?.athlete?.displayName;
  if (direct) return direct;

  // Fall back to parsing the human-readable narrative text, e.g.
  // "Goal! Paraguay 0, France 1. Kylian Mbappé (France) converts the
  // penalty...". [^\s] (not \w) so accented letters — Mbappé, Ávalos,
  // Martínez — aren't cut off mid-name; \w alone is ASCII-only in JS.
  const text: string = d?.text ?? d?.shortText ?? "";
  const afterScore = text.split(/\.\s+/)[1] ?? text;
  const beforeParen = afterScore.split("(")[0]?.trim();
  if (beforeParen && /^[A-ZÀ-ÿ][^\s]*(\s+[A-ZÀ-ÿ][^\s]*){0,3}$/.test(beforeParen)) {
    return beforeParen;
  }

  if (!logged.has(matchKey)) {
    logged.add(matchKey);
    console.warn(`Couldn't identify scorer name, raw event: ${JSON.stringify(d).slice(0, 500)}`);
  }
  return "Unknown";
}

const loggedUnknownScorers = new Set<string>();

async function fetchEspnGoals(
  homeTeam: string,
  awayTeam: string,
  dateISO: string,
  cache: EventLookupCache
): Promise<{ goals: RawGoal[]; eventId?: string } | null> {
  const eventId = cache.espnEventId ?? (await findEspnEventId(homeTeam, awayTeam, dateISO));
  if (!eventId) return null;

  const summary = await getJson(`${ESPN_BASE}/summary?event=${eventId}`);
  const details: any[] =
    summary?.keyEvents ?? summary?.header?.competitions?.[0]?.details ?? [];
  const goals: RawGoal[] = details
    .filter((d: any) => d?.scoringPlay === true || /goal/i.test(d?.type?.text ?? ""))
    .map((d: any) => {
      const typeText: string = d?.type?.text ?? "";
      return {
        teamName: d?.team?.displayName ?? d?.team?.name ?? "",
        scorer: extractScorerName(d, loggedUnknownScorers, `${eventId}`),
        assist: d?.athletesInvolved?.[1]?.displayName ?? null,
        minute: d?.clock?.value != null ? Math.floor(d.clock.value / 60) : null,
        extra: null,
        type: /own/i.test(typeText) ? "OWN" : /penalty/i.test(typeText) ? "PENALTY" : "REGULAR",
      };
    });

  return { goals, eventId };
}

/**
 * Try API-Football first (if a key is configured), then fall back to ESPN.
 * Never throws — a failure or an unrecognized response shape from either
 * source just yields no goals, same as if neither were configured at all.
 */
export async function fetchLiveGoals(
  homeTeam: string,
  awayTeam: string,
  dateISO: string,
  cache: EventLookupCache
): Promise<{ goals: RawGoal[]; cache: EventLookupCache }> {
  const apiFootballKey = process.env.API_FOOTBALL_KEY;
  if (apiFootballKey) {
    try {
      const result = await fetchApiFootballGoals(apiFootballKey, homeTeam, awayTeam, dateISO, cache);
      if (result && result.goals.length > 0) {
        return { goals: result.goals, cache: { ...cache, apiFootballFixtureId: result.fixtureId } };
      }
      if (result) {
        // Fixture found, just no goals yet — keep the fixture id cached so the
        // next check skips straight to the events call.
        cache = { ...cache, apiFootballFixtureId: result.fixtureId };
      }
    } catch (err) {
      console.warn(`API-Football lookup failed for ${homeTeam} v ${awayTeam}: ${err}`);
    }
  }

  try {
    const result = await fetchEspnGoals(homeTeam, awayTeam, dateISO, cache);
    if (result) {
      return { goals: result.goals, cache: { ...cache, espnEventId: result.eventId } };
    }
  } catch (err) {
    console.warn(`ESPN lookup failed for ${homeTeam} v ${awayTeam}: ${err}`);
  }

  return { goals: [], cache };
}
