import type { GroupId, Match, Venue } from "./types";
import { GROUP_IDS, teamsInGroup } from "./teams";

/** The 16 host venues across the three nations. */
export const venues: Venue[] = [
  { city: "Mexico City", stadium: "Estadio Azteca", country: "Mexico" },
  { city: "Guadalajara", stadium: "Estadio Akron", country: "Mexico" },
  { city: "Monterrey", stadium: "Estadio BBVA", country: "Mexico" },
  { city: "Toronto", stadium: "BMO Field", country: "Canada" },
  { city: "Vancouver", stadium: "BC Place", country: "Canada" },
  { city: "Atlanta", stadium: "Mercedes-Benz Stadium", country: "USA" },
  { city: "Boston", stadium: "Gillette Stadium", country: "USA" },
  { city: "Dallas", stadium: "AT&T Stadium", country: "USA" },
  { city: "Houston", stadium: "NRG Stadium", country: "USA" },
  { city: "Kansas City", stadium: "Arrowhead Stadium", country: "USA" },
  { city: "Los Angeles", stadium: "SoFi Stadium", country: "USA" },
  { city: "Miami", stadium: "Hard Rock Stadium", country: "USA" },
  { city: "New York / New Jersey", stadium: "MetLife Stadium", country: "USA" },
  { city: "Philadelphia", stadium: "Lincoln Financial Field", country: "USA" },
  { city: "San Francisco Bay Area", stadium: "Levi's Stadium", country: "USA" },
  { city: "Seattle", stadium: "Lumen Field", country: "USA" },
];

/** Round-robin pairings (indices into a group's 4 teams), by matchday. */
const PAIRINGS: ReadonlyArray<ReadonlyArray<[number, number]>> = [
  [[0, 1], [2, 3]], // Matchday 1
  [[0, 2], [3, 1]], // Matchday 2
  [[3, 0], [1, 2]], // Matchday 3
];

/** Group-stage matchday windows (UTC dates). */
const MATCHDAY_DATES: Record<number, string[]> = {
  0: ["2026-06-11", "2026-06-13", "2026-06-15"],
  1: ["2026-06-18", "2026-06-20", "2026-06-22"],
  2: ["2026-06-24", "2026-06-25", "2026-06-26"],
};

const KICKOFFS = ["19:00", "22:00", "01:00"]; // staggered UTC slots

/**
 * Final scores for a handful of matchday-1 fixtures. SAMPLE DATA — wire this
 * to a live results feed (see README) for the real tournament. Keyed by match id.
 */
const RESULTS: Record<string, [number, number]> = {
  "m-A-1": [2, 0], // Mexico 2–0 South Africa (the real tournament opener)
  "m-A-2": [1, 1], // Korea Republic 1–1 Czechia
  "m-D-1": [1, 0], // United States 1–0 Paraguay
  "m-D-2": [2, 2], // Australia 2–2 Türkiye
  "m-L-1": [1, 2], // England 1–2 Croatia
  "m-L-2": [0, 0], // Ghana 0–0 Panama
};

function buildMatches(): Match[] {
  const out: Match[] = [];
  let venueCursor = 0;

  for (const group of GROUP_IDS) {
    const gTeams = teamsInGroup(group);
    PAIRINGS.forEach((day, mdIndex) => {
      day.forEach(([h, a], slot) => {
        const idx = mdIndex * 2 + slot + 1; // 1..6 within the group
        const id = `m-${group}-${idx}`;
        const date = MATCHDAY_DATES[mdIndex][slot % 3];
        const time = KICKOFFS[(mdIndex + slot) % KICKOFFS.length];
        const venue = venues[venueCursor % venues.length];
        venueCursor++;

        const result = RESULTS[id];
        out.push({
          id,
          stage: "group",
          group: group as GroupId,
          home: gTeams[h].id,
          away: gTeams[a].id,
          kickoff: `${date}T${time}:00Z`,
          venue,
          status: result ? "finished" : "scheduled",
          homeScore: result?.[0],
          awayScore: result?.[1],
        });
      });
    });
  }

  return out.sort((m1, m2) => m1.kickoff.localeCompare(m2.kickoff));
}

export const matches: Match[] = buildMatches();

export const matchesInGroup = (group: string): Match[] =>
  matches.filter((m) => m.group === group);
