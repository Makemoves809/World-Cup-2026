import type { Match } from "../data/types";

/** Rough in-play window: 90' + half-time + stoppage/VAR. */
const LIVE_MS = 135 * 60 * 1000;

/**
 * A match is treated as "live" when it has kicked off, is not yet marked
 * finished, and is still inside the in-play window. The data only flips a
 * match to "finished" once its result is ingested, so live is inferred from
 * the clock rather than stored.
 */
export function isLive(match: Match, now: number): boolean {
  if (match.status === "finished") return false;
  const kickoff = new Date(match.kickoff).getTime();
  return now >= kickoff && now < kickoff + LIVE_MS;
}
