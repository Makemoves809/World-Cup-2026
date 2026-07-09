import { useEffect } from "react";
import type { Match } from "../data/types";
import { teamById } from "../data/teams";
import { sentOffIn, unavailableFor } from "../data/discipline";
import { attendanceFor } from "../data/attendance";
import { isLive, liveScore } from "../lib/live";
import { goalsFor, minuteLabel, type Goal } from "../data/goals";
import { matchup } from "../lib/matchup";
import { openRoster, isRosterOpen } from "../lib/roster";
import { useSheetDismiss } from "../lib/useSheetDismiss";
import { Flag } from "./Flag";
import { MatchupPanel } from "./MatchupPanel";
import { PlayerRow } from "./PlayerRow";

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
  const isLiveNow = isLive(match, Date.now());
  const ls = isLiveNow ? liveScore(match.id) : undefined;
  const goals = goalsFor(match.id);
  const reds = sentOffIn(match.id);
  const out = unavailableFor(match.id, [match.home, match.away]);
  const m = matchup(match);
  const sheet = useSheetDismiss(onClose);

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
        ref={sheet.ref}
        style={sheet.style}
        onTouchStart={sheet.onTouchStart}
        onTouchMove={sheet.onTouchMove}
        onTouchEnd={sheet.onTouchEnd}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <p className="modal-kicker">
          Group {match.group} · {fmtFull.format(new Date(match.kickoff))}
          {done && <span className="ft-badge">FT</span>}
          {isLiveNow && (
            <span className="live-badge">
              <span className="live-dot" aria-hidden="true" /> LIVE
            </span>
          )}
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
          <span
            className={
              done ? "modal-score is-final" : isLiveNow ? "modal-score is-live" : "modal-score"
            }
          >
            {done ? `${match.homeScore}–${match.awayScore}` : isLiveNow ? `${ls?.home ?? 0}–${ls?.away ?? 0}` : "vs"}
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

        {isLiveNow && ls?.minute != null && (
          <p className="modal-venue live-status">
            <span className="live-min">{ls.minute}'</span>
          </p>
        )}

        {goals.length > 0 && (
          <p className="modal-venue">
            Scorers: {goals.map((g, i) => <GoalMention key={i} g={g} first={i === 0} />)}
          </p>
        )}

        <p className="modal-venue">
          {match.venue.stadium} · {match.venue.city}, {match.venue.country}
        </p>

        <Attendance match={match} />

        <MatchupPanel m={m} onOpen={openSquad} />

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

function GoalMention({ g, first }: { g: Goal; first: boolean }) {
  const team = teamById(g.team);
  return (
    <span>
      {!first && ", "}
      {minuteLabel(g.minute, g.extra)} {g.scorer}
      {g.type === "OWN" ? " (OG)" : g.type === "PENALTY" ? " (pen)" : ""} ({team.code})
    </span>
  );
}

