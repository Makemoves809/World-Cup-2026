import type { StandingRow } from "../data/types";
import { standingsForGroup } from "./standings";
import { teamById, GROUP_IDS } from "../data/teams";
import { getLiveData } from "./liveData";

/**
 * Knockout stage — the OFFICIAL 2026 World Cup bracket (matches 73–104).
 *
 * Group winners / runners-up are projected live from the group standings, so
 * the bracket fills in as the group stage plays out (firm once a group is
 * decided). The eight matches that host a third-placed team show the official
 * eligible-group set (e.g. "3rd C/E/F/H/I") until the real draw; FIFA's
 * Annex-C allocation assigns the specific team after the group stage.
 *
 * Once the knockouts begin, finished results captured into live.json
 * (koResults) are overlaid: actual teams and scores replace the projection and
 * winners advance through the tree. All of that is fail-safe — any mismatch
 * falls back to the projection rather than throwing.
 */

export interface GroupOutcome {
  group: string;
  winner: StandingRow;
  runnerUp: StandingRow;
  third: StandingRow;
  /** True once all six group matches are finished. */
  decided: boolean;
  /** True once any match has been played. */
  started: boolean;
}

/** Provisional 1st / 2nd / 3rd for every group, in group order A–L. */
export function groupOutcomes(): GroupOutcome[] {
  return GROUP_IDS.map((group) => {
    const rows = standingsForGroup(group);
    return {
      group,
      winner: rows[0],
      runnerUp: rows[1],
      third: rows[2],
      decided: rows.every((r) => r.played === 3),
      started: rows.some((r) => r.played > 0),
    };
  });
}

export interface ThirdPlaceRow {
  row: StandingRow;
  rank: number;
  qualifies: boolean;
}

/** FIFA third-place ranking: points, goal difference, goals for, then name. */
function compareThirds(a: StandingRow, b: StandingRow): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.team.name.localeCompare(b.team.name);
}

/** The 12 third-placed teams ranked, with the qualifying top 8 flagged. */
export function bestThirds(): ThirdPlaceRow[] {
  return groupOutcomes()
    .map((o) => o.third)
    .sort(compareThirds)
    .map((row, i) => ({ row, rank: i + 1, qualifies: i < 8 }));
}

/* ----- Bracket structure (official match numbers & slots) ----- */

type Seed =
  | { kind: "winner"; group: string }
  | { kind: "runnerUp"; group: string }
  | { kind: "third"; groups: string[] }
  | { kind: "pending"; from: string };

interface KoMatch {
  id: string;
  num: number;
  home: Seed;
  away: Seed;
  /** Local match date, YYYY-MM-DD (used for day-grouping). */
  date: string;
  /** Kick-off instant, UTC ISO — rendered in the viewer's timezone. */
  kickoff: string;
  venue: string;
}

const W = (group: string): Seed => ({ kind: "winner", group });
const R = (group: string): Seed => ({ kind: "runnerUp", group });
const T = (groups: string): Seed => ({ kind: "third", groups: groups.split("") });
const P = (from: string): Seed => ({ kind: "pending", from });

