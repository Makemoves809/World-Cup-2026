import { useEffect } from "react";
import type { Match, PlayerAbsence } from "../data/types";
import { teamById } from "../data/teams";
import { IMPACT_LABELS, sentOffIn, unavailableFor } from "../data/discipline";
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
          <span className="modal-team">
            <Flag team={home} size={22} /> {home.name}
          </span>
          <span className={done ? "modal-score is-final" : "modal-score"}>
            {done ? `${match.homeScore}–${match.awayScore}` : "vs"}
          </span>
          <span className="modal-team modal-team-away">
            {away.name} <Flag team={away} size={22} />
          </span>
        </div>

        <p className="modal-venue">
          {match.venue.stadium} · {match.venue.city}, {match.venue.country}
        </p>

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
