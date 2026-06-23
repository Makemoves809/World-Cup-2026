import type { Match } from "../data/types";
import { matchup } from "./matchup";
import { SQUADS } from "../data/squads";

/**
 * An auto-written "script" for a match — a short read derived entirely from
 * the match-up model (form-adjusted ratings, form trend, players ruled out),
 * so it stays in sync as results come in. A preview before kickoff, a one-line
 * recap once the match is final.
 */
export interface MatchScript {
  /** One-line verdict, e.g. "England are strong favourites". */
  headline: string;
  /** A few sentences of read. */
  lines: string[];
  /** The model's lean scoreline as "home–away" (previews only). */
  projection?: string;
}

function captainName(teamId: string): string | undefined {
  return SQUADS[teamId]?.players.find((p) => p.captain)?.name;
}

const formPhrase = (delta: number): string => {
  if (delta >= 3) return "climbing fast in form";
  if (delta > 0.5) return "trending up";
  if (delta <= -3) return "sliding in form";
  if (delta < -0.5) return "trending down";
  return "holding steady";
};

/** Goals for favourite (hi) and underdog (lo) by the rating gap. */
function tierScore(absGap: number): { hi: number; lo: number } {
  if (absGap < 2) return { hi: 1, lo: 1 };
  if (absGap < 6) return { hi: 2, lo: 1 };
  if (absGap < 13) return { hi: 2, lo: 0 };
  if (absGap < 22) return { hi: 3, lo: 1 };
  return { hi: 3, lo: 0 };
}

export function matchScript(match: Match): MatchScript {
  const m = matchup(match);
  const { home, away } = m;
  const gap = home.effective - away.effective;
  const absGap = Math.abs(gap);
  const favHome = gap >= 0;
  const fav = favHome ? home : away;
  const dog = favHome ? away : home;

  // ----- Finished: recap against what the model expected -----
  if (match.status === "finished" && match.homeScore != null && match.awayScore != null) {
    const hs = match.homeScore;
    const as = match.awayScore;
    const winner = hs > as ? home : hs < as ? away : null;
    const scoreStr = `${home.team.name} ${hs}–${as} ${away.team.name}`;
    let read: string;
    if (!winner) {
      read =
        absGap < 2
          ? "An even match-up that, true to form, finished level."
          : `${fav.team.name} were favoured but had to settle for a draw.`;
    } else if (winner.team.id === fav.team.id) {
      read =
        absGap >= 13
          ? `${winner.team.name} delivered on their billing as strong favourites.`
          : `${winner.team.name}, the slight favourites, got the job done.`;
    } else {
      read =
        absGap >= 13
          ? `A genuine upset — ${winner.team.name} downed the favoured ${fav.team.name}.`
          : `${winner.team.name} edged it against the odds.`;
    }
    return { headline: `Final · ${scoreStr}`, lines: [read] };
  }

  // ----- Preview -----
  const lines: string[] = [];

  // Strength + form read.
  const favCap = captainName(fav.team.id);
  lines.push(
    `${fav.team.name} carry the stronger hand at ${fav.effective} to ` +
      `${dog.team.name}'s ${dog.effective}` +
      (favCap ? `, with ${favCap} to marshal them` : "") +
      `. They're ${formPhrase(fav.formDelta)}, while ${dog.team.name} are ` +
      `${formPhrase(dog.formDelta)}.`
  );

  // The underdog's angle (form rising and/or full-strength).
  if (dog.formDelta >= 2) {
    lines.push(
      `${dog.team.name} arrive as the bigger riser, so this may be tighter ` +
        `than the gap suggests.`
    );
  }

  // Absences shaping it.
  const favOut = fav.outs.length;
  const dogOut = dog.outs.length;
  if (favOut || dogOut) {
    const bits: string[] = [];
    if (favOut)
      bits.push(`${fav.team.name} are missing ${fav.outs.map((o) => o.player).join(", ")}`);
    if (dogOut)
      bits.push(`${dog.team.name} are without ${dog.outs.map((o) => o.player).join(", ")}`);
    lines.push(bits.join("; ") + ".");
  } else {
    lines.push("Both sides are at full strength — no suspensions or injuries bite.");
  }

  // Model's lean scoreline (favourite first, then oriented to home–away).
  let { hi, lo } = tierScore(absGap);
  if (lo === 0 && dog.formDelta >= 3) lo = 1; // in-form dog likely nicks one
  const favGoals = hi;
  const dogGoals = lo;
  const projection =
    absGap < 2
      ? `${hi}–${lo}`
      : favHome
        ? `${favGoals}–${dogGoals}`
        : `${dogGoals}–${favGoals}`;

  return { headline: m.verdict, lines, projection };
}