const R32: KoMatch[] = [
  { id: "m73", num: 73, home: R("A"), away: R("B"), date: "2026-06-28", kickoff: "2026-06-28T19:00:00Z", venue: "SoFi Stadium · Los Angeles" },
  { id: "m74", num: 74, home: W("E"), away: T("ABCDF"), date: "2026-06-29", kickoff: "2026-06-29T20:30:00Z", venue: "Gillette Stadium · Boston" },
  { id: "m75", num: 75, home: W("F"), away: R("C"), date: "2026-06-29", kickoff: "2026-06-30T01:00:00Z", venue: "Estadio BBVA · Monterrey" },
  { id: "m76", num: 76, home: W("C"), away: R("F"), date: "2026-06-29", kickoff: "2026-06-29T17:00:00Z", venue: "NRG Stadium · Houston" },
  { id: "m77", num: 77, home: W("I"), away: T("CDFGH"), date: "2026-06-30", kickoff: "2026-06-30T21:00:00Z", venue: "MetLife Stadium · New York/New Jersey" },
  { id: "m78", num: 78, home: R("E"), away: R("I"), date: "2026-06-30", kickoff: "2026-06-30T17:00:00Z", venue: "AT&T Stadium · Dallas" },
  { id: "m79", num: 79, home: W("A"), away: T("CEFHI"), date: "2026-06-30", kickoff: "2026-07-01T01:00:00Z", venue: "Estadio Azteca · Mexico City" },
  { id: "m80", num: 80, home: W("L"), away: T("EHIJK"), date: "2026-07-01", kickoff: "2026-07-01T16:00:00Z", venue: "Mercedes-Benz Stadium · Atlanta" },
  { id: "m81", num: 81, home: W("D"), away: T("BEFIJ"), date: "2026-07-01", kickoff: "2026-07-02T00:00:00Z", venue: "Levi's Stadium · San Francisco Bay Area" },
  { id: "m82", num: 82, home: W("G"), away: T("AEHIJ"), date: "2026-07-01", kickoff: "2026-07-01T20:00:00Z", venue: "Lumen Field · Seattle" },
  { id: "m83", num: 83, home: R("K"), away: R("L"), date: "2026-07-02", kickoff: "2026-07-02T23:00:00Z", venue: "BMO Field · Toronto" },
  { id: "m84", num: 84, home: W("H"), away: R("J"), date: "2026-07-02", kickoff: "2026-07-02T19:00:00Z", venue: "SoFi Stadium · Los Angeles" },
  { id: "m85", num: 85, home: W("B"), away: T("EFGIJ"), date: "2026-07-03", kickoff: "2026-07-04T03:00:00Z", venue: "BC Place · Vancouver" },
  { id: "m86", num: 86, home: W("J"), away: R("H"), date: "2026-07-03", kickoff: "2026-07-03T22:00:00Z", venue: "Hard Rock Stadium · Miami" },
  { id: "m87", num: 87, home: W("K"), away: T("DEIJL"), date: "2026-07-03", kickoff: "2026-07-04T01:30:00Z", venue: "Arrowhead Stadium · Kansas City" },
  { id: "m88", num: 88, home: R("D"), away: R("G"), date: "2026-07-03", kickoff: "2026-07-03T18:00:00Z", venue: "AT&T Stadium · Dallas" },
];

const R16: KoMatch[] = [
  { id: "m89", num: 89, home: P("m74"), away: P("m77"), date: "2026-07-04", kickoff: "2026-07-04T21:00:00Z", venue: "Lincoln Financial Field · Philadelphia" },
  { id: "m90", num: 90, home: P("m73"), away: P("m75"), date: "2026-07-04", kickoff: "2026-07-04T17:00:00Z", venue: "NRG Stadium · Houston" },
  { id: "m91", num: 91, home: P("m76"), away: P("m78"), date: "2026-07-05", kickoff: "2026-07-05T20:00:00Z", venue: "MetLife Stadium · New York/New Jersey" },
  { id: "m92", num: 92, home: P("m79"), away: P("m80"), date: "2026-07-05", kickoff: "2026-07-06T00:00:00Z", venue: "Estadio Azteca · Mexico City" },
  { id: "m93", num: 93, home: P("m83"), away: P("m84"), date: "2026-07-06", kickoff: "2026-07-06T19:00:00Z", venue: "AT&T Stadium · Dallas" },
  { id: "m94", num: 94, home: P("m81"), away: P("m82"), date: "2026-07-06", kickoff: "2026-07-07T00:00:00Z", venue: "Lumen Field · Seattle" },
  { id: "m95", num: 95, home: P("m86"), away: P("m88"), date: "2026-07-07", kickoff: "2026-07-07T16:00:00Z", venue: "Mercedes-Benz Stadium · Atlanta" },
  { id: "m96", num: 96, home: P("m85"), away: P("m87"), date: "2026-07-07", kickoff: "2026-07-07T20:00:00Z", venue: "BC Place · Vancouver" },
];

const QF: KoMatch[] = [
  { id: "m97", num: 97, home: P("m89"), away: P("m90"), date: "2026-07-09", kickoff: "2026-07-09T20:00:00Z", venue: "Gillette Stadium · Boston" },
  { id: "m98", num: 98, home: P("m93"), away: P("m94"), date: "2026-07-10", kickoff: "2026-07-10T19:00:00Z", venue: "SoFi Stadium · Los Angeles" },
  { id: "m99", num: 99, home: P("m91"), away: P("m92"), date: "2026-07-11", kickoff: "2026-07-11T21:00:00Z", venue: "Hard Rock Stadium · Miami" },
  { id: "m100", num: 100, home: P("m95"), away: P("m96"), date: "2026-07-11", kickoff: "2026-07-12T01:00:00Z", venue: "Arrowhead Stadium · Kansas City" },
];

