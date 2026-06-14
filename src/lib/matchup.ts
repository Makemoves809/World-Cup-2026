import type { Match, PlayerAbsence, Team } from "../data/types";
import { teamById } from "../data/teams";
import { teamRating } from "../data/ratings";
import { unavailableFor } from "../data/discipline";

/**
 * Match-up strength model. Each team starts from its 0–100 base rating, then
 * loses points for every player ruled out of this match — weighted by how big
 * a loss the player is (impact 1–5) and lightly by position (losing a keeper
 * or a forward stings a touch more than a defender). The two adjusted ratings
 * are compared to call who's favoured and by how much.
 */

const IMPACT_PTS: Record<number, number> = { 1: 1, 2: 2, 3: 4, 4: 6, 5: 9 };

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

export interface TeamStrength {
  team: Team;
  base: number;
  penalty: number;
  effective: number;
  outs: PlayerAbsence[];
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
  const base = teamRating(teamId);
  const outs = unavailableFor(matchId).filter((a) => a.team === teamId);
  const penalty = outs.reduce(
    (sum, a) => sum + IMPACT_PTS[a.impact] * positionWeight(a.position),
    0
  );
  return {
    team,
    base,
    penalty: round1(penalty),
    effective: round1(Math.max(30, base - penalty)),
    outs,
  };
}

export function matchup(match: Match): Matchup {
  const home = strengthFor(match.home, match.id);
  const away = strengthFor(match.away, match.id);

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
