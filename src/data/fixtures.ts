import type { GroupId, Match, Venue } from "./types";
import live from "./live.json";

/** The 16 host venues across the three nations. */
export const venues: Venue[] = [
  { city: "Mexico City", stadium: "Estadio Azteca", country: "Mexico", capacity: 80824 },
  { city: "Guadalajara", stadium: "Estadio Akron", country: "Mexico", capacity: 48000 },
  { city: "Monterrey", stadium: "Estadio BBVA", country: "Mexico", capacity: 53500 },
  { city: "Toronto", stadium: "BMO Field", country: "Canada", capacity: 45000 },
  { city: "Vancouver", stadium: "BC Place", country: "Canada", capacity: 54000 },
  { city: "Atlanta", stadium: "Mercedes-Benz Stadium", country: "USA", capacity: 71000 },
  { city: "Boston", stadium: "Gillette Stadium", country: "USA", capacity: 64146 },
  { city: "Dallas", stadium: "AT&T Stadium", country: "USA", capacity: 94000 },
  { city: "Houston", stadium: "NRG Stadium", country: "USA", capacity: 71000 },
  { city: "Kansas City", stadium: "Arrowhead Stadium", country: "USA", capacity: 73000 },
  { city: "Los Angeles", stadium: "SoFi Stadium", country: "USA", capacity: 71000 },
  { city: "Miami", stadium: "Hard Rock Stadium", country: "USA", capacity: 65000 },
  { city: "New York / New Jersey", stadium: "MetLife Stadium", country: "USA", capacity: 82500 },
  { city: "Philadelphia", stadium: "Lincoln Financial Field", country: "USA", capacity: 69000 },
  { city: "San Francisco Bay Area", stadium: "Levi's Stadium", country: "USA", capacity: 70000 },
  { city: "Seattle", stadium: "Lumen Field", country: "USA", capacity: 68000 },
];

const venueByCity = new Map(venues.map((v) => [v.city, v]));

/** [group, home team id, away team id, kickoff (UTC ISO), venue city] */
type ScheduleRow = [GroupId, string, string, string, string];

/**
 * The official 72-match group-stage schedule (kickoffs stored in UTC; the UI
 * renders them in the viewer's local time). Matches are numbered within each
 * group in kickoff order, so ids like "m-A-1" are stable.
 */
