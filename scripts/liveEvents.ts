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
    const date = dateISO.slice(0, 10);
    const data = await getJson(
      `${API_FOOTBALL_BASE}/fixtures?league=${API_FOOTBALL_WC_LEAGUE}&season=${API_FOOTBALL_SEASON}&date=${date}`,
      headers
    );
    const fixtures: any[] = data?.response ?? [];
    const hit = fixtures.find(
      (f) =>
        namesMatch(f?.teams?.home?.name ?? "", homeTeam) &&
        namesMatch(f?.teams?.away?.name ?? "", awayTeam)
    );
    if (!hit?.fixture?.id) return null;
    fixtureId = hit.fixture.id;
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

async function fetchEspnGoals(
  homeTeam: string,
  awayTeam: string,
  dateISO: string,
  cache: EventLookupCache
): Promise<{ goals: RawGoal[]; eventId?: string } | null> {
  let eventId = cache.espnEventId;

  if (!eventId) {
    const date = dateISO.slice(0, 10).replace(/-/g, "");
    const data = await getJson(`${ESPN_BASE}/scoreboard?dates=${date}`);
    const events: any[] = data?.events ?? [];
    const hit = events.find((ev) => {
      const competitors = ev?.competitions?.[0]?.competitors ?? [];
      const home =
        competitors.find((c: any) => c.homeAway === "home")?.team?.displayName ?? "";
      const away =
        competitors.find((c: any) => c.homeAway === "away")?.team?.displayName ?? "";
      return namesMatch(home, homeTeam) && namesMatch(away, awayTeam);
    });
    if (!hit?.id) return null;
    eventId = hit.id;
  }

  const summary = await getJson(`${ESPN_BASE}/summary?event=${eventId}`);
  const details: any[] =
    summary?.keyEvents ?? summary?.header?.competitions?.[0]?.details ?? [];
  const goals: RawGoal[] = details
    .filter((d: any) => d?.scoringPlay === true || /goal/i.test(d?.type?.text ?? ""))
    .map((d: any) => {
      const typeText: string = d?.type?.text ?? "";
      return {
        teamName: d?.team?.displayName ?? d?.team?.name ?? "",
        scorer:
          d?.athletesInvolved?.[0]?.displayName ?? d?.athletesInvolved?.[0]?.shortName ?? "Unknown",
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
