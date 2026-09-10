/**
 * Per-match goal scorers for the Champions League, from ESPN's unofficial API.
 *
 * Why ESPN: football-data.org's free tier does NOT provide goal events — a
 * live probe of a finished CL match returned `goals: —, bookings: —,
 * substitutions: —` (that detail sits behind their paid "Deep Data" add-on).
 * Their `/scorers` endpoint gives season totals only, which is what the
 * Golden Boot uses; it can't say who scored in a given match. ESPN's public
 * scoreboard can, needs no key, and gives scorer + minute + goal type.
 * Verified against real finished CL matches (probe, 10 Sep 2026):
 *   {"clock":"21'","type":"Goal - Free-kick","who":["Razvan Marin"]}
 *   {"clock":"3'","type":"Goal","who":["Raphinha"]}
 *
 * It is an *unofficial* API and can change shape or block without notice, so
 * every failure here is non-fatal: goals are a layer on top of results and
 * must never break the results pipeline. If scorers stop appearing, check this
 * job's log for `HTTP` / `no scorer name` lines first.
 *
 * Only fetches dates that actually need work — dates with finished fixtures
 * whose goals we don't have yet, plus today (for matches in progress).
 *
 * Writes `goals` in src/data/live.json, in the same shape src/data/goals.ts
 * and src/lib/clLive.ts read.
 *
 * Usage: npx tsx scripts/fetch-goals.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { CL_FIXTURES } from "../src/data/clFixtures";
import { mapTeam } from "./clubMap";

const ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard";

export interface MatchGoal {
  matchId: string;
  /** Our club id for the side the goal counted *for* (own goals included). */
  team: string;
  scorer: string;
  assist: string | null;
  /** Regulation minute, e.g. 45 for 45+2'. */
  minute: number | null;
  /** Added time on top of `minute`, e.g. 2 for 45+2'. */
  extra: number | null;
  /** "REGULAR" | "PENALTY" | "OWN". */
  type: string;
}

const LIVE = new URL("../src/data/live.json", import.meta.url);
const live = JSON.parse(readFileSync(LIVE, "utf8"));
live.goals = Array.isArray(live.goals) ? live.goals : [];
const before = JSON.stringify(live.goals);

const fixtureById = new Map(CL_FIXTURES.map((f) => [f.id, f]));
const meta: Record<string, { utc?: string }> = live.fixtures ?? {};
const results: Record<string, number[]> = live.results ?? {};
const haveGoalsFor = new Set<string>(live.goals.map((g: MatchGoal) => g.matchId));

/** Dates worth asking about: finished fixtures still missing goals, plus today. */
const dates = new Set<string>();
dates.add(new Date().toISOString().slice(0, 10).replace(/-/g, ""));
for (const f of CL_FIXTURES) {
  const utc = meta[f.id]?.utc;
  if (!utc) continue;
  if (results[f.id] && !haveGoalsFor.has(f.id)) dates.add(utc.slice(0, 10).replace(/-/g, ""));
}
console.log(`Checking ${dates.size} date(s): ${[...dates].sort().join(", ")}`);

/** "45+2'" → { minute: 45, extra: 2 }; "21'" → { minute: 21, extra: null }. */
function clockOf(d: any): { minute: number | null; extra: number | null } {
  const m = /^(\d+)(?:\s*\+\s*(\d+))?/.exec(d?.clock?.displayValue ?? "");
  if (m) return { minute: Number(m[1]), extra: m[2] ? Number(m[2]) : null };
  const secs = d?.clock?.value;
  return { minute: typeof secs === "number" ? Math.floor(secs / 60) : null, extra: null };
}

/**
 * Scorer name. The scoreboard's `details` really do carry
 * `athletesInvolved` (confirmed by probe) — but the *summary* endpoint puts
 * the name at `participants[0].athlete.displayName` instead, so accept both
 * rather than trusting one shape of an unofficial API.
 */
function namesOf(d: any): { scorer: string | null; assist: string | null } {
  const list: any[] = d?.athletesInvolved ?? d?.participants ?? [];
  const nameAt = (i: number): string | null => {
    const a = list[i];
    return a?.displayName ?? a?.athlete?.displayName ?? a?.fullName ?? a?.shortName ?? null;
  };
  return { scorer: nameAt(0), assist: nameAt(1) };
}

