import type { Match } from "../data/types";
import { matches } from "../data/fixtures";
import { TEAM_RATING, teamRating } from "../data/ratings";

/**
 * Form-adjusted team strength. Each team starts from its pre-tournament
 * FIFA-based rating, then every finished result nudges it Elo-style: teams
 * are rewarded/punished by how the result compares to expectation given the
 * two ratings (a shock — Spain drawing Cabo Verde — drops the favourite and
 * lifts the underdog), scaled by the goal margin. Derived purely from scores
 * we already have, so it updates automatically as games are played.
 */

const D = 18; // rating-gap scale for the expected-result curve
const K = 3.5; // how strongly each result moves the rating
const clamp = (n: number) => Math.max(30, Math.min(99, n));

export interface FormRating {
  /** Current, form-adjusted rating. */
  rating: number;
  /** Pre-tournament FIFA-based rating. */
  base: number;
  /** rating − base (positive = trending up). */
  delta: number;
  played: number;
}

function compute(): Map<string, FormRating> {
  const cur = new Map<string, number>();
  const played = new Map<string, number>();
  for (const id of Object.keys(TEAM_RATING)) cur.set(id, TEAM_RATING[id]);

  const finished = (matches as Match[])
    .filter(
      (m) =>
        m.status === "finished" && m.homeScore != null && m.awayScore != null
    )
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));

  for (const m of finished) {
    const rA = cur.get(m.home) ?? teamRating(m.home);
    const rB = cur.get(m.away) ?? teamRating(m.away);
    const eA = 1 / (1 + Math.pow(10, (rB - rA) / D)); // expected score for home
    const hs = m.homeScore!;
    const as = m.awayScore!;
    const sHome = hs > as ? 1 : hs < as ? 0 : 0.5; // win / loss / draw
    const margin = Math.abs(hs - as);
    const mult = 1 + 0.4 * Math.log2(1 + margin); // bigger wins move more
    const delta = K * mult * (sHome - eA);
    cur.set(m.home, clamp(rA + delta));
    cur.set(m.away, clamp(rB - delta));
    played.set(m.home, (played.get(m.home) ?? 0) + 1);
    played.set(m.away, (played.get(m.away) ?? 0) + 1);
  }

  const out = new Map<string, FormRating>();
  for (const id of Object.keys(TEAM_RATING)) {
    const base = TEAM_RATING[id];
    const rating = Math.round((cur.get(id) ?? base) * 10) / 10;
    out.set(id, {
      rating,
      base,
      delta: Math.round((rating - base) * 10) / 10,
      played: played.get(id) ?? 0,
    });
  }
  return out;
}

// Source data is static per build, so compute once.
const FORM = compute();

export function formRating(id: string): FormRating {
  const f = FORM.get(id);
  if (f) return f;
  const base = teamRating(id);
  return { rating: base, base, delta: 0, played: 0 };
}
