/**
 * Pulls finished results and red cards for the 2026 World Cup from
 * API-Football (v3.football.api-sports.io) and writes them to
 * src/data/live.json. Run by .github/workflows/update-data.yml on a
 * schedule; the app merges live.json with the manually curated data.
 *
 * Usage: FOOTBALL_API_KEY=... npx tsx scripts/update-data.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { matches } from "../src/data/fixtures";
import { teams } from "../src/data/teams";

const API = "https://v3.football.api-sports.io";
const LEAGUE = process.env.LEAGUE_ID ?? "1"; // FIFA World Cup
const SEASON = process.env.SEASON ?? "2026";
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

interface LiveData {
  updatedAt: string;
  results: Record<string, [number, number]>;
  redCards: LiveRedCard[];
  /** Match ids whose post-match events were already fetched. */
  eventsChecked: string[];
}

const LIVE_PATH = new URL("../src/data/live.json", import.meta.url);
const live: LiveData = JSON.parse(readFileSync(LIVE_PATH, "utf8"));
const before = JSON.stringify({
  results: live.results,
  redCards: live.redCards,
  eventsChecked: live.eventsChecked,
});

/** Normalize a team/player name for matching: lowercase, no accents/symbols. */
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

/** API-Football team names that differ from ours. */
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

const matchByPair = new Map<string, { id: string; reversed: boolean }>();
for (const m of matches) {
  matchByPair.set(`${m.home}|${m.away}`, { id: m.id, reversed: false });
  matchByPair.set(`${m.away}|${m.home}`, { id: m.id, reversed: true });
}

async function get(path: string): Promise<any[]> {
  const res = await fetch(`${API}${path}`, {
    headers: { "x-apisports-key": KEY! },
  });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  const body = await res.json();
  if (body.errors && Object.keys(body.errors).length > 0) {
    throw new Error(`${path}: ${JSON.stringify(body.errors)}`);
  }
  return body.response ?? [];
}

const FINISHED = new Set(["FT", "AET", "PEN"]);

const fixtures = await get(`/fixtures?league=${LEAGUE}&season=${SEASON}`);
console.log(`API returned ${fixtures.length} fixtures`);

/** Our match id → API fixture id, for finished matches we can map. */
const finishedApi = new Map<string, number>();

for (const f of fixtures) {
  if (!FINISHED.has(f.fixture?.status?.short)) continue;
  const homeId = teamIdByName.get(norm(f.teams?.home?.name ?? ""));
  const awayId = teamIdByName.get(norm(f.teams?.away?.name ?? ""));
  if (!homeId || !awayId) {
    console.warn(`Unmapped teams: ${f.teams?.home?.name} vs ${f.teams?.away?.name}`);
    continue;
  }
  const pair = matchByPair.get(`${homeId}|${awayId}`);
  if (!pair) continue; // knockout round — not in the group-stage data
  if (f.goals?.home == null || f.goals?.away == null) continue;

  live.results[pair.id] = pair.reversed
    ? [f.goals.away, f.goals.home]
    : [f.goals.home, f.goals.away];
  finishedApi.set(pair.id, f.fixture.id);
}

// Fetch card events once per newly finished match (keeps API usage tiny).
for (const [matchId, apiFixtureId] of finishedApi) {
  if (live.eventsChecked.includes(matchId)) continue;
  console.log(`Fetching events for ${matchId} (fixture ${apiFixtureId})`);
  const events = await get(`/fixtures/events?fixture=${apiFixtureId}`);
  for (const ev of events) {
    if (ev.type !== "Card" || !/red/i.test(ev.detail ?? "")) continue;
    const teamId = teamIdByName.get(norm(ev.team?.name ?? ""));
    if (!teamId) continue;
    live.redCards.push({
      player: ev.player?.name ?? "Unknown player",
      team: teamId,
      matchId,
      minute: ev.time?.elapsed ?? null,
      extra: ev.time?.extra ?? null,
      detail: ev.detail ?? "Red Card",
    });
  }
  live.eventsChecked.push(matchId);
}

const after = JSON.stringify({
  results: live.results,
  redCards: live.redCards,
  eventsChecked: live.eventsChecked,
});

if (after === before) {
  console.log("No changes.");
} else {
  live.updatedAt = new Date().toISOString();
  writeFileSync(LIVE_PATH, JSON.stringify(live, null, 2) + "\n");
  console.log(
    `Updated: ${Object.keys(live.results).length} results, ${live.redCards.length} red cards.`
  );
}
