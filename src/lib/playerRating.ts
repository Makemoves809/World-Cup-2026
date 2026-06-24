import type { Player } from "../data/squads";
import { matchesForTeam } from "../data/fixtures";

/**
 * A SofaScore-style per-player match rating — a **model estimate**, not a real
 * feed. We don't have a player-ratings source, so we derive a believable number
 * from data we do have: the team's most recent completed result (win/draw/loss
 * and margin), the player's role and whether a clean sheet was kept, a small
 * captain bump, and a stable per-player jitter so a line of team-mates doesn't
 * all read identically. Deterministic, so it's the same every render/build.
 */

export type RatingTone = "high" | "mid" | "low";

export interface PlayerRating {
  /** 1-decimal rating, ~4.5–9.0. */
  value: number;
  tone: RatingTone;
  /** The match this rating reflects. */
  matchId: string;
}

/** Stable hash of a string → unsigned int. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const clamp = (n: number) => Math.max(4.6, Math.min(8.9, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Estimated rating for a starter from their team's most recent completed match.
 * Returns null for bench players (not on the pitch map) and teams yet to play.
 */
export function playerRating(teamId: string, player: Player): PlayerRating | null {
  if (!player.start) return null; // only the on-pitch XI carries a rating

  const played = matchesForTeam(teamId).filter(
    (m) => m.status === "finished" && m.homeScore != null && m.awayScore != null
  );
  const last = played[played.length - 1];
  if (!last) return null;

  const isHome = last.home === teamId;
  const gf = isHome ? last.homeScore! : last.awayScore!;
  const ga = isHome ? last.awayScore! : last.homeScore!;
  const margin = gf - ga;

  // Team baseline from the result.
  let base = 6.5 + 0.22 * Math.sign(margin) * Math.min(3, Math.abs(margin));

  // Role-specific colouring off the same scoreline.
  switch (player.line) {
    case "gk":
      base += ga === 0 ? 0.5 : ga >= 3 ? -0.7 : -0.18 * ga;
      break;
    case "def":
      base += ga === 0 ? 0.35 : ga >= 3 ? -0.45 : -0.1 * ga;
      break;
    case "fwd":
      base += gf >= 2 ? 0.45 : gf === 0 ? -0.3 : 0.1;
      break;
    default: // midfield / other
      base += margin > 0 ? 0.18 : margin < 0 ? -0.12 : 0.05;
  }

  if (player.captain) base += 0.15;

  // Stable per-player jitter in roughly ±0.45.
  const jitter = ((hash(player.name + teamId) % 91) - 45) / 100;
  const value = round1(clamp(base + jitter));
  const tone: RatingTone = value >= 7.0 ? "high" : value >= 6.0 ? "mid" : "low";

  return { value, tone, matchId: last.id };
}
