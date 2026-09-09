/**
 * The Champions League league-phase table, computed from results.
 *
 * All 36 clubs sit in one table. Each finished league fixture (from
 * live.json `results`, keyed by the ids in data/clFixtures.ts) contributes
 * 3/1/0 points. Sort: points → goal difference → goals scored → name.
 * (UEFA's full tiebreaker chain continues into away goals, wins, etc.; that
 * only matters for clubs level on all three, and is a curation call if it
 * ever decides a qualification spot.)
 *
 * Bands, by position: 1–8 straight to the Round of 16; 9–24 into the
 * two-legged knockout play-off; 25–36 eliminated.
 *
 * We compute from results rather than using the feed's own standings table,
 * because that table lags: it has been observed reporting a club's goal
 * difference from mid-match (AEK at +1 while the finished result was 2–0,
 * i.e. +2). Results are always the finished truth. But UEFA's tiebreaker
 * chain runs past goals scored (head-to-head, away goals, wins, disciplinary
 * points...), which we can't replicate — so when clubs are genuinely level on
 * points, goal difference and goals scored, we defer to the feed's own
 * ordering before falling back to alphabetical.
 */
import { CLUBS, type Club } from "../data/clubs";
import { CL_FIXTURES } from "../data/clFixtures";
import { resultFor, officialPosition } from "./clLive";

export interface StandingRow {
  club: Club;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export type Band = "go" | "playoff" | "out";

/** Which band a table position falls in (1-based). */
export const bandFor = (pos: number): Band =>
  pos <= 8 ? "go" : pos <= 24 ? "playoff" : "out";

export function leagueTable(): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  for (const club of CLUBS) {
    rows.set(club.id, { club, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
  }
  for (const f of CL_FIXTURES) {
    const r = resultFor(f.id);
    if (!r) continue;
    const [h, a] = r;
    const H = rows.get(f.home);
    const A = rows.get(f.away);
    if (!H || !A) continue;
    H.played++;
    A.played++;
    H.gf += h;
    H.ga += a;
    A.gf += a;
    A.ga += h;
    if (h > a) {
      H.won++;
      A.lost++;
      H.pts += 3;
    } else if (h < a) {
      A.won++;
      H.lost++;
      A.pts += 3;
    } else {
      H.drawn++;
      A.drawn++;
      H.pts++;
      A.pts++;
    }
  }
  for (const r of rows.values()) r.gd = r.gf - r.ga;
  return [...rows.values()].sort(
    (x, y) =>
      y.pts - x.pts ||
      y.gd - x.gd ||
      y.gf - x.gf ||
      // Genuinely level: use UEFA's own ordering, which applies tiebreakers
      // we can't compute. Clubs the feed hasn't ranked sort last.
      (officialPosition(x.club.id) ?? 99) - (officialPosition(y.club.id) ?? 99) ||
      x.club.name.localeCompare(y.club.name)
  );
}

/** True once at least one league-phase result is in. */
export const seasonStarted = (): boolean => leagueTable().some((r) => r.played > 0);
