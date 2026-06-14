import type { Match } from "../data/types";
import { teamById } from "../data/teams";
import { sentOffIn, unavailableFor } from "../data/discipline";
import { attendanceFor } from "../data/attendance";
import { liveScore } from "../lib/live";
import { matchup } from "../lib/matchup";
import { Flag } from "./Flag";

const fmtDate = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});
const fmtTime = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

interface MatchCardProps {
  match: Match;
  onSelect: (match: Match) => void;
  live?: boolean;
}

export function MatchCard({ match, onSelect, live = false }: MatchCardProps) {
  const home = teamById(match.home);
  const away = teamById(match.away);
  const kickoff = new Date(match.kickoff);
  const done = match.status === "finished";
  const redCount = sentOffIn(match.id).length;
  const outCount = unavailableFor(match.id).length;

  const homeWon = done && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = done && (match.awayScore ?? 0) > (match.homeScore ?? 0);
  const ls = live ? liveScore(match.id) : undefined;
  const strength = done ? null : matchup(match);
  const att = done ? attendanceFor(match.id) : undefined;

  return (
    <li className={`match-card status-${match.status}${live ? " is-live" : ""}`}>
      <button
        className="match-open"
        onClick={() => onSelect(match)}
        aria-label={`${home.name} vs ${away.name} — match details`}
      >
        <span className="match-meta">
          <span className="match-group">Group {match.group}</span>
          <span className="meta-chips">
            {redCount > 0 && (
              <span className="meta-red" title={`${redCount} red card${redCount > 1 ? "s" : ""}`}>
                <i className="rc" aria-hidden="true" /> {redCount}
              </span>
            )}
            {outCount > 0 && (
              <span className="meta-sus" title={`${outCount} suspended`}>
                <i className="sus-dot" aria-hidden="true" /> {outCount} out
              </span>
            )}
            {done && att != null && (
              <span className="meta-att" title="Attendance">
                <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
                  <path
                    d="M5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5 8c-2.2 0-4 1.1-4 3v1h6.2c-.1-.3-.2-.6-.2-1 0-1 .5-1.9 1.2-2.5A6 6 0 0 0 5 8Zm6 0c-.5 0-1 .1-1.5.2.9.6 1.5 1.6 1.5 2.8v1h4v-1c0-1.9-1.8-3-4-3Z"
                    fill="currentColor"
                  />
                </svg>
                {att.toLocaleString()}
              </span>
            )}
            {done ? (
              <span className="ft-badge">FT</span>
            ) : live ? (
              <span className="live-badge">
                <span className="live-dot" aria-hidden="true" /> LIVE
                {ls?.minute != null && <span className="live-min">{ls.minute}'</span>}
              </span>
            ) : (
              <span className="match-when">
                {fmtDate.format(kickoff)} · {fmtTime.format(kickoff)}
              </span>
            )}
          </span>
        </span>

        <span className="match-body">
          <span className={`side ${homeWon ? "won" : ""}`}>
            <Flag team={home} />
            <span className="side-name">{home.name}</span>
          </span>

          <span className={done || ls ? "score is-final" : "score"}>
            {done ? (
              <>
                <span>{match.homeScore}</span>
                <span className="score-dash">–</span>
                <span>{match.awayScore}</span>
              </>
            ) : ls ? (
              <>
                <span>{ls.home}</span>
                <span className="score-dash">–</span>
                <span>{ls.away}</span>
              </>
            ) : (
              <span className="score-vs">vs</span>
            )}
          </span>

          <span className={`side side-away ${awayWon ? "won" : ""}`}>
            <span className="side-name">{away.name}</span>
            <Flag team={away} />
          </span>
        </span>

        {strength && (
          <span className="match-strength" title={`${strength.verdict} (strength rating)`}>
            <span className="ms-num">{strength.home.effective}</span>
            <span className="ms-bar">
              <span
                className="ms-fill ms-home"
                style={{ width: `${strength.homeShare}%` }}
              />
              <span
                className="ms-fill ms-away"
                style={{ width: `${100 - strength.homeShare}%` }}
              />
            </span>
            <span className="ms-num">{strength.away.effective}</span>
          </span>
        )}

        <span className="match-venue">
          <svg
            className="pin"
            viewBox="0 0 12 12"
            width="10"
            height="10"
            aria-hidden="true"
          >
            <path
              d="M6 0a4.2 4.2 0 0 0-4.2 4.2C1.8 7.4 6 12 6 12s4.2-4.6 4.2-7.8A4.2 4.2 0 0 0 6 0Zm0 6a1.8 1.8 0 1 1 0-3.6A1.8 1.8 0 0 1 6 6Z"
              fill="currentColor"
            />
          </svg>
          {match.venue.stadium} · {match.venue.city}
          <span className="match-more" aria-hidden="true">
            Details ›
          </span>
        </span>
      </button>
    </li>
  );
}
