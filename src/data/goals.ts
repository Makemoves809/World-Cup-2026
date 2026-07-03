import live from "./live.json";
import { koKey } from "../lib/koKey";

export interface Goal {
  team: string;
  scorer: string;
  assist: string | null;
  minute: number | null;
  extra: number | null;
  /** "REGULAR" | "OWN" | "PENALTY". */
  type: string;
}

interface LiveGoal extends Goal {
  matchId: string;
}

const all = (live as { goals?: LiveGoal[] }).goals ?? [];

const byMinute = (a: Goal, b: Goal) => (a.minute ?? 0) - (b.minute ?? 0);

/** Goals scored in a group-stage match (by our fixtures.ts id), earliest first. */
export const goalsFor = (matchId: string): Goal[] =>
  all.filter((g) => g.matchId === matchId).sort(byMinute);

/** Goals scored in a knockout tie, keyed by the two team ids (order-free). */
export const goalsForTie = (homeId: string, awayId: string): Goal[] =>
  all.filter((g) => g.matchId === koKey(homeId, awayId)).sort(byMinute);

/** "45+2'" style clock for a goal minute + injury-time offset. */
export const minuteLabel = (minute: number | null, extra?: number | null): string => {
  if (minute == null) return "";
  return extra ? `${minute}+${extra}'` : `${minute}'`;
};
