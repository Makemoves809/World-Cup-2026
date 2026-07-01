import type { Match } from "../data/types";
import { getLiveData } from "./liveData";

/** Rough in-play window for a group game: 90' + half-time + stoppage/VAR. */
const LIVE_MS = 135 * 60 * 1000;
/** Knockout ties can go to extra time + penalties, so allow a longer window. */
export const KO_LIVE_MS = 200 * 60 * 1000;

export interface LiveScore {
  home: number;
  away: number;
  minute: number | null;
}

/** Current in-play score for a match, if the feed has reported one. */
export function liveScore(matchId: string): LiveScore | undefined {
  const scores =
    (getLiveData() as { liveScores?: Record<string, LiveScore> }).liveScores ??
    {};
  return scores[matchId];
}

/**
 * A match is treated as "live" when it has kicked off, is not yet marked
 * finished, and is still inside the in-play window. The data only flips a
 * match to "finished" once its result is ingested, so live is inferred from
 * the clock rather than stored.
 */
export function isLive(match: Match, now: number): boolean {
  return isKickoffLive(match.kickoff, match.status === "finished", now);
}

/**
 * Same live check keyed by a kickoff instant + finished flag, so it also works
 * for knockout ties (which aren't group `Match` records).
 */
export function isKickoffLive(
  kickoffIso: string,
  finished: boolean,
  now: number,
  windowMs: number = LIVE_MS
): boolean {
  if (finished) return false;
  const kickoff = new Date(kickoffIso).getTime();
  return now >= kickoff && now < kickoff + windowMs;
}
