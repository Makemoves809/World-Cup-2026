import { matches } from "../data/fixtures";
import { resolveBracket, resolveThirdPlace } from "./bracket";

export interface TeamGoalStats {
  teamId: string;
  played: number;
  goalsFor: number;
  goalsAgainst: number;
}

/**
 * Goals for/against across every match a team has played so far — group
 * stage and knockouts combined. Mirrors the same two-source merge as
 * `TeamResults`/`koMatchesForTeam`: the group schedule and the bracket are
 * separate data sources, so a tournament-wide stat has to pull from both.
 */
export function tournamentGoalStats(): TeamGoalStats[] {
  const byId = new Map<string, TeamGoalStats>();
  const stat = (id: string): TeamGoalStats => {
    let s = byId.get(id);
    if (!s) {
      s = { teamId: id, played: 0, goalsFor: 0, goalsAgainst: 0 };
      byId.set(id, s);
    }
    return s;
  };
  const add = (id: string, gf: number, ga: number) => {
    const s = stat(id);
    s.played += 1;
    s.goalsFor += gf;
    s.goalsAgainst += ga;
  };

  for (const m of matches) {
    if (m.status === "finished" && m.homeScore != null && m.awayScore != null) {
      add(m.home, m.homeScore, m.awayScore);
      add(m.away, m.awayScore, m.homeScore);
    }
  }

  for (const round of resolveBracket()) {
    for (const m of round.matches) {
      if (m.finished && m.home.id && m.away.id && m.homeScore != null && m.awayScore != null) {
        add(m.home.id, m.homeScore, m.awayScore);
        add(m.away.id, m.awayScore, m.homeScore);
      }
    }
  }

  const third = resolveThirdPlace();
  if (
    third.finished &&
    third.home.id &&
    third.away.id &&
    third.homeScore != null &&
    third.awayScore != null
  ) {
    add(third.home.id, third.homeScore, third.awayScore);
    add(third.away.id, third.awayScore, third.homeScore);
  }

  return [...byId.values()];
}

/** Teams ranked by goals scored, ties broken by goal difference. */
export function topScorers(limit = 10): TeamGoalStats[] {
  return tournamentGoalStats()
    .sort(
      (a, b) =>
        b.goalsFor - a.goalsFor ||
        b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst)
    )
    .slice(0, limit);
}
