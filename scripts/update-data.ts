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

async function get(path: string): Promise<any> {
  const res = await fetch(`${API}${path}`, {
    headers: { "X-Auth-Token": KEY! },
  });
  if (!res.ok) {
    throw new Error(`${path}: HTTP ${res.status} ${await res.text()}`);
  }
  return res.json();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const data = await get(`/competitions/${COMPETITION}/matches`);
const fdMatches: any[] = data.matches ?? [];
console.log(`API returned ${fdMatches.length} fixtures`);

/** Our match id → football-data match id, for finished matches we can map. */
const finishedApi = new Map<string, number>();

for (const f of fdMatches) {
  if (f.status !== "FINISHED") continue;
  const homeId = mapTeam(f.homeTeam);
  const awayId = mapTeam(f.awayTeam);
  if (!homeId || !awayId) {
    console.warn(`Unmapped teams: ${f.homeTeam?.name} vs ${f.awayTeam?.name}`);
    continue;
  }
  const pair = matchByPair.get(`${homeId}|${awayId}`);
  if (!pair) continue; // knockout round — not in the group-stage data
  const ft = f.score?.fullTime;
  if (ft?.home == null || ft?.away == null) continue;

  live.results[pair.id] = pair.reversed ? [ft.away, ft.home] : [ft.home, ft.away];
  finishedApi.set(pair.id, f.id);
}

// Fetch bookings once per newly finished match (free tier: 10 requests/min).
for (const [matchId, apiId] of finishedApi) {
  if (live.eventsChecked.includes(matchId)) continue;
  console.log(`Fetching events for ${matchId} (fd match ${apiId})`);
  await sleep(6500);
  const detail = await get(`/matches/${apiId}`);
  const bookings: any[] = detail.bookings ?? detail.match?.bookings ?? [];
  for (const b of bookings) {
    const card: string = b.card ?? "";
    if (!card.includes("RED")) continue; // RED or YELLOW_RED
    const teamId = mapTeam(b.team);
    if (!teamId || !b.player?.name) continue;
    live.redCards.push({
      player: b.player.name,
      team: teamId,
      matchId,
      minute: b.minute ?? null,
      extra: null,
      detail: card === "YELLOW_RED" ? "second yellow card" : "straight red",
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
