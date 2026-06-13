import type { Match } from "../data/types";
import { teamById } from "../data/teams";
import { sentOffIn, unavailableFor } from "../data/discipline";
import { liveScore } from "../lib/live";
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
