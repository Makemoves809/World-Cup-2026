/**
 * Pulls finished results, cards, goals, and substitutions for the 2026 World
 * Cup from football-data.org (v4) and writes them to src/data/live.json. Run
 * by .github/workflows/update-data.yml on a schedule; the app merges
 * live.json with the manually curated data.
 *
 * Usage: FOOTBALL_API_KEY=... npx tsx scripts/update-data.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { matches } from "../src/data/fixtures";
import { teams } from "../src/data/teams";

const API = "https://api.football-data.org/v4";
const COMPETITION = process.env.COMPETITION ?? "WC"; // FIFA World Cup
const KEY = process.env.FOOTBALL_API_KEY;

if (!KEY) {
  console.error("FOOTBALL_API_KEY is not set");
  process.exit(1);
}

interface LiveRedCard {
  player: string;
  team: string;
  matchId: string;
  minute: number | null;
  extra: number | null;
  detail: string;
}

interface LiveYellowCard {
  player: string;
  team: string;
  matchId: string;
  minute: number | null;
}

/** A goal, keyed the same way as substitutions (see `matchId` below). */
interface LiveGoal {
  matchId: string;
  team: string;
  scorer: string;
  assist: string | null;
  minute: number | null;
  extra: number | null;
  /** "REGULAR" | "OWN" | "PENALTY". */
  type: string;
}

/**
 * A substitution. `matchId` is our fixtures.ts id for group matches, or a
 * synthetic `ko:<idA>-<idB>` key (see `koKey`) for knockout ties, which have
 * no fixed id until the bracket resolves — but any two teams meet at most
 * once across the whole knockout stage, so the team-id pair alone is a safe,
 * stage-free lookup key.
 */
