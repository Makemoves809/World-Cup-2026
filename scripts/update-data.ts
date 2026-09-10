/**
 * Pulls results, in-play scores, kickoff times and matchdays for the 2026/27
 * UEFA Champions League from football-data.org (v4) and writes them to
 * src/data/live.json. Run by
 * .github/workflows/update-data.yml on a schedule; the app merges live.json
 * with the manually curated data.
 *
 * Cards, goals, substitutions, and attendance all live on the `/matches/{id}`
 * detail endpoint, which football-data.org gates behind their paid "Deep
 * Data" add-on — the free tier this key is on returns none of it (confirmed
 * by running the fetch loop against 10 real finished matches: 0 cards, 0
 * goals, 0 substitutions back every time). So this script doesn't bother
 * fetching match detail from football-data.org at all; cards/substitutions/
 * attendance stay hand-curated in discipline.ts / attendance.ts.
 *
 * Goal scorers are a partial exception: while a match is actually in play (or
 * right as it finishes), see liveEvents.ts for a best-effort lookup against
 * two free sources (API-Football, ESPN's unofficial API). That's throttled
 * and scoped to "game time" only — see fetchGoalsForLiveMatches() below — so
 * it never runs as a backfill sweep over old matches.
 *
 * Usage: FOOTBALL_API_KEY=... [API_FOOTBALL_KEY=...] npx tsx scripts/update-data.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { CL_FIXTURES as matches } from "../src/data/clFixtures";
import { norm, mapTeam } from "./clubMap";
import { koKey } from "../src/lib/koKey";
import { type EventLookupCache } from "./liveEvents";

const API = "https://api.football-data.org/v4";
const COMPETITION = process.env.COMPETITION ?? "CL"; // UEFA Champions League
const KEY = process.env.FOOTBALL_API_KEY;

if (!KEY) {
  console.error("FOOTBALL_API_KEY is not set");
  process.exit(1);
}

interface KoResult {
  /** API stage, e.g. "LAST_32", "LAST_16", "QUARTER_FINALS", "FINAL". */
  stage: string;
  homeId: string;
  awayId: string;
  homeScore: number;
  awayScore: number;
  /** Team id that advanced (after extra time / penalties), if known. */
  winnerId: string | null;
  /** Penalty-shootout score, oriented home/away, when the tie went to kicks. */
  penaltiesHome?: number;
  penaltiesAway?: number;
}

interface LiveKo {
  stage: string;
  homeId: string;
  awayId: string;
  homeScore: number;
  awayScore: number;
  minute: number | null;
  /** "HT" | "ET" | "PENS" for a live tie, from status + score.duration. */
  phase: string | null;
}

/** A goal, keyed the same way as `lastEventsCheck`/`eventLookup` (see below). */
interface LiveGoal {
  matchId: string;
  team: string;
  scorer: string;
  assist: string | null;
  minute: number | null;
  extra: number | null;
  /** "REGULAR" | "OWN" | "PENALTY" */
  type: string;
}

interface LiveData {
  updatedAt: string;
  results: Record<string, [number, number]>;
  /** Kickoff time + matchday per fixture, from the feed (league phase + KO). */
  fixtures: Record<string, { utc: string; matchday: number | null }>;
  /** Official league-phase standings (position + form), straight from UEFA's feed. */
  standings: {
    clubId: string;
    position: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    gd: number;
    points: number;
    /** Recent results string like "W,D,L" when the feed supplies it. */
    form: string | null;
  }[];
  /** Top scorers — the Golden Boot race. */
  scorers: {
    name: string;
    clubId: string | null;
    goals: number;
    assists: number | null;
    penalties: number | null;
    nationality: string | null;
    position: string | null;
  }[];
  /** Finished knockout matches — used to fill the bracket. */
  koResults: KoResult[];
  /** In-play knockout scores by stage + teams (rebuilt each run). */
  liveKo: LiveKo[];
  /** In-play group scores, keyed by match id (rebuilt each run). */
  liveScores: Record<string, { home: number; away: number; minute: number | null }>;
  /** Announced attendance, keyed by match id (rarely present on the free tier). */
  attendance: Record<string, number>;
  /** Best-effort scorers, from liveEvents.ts, for matches that were live. */
  goals: LiveGoal[];
  /** matchId (our id, or `ko:` key) → ISO time of the last goal-events check. */
  lastEventsCheck: Record<string, string>;
  /** matchId → cached fixture/event ids so repeat checks skip the lookup call. */
  eventLookup: Record<string, EventLookupCache>;
}

