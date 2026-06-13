import type { StandingRow } from "../data/types";
import { standingsForGroup } from "./standings";
import { GROUP_IDS } from "../data/teams";

/**
 * Knockout projection.
 *
 * The 2026 World Cup sends 32 teams to the Round of 32: the 12 group winners,
 * the 12 runners-up, and the 8 best third-placed teams. Everything here is
 * derived live from the group standings, so the picture updates on every data
 * refresh. Until a group has played all six matches it is a *projection* — the
 * `decided` flag says whether the order is final.
 *
 * The bracket pairings below follow a standard, fixed layout (every winner,
 * runner-up and best-third slotted exactly once). FIFA confirms the official
 * Round-of-32 slotting only after the group stage, so the tree is presented as
 * a projection for fun rather than the official fixture.
 */

export interface GroupOutcome {
  group: string;
  winner: StandingRow;
  runnerUp: StandingRow;
  third: StandingRow;
  /** True once all six group matches are finished. */
  decided: boolean;
  /** True once any match has been played (there is something to show). */
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
  /** 1-based rank among the 12 third-placed teams. */
  rank: number;
  /** True for the top 8, who reach the Round of 32. */
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

/** A reference to a team's seed in the bracket. */
export type Seed =
  | { kind: "winner"; group: string }
  | { kind: "runnerUp"; group: string }
  | { kind: "third"; index: number } // 0-based into the best-thirds list
  | { kind: "pending"; from: string }; // winner of an earlier knockout match

export interface BracketMatch {
  id: string;
  home: Seed;
  away: Seed;
}

export interface BracketRound {
  id: string;
  name: string;
  matches: BracketMatch[];
}

const W = (group: string): Seed => ({ kind: "winner", group });
const R = (group: string): Seed => ({ kind: "runnerUp", group });
const T = (index: number): Seed => ({ kind: "third", index });
const P = (from: string): Seed => ({ kind: "pending", from });

/**
 * Round of 32 — a fixed bracket layout. Each group winner, runner-up and the
 * eight best thirds appear exactly once. Presented as a projection (see file
 * header).
 */
const R32: BracketMatch[] = [
  { id: "k1", home: W("A"), away: T(0) },
  { id: "k2", home: R("B"), away: R("C") },
  { id: "k3", home: W("D"), away: T(1) },
  { id: "k4", home: W("E"), away: R("F") },
  { id: "k5", home: W("B"), away: T(2) },
  { id: "k6", home: R("A"), away: R("D") },
  { id: "k7", home: W("F"), away: T(3) },
  { id: "k8", home: W("C"), away: R("E") },
  { id: "k9", home: W("G"), away: T(4) },
  { id: "k10", home: R("H"), away: R("I") },
  { id: "k11", home: W("J"), away: T(5) },
  { id: "k12", home: W("K"), away: R("L") },
  { id: "k13", home: W("H"), away: T(6) },
  { id: "k14", home: R("G"), away: R("J") },
  { id: "k15", home: W("L"), away: T(7) },
  { id: "k16", home: W("I"), away: R("K") },
];

/** Pair up consecutive matches of a round into the next round. */
function nextRound(prefix: string, prev: BracketMatch[]): BracketMatch[] {
  const out: BracketMatch[] = [];
  for (let i = 0; i < prev.length; i += 2) {
    out.push({
      id: `${prefix}${i / 2 + 1}`,
      home: P(prev[i].id),
      away: P(prev[i + 1].id),
    });
  }
  return out;
}

const R16 = nextRound("r16-", R32);
const QF = nextRound("qf-", R16);
const SF = nextRound("sf-", QF);
const FINAL = nextRound("final-", SF);

export const bracketRounds: BracketRound[] = [
  { id: "r32", name: "Round of 32", matches: R32 },
  { id: "r16", name: "Round of 16", matches: R16 },
  { id: "qf", name: "Quarter-finals", matches: QF },
  { id: "sf", name: "Semi-finals", matches: SF },
  { id: "final", name: "Final", matches: FINAL },
];

export interface ResolvedSeed {
  /** Short label, e.g. "MEX", "1A", "3rd", or "W k1". */
  label: string;
  /** Full team name when known, else a descriptor. */
  name: string;
  /** flagcdn slug when a team is known. */
  flag?: string;
  host?: boolean;
  /** True when this is a concrete, decided team rather than a projection. */
  firm: boolean;
}

/** Resolve a seed to a displayable team or placeholder, given live standings. */
export function resolveSeed(
  seed: Seed,
  outcomes: GroupOutcome[],
  thirds: ThirdPlaceRow[],
): ResolvedSeed {
  switch (seed.kind) {
    case "winner": {
      const o = outcomes.find((x) => x.group === seed.group)!;
      return seedFromRow(o.winner, `1${seed.group}`, o.started, o.decided);
    }
    case "runnerUp": {
      const o = outcomes.find((x) => x.group === seed.group)!;
      return seedFromRow(o.runnerUp, `2${seed.group}`, o.started, o.decided);
    }
    case "third": {
      const t = thirds[seed.index];
      if (!t || t.row.played === 0) {
        return { label: "3rd", name: "Best third-placed", firm: false };
      }
      return seedFromRow(t.row, "3rd", true, t.row.played === 3);
    }
    case "pending":
      return { label: `W ${seed.from}`, name: "Winner", firm: false };
  }
}

function seedFromRow(
  row: StandingRow,
  code: string,
  started: boolean,
  decided: boolean,
): ResolvedSeed {
  if (!started) {
    return { label: code, name: code, firm: false };
  }
  return {
    label: row.team.code,
    name: row.team.name,
    flag: row.team.flag,
    host: row.team.host,
    firm: decided,
  };
}
