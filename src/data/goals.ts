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

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
const nameWords = (s: string) => norm(s).split(/[^a-z]+/).filter(Boolean);

/**
 * All goals a named player has scored for a team across the whole
 * tournament so far, earliest first — lets an absence entry answer "how
 * have they actually been playing this World Cup?" instead of leaving it to
 * a static impact rating. Matched the same way as `cardStatus()`: every
 * word of the shorter name must appear in the longer one, so a scorer name
 * from the live feed ("Messi") still matches a fuller curated name ("Lionel
 * Messi") without collapsing on a shared first name alone.
 */
export const goalsForPlayer = (team: string, playerName: string): Goal[] => {
  const words = nameWords(playerName);
  return all
    .filter((g) => {
      if (g.team !== team) return false;
      const scorerWords = nameWords(g.scorer);
      return (
        scorerWords.every((w) => words.includes(w)) ||
        words.every((w) => scorerWords.includes(w))
      );
    })
    .sort(byMinute);
};

export interface Scorer {
  /** Display name (the fullest spelling seen in the feed). */
  scorer: string;
  /** Team id. */
  team: string;
  /** Total goals this tournament (own goals excluded). */
  goals: number;
  /** How many of those came from the penalty spot. */
  penalties: number;
}

/**
 * Golden Boot standings — every player ranked by goals scored across the
 * whole tournament (group stage + knockouts, since `all` already holds both).
 * Own goals are excluded (they never count toward a scorer's tally, and the
 * feed credits them to the benefiting team anyway); penalties count but are
 * also surfaced separately. Ranked by goals, then — since the free feed gives
 * us no assists or minutes for FIFA's official tiebreakers — by fewer
 * penalties (a light nudge toward open-play scoring) and then name, purely so
 * the order is stable. Recomputes from the goal feed, so it tracks live.
 */
export function goldenBoot(limit?: number): Scorer[] {
  const byKey = new Map<string, Scorer>();
  for (const g of all) {
    if (g.type === "OWN") continue;
    const key = `${g.team}|${norm(g.scorer)}`;
    let s = byKey.get(key);
    if (!s) {
      s = { scorer: g.scorer, team: g.team, goals: 0, penalties: 0 };
      byKey.set(key, s);
    }
    // Keep the fullest spelling if the feed ever varies it.
    if (g.scorer.length > s.scorer.length) s.scorer = g.scorer;
    s.goals += 1;
    if (g.type === "PENALTY") s.penalties += 1;
  }
  const ranked = [...byKey.values()].sort(
    (a, b) =>
      b.goals - a.goals ||
      a.penalties - b.penalties ||
      a.scorer.localeCompare(b.scorer)
  );
  return limit != null ? ranked.slice(0, limit) : ranked;
}

/** "45+2'" style clock for a goal minute + injury-time offset. */
export const minuteLabel = (minute: number | null, extra?: number | null): string => {
  if (minute == null) return "";
  return extra ? `${minute}+${extra}'` : `${minute}'`;
};