const SF: KoMatch[] = [
  { id: "m101", num: 101, home: P("m97"), away: P("m98"), date: "2026-07-14", kickoff: "2026-07-14T19:00:00Z", venue: "AT&T Stadium · Dallas" },
  { id: "m102", num: 102, home: P("m99"), away: P("m100"), date: "2026-07-15", kickoff: "2026-07-15T19:00:00Z", venue: "Mercedes-Benz Stadium · Atlanta" },
];

const FINAL: KoMatch[] = [
  { id: "m104", num: 104, home: P("m101"), away: P("m102"), date: "2026-07-19", kickoff: "2026-07-19T19:00:00Z", venue: "MetLife Stadium · New York/New Jersey" },
];

interface RoundDef {
  id: string;
  name: string;
  /** football-data stage label these matches map to. */
  stage: string;
  matches: KoMatch[];
}

const ROUND_DEFS: RoundDef[] = [
  { id: "r32", name: "Round of 32", stage: "LAST_32", matches: R32 },
  { id: "r16", name: "Round of 16", stage: "LAST_16", matches: R16 },
  { id: "qf", name: "Quarter-finals", stage: "QUARTER_FINALS", matches: QF },
  { id: "sf", name: "Semi-finals", stage: "SEMI_FINALS", matches: SF },
  { id: "final", name: "Final", stage: "FINAL", matches: FINAL },
];

/* ----- Resolution (projection + live overlay) ----- */

interface KoResult {
  stage: string;
  homeId: string;
  awayId: string;
  homeScore: number;
  awayScore: number;
  winnerId: string | null;
}

export interface ResolvedSeed {
  /** Slot label, e.g. "1A", "2B", "3rd C/E/F/H/I", or "Winner 74". */
  label: string;
  /** Team name when known, else a descriptor. */
  name: string;
  /** Team id when a real team occupies the slot (for linking to its squad). */
  id?: string;
  flag?: string;
  host?: boolean;
  /** True when this is a decided team rather than a projection. */
  firm: boolean;
}

export interface ResolvedMatch {
  id: string;
  num: number;
  date: string;
  /** Kick-off instant, UTC ISO — rendered in the viewer's timezone. */
  kickoff: string;
  venue: string;
  home: ResolvedSeed;
  away: ResolvedSeed;
  homeScore?: number;
  awayScore?: number;
  finished: boolean;
  /** Side that advanced, when finished. */
  winner?: "home" | "away";
}

export interface ResolvedRound {
  id: string;
  name: string;
  matches: ResolvedMatch[];
}

const seedFromTeamId = (id: string, label: string, firm: boolean): ResolvedSeed => {
  try {
    const t = teamById(id);
    return { label, name: t.name, id: t.id, flag: t.flag, host: t.host, firm };
  } catch {
    return { label, name: label, firm: false };
  }
};

const groupLabel = (groups: string[]) => `3rd ${groups.join("/")}`;

/**
 * Official FIFA allocation of the 8 best third-placed teams to their Round-of-32
 * slots, keyed by match id → the group whose third-placed team fills that slot.
 * Determined by the draw once the group stage finished (confirmed vs FIFA /
 * Wikipedia): m74 1E–3D, m77 1I–3F, m79 1A–3E, m80 1L–3K, m81 1D–3B,
 * m82 1G–3I, m85 1B–3J, m87 1K–3L.
 */
const THIRD_ALLOCATION: Record<string, string> = {
  m74: "D",
  m77: "F",
  m79: "E",
  m80: "K",
  m81: "B",
  m82: "I",
  m85: "J",
  m87: "L",
};