const LIVE_PATH = new URL("../src/data/live.json", import.meta.url);
const live: LiveData = JSON.parse(readFileSync(LIVE_PATH, "utf8"));
live.fixtures = live.fixtures ?? {};
live.standings = live.standings ?? [];
live.scorers = live.scorers ?? [];
live.koResults = live.koResults ?? [];
live.liveKo = live.liveKo ?? [];
live.liveScores = live.liveScores ?? {};
live.attendance = live.attendance ?? {};
live.goals = live.goals ?? [];
live.lastEventsCheck = live.lastEventsCheck ?? {};
live.eventLookup = live.eventLookup ?? {};
const before = JSON.stringify({
  results: live.results,
  fixtures: live.fixtures,
  standings: live.standings,
  scorers: live.scorers,
  koResults: live.koResults,
  liveKo: live.liveKo,
  liveScores: live.liveScores,
  attendance: live.attendance,
  goals: live.goals,
  lastEventsCheck: live.lastEventsCheck,
  eventLookup: live.eventLookup,
});

/** The league phase (football-data: LEAGUE_STAGE; legacy GROUP_STAGE) vs. knockouts. */
const isLeague = (stage?: string) => stage === "GROUP_STAGE" || stage === "LEAGUE_STAGE";

const matchByPair = new Map<string, { id: string; reversed: boolean }>();
for (const m of matches) {
  matchByPair.set(`${m.home}|${m.away}`, { id: m.id, reversed: false });
  matchByPair.set(`${m.away}|${m.home}`, { id: m.id, reversed: true });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get(path: string, attempts = 4): Promise<any> {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(`${API}${path}`, {
        headers: { "X-Auth-Token": KEY! },
      });
      if (res.status === 429 && i < attempts) {
        await sleep(7000); // rate limited — wait out the per-minute window
        continue;
      }
      if (!res.ok) {
        throw new Error(`${path}: HTTP ${res.status} ${await res.text()}`);
      }
      return res.json();
    } catch (err) {
      // Transient network errors (dropped sockets, DNS, timeouts) are common
      // at 1-minute polling — back off and retry rather than crash the run.
      if (i >= attempts) throw err;
      console.warn(`get ${path} failed (attempt ${i}/${attempts}): ${err}`);
      await sleep(1500 * i);
    }
  }
}

const data = await get(`/competitions/${COMPETITION}/matches`);
const fdMatches: any[] = data.matches ?? [];
console.log(`API returned ${fdMatches.length} fixtures`);

/** In-play group-stage scores, rebuilt fresh each run. */
const liveScores: Record<
  string,
  { home: number; away: number; minute: number | null }
> = {};
/** In-play knockout scores, rebuilt fresh each run. */
const liveKo: LiveKo[] = [];

for (const f of fdMatches) {
  const homeId = mapTeam(f.homeTeam);
  const awayId = mapTeam(f.awayTeam);
  if (!homeId || !awayId) {
    console.warn(`Unmapped teams: ${f.homeTeam?.name} vs ${f.awayTeam?.name}`);
    continue;
  }
  const pair = matchByPair.get(`${homeId}|${awayId}`);

  // Kickoff time + matchday for every mapped league fixture — this is what
  // the Fixtures page and the .ics feed use before a ball is kicked.
  if (pair && f.utcDate) {
    live.fixtures[pair.id] = { utc: f.utcDate, matchday: f.matchday ?? null };
  }

  // Attendance is sometimes on the list object (even while in play).
  if (pair && typeof f.attendance === "number" && f.attendance > 0) {
    live.attendance[pair.id] = f.attendance;
  }

  // In-play / half-time: record the running score.
  if (f.status === "IN_PLAY" || f.status === "PAUSED") {
    const dur = f.score?.duration;
    const rawSc = f.score?.fullTime ?? {};
    const livePens = f.score?.penalties;
    // Same fullTime-folds-in-penalties quirk as finished matches (see below)
    // seems to kick in as soon as the shootout starts — subtract the running
    // penalty tally back out so this doesn't show a scored penalty as a goal.
    const sc =
      dur === "PENALTY_SHOOTOUT" && livePens?.home != null && livePens?.away != null
        ? { home: (rawSc.home ?? 0) - livePens.home, away: (rawSc.away ?? 0) - livePens.away }
        : rawSc;
    const h = sc.home ?? 0;
    const a = sc.away ?? 0;
    const minute = f.minute ?? null;
    if (pair) {
      liveScores[pair.id] = pair.reversed
        ? { home: a, away: h, minute }
        : { home: h, away: a, minute };
    } else if (f.stage && !isLeague(f.stage)) {
      // Knockout tie in progress — key by stage + teams so the bracket matches.
      const htPlayed = f.score?.halfTime?.home != null;
      const phase =
        dur === "PENALTY_SHOOTOUT"
          ? "PENS"
          : dur === "EXTRA_TIME"
          ? "ET"
          : f.status === "PAUSED"
          ? "HT"
          : htPlayed
          ? "2H"
          : "1H";
      liveKo.push({ stage: f.stage, homeId, awayId, homeScore: h, awayScore: a, minute, phase });
    }
    continue;
  }

  if (f.status !== "FINISHED") continue;
  // For a normal (non-shootout) result, `fullTime` already covers regulation
  // + extra time — that's what we want. But for a match that WENT to
  // penalties, football-data's `fullTime` is observed to fold the shootout
  // score into the total (e.g. a 1–1 draw that went 3–4 on kicks is reported
  // as fullTime 4–5 = 1+3, 1+4) — confirmed against real scorelines, and NOT
  // fixed by any other score.* field (tried regularTime, extraTime — both
  // gave wrong values too, likely different undocumented semantics). Since
  // the fold-in is exactly "+ the penalty score", subtract it back out
  // rather than lean on an unverified field.
  const pens = f.score?.penalties;
  const wentToPens =
    f.score?.duration === "PENALTY_SHOOTOUT" && pens?.home != null && pens?.away != null;
  const rawFt = f.score?.fullTime;
  const ft = wentToPens
    ? { home: rawFt.home - pens.home, away: rawFt.away - pens.away }
    : rawFt;
  if (ft?.home == null || ft?.away == null) continue;

  if (pair) {
    live.results[pair.id] = pair.reversed
      ? [ft.away, ft.home]
      : [ft.home, ft.away];
  } else if (f.stage && !isLeague(f.stage)) {
    // Knockout match — record by stage + teams so the bracket can fill in.
    const w = f.score?.winner;
    const winnerId =
      w === "HOME_TEAM" ? homeId : w === "AWAY_TEAM" ? awayId : null;
    const rec: KoResult = {
      stage: f.stage,
      homeId,
      awayId,
      homeScore: ft.home,
      awayScore: ft.away,
      winnerId,
      penaltiesHome: pens?.home ?? undefined,
      penaltiesAway: pens?.away ?? undefined,
    };
    const existing = live.koResults.find(
      (k) => k.homeId === homeId && k.awayId === awayId && k.stage === f.stage
    );
    if (existing) Object.assign(existing, rec);
    else live.koResults.push(rec);
  }
}

