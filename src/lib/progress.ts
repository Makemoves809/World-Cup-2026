import { matches } from "../data/fixtures";
import { getLiveData } from "./liveData";

/** Full tournament = 104 matches (72 group + 32 knockout). */
const TOTAL = 104;
const FINAL = Date.UTC(2026, 6, 19); // July 19, 2026 — the final
const GROUP_END = Date.UTC(2026, 5, 27); // June 27 — last group-stage day
const DAY = 86_400_000;

export interface Progress {
  total: number;
  played: number;
  remaining: number;
  daysToFinal: number;
  pct: number;
  inGroupStage: boolean;
  phase: string;
}

/** Live tournament progress, derived from results + the calendar. */
export function tournamentProgress(now = Date.now()): Progress {
  const groupPlayed = matches.filter((m) => m.status === "finished").length;
  const koPlayed = ((getLiveData() as { koResults?: unknown[] }).koResults ?? [])
    .length;
  const played = Math.min(TOTAL, groupPlayed + koPlayed);
  const remaining = Math.max(0, TOTAL - played);
  const daysToFinal = Math.max(0, Math.ceil((FINAL - now) / DAY));
  const pct = Math.round((played / TOTAL) * 100);
  const inGroupStage = now < GROUP_END;
  // Name the current knockout round from how many KO games have been played
  // (R32 = 16 games, R16 = 8, QF = 4, SF = 2, then the final).
  const koRound =
    koPlayed < 16
      ? "Round of 32"
      : koPlayed < 24
      ? "Round of 16"
      : koPlayed < 28
      ? "Quarter-finals"
      : koPlayed < 30
      ? "Semi-finals"
      : "Final";
  const phase = inGroupStage
    ? `Group stage · ${Math.max(0, Math.ceil((GROUP_END - now) / DAY))} days left`
    : koRound;
  return { total: TOTAL, played, remaining, daysToFinal, pct, inGroupStage, phase };
}
