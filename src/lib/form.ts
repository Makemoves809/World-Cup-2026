import type { Match } from "../data/types";
import { matches } from "../data/fixtures";
import { TEAM_RATING, teamRating } from "../data/ratings";
import { resolveBracket, resolveThirdPlace } from "./bracket";

/**
 * Form-adjusted team strength. Each team starts from its pre-tournament
 * FIFA-based rating, then every finished result nudges it Elo-style: teams
 * are rewarded/punished by how the result compares to expectation given the
 * two ratings (a shock — Spain drawing Cabo Verde — drops the favourite and
 * lifts the underdog), scaled by the goal margin. Derived purely from scores
 * we already have, so it updates automatically as games are played — group
 * stage AND knockouts, which live in two separate data sources and have to
 * be merged (same pattern as `TeamResults`/`tournamentStats`).
 */

const D = 18; // rating-gap scale for the expected-result curve
const K = 3.5; // how strongly each result moves the rating
const clamp = (n: number) => Math.max(30, Math.min(99, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

export interface FormRating {
  /** Current, form-adjusted rating. */
  rating: number;
  /** Pre-tournament FIFA-based rating. */
  base: number;
  /** rating − base (positive = trending up). */
  delta: number;
  played: number;
}

interface ResultInput {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  kickoff: string;
  /**
   * Explicit result override for knockout ties decided on penalties — the
   * scoreline alone (e.g. 0–0) would otherwise register as a draw, when one
   * side clearly won and advanced.
   */
  winner?: "home" | "away";
}

/** Every finished result, group stage and knockouts combined, kickoff order. */
function allFinishedResults(): ResultInput[] {
  const group: ResultInput[] = (matches as Match[])
    .filter(
      (m) =>
        m.status === "finished" && m.homeScore != null && m.awayScore != null
    )
    .map((m) => ({
      home: m.home,
      away: m.away,
      homeScore: m.homeScore!,
      awayScore: m.awayScore!,
      kickoff: m.kickoff,
    }));

  const ko: ResultInput[] = [];
  for (const round of resolveBracket()) {
    for (const m of round.matches) {
      if (m.finished && m.home.id && m.away.id && m.homeScore != null && m.awayScore != null) {
        ko.push({
          home: m.home.id,
          away: m.away.id,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          kickoff: m.kickoff,
          winner: m.winner,
        });
      }
    }
  }
  const third = resolveThirdPlace();
  if (
    third.finished &&
    third.home.id &&
    third.away.id &&
    third.homeScore != null &&
    third.awayScore != null
  ) {
    ko.push({
      home: third.home.id,
      away: third.away.id,
      homeScore: third.homeScore,
      awayScore: third.awayScore,
      kickoff: third.kickoff,
      winner: third.winner,
    });
  }

  return [...group, ...ko].sort((a, b) => a.kickoff.localeCompare(b.kickoff));
}

/**
 * Replay every finished result in kickoff order, accumulating the
 * Elo-style ratings. Returns each team's live rating and games-played count.
 */
function accumulate(): Map<string, { rating: number; played: number }> {
  const cur = new Map<string, number>();
  const played = new Map<string, number>();
  for (const id of Object.keys(TEAM_RATING)) cur.set(id, TEAM_RATING[id]);

  for (const r of allFinishedResults()) {
    const rA = cur.get(r.home) ?? teamRating(r.home);
    const rB = cur.get(r.away) ?? teamRating(r.away);
    const eA = 1 / (1 + Math.pow(10, (rB - rA) / D)); // expected score for home
    const hs = r.homeScore;
    const as = r.awayScore;
    // A knockout tie always has a winner — use it when the scoreline alone
    // is a draw (i.e. the tie went to penalties) rather than reading a 0.5.
    const sHome = r.winner
      ? r.winner === "home"
        ? 1
        : 0
      : hs > as
      ? 1
      : hs < as
      ? 0
      : 0.5;
    const margin = Math.abs(hs - as);
    const mult = 1 + 0.4 * Math.log2(1 + margin); // bigger wins move more
    const delta = K * mult * (sHome - eA);
    cur.set(r.home, clamp(rA + delta));
    cur.set(r.away, clamp(rB - delta));
    played.set(r.home, (played.get(r.home) ?? 0) + 1);
    played.set(r.away, (played.get(r.away) ?? 0) + 1);
  }

  const out = new Map<string, { rating: number; played: number }>();
  for (const id of Object.keys(TEAM_RATING)) {
    out.set(id, {
      rating: round1(cur.get(id) ?? TEAM_RATING[id]),
      played: played.get(id) ?? 0,
    });
  }
  return out;
}

function toFormRatings(
  acc: Map<string, { rating: number; played: number }>
): Map<string, FormRating> {
  const out = new Map<string, FormRating>();
  for (const id of Object.keys(TEAM_RATING)) {
    const base = TEAM_RATING[id];
    const a = acc.get(id)!;
    out.set(id, {
      rating: a.rating,
      base,
      delta: round1(a.rating - base),
      played: a.played,
    });
  }
  return out;
}

// Source data is static per build, so compute the all-results table once.
const FORM = toFormRatings(accumulate());

export function formRating(id: string): FormRating {
  const f = FORM.get(id);
  if (f) return f;
  const base = teamRating(id);
  return { rating: base, base, delta: 0, played: 0 };
}