live.liveScores = liveScores;
live.liveKo = liveKo;

// ---- Official standings (authoritative order + form) ----
// Our own table (src/lib/clStandings.ts) computes points→GD→GF, but UEFA's
// full tiebreaker chain goes further, so prefer the feed's own ordering.
try {
  const st = await get(`/competitions/${COMPETITION}/standings`);
  const table: any[] = st.standings?.[0]?.table ?? [];
  const rows = table
    .map((r) => {
      const clubId = mapTeam(r.team);
      if (!clubId) {
        console.warn(`Unmapped in standings: ${r.team?.name}`);
        return null;
      }
      return {
        clubId,
        position: r.position,
        played: r.playedGames ?? 0,
        won: r.won ?? 0,
        drawn: r.draw ?? 0,
        lost: r.lost ?? 0,
        gf: r.goalsFor ?? 0,
        ga: r.goalsAgainst ?? 0,
        gd: r.goalDifference ?? 0,
        points: r.points ?? 0,
        form: r.form ?? null,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
  if (rows.length) live.standings = rows;
  console.log(`Standings: ${rows.length} rows`);
} catch (err) {
  console.warn(`Standings fetch failed: ${err}`);
}

// ---- Top scorers (Golden Boot) ----
try {
  const sc = await get(`/competitions/${COMPETITION}/scorers?limit=50`);
  const list: any[] = sc.scorers ?? [];
  live.scorers = list.map((s: any) => ({
    name: s.player?.name ?? "",
    clubId: mapTeam(s.team) ?? null,
    goals: s.goals ?? 0,
    assists: s.assists ?? null,
    penalties: s.penalties ?? null,
    nationality: s.player?.nationality ?? null,
    position: s.player?.section ?? s.player?.position ?? null,
  }));
  console.log(`Scorers: ${live.scorers.length}`);
} catch (err) {
  console.warn(`Scorers fetch failed: ${err}`);
}

/*
 * Goal scorers are NOT fetched here. liveEvents.ts targets the World Cup
 * (ESPN's `fifa.world` feed and API-Football league 1) and is kept only for
 * the 2030 restore; running it during a Champions League match would look up
 * the wrong competition. CL scorers come from scripts/fetch-goals.ts, which
 * reads ESPN's `uefa.champions` scoreboard and writes the same `goals` array
 * — it runs as its own (non-fatal) step right after this script.
 */

const after = JSON.stringify({
  results: live.results,
  fixtures: live.fixtures,
  standings: live.standings,
  scorers: live.scorers,
  koResults: live.koResults,
  liveKo: live.liveKo,
  liveScores: live.liveScores,
  attendance: live.attendance,
  goals: live.goals,
  lastEventsCheck: live.lastEventsCheck,
  eventLookup: live.eventLookup,
});

if (after === before) {
  console.log("No changes.");
} else {
  live.updatedAt = new Date().toISOString();
  writeFileSync(LIVE_PATH, JSON.stringify(live, null, 2) + "\n");
  console.log(
    `Updated: ${Object.keys(live.results).length} results, ${live.goals.length} goals tracked.`
  );
}