/** Resolve all rounds, projecting from standings and overlaying live results. */
export function resolveBracket(): ResolvedRound[] {
  const outcomes = groupOutcomes();
  const byGroup = new Map(outcomes.map((o) => [o.group, o]));
  const koResults = (
    (getLiveData() as { koResults?: KoResult[] }).koResults ?? []
  ).slice();

  // teamId that advanced from each resolved knockout match.
  const winners = new Map<string, string>();

  // The projected (or known) teamId for a deterministic seed, if any.
  const projectedTeamId = (
    seed: Seed,
    matchId: string
  ): { id?: string; label: string; firm: boolean } => {
    switch (seed.kind) {
      case "winner": {
        const o = byGroup.get(seed.group)!;
        return { id: o.started ? o.winner.team.id : undefined, label: `1${seed.group}`, firm: o.decided };
      }
      case "runnerUp": {
        const o = byGroup.get(seed.group)!;
        return { id: o.started ? o.runnerUp.team.id : undefined, label: `2${seed.group}`, firm: o.decided };
      }
      case "third": {
        // Once the draw has allocated the best thirds, resolve the real team.
        const grp = THIRD_ALLOCATION[matchId];
        const o = grp ? byGroup.get(grp) : undefined;
        if (o && o.decided) {
          return { id: o.third.team.id, label: `3${grp}`, firm: true };
        }
        return { id: undefined, label: groupLabel(seed.groups), firm: false };
      }
      case "pending": {
        const id = winners.get(seed.from);
        const num = seed.from.replace("m", "");
        return { id, label: `Winner ${num}`, firm: id != null };
      }
    }
  };

  const rounds: ResolvedRound[] = [];

  for (const def of ROUND_DEFS) {
    const stageResults = koResults.filter((k) => k.stage === def.stage);
    const matches: ResolvedMatch[] = def.matches.map((m) => {
      const h = projectedTeamId(m.home, m.id);
      const a = projectedTeamId(m.away, m.id);

      // Find a finished result for this slot: match on whichever side(s) we
      // already know. Each team plays once per round, so a known id is unique.
      const known = [h.id, a.id].filter(Boolean) as string[];
      let result: KoResult | undefined;
      if (known.length > 0) {
        result = stageResults.find((k) => {
          const ids = [k.homeId, k.awayId];
          return known.every((id) => ids.includes(id));
        });
      }

      let home: ResolvedSeed;
      let away: ResolvedSeed;
      let homeScore: number | undefined;
      let awayScore: number | undefined;
      let finished = false;
      let winner: "home" | "away" | undefined;

      if (result) {
        // Orient the result to our home/away slots.
        const homeIsResultHome =
          h.id === result.homeId || (h.id == null && a.id === result.awayId);
        const hId = homeIsResultHome ? result.homeId : result.awayId;
        const aId = homeIsResultHome ? result.awayId : result.homeId;
        home = seedFromTeamId(hId, h.label, true);
        away = seedFromTeamId(aId, a.label, true);
        homeScore = homeIsResultHome ? result.homeScore : result.awayScore;
        awayScore = homeIsResultHome ? result.awayScore : result.homeScore;
        finished = true;
        if (result.winnerId) {
          winners.set(m.id, result.winnerId);
          winner = result.winnerId === hId ? "home" : result.winnerId === aId ? "away" : undefined;
        }
      } else {
        home = h.id
          ? seedFromTeamId(h.id, h.label, h.firm)
          : { label: h.label, name: seedName(m.home, h.label), firm: false };
        away = a.id
          ? seedFromTeamId(a.id, a.label, a.firm)
          : { label: a.label, name: seedName(m.away, a.label), firm: false };
      }

      return { id: m.id, num: m.num, date: m.date, kickoff: m.kickoff, venue: m.venue, home, away, homeScore, awayScore, finished, winner };
    });

    rounds.push({ id: def.id, name: def.name, matches });
  }

  return rounds;
}

/**
 * Display order for a true bracket tree. Each match is ranked by the index of
 * its left-most Round-of-32 descendant — found by walking the pending feeders
 * back from the final — so that within every round the two matches feeding a
 * given next-round match sit directly above and below it. Returns id → rank;
 * sort each round's matches ascending by it. Structure-only, so it never
 * changes as results come in.
 */
export function bracketOrder(): Record<string, number> {
  const byId = new Map<string, KoMatch>();
  for (const def of ROUND_DEFS) for (const m of def.matches) byId.set(m.id, m);

  const rank: Record<string, number> = {};
  let leaf = 0;
  const visit = (id: string): number => {
    const m = byId.get(id);
    if (!m) return leaf;
    const feeders = [m.home, m.away].filter(
      (s): s is Extract<Seed, { kind: "pending" }> => s.kind === "pending"
    );
    if (feeders.length === 0) {
      const r = leaf++;
      rank[id] = r;
      return r;
    }
    const firstLeaf = visit(feeders[0].from);
    for (let i = 1; i < feeders.length; i++) visit(feeders[i].from);
    rank[id] = firstLeaf;
    return firstLeaf;
  };
  visit("m104");
  return rank;
}

/** Display name for an unresolved seed. */
function seedName(seed: Seed, label: string): string {
  if (seed.kind === "third") return "Best third-placed";
  if (seed.kind === "pending") return label;
  return label;
}

/** Third-place play-off & final summary line (not part of the main tree). */
export const finalInfo = {
  thirdPlace: "Third-place play-off · July 18 · Hard Rock Stadium, Miami",
  final: "Final · July 19 · MetLife Stadium, New York/New Jersey",
};
