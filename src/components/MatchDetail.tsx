import { useEffect } from "react";
import type { Match, PlayerAbsence } from "../data/types";
import { teamById } from "../data/teams";
import { IMPACT_LABELS, sentOffIn, unavailableFor } from "../data/discipline";
import { attendanceFor } from "../data/attendance";
import { matchup, type TeamStrength } from "../lib/matchup";
import { matchScript } from "../lib/script";
import { gradeMatch, modelAccuracy } from "../lib/accuracy";
import { matchNote } from "../data/matchNotes";
import { openRoster, isRosterOpen } from "../lib/roster";
import { Flag } from "./Flag";

const fmtFull = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

interface MatchDetailProps {
  match: Match;
  onClose: () => void;
}

export function MatchDetail({ match, onClose }: MatchDetailProps) {
  const home = teamById(match.home);
  const away = teamById(match.away);
  const done = match.status === "finished";
  const reds = sentOffIn(match.id);
  const out = unavailableFor(match.id);
  const m = matchup(match);
  const script = matchScript(match);
  const grade = gradeMatch(match);
  const acc = modelAccuracy();
  const note = matchNote(match.id);

  // Open the roster as an overlay *on top of* this comparison (it sits at a
  // higher z-index) rather than closing it — so dismissing the roster returns
  // here, not all the way back to the fixtures list.
  const openSquad = (teamId: string) => {
    openRoster(teamId);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // If a roster overlay is open on top, let it handle Escape first so we
      // don't close both layers at once.
      if (e.key === "Escape" && !isRosterOpen()) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${home.name} vs ${away.name} match details`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <p className="modal-kicker">
          Group {match.group} · {fmtFull.format(new Date(match.kickoff))}
          {done && <span className="ft-badge">FT</span>}
        </p>

        <div className="modal-tie">
          <button
            type="button"
            className="modal-team team-link"
            onClick={() => openSquad(home.id)}
            title={`${home.name} squad`}
          >
            <Flag team={home} size={22} /> {home.name}
          </button>
          <span className={done ? "modal-score is-final" : "modal-score"}>
            {done ? `${match.homeScore}–${match.awayScore}` : "vs"}
          </span>
          <button
            type="button"
            className="modal-team modal-team-away team-link"
            onClick={() => openSquad(away.id)}
            title={`${away.name} squad`}
          >
            {away.name} <Flag team={away} size={22} />
          </button>
        </div>

        <p className="modal-venue">
          {match.venue.stadium} · {match.venue.city}, {match.venue.country}
        </p>

        <Attendance match={match} />

        <section className="modal-section match-script">
          <h4 className="modal-head">
            <span className="script-tag">Script</span>
            {match.status === "finished" ? "Match recap" : "The read"}
          </h4>
          <p className="script-headline">{script.headline}</p>
          {note && (
            <p className="script-note">
              <span className="script-note-tag">Editor's note</span>
              {note}
            </p>
          )}
          {script.lines.map((line, i) => (
            <p key={i} className="script-line">
              {line}
            </p>
          ))}
          {script.projection && (
            <p className="script-projection">
              Model lean
              <span className="script-score">{script.projection}</span>
            </p>
          )}
          {grade && (
            <p className={`script-grade ${grade.outcomeHit ? "is-hit" : "is-miss"}`}>
              <span className="grade-mark">{grade.outcomeHit ? "✓" : "✗"}</span>
              {grade.outcomeHit ? "Called the result" : "Missed the result"}
              <span className="grade-detail">
                pre-match lean {grade.projection}
                {grade.exactHit && " — exact score"}
              </span>
            </p>
          )}
          <p className="script-foot">
            Auto-generated from the form-adjusted ratings below — a projection,
            not a prediction.
            {acc.graded > 0 && (
              <>
                {" "}
                <strong className="script-record">
                  Script record: {acc.outcomeCorrect}/{acc.graded} results right (
                  {acc.outcomePct}%){acc.exactCorrect > 0 && `, ${acc.exactCorrect} exact`}
                </strong>
              </>
            )}
          </p>
        </section>

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
            <TeamStrengthRow s={m.home} side="home" onOpen={openSquad} />
            <TeamStrengthRow s={m.away} side="away" onOpen={openSquad} />
          </div>
          <p className="vs-verdict">{m.verdict}</p>

          <details className="vs-details">
            <summary>Why these numbers?</summary>
            <p className="vs-explain">
              Each side starts from a rating that blends its FIFA ranking with
              tournament form — results so far nudge it up (▲) or down (▼), so
              an upset like a 0–0 dents the favourite. It then loses points for
              players ruled out (weighted by impact 1–5 and position). Deeper
              squads are docked a little less.
            </p>
            <StrengthBreakdown s={m.home} />
            <StrengthBreakdown s={m.away} />
          </details>
        </section>

        {reds.length > 0 && (
          <section className="modal-section">
            <h4 className="modal-head">
              <i className="rc" aria-hidden="true" /> Red cards in this match
            </h4>
            <ul className="player-list">
              {reds.map((a) => (
                <PlayerRow key={a.player} a={a} />
              ))}
            </ul>
          </section>
        )}

        {out.length > 0 && (
          <section className="modal-section">
            <h4 className="modal-head">
              <i className="sus-dot" aria-hidden="true" /> Ruled out of this match
            </h4>
            <ul className="player-list">
              {out.map((a) => (
                <PlayerRow key={a.player} a={a} />
              ))}
            </ul>
          </section>
        )}

        {reds.length === 0 && out.length === 0 && (
          <p className="modal-clean">
            No red cards or suspensions affect this match — both squads at full
            strength.
          </p>
        )}

        <p className="modal-foot">
          Impact gauges how big a loss each absent player is to their side,
          from fringe player to star.
        </p>
      </div>
    </div>
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

function Attendance({ match }: { match: Match }) {
  const att = attendanceFor(match.id);
  const cap = match.venue.capacity;
  if (att == null && cap == null) return null;
  const pct =
    att != null && cap ? Math.min(100, Math.round((att / cap) * 100)) : null;

  return (
    <div className="attendance">
      <div className="att-stats">
        <div className="att-stat">
          <span className="att-label">Attendance</span>
          <span className="att-num">
            {att != null ? att.toLocaleString() : "—"}
          </span>
        </div>
        <div className="att-stat att-stat-cap">
          <span className="att-label">Capacity</span>
          <span className="att-num">
            {cap != null ? cap.toLocaleString() : "—"}
          </span>
        </div>
        {pct != null && (
          <div className="att-stat att-stat-pct">
            <span className="att-label">Full</span>
            <span className="att-num">{pct}%</span>
          </div>
        )}
      </div>
      {pct != null && (
        <div className="att-bar" role="img" aria-label={`${pct}% full`}>
          <span className="att-fill" style={{ width: `${pct}%` }} />
          <span className="att-bar-pct">{pct}% full</span>
        </div>
      )}
      {att == null && (
        <p className="att-note">Attendance reported after kickoff.</p>
      )}
    </div>
  );
}

function PlayerRow({ a }: { a: PlayerAbsence }) {
  const team = teamById(a.team);
  return (
    <li className="player-row">
      <div className="player-main">
        <span className="player-name">
          <Flag team={team} size={14} /> {a.player}
          {a.position && <em className="player-pos">{a.position}</em>}
        </span>
        <span className="player-reason">{a.reason}</span>
        {a.note && <span className="player-note">{a.note}</span>}
      </div>
      <div className="impact" data-level={a.impact}>
        <span className="impact-label">{IMPACT_LABELS[a.impact]}</span>
        <span
          className="impact-meter"
          role="img"
          aria-label={`Impact ${a.impact} out of 5 — ${IMPACT_LABELS[a.impact]}`}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <i key={i} className={i <= a.impact ? "seg is-on" : "seg"} />
          ))}
        </span>
      </div>
    </li>
  );
}
