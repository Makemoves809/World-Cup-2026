/**
 * Pulls finished results and red cards for the 2026 World Cup from
 * football-data.org (v4) and writes them to src/data/live.json. Run by
 * .github/workflows/update-data.yml on a schedule; the app merges
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

interface KoResult {
  /** API stage, e.g. "LAST_32", "LAST_16", "QUARTER_FINALS", "FINAL". */
  stage: string;
  homeId: string;
  awayId: string;
  homeScore: number;
  awayScore: number;
  /** Team id that advanced (after extra time / penalties), if known. */
  winnerId: string | null;
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
  /** Finished knockout matches — used to fill the bracket. */
  koResults: KoResult[];
  /** In-play knockout scores by stage + teams (rebuilt each run). */
  liveKo: LiveKo[];
  /** In-play group scores, keyed by match id (rebuilt each run). */
  liveScores: Record<string, { home: number; away: number; minute: number | null }>;
  /** Announced attendance, keyed by match id. */
  attendance: Record<string, number>;
  /** Match ids whose post-match events were already fetched. */
  eventsChecked: string[];
}

const LIVE_PATH = new URL("../src/data/live.json", import.meta.url);
const live: LiveData = JSON.parse(readFileSync(LIVE_PATH, "utf8"));
live.yellowCards = live.yellowCards ?? [];
live.koResults = live.koResults ?? [];
live.liveKo = live.liveKo ?? [];
live.liveScores = live.liveScores ?? {};
live.attendance = live.attendance ?? {};
const before = JSON.stringify({
  results: live.results,
  redCards: live.redCards,
  yellowCards: live.yellowCards,
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
      const phase =
        f.score?.duration === "PENALTY_SHOOTOUT"
          ? "PENS"
          : f.score?.duration === "EXTRA_TIME"
          ? "ET"
          : f.status === "PAUSED"
          ? "HT"
          : null;
      liveKo.push({ stage: f.stage, homeId, awayId, homeScore: h, awayScore: a, minute, phase });
    }
    continue;
  }

  if (f.status !== "FINISHED") continue;
  const ft = f.score?.fullTime;
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
    const existing = live.koResults.find(
      (k) => k.homeId === homeId && k.awayId === awayId && k.stage === f.stage
    );
    const rec: KoResult = {
      stage: f.stage,
      homeId,
      awayId,
      homeScore: ft.home,
      awayScore: ft.away,
      winnerId,
    };
    if (existing) Object.assign(existing, rec);
    else live.koResults.push(rec);
  }
}

live.liveScores = liveScores;
live.liveKo = liveKo;

// Fetch bookings once per newly finished match (free tier: 10 requests/min).
for (const [matchId, apiId] of finishedApi) {
  if (live.eventsChecked.includes(matchId)) continue;
  console.log(`Fetching events for ${matchId} (fd match ${apiId})`);
  await sleep(6500);
  const detail = await get(`/matches/${apiId}`);
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
  live.eventsChecked.push(matchId);
}

const after = JSON.stringify({
  results: live.results,
  redCards: live.redCards,
  yellowCards: live.yellowCards,
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
    `Updated: ${Object.keys(live.results).length} results, ${live.redCards.length} red cards, ${live.yellowCards.length} yellow cards.`
  );
}
