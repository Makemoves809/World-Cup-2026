import { matches } from "../data/fixtures";
import live from "../data/live.json";

/** Full tournament = 104 matches (72 group + 32 knockout). */
const TOTAL = 104;
const FINAL = Date.UTC(2026, 6, 19); // July 19, 2026 — the final
const GROUP_END = Date.UTC(2026, 5, 27); // June 27 — last group-stage day
const DAY = 86_400_000;

export function TournamentProgress() {
  const now = Date.now();
  const groupPlayed = matches.filter((m) => m.status === "finished").length;
  const koPlayed = ((live as { koResults?: unknown[] }).koResults ?? []).length;
  const played = Math.min(TOTAL, groupPlayed + koPlayed);
  const remaining = Math.max(0, TOTAL - played);
  const daysToFinal = Math.max(0, Math.ceil((FINAL - now) / DAY));
  const pct = Math.round((played / TOTAL) * 100);

  const inGroupStage = now < GROUP_END;
  const phase = inGroupStage
    ? `Group stage · ${Math.max(0, Math.ceil((GROUP_END - now) / DAY))} days left`
    : "Knockout stage";

  return (
    <section className="progress" aria-label="Tournament progress">
      <span className="kicker">{phase}</span>
      <div className="progress-stats">
        <div className="prog-stat">
          <span className="prog-num">{daysToFinal}</span>
          <span className="prog-lab">days to the final</span>
        </div>
        <div className="prog-stat">
          <span className="prog-num">{played}</span>
          <span className="prog-lab">matches played</span>
        </div>
        <div className="prog-stat">
          <span className="prog-num">{remaining}</span>
          <span className="prog-lab">matches to go</span>
        </div>
      </div>
      <div
        className="prog-bar"
        role="img"
        aria-label={`${pct}% of matches played`}
      >
        <span className="prog-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="prog-cap">
        {played} of {TOTAL} matches played · Final July 19 at MetLife Stadium
      </p>
    </section>
  );
}
