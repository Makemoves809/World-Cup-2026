import type { Match } from "../data/types";
import { matches } from "../data/fixtures";
import { TEAM_RATING, teamRating } from "../data/ratings";
import { formRatingsBefore } from "./form";
import { predict } from "./script";

/**
 * How the Script's pre-match call fared against the actual result. Every
 * judgement uses the ratings *as they stood before that kickoff*, so the
 * match being graded never informs its own prediction — no hindsight.
 */
export interface MatchGrade {
  /** "home" | "away" | "draw" the model leaned toward. */
  predicted: "home" | "away" | "draw";
  /** What actually happened. */
  actual: "home" | "away" | "draw";
  /** The model's lean scoreline, "home–away". */
  projection: string;
  /** Predicted the correct outcome (W/D/L). */
  outcomeHit: boolean;
  /** Nailed the exact scoreline. */
  exactHit: boolean;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function baseOf(teamId: string): number {
  return TEAM_RATING[teamId] ?? teamRating(teamId);
}

function gradeWith(match: Match, ratings: Map<string, { rating: number }>): MatchGrade {
  const homeBase = baseOf(match.home);
  const awayBase = baseOf(match.away);
  const homeEff = ratings.get(match.home)?.rating ?? homeBase;
  const awayEff = ratings.get(match.away)?.rating ?? awayBase;
  const p = predict(
    homeEff,
    awayEff,
    round1(homeEff - homeBase),
    round1(awayEff - awayBase)
  );

  const hs = match.homeScore!;
  const as = match.awayScore!;
  const actual = hs > as ? "home" : hs < as ? "away" : "draw";
  const predicted = p.favored ?? "draw";

  return {
    predicted,
    actual,
    projection: p.projection,
    outcomeHit: predicted === actual,
    exactHit: p.homeGoals === hs && p.awayGoals === as,
  };
}

/** Grade a single finished match's pre-match call (null if not finished). */
export function gradeMatch(match: Match): MatchGrade | null {
  if (match.status !== "finished" || match.homeScore == null || match.awayScore == null)
    return null;
  return gradeWith(match, formRatingsBefore(match.kickoff));
}

export interface ModelAccuracy {
  /** Finished matches graded so far. */
  graded: number;
  /** Correct outcome (win/draw/loss) calls. */
  outcomeCorrect: number;
  /** Exact-scoreline calls. */
  exactCorrect: number;
  /** Outcome hit-rate, 0–100. */
  outcomePct: number;
}

function compute(): ModelAccuracy {
  const finished = (matches as Match[])
    .filter(
      (m) =>
        m.status === "finished" && m.homeScore != null && m.awayScore != null
    )
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));

  let outcomeCorrect = 0;
  let exactCorrect = 0;
  for (const m of finished) {
    const g = gradeWith(m, formRatingsBefore(m.kickoff));
    if (g.outcomeHit) outcomeCorrect++;
    if (g.exactHit) exactCorrect++;
  }
  const graded = finished.length;
  return {
    graded,
    outcomeCorrect,
    exactCorrect,
    outcomePct: graded ? Math.round((outcomeCorrect / graded) * 100) : 0,
  };
}

// Static per build — compute once.
const ACCURACY = compute();

/** The Script model's running record across all finished matches. */
export function modelAccuracy(): ModelAccuracy {
  return ACCURACY;
}
