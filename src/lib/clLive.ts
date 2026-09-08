/**
 * Shared read layer over the live feed for the Champions League.
 *
 * src/data/live.json is written by scripts/update-data.ts (the results bot):
 *   fixtures    — kickoff time + matchday per fixture id
 *   results     — final score [home, away] per fixture id
 *   liveScores  — in-play score + minute, rebuilt each run
 *
 * Everything the hero, home dashboard and schedule need comes from here so
 * they can't drift apart.
 */
import { CL_FIXTURES, type ClFixture } from "../data/clFixtures";
import live from "../data/live.json";

export interface FixtureMeta {
  utc?: string;
  matchday?: number | null;
}
export interface LiveScore {
  home: number;
  away: number;
  minute: number | null;
}

const feed = live as {
  updatedAt?: string;
  fixtures?: Record<string, FixtureMeta>;
  results?: Record<string, [number, number]>;
  liveScores?: Record<string, LiveScore>;
};

export const metaFor = (id: string): FixtureMeta => feed.fixtures?.[id] ?? {};
export const resultFor = (id: string): [number, number] | undefined =>
  feed.results?.[id];
export const liveScoreFor = (id: string): LiveScore | undefined =>
  feed.liveScores?.[id];

export const kickoffOf = (f: ClFixture): number | null => {
  const u = metaFor(f.id).utc;
  return u ? new Date(u).getTime() : null;
};

export const MATCHDAYS = [1, 2, 3, 4, 5, 6, 7, 8];

/** A match is "in play" while the feed says so, or within ~2h of kickoff. */
const WINDOW_MS = 2 * 60 * 60 * 1000;

/** Fixtures of one matchday, in kickoff order. */
export function matchdayFixtures(md: number): ClFixture[] {
  return CL_FIXTURES.filter((f) => metaFor(f.id).matchday === md).sort(
    (a, b) => (metaFor(a.id).utc ?? "").localeCompare(metaFor(b.id).utc ?? "")
  );
}

/** The matchday in play or next up (falls back to the last one). */
export function currentMatchday(now: number): number {
  for (const md of MATCHDAYS) {
    const times = matchdayFixtures(md)
      .map(kickoffOf)
      .filter((t): t is number => t != null);
    if (times.length && Math.max(...times) + WINDOW_MS > now) return md;
  }
  return MATCHDAYS[MATCHDAYS.length - 1];
}

/** Matches currently being played (feed-reported, or inside the window). */
export function liveFixtures(now: number): ClFixture[] {
  return CL_FIXTURES.filter((f) => {
    if (resultFor(f.id)) return false;
    if (liveScoreFor(f.id)) return true;
    const t = kickoffOf(f);
    return t != null && t <= now && now < t + WINDOW_MS;
  }).sort((a, b) => (kickoffOf(a) ?? 0) - (kickoffOf(b) ?? 0));
}

/** The soonest fixture that hasn't kicked off yet. */
export function nextFixture(now: number): ClFixture | undefined {
  return CL_FIXTURES.filter((f) => {
    const t = kickoffOf(f);
    return t != null && t > now;
  }).sort((a, b) => (kickoffOf(a) ?? 0) - (kickoffOf(b) ?? 0))[0];
}

/** Most recently finished matches, newest first. */
export function recentResults(limit = 6): ClFixture[] {
  return CL_FIXTURES.filter((f) => resultFor(f.id))
    .sort((a, b) => (kickoffOf(b) ?? 0) - (kickoffOf(a) ?? 0))
    .slice(0, limit);
}

/** True once any match has a result or is in play. */
export const seasonUnderway = (now: number): boolean =>
  recentResults(1).length > 0 || liveFixtures(now).length > 0;

export const feedUpdatedAt = (): string | undefined => feed.updatedAt;
