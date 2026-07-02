import type { Match, PlayerAbsence, Team } from "../data/types";
import { teamById } from "../data/teams";
import { unavailableFor } from "../data/discipline";
import { formRating } from "./form";

/**
 * Match-up strength model. Each team starts from its 0–100 base rating, then
 * loses points for every player ruled out of this match — weighted by how big
 * a loss the player is (impact 1–5) and lightly by position (losing a keeper
 * or a forward stings a touch more than a defender). The two adjusted ratings
 * are compared to call who's favoured and by how much.
 */

const IMPACT_PTS: Record<number, number> = {
  1: 0.5,
  2: 1.5,
  3: 3,
  4: 4.5,
  5: 6.5,
};

/**
 * Deeper squads absorb absences better, so the same loss dents a stronger
 * team less. Scales the penalty from ~0.7× (elite) to ~1.1× (weakest).
 */
const depthFactor = (base: number) =>
  Math.min(1.1, Math.max(0.7, 1 - (base - 65) / 120));

function positionWeight(pos?: string): number {
  if (!pos) return 1;
  const p = pos.toLowerCase();
  if (p.includes("goalkeep") || p === "gk") return 1.15;
  if (p.includes("strik") || p.includes("forward") || p.includes("wing"))
    return 1.1;
  if (p.includes("back") || p.includes("defen")) return 0.95;
  return 1; // midfield / other
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export interface AbsenceHit {
  absence: PlayerAbsence;
  /** Points knocked off the rating for this player (after the depth factor). */
  points: number;
}

export interface TeamStrength {
  team: Team;
  /** Form-adjusted rating used as the comparison's starting point. */
  base: number;
  /** Pre-tournament FIFA-based rating. */
  fifaBase: number;
  /** Form movement so far (base − fifaBase). */
  formDelta: number;
  penalty: number;
  effective: number;
  /** Depth multiplier applied to the raw penalty (rounded for display). */
  depth: number;
  outs: PlayerAbsence[];
  breakdown: AbsenceHit[];
}

export interface Matchup {
  home: TeamStrength;
  away: TeamStrength;
  /** Home team's share of the combined strength, 0–100 (for the bar). */
  homeShare: number;
  favored?: "home" | "away";
  verdict: string;
}

function strengthFor(teamId: string, matchId: string): TeamStrength {
  const team = teamById(teamId);
  const fr = formRating(teamId);
  const base = fr.rating;
  const outs = unavailableFor(matchId, [teamId]).filter((a) => a.team === teamId);
  const df = depthFactor(base);
  const breakdown: AbsenceHit[] = outs.map((a) => ({
    absence: a,
    points: round1(IMPACT_PTS[a.impact] * positionWeight(a.position) * df),
  }));
  const penalty = round1(breakdown.reduce((sum, b) => sum + b.points, 0));
  return {
    team,
    base,
    fifaBase: fr.base,
    formDelta: fr.delta,
    penalty,
    effective: round1(Math.max(30, base - penalty)),
    depth: Math.round(df * 100) / 100,
    outs,
    breakdown,
  };
}

export function matchup(match: Match): Matchup {
  return matchupTeams(match.home, match.away, match.id);
}

/**
 * Same comparison keyed directly by team ids + a match id (for the discipline
 * lookup). Used by knockout ties, which aren't full group `Match` records.
 */
export function matchupTeams(
  homeId: string,
  awayId: string,
  matchId: string
): Matchup {
  const home = strengthFor(homeId, matchId);
  const away = strengthFor(awayId, matchId);

  const total = home.effective + away.effective || 1;
  const homeShare = Math.round((home.effective / total) * 100);

  const gap = home.effective - away.effective;
  const absGap = Math.abs(gap);
  const stronger = gap >= 0 ? home.team.name : away.team.name;

  let verdict: string;
  if (absGap < 2) verdict = "Evenly matched";
  else if (absGap < 6) verdict = `${stronger} have a slight edge`;
  else if (absGap < 13) verdict = `${stronger} are favoured`;
  else verdict = `${stronger} are strong favourites`;

  return {
    home,
    away,
    homeShare,
    favored: absGap < 2 ? undefined : gap > 0 ? "home" : "away",
    verdict,
  };
}