function typeOf(text: string): string {
  if (/own goal/i.test(text)) return "OWN";
  if (/penalt/i.test(text)) return "PENALTY";
  return "REGULAR";
}

let added = 0;
for (const date of [...dates].sort()) {
  try {
    const r = await fetch(`${ESPN}?dates=${date}`);
    if (!r.ok) {
      console.warn(`  ${date}: HTTP ${r.status}`);
      continue;
    }
    const j: any = await r.json();
    for (const ev of j.events ?? []) {
      const comp = ev.competitions?.[0];
      if (!comp) continue;

      // Map ESPN's two competitors onto our club ids, then onto our fixture.
      const byEspnId = new Map<string, string>();
      let homeId: string | undefined;
      let awayId: string | undefined;
      for (const c of comp.competitors ?? []) {
        const t = c.team ?? {};
        const id = mapTeam({
          name: t.displayName,
          shortName: t.shortDisplayName ?? t.name,
          tla: t.abbreviation,
        });
        if (!id) continue;
        byEspnId.set(String(t.id), id);
        if (c.homeAway === "home") homeId = id;
        else awayId = id;
      }
      if (!homeId || !awayId) continue;
      const fixture = fixtureById.get(`cl-${homeId}-${awayId}`);
      if (!fixture) continue;

      const goals: MatchGoal[] = [];
      let prevHome = 0;
      let prevAway = 0;
      for (const d of comp.details ?? []) {
        const text: string = d?.type?.text ?? "";
        // Shootout kicks are not goals — they decide a knockout tie but never
        // change the scoreline or a player's tally.
        if (/shootout/i.test(text)) continue;
        if (!d?.scoringPlay) continue;

        /*
         * Which side the goal counted for. Prefer the running scoreline:
         * whichever score ticked up is the credited side, which stays right
         * for an own goal without having to guess whether ESPN's `team` on
         * an own goal means the scorer's club or the one that benefits.
         * Fall back to the event's team, flipped for an own goal.
         */
        const type = typeOf(text);
        let side: string | null = null;
        if (typeof d.homeScore === "number" && typeof d.awayScore === "number") {
          if (d.homeScore > prevHome) side = homeId;
          else if (d.awayScore > prevAway) side = awayId;
          prevHome = d.homeScore;
          prevAway = d.awayScore;
        }
        if (!side) {
          const evTeam = byEspnId.get(String(d?.team?.id)) ?? null;
          side = type === "OWN" ? (evTeam === homeId ? awayId : homeId) : evTeam;
        }
        if (!side) continue;

        const { scorer, assist } = namesOf(d);
        if (!scorer) console.warn(`  ${fixture.id}: no scorer name on a ${text || "goal"}`);
        const { minute, extra } = clockOf(d);
        goals.push({
          matchId: fixture.id,
          team: side,
          scorer: scorer ?? "Unknown",
          assist: assist ?? null,
          minute,
          extra,
          type,
        });
      }
      if (!goals.length) continue;

      // Replace this match's goals wholesale — simpler than merging, and
      // self-correcting if ESPN revises an event (goal reassigned, minute
      // corrected, a disallowed goal removed).
      live.goals = live.goals.filter((g: MatchGoal) => g.matchId !== fixture.id);
      live.goals.push(...goals);
      added += goals.length;
      console.log(`  ${fixture.id}: ${goals.length} goal(s) — ${goals.map((g) => g.scorer).join(", ")}`);
    }
  } catch (err) {
    console.warn(`  ${date}: ${err}`);
  }
}

if (JSON.stringify(live.goals) === before) {
  console.log("No goal changes.");
} else {
  live.goals.sort(
    (a: MatchGoal, b: MatchGoal) =>
      a.matchId.localeCompare(b.matchId) ||
      (a.minute ?? 0) - (b.minute ?? 0) ||
      (a.extra ?? 0) - (b.extra ?? 0)
  );
  writeFileSync(LIVE, JSON.stringify(live, null, 2) + "\n");
  console.log(`Wrote ${live.goals.length} goals (${added} touched this run).`);
}
