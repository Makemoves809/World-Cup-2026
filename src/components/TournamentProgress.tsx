import { tournamentProgress } from "../lib/progress";

export function TournamentProgress() {
  const p = tournamentProgress();

  return (
    <section className="progress" aria-label="Tournament progress">
      <span className="kicker">{p.phase}</span>
      <div className="progress-stats">
        <div className="prog-stat">
          <span className="prog-num">{p.daysToFinal}</span>
          <span className="prog-lab">days to the final</span>
        </div>
        <div className="prog-stat">
          <span className="prog-num">{p.played}</span>
          <span className="prog-lab">matches played</span>
        </div>
        <div className="prog-stat">
          <span className="prog-num">{p.remaining}</span>
          <span className="prog-lab">matches to go</span>
        </div>
      </div>
      <div
        className="prog-bar"
        role="img"
        aria-label={`${p.pct}% of matches played`}
      >
        <span className="prog-fill" style={{ width: `${p.pct}%` }} />
      </div>
      <p className="prog-cap">
        {p.played} of {p.total} matches played · Final July 19 at MetLife
        Stadium
      </p>
    </section>
  );
}
