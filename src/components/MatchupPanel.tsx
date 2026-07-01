import { IMPACT_LABELS } from "../data/discipline";
import type { Matchup, TeamStrength } from "../lib/matchup";
import { Flag } from "./Flag";

/**
 * The "Team comparison" block — the strength bar, per-team rows (each opening
 * that squad), the verdict, and the expandable breakdown. Shared by the group
 * match detail and the knockout match detail so both read identically.
 */
export function MatchupPanel({
  m,
  onOpen,
}: {
  m: Matchup;
  onOpen: (teamId: string) => void;
}) {
  return (
    <section className="modal-section matchup">
      <h4 className="modal-head">Team comparison</h4>
      <div
        className="vs-bar"
        role="img"
        aria-label={`Strength ${m.home.effective} vs ${m.away.effective}`}
      >
        <span
          className={`vs-fill vs-home${m.favored === "home" ? " is-fav" : ""}`}
          style={{ width: `${m.homeShare}%` }}
        />
        <span
          className={`vs-fill vs-away${m.favored === "away" ? " is-fav" : ""}`}
          style={{ width: `${100 - m.homeShare}%` }}
        />
      </div>
      <div className="vs-rows">
        <TeamStrengthRow s={m.home} side="home" onOpen={onOpen} />
        <TeamStrengthRow s={m.away} side="away" onOpen={onOpen} />
      </div>
      <p className="vs-verdict">{m.verdict}</p>

      <details className="vs-details">
        <summary>Why these numbers?</summary>
        <p className="vs-explain">
          Each side starts from a rating that blends its FIFA ranking with
          tournament form — results so far nudge it up (▲) or down (▼), so an
          upset like a 0–0 dents the favourite. It then loses points for players
          ruled out (weighted by impact 1–5 and position). Deeper squads are
          docked a little less.
        </p>
        <StrengthBreakdown s={m.home} />
        <StrengthBreakdown s={m.away} />
      </details>
    </section>
  );
}

function StrengthBreakdown({ s }: { s: TeamStrength }) {
  return (
    <div className="vs-bd">
      <div className="vs-bd-head">
        <span className="vs-bd-team">
          <Flag team={s.team} size={14} /> {s.team.name}
        </span>
        <span className="vs-bd-base">
          {s.base}
          {s.formDelta !== 0 && (
            <em className="vs-bd-form">
              {" "}
              · FIFA {s.fifaBase} {s.formDelta > 0 ? "+" : ""}
              {s.formDelta} form
            </em>
          )}
        </span>
      </div>
      {s.breakdown.length === 0 ? (
        <p className="vs-bd-none">Full strength — no players out.</p>
      ) : (
        <ul className="vs-bd-list">
          {s.breakdown.map((b) => (
            <li key={b.absence.player}>
              <span>
                {b.absence.player}
                {b.absence.position ? ` · ${b.absence.position}` : ""}{" "}
                <em>({IMPACT_LABELS[b.absence.impact]})</em>
              </span>
              <span className="vs-bd-pts">−{b.points}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="vs-bd-foot">
        {s.penalty > 0 ? (
          <span>
            −{s.penalty} total · depth ×{s.depth}
          </span>
        ) : (
          <span />
        )}
        <span className="vs-bd-eff">= {s.effective}</span>
      </div>
    </div>
  );
}

function TeamStrengthRow({
  s,
  side,
  onOpen,
}: {
  s: TeamStrength;
  side: "home" | "away";
  onOpen: (teamId: string) => void;
}) {
  return (
    <div className={`vs-row vs-${side}`}>
      <button
        type="button"
        className="vs-team-id team-link"
        onClick={() => onOpen(s.team.id)}
        title={`${s.team.name} squad`}
      >
        <Flag team={s.team} size={16} />
        <span className="vs-name">{s.team.name}</span>
        <span className="team-link-cue" aria-hidden="true">›</span>
      </button>
      <span className="vs-figs">
        {s.formDelta !== 0 && (
          <span
            className={`vs-form ${s.formDelta > 0 ? "up" : "down"}`}
            title="Form vs pre-tournament rating"
          >
            {s.formDelta > 0 ? "▲" : "▼"}
            {Math.abs(s.formDelta)}
          </span>
        )}
        {s.penalty > 0 && (
          <span
            className="vs-pen"
            title={`Out: ${s.outs.map((o) => o.player).join(", ")}`}
          >
            −{s.penalty}
          </span>
        )}
        <span className="vs-rating">{s.effective}</span>
      </span>
    </div>
  );
}
