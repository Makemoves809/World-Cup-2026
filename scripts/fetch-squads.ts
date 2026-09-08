/**
 * Fetches club squads for the Champions League from football-data.org and
 * writes them to src/data/clSquads.json.
 *
 * One request: /v4/competitions/CL/teams returns all 36 clubs, each with a
 * `squad` array. Squads change slowly (transfer windows), so this is a
 * manual / occasional job — see .github/workflows/fetch-squads.yml — rather
 * than part of the every-10-minutes results poll.
 *
 * If the free tier withholds squads, the arrays come back empty; the script
 * reports that plainly and writes nothing rather than clobbering good data.
 *
 * Usage: FOOTBALL_API_KEY=... npx tsx scripts/fetch-squads.ts
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { mapTeam } from "./clubMap";

const API = "https://api.football-data.org/v4";
const COMPETITION = process.env.COMPETITION ?? "CL";
const KEY = process.env.FOOTBALL_API_KEY;
if (!KEY) {
  console.error("FOOTBALL_API_KEY is not set");
  process.exit(1);
}

export interface SquadPlayer {
  name: string;
  position: string | null;
  /** Shirt number, when the feed provides one. */
  number?: number | null;
  nationality: string | null;
  dateOfBirth: string | null;
}
export interface ClubSquad {
  /** Club crest URL from the feed (handy later; we render monograms today). */
  crest?: string | null;
  coach?: string | null;
  players: SquadPlayer[];
}

const OUT = new URL("../src/data/clSquads.json", import.meta.url);

const res = await fetch(`${API}/competitions/${COMPETITION}/teams`, {
  headers: { "X-Auth-Token": KEY },
});
if (!res.ok) {
  console.error(`teams: HTTP ${res.status} ${await res.text()}`);
  process.exit(1);
}
const data: any = await res.json();
const teams: any[] = data.teams ?? [];
console.log(`API returned ${teams.length} teams`);

const squads: Record<string, ClubSquad> = {};
let mapped = 0;
let withPlayers = 0;
let totalPlayers = 0;

for (const t of teams) {
  const id = mapTeam(t);
  if (!id) {
    console.warn(`Unmapped team: ${t.name} (tla ${t.tla})`);
    continue;
  }
  mapped++;
  const players: SquadPlayer[] = (t.squad ?? []).map((p: any) => ({
    name: p.name,
    position: p.position ?? null,
    number: p.shirtNumber ?? null,
    nationality: p.nationality ?? null,
    dateOfBirth: p.dateOfBirth ?? null,
  }));
  if (players.length) {
    withPlayers++;
    totalPlayers += players.length;
  }
  squads[id] = {
    crest: t.crest ?? null,
    coach: t.coach?.name ?? null,
    players,
  };
}

console.log(
  `Mapped ${mapped}/${teams.length} clubs; ${withPlayers} have squads; ${totalPlayers} players total.`
);

if (totalPlayers === 0) {
  // The plan doesn't expose squads — don't overwrite whatever is on disk.
  console.warn(
    "No squad data returned (this tier likely withholds it). Leaving src/data/clSquads.json untouched."
  );
  process.exit(0);
}

const prev = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
const next = JSON.stringify({ updatedAt: new Date().toISOString(), squads }, null, 2) + "\n";
// Compare ignoring updatedAt so an unchanged squad set doesn't churn a commit.
const strip = (s: string) => s.replace(/"updatedAt":\s*"[^"]*",?\s*/, "");
if (strip(prev) === strip(next)) {
  console.log("No squad changes.");
} else {
  writeFileSync(OUT, next);
  console.log(`Wrote ${withPlayers} squads.`);
}
