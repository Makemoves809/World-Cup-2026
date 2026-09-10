/**
 * Shared read layer over the live feed for the Champions League.
 *
 * src/data/live.json is written by scripts/update-data.ts (the results bot):
 *   fixtures    — kickoff time + matchday per fixture id
 *   results     — final score [home, away] per fixture id
 *   liveScores  — in-play score + minute, rebuilt each run
 *   goals       — who scored, from scripts/fetch-goals.ts (ESPN)
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

interface LiveFeed {
  updatedAt?: string;
  fixtures?: Record<string, FixtureMeta>;
  /** Stored as a 2-element array [home, away]. */
  results?: Record<string, number[]>;
  liveScores?: Record<string, LiveScore>;
  standings?: unknown[];
  scorers?: unknown[];
  goals?: unknown[];
}

/**
 * Cast through `unknown` deliberately. TypeScript types an imported JSON file
 * from its *current contents*, so a direct `as` is checked against whatever
 * the bot last wrote — e.g. an empty `results: {}` narrows to `{}`, and one
 * real entry narrows to `number[]`, which is not assignable to a
 * `[number, number]` tuple. That made the build fail the first time a match
 * finished. Going through `unknown` decouples our types from the live data's
 * shape, and the accessors below validate at runtime instead.
 */
const feed = live as unknown as LiveFeed;

export const metaFor = (id: string): FixtureMeta => feed.fixtures?.[id] ?? {};

/** A final score, only when the feed really has both numbers. */
export const resultFor = (id: string): [number, number] | undefined => {
  const r = feed.results?.[id];
  return r && r.length >= 2 && typeof r[0] === "number" && typeof r[1] === "number"
    ? [r[0], r[1]]
    : undefined;
};
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

/**
 * The feed's own table position for a club, when it has ranked them.
 * Used only as a deep tiebreaker — the table itself is computed from results,
 * since this standings snapshot can lag behind finished matches.
 */
export function officialPosition(clubId: string): number | undefined {
  const rows = (feed.standings ?? []) as { clubId?: string; position?: number }[];
  const row = rows.find((r) => r?.clubId === clubId);
  return typeof row?.position === "number" ? row.position : undefined;
}

/* ------------------------------ goal scorers ----------------------------- */

export interface Goal {
  /** Our club id for the side the goal counted for (own goals included). */
  team: string;
  scorer: string;
  assist: string | null;
  /** Regulation minute — 45 for a goal at 45+2'. */
  minute: number | null;
  /** Added time on top of `minute` — 2 for a goal at 45+2'. */
  extra: number | null;
  /** "REGULAR" | "PENALTY" | "OWN". */
  type: string;
}
interface FeedGoal extends Goal {
  matchId: string;
}

/**
 * Validated at runtime rather than trusted. These come from ESPN's unofficial
 * API via the bot, so a shape change upstream should quietly drop a bad entry
 * — never render `undefined` next to a scoreline, and never break the build
 * (see the cast note above).
 */
const isGoal = (g: unknown): g is FeedGoal => {
  const x = g as FeedGoal;
  return (
    !!x &&
    typeof x.matchId === "string" &&
    typeof x.team === "string" &&
    typeof x.scorer === "string" &&
    x.scorer.length > 0
  );
};

const ALL_GOALS: FeedGoal[] = (feed.goals ?? []).filter(isGoal);

const byClock = (a: Goal, b: Goal) =>
  (a.minute ?? 0) - (b.minute ?? 0) || (a.extra ?? 0) - (b.extra ?? 0);

/** Goals in one match, earliest first. Empty when we have no scorer data. */
export const goalsFor = (matchId: string): Goal[] =>
  ALL_GOALS.filter((g) => g.matchId === matchId).sort(byClock);

/** Every match we have scorers for — lets the UI hide an empty history. */
export const matchesWithGoals = (): Set<string> =>
  new Set(ALL_GOALS.map((g) => g.matchId));

/** How a goal reads on a scoresheet: "23'", "45+2'", "78' (pen)". */
export function goalClock(g: Goal): string {
  const base = g.minute == null ? "" : `${g.minute}${g.extra ? `+${g.extra}` : ""}'`;
  const tag = g.type === "PENALTY" ? " (pen)" : g.type === "OWN" ? " (og)" : "";
  return `${base}${tag}`;
}

/** Every finished match, newest first — the match history. */
export function playedFixtures(): ClFixture[] {
  return CL_FIXTURES.filter((f) => resultFor(f.id)).sort(
    (a, b) => (kickoffOf(b) ?? 0) - (kickoffOf(a) ?? 0)
  );
}

export const feedUpdatedAt = (): string | undefined => feed.updatedAt;
