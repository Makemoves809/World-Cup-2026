import live from "./live.json";
import { koKey } from "../lib/koKey";

export interface Substitution {
  team: string;
  playerOut: string;
  playerIn: string;
  minute: number | null;
}

interface LiveSubstitution extends Substitution {
  matchId: string;
}

const all = (live as { substitutions?: LiveSubstitution[] }).substitutions ?? [];

/** Substitutions made in a group-stage match (by our fixtures.ts id). */
export const substitutionsFor = (matchId: string): Substitution[] =>
  all.filter((s) => s.matchId === matchId);

/** Substitutions made in a knockout tie, keyed by the two team ids (order-free). */
export const substitutionsForTie = (homeId: string, awayId: string): Substitution[] =>
  all.filter((s) => s.matchId === koKey(homeId, awayId));
