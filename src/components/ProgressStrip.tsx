import { tournamentProgress } from "../lib/progress";

/** Slim sitewide progress bar shown under the header on every page. */
export function ProgressStrip() {
  const p = tournamentProgress();

  return (
    <div className="pstrip" aria-label="Tournament progress">
      <div className="pstrip-inner">
        <span className="pstrip-phase">{p.phase}</span>
        <span className="pstrip-stat">
          <b>{p.daysToFinal}</b> days to final
        </span>
        <span className="pstrip-stat">
          <b>{p.played}</b>/{p.total} played
        </span>
        <span className="pstrip-stat pstrip-togo">
          <b>{p.remaining}</b> to go
        </span>
      </div>
      <div className="pstrip-track">
        <span className="pstrip-fill" style={{ width: `${p.pct}%` }} />
      </div>
    </div>
  );
}