interface LiveSubstitution {
  matchId: string;
  team: string;
  playerOut: string;
  playerIn: string;
  minute: number | null;
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

interface LiveData {
  updatedAt: string;
  results: Record<string, [number, number]>;
  redCards: LiveRedCard[];
  /** Straight yellow cards — used to compute two-yellow suspensions. */
  yellowCards: LiveYellowCard[];
  goals: LiveGoal[];
  substitutions: LiveSubstitution[];
  /** Finished knockout matches — used to fill the bracket. */
  koResults: KoResult[];
  /** In-play knockout scores by stage + teams (rebuilt each run). */
  liveKo: LiveKo[];
  /** In-play group scores, keyed by match id (rebuilt each run). */
  liveScores: Record<string, { home: number; away: number; minute: number | null }>;
  /** Announced attendance, keyed by match id. */
  attendance: Record<string, number>;
  /** Match ids (or `ko:` keys) whose post-match events were already fetched. */
  eventsChecked: string[];
}

/** Order-free lookup key for a knockout tie — any two teams meet at most once. */
const koKey = (a: string, b: string) => `ko:${[a, b].sort().join("-")}`;

const LIVE_PATH = new URL("../src/data/live.json", import.meta.url);
const live: LiveData = JSON.parse(readFileSync(LIVE_PATH, "utf8"));
live.yellowCards = live.yellowCards ?? [];
live.goals = live.goals ?? [];
live.substitutions = live.substitutions ?? [];
live.koResults = live.koResults ?? [];
live.liveKo = live.liveKo ?? [];
live.liveScores = live.liveScores ?? {};
live.attendance = live.attendance ?? {};
const before = JSON.stringify({
  results: live.results,
  redCards: live.redCards,
  yellowCards: live.yellowCards,
  goals: live.goals,
  substitutions: live.substitutions,
  koResults: live.koResults,
  liveKo: live.liveKo,
  liveScores: live.liveScores,
  attendance: live.attendance,
  eventsChecked: live.eventsChecked,
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

/** Our match id → football-data match id, for finished matches we can map. */
const finishedApi = new Map<string, number>();
/** `ko:` key → football-data match id, for finished knockout ties. */
const finishedKoApi = new Map<string, number>();
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
    const sc = f.score?.fullTime ?? {};
    const h = sc.home ?? 0;
    const a = sc.away ?? 0;
    const minute = f.minute ?? null;
    if (pair) {
      liveScores[pair.id] = pair.reversed
        ? { home: a, away: h, minute }
        : { home: h, away: a, minute };
    } else if (f.stage && f.stage !== "GROUP_STAGE") {
      // Knockout tie in progress — key by stage + teams so the bracket matches.
      const dur = f.score?.duration;
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
  // as fullTime 4–5 = 1+3, 1+4) — confirmed by comparing several shootout
  // results against real scorelines, not documented behavior. So for those,
  // use `regularTime`/`extraTime` (pre-shootout) instead, and track the
  // shootout separately via `penalties` below.
  const wentToPens = f.score?.duration === "PENALTY_SHOOTOUT";
  const ft = wentToPens
    ? f.score?.extraTime ?? f.score?.regularTime
    : f.score?.fullTime;
  if (ft?.home == null || ft?.away == null) continue;

  if (pair) {
    live.results[pair.id] = pair.reversed
      ? [ft.away, ft.home]
      : [ft.home, ft.away];
    finishedApi.set(pair.id, f.id);
  } else if (f.stage && f.stage !== "GROUP_STAGE") {
    // Knockout match — record by stage + teams so the bracket can fill in.
    const w = f.score?.winner;
    const winnerId =
      w === "HOME_TEAM" ? homeId : w === "AWAY_TEAM" ? awayId : null;
    const pens = f.score?.penalties;
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
    finishedKoApi.set(koKey(homeId, awayId), f.id);
  }
}

live.liveScores = liveScores;
live.liveKo = liveKo;

/** Pull bookings/goals/substitutions out of a `/matches/{id}` detail payload. */
function extractEvents(detail: any, matchId: string) {
  const att = detail.attendance ?? detail.match?.attendance;
  if (typeof att === "number" && att > 0) live.attendance[matchId] = att;

  const bookings: any[] = detail.bookings ?? detail.match?.bookings ?? [];
  for (const b of bookings) {
    const card: string = b.card ?? "";
    const teamId = mapTeam(b.team);
    if (!teamId || !b.player?.name) continue;
    if (card.includes("RED")) {
      // RED (straight) or YELLOW_RED (second yellow) — a sending off.
      live.redCards.push({
        player: b.player.name,
        team: teamId,
        matchId,
        minute: b.minute ?? null,
        extra: null,
        detail: card === "YELLOW_RED" ? "second yellow card" : "straight red",
      });
    } else if (card === "YELLOW") {
      // Straight yellow — tracked so two across matches => a suspension.
      live.yellowCards.push({
        player: b.player.name,
        team: teamId,
        matchId,
        minute: b.minute ?? null,
      });
    }
  }

  const goals: any[] = detail.goals ?? detail.match?.goals ?? [];
  for (const g of goals) {
    const teamId = mapTeam(g.team);
    if (!teamId || !g.scorer?.name) continue;
    live.goals.push({
      matchId,
      team: teamId,
      scorer: g.scorer.name,
      assist: g.assist?.name ?? null,
      minute: g.minute ?? null,
      extra: g.injuryTime ?? null,
      type: g.type ?? "REGULAR",
    });
  }

  const subs: any[] = detail.substitutions ?? detail.match?.substitutions ?? [];
  for (const s of subs) {
    const teamId = mapTeam(s.team);
    if (!teamId || !s.playerOut?.name || !s.playerIn?.name) continue;
    live.substitutions.push({
      matchId,
      team: teamId,
      playerOut: s.playerOut.name,
      playerIn: s.playerIn.name,
      minute: s.minute ?? null,
    });
  }
}

// Fetch full match details once per newly finished match (free tier: 10
// requests/min) — bookings, goals, and substitutions all come from the same
// response, so this covers all three at no extra request cost.
const toFetch: Array<[string, number]> = [
  ...finishedApi.entries(),
  ...finishedKoApi.entries(),
];
for (const [matchId, apiId] of toFetch) {
  if (live.eventsChecked.includes(matchId)) continue;
  console.log(`Fetching events for ${matchId} (fd match ${apiId})`);
  await sleep(6500);
  const detail = await get(`/matches/${apiId}`);
  extractEvents(detail, matchId);
  live.eventsChecked.push(matchId);
}

const after = JSON.stringify({
  results: live.results,
  redCards: live.redCards,
  yellowCards: live.yellowCards,
  goals: live.goals,
  substitutions: live.substitutions,
  koResults: live.koResults,
  liveKo: live.liveKo,
  liveScores: live.liveScores,
  attendance: live.attendance,
  eventsChecked: live.eventsChecked,
});

if (after === before) {
  console.log("No changes.");
} else {
  live.updatedAt = new Date().toISOString();
  writeFileSync(LIVE_PATH, JSON.stringify(live, null, 2) + "\n");
  console.log(
    `Updated: ${Object.keys(live.results).length} results, ${live.redCards.length} red cards, ` +
      `${live.yellowCards.length} yellow cards, ${live.goals.length} goals, ${live.substitutions.length} substitutions.`
  );
}
