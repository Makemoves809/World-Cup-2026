/**
 * Pulls finished results and in-play scores for the 2026 World Cup from
 * football-data.org (v4) and writes them to src/data/live.json. Run by
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
import { matches } from "../src/data/fixtures";
import { teams } from "../src/data/teams";
import { koKey } from "../src/lib/koKey";
import { fetchLiveGoals, namesMatch, type EventLookupCache } from "./liveEvents";

const API = "https://api.football-data.org/v4";
const COMPETITION = process.env.COMPETITION ?? "WC"; // FIFA World Cup
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
live.koResults = live.koResults ?? [];
live.liveKo = live.liveKo ?? [];
live.liveScores = live.liveScores ?? {};
live.attendance = live.attendance ?? {};
live.goals = live.goals ?? [];
live.lastEventsCheck = live.lastEventsCheck ?? {};
live.eventLookup = live.eventLookup ?? {};
const before = JSON.stringify({
  results: live.results,
  koResults: live.koResults,
  liveKo: live.liveKo,
  liveScores: live.liveScores,
  attendance: live.attendance,
  goals: live.goals,
  lastEventsCheck: live.lastEventsCheck,
  eventLookup: live.eventLookup,
});

/** Normalize a team/player name for matching: lowercase, no accents/symbols. */
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

/** football-data.org team names that differ from ours. */
const ALIASES: Record<string, string> = {
  southkorea: "kor",
  korearepublic: "kor",
  czechrepublic: "cze",
  turkey: "tur",
  turkiye: "tur",
  ivorycoast: "civ",
  capeverdeislands: "cpv",
  capeverde: "cpv",
  usa: "usa",
  unitedstates: "usa",
  bosniaandherzegovina: "bih",
  congodr: "cod",
  drcongo: "cod",
};

const teamIdByName = new Map<string, string>();
for (const t of teams) teamIdByName.set(norm(t.name), t.id);
for (const [k, v] of Object.entries(ALIASES)) teamIdByName.set(k, v);
const teamIdByCode = new Map(teams.map((t) => [t.code, t.id]));

/** Map a football-data team object ({ name, tla }) to our team id. */
function mapTeam(t: { name?: string; tla?: string } | null): string | undefined {
  if (!t) return undefined;
  return (
    (t.name && teamIdByName.get(norm(t.name))) ||
    (t.tla && teamIdByCode.get(t.tla)) ||
    undefined
  );
}

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

/** Matches already on record as finished before this run touches anything —
 * used below to tell a freshly-finished match (worth one goal-events check)
 * from one that's been finished for a while (never re-checked). */
const alreadyFinished = new Set<string>([
  ...Object.keys(live.results),
  ...live.koResults.map((k) => koKey(k.homeId, k.awayId)),
]);

interface GoalCandidate {
  matchId: string;
  homeId: string;
  awayId: string;
  homeName: string;
  awayName: string;
  dateISO: string;
  /** Bypasses the throttle — always checked once right as a match finishes. */
  justFinished: boolean;
}
/** Live-or-just-finished matches to check for goal events — "game time" only. */
const goalCandidates: GoalCandidate[] = [];

for (const f of fdMatches) {
  const homeId = mapTeam(f.homeTeam);
  const awayId = mapTeam(f.awayTeam);
  if (!homeId || !awayId) {
    if (f.status === "FINISHED") {
      console.warn(`Unmapped teams: ${f.homeTeam?.name} vs ${f.awayTeam?.name}`);
    }
    continue;
  }
  const pair = matchByPair.get(`${homeId}|${awayId}`);

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
    } else if (f.stage && f.stage !== "GROUP_STAGE") {
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
    goalCandidates.push({
      matchId: pair ? pair.id : koKey(homeId, awayId),
      homeId,
      awayId,
      homeName: f.homeTeam?.name ?? "",
      awayName: f.awayTeam?.name ?? "",
      dateISO: f.utcDate ?? new Date().toISOString(),
      justFinished: false,
    });
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

  const finishedMatchId = pair ? pair.id : koKey(homeId, awayId);
  if (!alreadyFinished.has(finishedMatchId)) {
    // Newly finished this run — one last check to catch a stoppage-time goal
    // the live polling window might have just missed.
    goalCandidates.push({
      matchId: finishedMatchId,
      homeId,
      awayId,
      homeName: f.homeTeam?.name ?? "",
      awayName: f.awayTeam?.name ?? "",
      dateISO: f.utcDate ?? new Date().toISOString(),
      justFinished: true,
    });
  }

  if (pair) {
    live.results[pair.id] = pair.reversed
      ? [ft.away, ft.home]
      : [ft.home, ft.away];
  } else if (f.stage && f.stage !== "GROUP_STAGE") {
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

/** Minimum gap between goal-events checks for the same still-live match. */
const EVENTS_THROTTLE_MS = 8 * 60 * 1000;

for (const c of goalCandidates) {
  const last = live.lastEventsCheck[c.matchId];
  const due =
    c.justFinished || !last || Date.now() - new Date(last).getTime() > EVENTS_THROTTLE_MS;
  if (!due) continue;

  try {
    const cache = live.eventLookup[c.matchId] ?? {};
    const { goals: raw, cache: newCache } = await fetchLiveGoals(
      c.homeName,
      c.awayName,
      c.dateISO,
      cache
    );
    live.eventLookup[c.matchId] = newCache;
    live.lastEventsCheck[c.matchId] = new Date().toISOString();

    for (const g of raw) {
      const teamId = namesMatch(g.teamName, c.homeName)
        ? c.homeId
        : namesMatch(g.teamName, c.awayName)
        ? c.awayId
        : undefined;
      if (!teamId) continue;
      const exists = live.goals.some(
        (x) =>
          x.matchId === c.matchId &&
          x.team === teamId &&
          x.scorer === g.scorer &&
          x.minute === g.minute
      );
      if (!exists) {
        live.goals.push({
          matchId: c.matchId,
          team: teamId,
          scorer: g.scorer,
          assist: g.assist,
          minute: g.minute,
          extra: g.extra,
          type: g.type,
        });
      }
    }
    if (raw.length > 0) {
      console.log(`Goal events: ${c.homeName} v ${c.awayName} — ${raw.length} found`);
    }
  } catch (err) {
    console.warn(`Goal-events check failed for ${c.homeName} v ${c.awayName}: ${err}`);
  }
}

const after = JSON.stringify({
  results: live.results,
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
