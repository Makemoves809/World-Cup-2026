/**
 * Fetches club squads for the Champions League from football-data.org and
 * writes them to src/data/clSquads.json.
 *
 * One request: /v4/competitions/CL/teams returns all 36 clubs, each with a
 * `squad` array. Squads change slowly (transfer windows), so this is a
 * manual / occasional job — see .github/workflows/fetch-squads.yml — rather
 * than part of the every-10-minutes results poll.
 *
 * football-data's free tier withholds squads (confirmed: 36/36 clubs back,
 * 0 players), so when it returns none we fall back to API-Football
 * (api-sports.io), whose free tier does expose squads — 1 request for the
 * league's teams + 1 per club, ~37 total against a 100/day budget, which is
 * why this is weekly rather than part of the results poll.
 *
 * If neither source yields players the script writes nothing rather than
 * clobbering good data.
 *
 * Usage: FOOTBALL_API_KEY=... [API_FOOTBALL_KEY=...] npx tsx scripts/fetch-squads.ts
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
  /** Real club badge from the feed — replaces our monogram tokens. */
  crest?: string | null;
  coach?: string | null;
  venue?: string | null;
  founded?: number | null;
  colors?: string | null;
  players: SquadPlayer[];
}

const OUT = new URL("../src/data/clSquads.json", import.meta.url);

/** Persist whatever we have — metadata is useful even with no players. */
function writeOut() {
  const prev = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  const next = JSON.stringify({ updatedAt: new Date().toISOString(), squads }, null, 2) + "\n";
  // Compare ignoring updatedAt so unchanged data doesn't churn a commit.
  const strip = (x: string) => x.replace(/"updatedAt":\s*"[^"]*",?\s*/, "");
  if (strip(prev) === strip(next)) {
    console.log("No changes.");
  } else {
    writeFileSync(OUT, next);
    console.log(`Wrote ${Object.keys(squads).length} clubs (${withPlayers} with squads).`);
  }
}

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
    venue: t.venue ?? null,
    founded: t.founded ?? null,
    colors: t.clubColors ?? null,
    players,
  };
}

console.log(
  `Mapped ${mapped}/${teams.length} clubs; ${withPlayers} have squads; ${totalPlayers} players total.`
);

if (totalPlayers === 0) {
  console.warn(
    "football-data returned no squads (free tier withholds them) — trying API-Football."
  );
  const afKey = process.env.API_FOOTBALL_KEY;
  if (!afKey) {
    console.warn(
      "API_FOOTBALL_KEY is not set, so there is no squad source. " +
        "Add a free api-sports.io key as that repo secret to enable rosters. " +
        "Writing club metadata (crest / venue / coach) anyway."
    );
    writeOut();
    process.exit(0);
  }

  const AF = "https://v3.football.api-sports.io";
  const AF_LEAGUE = 2; // UEFA Champions League
  const AF_SEASON = 2026;
  const headers = { "x-apisports-key": afKey };
  const afGet = async (path: string): Promise<any> => {
    const r = await fetch(`${AF}${path}`, { headers });
    if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
    const j = await r.json();
    if (j.errors && Object.keys(j.errors).length) {
      throw new Error(`${path}: ${JSON.stringify(j.errors)}`);
    }
    return j;
  };

  try {
    const teamsRes = await afGet(`/teams?league=${AF_LEAGUE}&season=${AF_SEASON}`);
    const afTeams: any[] = teamsRes.response ?? [];
    console.log(`API-Football returned ${afTeams.length} teams`);

    for (const entry of afTeams) {
      const t = entry.team ?? {};
      const id = mapTeam({ name: t.name, shortName: t.name, tla: t.code });
      if (!id) {
        console.warn(`Unmapped (API-Football): ${t.name}`);
        continue;
      }
      try {
        const sq = await afGet(`/players/squads?team=${t.id}`);
        const list: any[] = sq.response?.[0]?.players ?? [];
        const players: SquadPlayer[] = list.map((p: any) => ({
          name: p.name,
          position: p.position ?? null,
          number: p.number ?? null,
          nationality: null,
          dateOfBirth: null,
        }));
        if (players.length) {
          squads[id] = { crest: t.logo ?? squads[id]?.crest ?? null, coach: squads[id]?.coach ?? null, players };
          withPlayers++;
          totalPlayers += players.length;
        }
      } catch (err) {
        console.warn(`squad fetch failed for ${t.name}: ${err}`);
      }
      // Stay well inside the per-minute rate limit.
      await new Promise((r) => setTimeout(r, 350));
    }
    console.log(
      `After API-Football: ${withPlayers} clubs have squads; ${totalPlayers} players total.`
    );
  } catch (err) {
    console.warn(`API-Football lookup failed: ${err}`);
  }

  if (totalPlayers === 0) {
    console.warn("Still no squad data — writing club metadata only.");
    writeOut();
    process.exit(0);
  }
}

writeOut();