const SCHEDULE: ScheduleRow[] = [
  // Group A
  ["A", "mex", "rsa", "2026-06-11T19:00:00Z", "Mexico City"],
  ["A", "kor", "cze", "2026-06-12T02:00:00Z", "Guadalajara"],
  ["A", "cze", "rsa", "2026-06-18T16:00:00Z", "Atlanta"],
  ["A", "mex", "kor", "2026-06-19T01:00:00Z", "Guadalajara"],
  ["A", "cze", "mex", "2026-06-25T01:00:00Z", "Mexico City"],
  ["A", "rsa", "kor", "2026-06-25T01:00:00Z", "Monterrey"],

  // Group B
  ["B", "can", "bih", "2026-06-12T19:00:00Z", "Toronto"],
  ["B", "qat", "sui", "2026-06-13T19:00:00Z", "San Francisco Bay Area"],
  ["B", "sui", "bih", "2026-06-18T19:00:00Z", "Los Angeles"],
  ["B", "can", "qat", "2026-06-18T22:00:00Z", "Vancouver"],
  ["B", "sui", "can", "2026-06-24T19:00:00Z", "Vancouver"],
  ["B", "bih", "qat", "2026-06-24T19:00:00Z", "Seattle"],

  // Group C
  ["C", "bra", "mar", "2026-06-13T22:00:00Z", "New York / New Jersey"],
  ["C", "hai", "sco", "2026-06-14T01:00:00Z", "Boston"],
  ["C", "sco", "mar", "2026-06-19T22:00:00Z", "Boston"],
  ["C", "bra", "hai", "2026-06-20T00:30:00Z", "Philadelphia"],
  ["C", "sco", "bra", "2026-06-24T22:00:00Z", "Miami"],
  ["C", "mar", "hai", "2026-06-24T22:00:00Z", "Atlanta"],

  // Group D
  ["D", "usa", "par", "2026-06-13T01:00:00Z", "Los Angeles"],
  ["D", "aus", "tur", "2026-06-14T04:00:00Z", "Vancouver"],
  ["D", "usa", "aus", "2026-06-19T19:00:00Z", "Seattle"],
  ["D", "tur", "par", "2026-06-20T03:00:00Z", "San Francisco Bay Area"],
  ["D", "tur", "usa", "2026-06-26T02:00:00Z", "Los Angeles"],
  ["D", "par", "aus", "2026-06-26T02:00:00Z", "San Francisco Bay Area"],

  // Group E
  ["E", "ger", "cuw", "2026-06-14T17:00:00Z", "Houston"],
  ["E", "civ", "ecu", "2026-06-14T23:00:00Z", "Philadelphia"],
  ["E", "ger", "civ", "2026-06-20T20:00:00Z", "Toronto"],
  ["E", "ecu", "cuw", "2026-06-21T00:00:00Z", "Kansas City"],
  ["E", "cuw", "civ", "2026-06-25T20:00:00Z", "Philadelphia"],
  ["E", "ecu", "ger", "2026-06-25T20:00:00Z", "New York / New Jersey"],

  // Group F
  ["F", "ned", "jpn", "2026-06-14T20:00:00Z", "Dallas"],
  ["F", "swe", "tun", "2026-06-15T02:00:00Z", "Monterrey"],
  ["F", "ned", "swe", "2026-06-20T17:00:00Z", "Houston"],
  ["F", "tun", "jpn", "2026-06-21T04:00:00Z", "Monterrey"],
  ["F", "jpn", "swe", "2026-06-25T23:00:00Z", "Dallas"],
  ["F", "tun", "ned", "2026-06-25T23:00:00Z", "Kansas City"],

  // Group G
  ["G", "bel", "egy", "2026-06-15T19:00:00Z", "Seattle"],
  ["G", "irn", "nzl", "2026-06-16T01:00:00Z", "Los Angeles"],
  ["G", "bel", "irn", "2026-06-21T19:00:00Z", "Los Angeles"],
  ["G", "nzl", "egy", "2026-06-22T01:00:00Z", "Vancouver"],
  ["G", "egy", "irn", "2026-06-27T03:00:00Z", "Seattle"],
  ["G", "nzl", "bel", "2026-06-27T03:00:00Z", "Vancouver"],

  // Group H
  ["H", "esp", "cpv", "2026-06-15T17:00:00Z", "Atlanta"],
  ["H", "ksa", "uru", "2026-06-15T22:00:00Z", "Miami"],
  ["H", "esp", "ksa", "2026-06-21T16:00:00Z", "Atlanta"],
  ["H", "uru", "cpv", "2026-06-21T22:00:00Z", "Miami"],
  ["H", "cpv", "ksa", "2026-06-27T00:00:00Z", "Houston"],
  ["H", "uru", "esp", "2026-06-27T00:00:00Z", "Guadalajara"],

  // Group I
  ["I", "fra", "sen", "2026-06-16T19:00:00Z", "New York / New Jersey"],
  ["I", "irq", "nor", "2026-06-16T22:00:00Z", "Boston"],
  ["I", "fra", "irq", "2026-06-22T21:00:00Z", "Philadelphia"],
  ["I", "nor", "sen", "2026-06-23T00:00:00Z", "New York / New Jersey"],
  ["I", "nor", "fra", "2026-06-26T19:00:00Z", "Boston"],
  ["I", "sen", "irq", "2026-06-26T19:00:00Z", "Toronto"],

  // Group J
  ["J", "arg", "alg", "2026-06-17T01:00:00Z", "Kansas City"],
  ["J", "aut", "jor", "2026-06-17T04:00:00Z", "San Francisco Bay Area"],
  ["J", "arg", "aut", "2026-06-22T17:00:00Z", "Dallas"],
  ["J", "jor", "alg", "2026-06-23T03:00:00Z", "San Francisco Bay Area"],
  ["J", "jor", "arg", "2026-06-28T02:00:00Z", "Dallas"],
  ["J", "alg", "aut", "2026-06-28T02:00:00Z", "Kansas City"],

  // Group K
  ["K", "por", "cod", "2026-06-17T17:00:00Z", "Houston"],
  ["K", "uzb", "col", "2026-06-18T02:00:00Z", "Mexico City"],
  ["K", "por", "uzb", "2026-06-23T17:00:00Z", "Houston"],
  ["K", "col", "cod", "2026-06-24T02:00:00Z", "Guadalajara"],
  ["K", "col", "por", "2026-06-27T23:30:00Z", "Miami"],
  ["K", "cod", "uzb", "2026-06-27T23:30:00Z", "Atlanta"],

  // Group L
  ["L", "eng", "cro", "2026-06-17T20:00:00Z", "Dallas"],
  ["L", "gha", "pan", "2026-06-17T23:00:00Z", "Toronto"],
  ["L", "eng", "gha", "2026-06-23T20:00:00Z", "Boston"],
  ["L", "pan", "cro", "2026-06-23T23:00:00Z", "Toronto"],
  ["L", "pan", "eng", "2026-06-27T20:00:00Z", "New York / New Jersey"],
  ["L", "cro", "gha", "2026-06-27T20:00:00Z", "Philadelphia"],
];

/**
 * Final scores, keyed by match id. Manual entries seed the data; live.json is
 * refreshed by the scheduled update-data workflow (see README) and wins when
 * both have an entry for the same match.
 */
const RESULTS: Record<string, [number, number]> = {
  "m-A-1": [2, 0], // Mexico 2–0 South Africa — Jun 11, Estadio Azteca
  "m-A-2": [2, 1], // Korea Republic 2–1 Czechia — Jun 11, Estadio Akron
  "m-D-2": [2, 0], // Australia 2–0 Türkiye — Jun 14, BC Place
  "m-F-1": [2, 2], // Netherlands 2–2 Japan — Jun 14, AT&T Stadium
  ...(live.results as unknown as Record<string, [number, number]>),
};

function buildMatches(): Match[] {
  const counters = new Map<GroupId, number>();

  const out = SCHEDULE.map(([group, home, away, kickoff, city]): Match => {
    const n = (counters.get(group) ?? 0) + 1;
    counters.set(group, n);
    const id = `m-${group}-${n}`;

    const venue = venueByCity.get(city);
    if (!venue) throw new Error(`Unknown venue city: ${city}`);

    const result = RESULTS[id];
    return {
      id,
      stage: "group",
      group,
      home,
      away,
      kickoff,
      venue,
      status: result ? "finished" : "scheduled",
      homeScore: result?.[0],
      awayScore: result?.[1],
    };
  });

  return out.sort((m1, m2) => m1.kickoff.localeCompare(m2.kickoff));
}

export const matches: Match[] = buildMatches();

export const matchesInGroup = (group: string): Match[] =>
  matches.filter((m) => m.group === group);
