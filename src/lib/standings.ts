import type { Match, StandingRow, Team } from "../data/types";
import { teamById, teamsInGroup } from "../data/teams";
import { matches } from "../data/fixtures";

interface Tally {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

const emptyTally = (): Tally => ({
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  points: 0,
});

function applyMatch(table: Map<string, Tally>, m: Match) {
  if (m.status !== "finished" || m.homeScore == null || m.awayScore == null) {
    return;
  }
  const home = table.get(m.home)!;
  const away = table.get(m.away)!;

  home.played++;
  away.played++;
  home.goalsFor += m.homeScore;
  home.goalsAgainst += m.awayScore;
  away.goalsFor += m.awayScore;
  away.goalsAgainst += m.homeScore;

  if (m.homeScore > m.awayScore) {
    home.won++;
    home.points += 3;
    away.lost++;
  } else if (m.homeScore < m.awayScore) {
    away.won++;
    away.points += 3;
    home.lost++;
  } else {
    home.drawn++;
    away.drawn++;
    home.points += 1;
    away.points += 1;
  }
}

/**
 * FIFA group ranking: points, then goal difference, then goals scored.
 * (Head-to-head and disciplinary tiebreakers are omitted in this scaffold.)
 */
function compare(a: StandingRow, b: StandingRow): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.team.name.localeCompare(b.team.name);
}

/** Compute the ordered standing rows for a single group. */
export function standingsForGroup(group: string): StandingRow[] {
  const groupTeams = teamsInGroup(group);
  const table = new Map<string, Tally>();
  groupTeams.forEach((t) => table.set(t.id, emptyTally()));

  matches
    .filter((m) => m.group === group)
    .forEach((m) => applyMatch(table, m));

  const rows: StandingRow[] = groupTeams.map((team: Team) => {
    const t = table.get(team.id)!;
    return {
      team,
      ...t,
      goalDiff: t.goalsFor - t.goalsAgainst,
      position: 0,
    };
  });

  rows.sort(compare);
  rows.forEach((row, i) => (row.position = i + 1));
  return rows;
}

export type QualificationZone = "qualified" | "playoff" | "out";

/** Top 2 qualify directly; 3rd place is in the best-third-placed race. */
export function zoneFor(position: number): QualificationZone {
  if (position <= 2) return "qualified";
  if (position === 3) return "playoff";
  return "out";
}

export const teamLabel = (id: string) => teamById(id).name;
