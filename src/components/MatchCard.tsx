import type { Match } from "../data/types";
import { teamById } from "../data/teams";
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

export function MatchCard({ match }: { match: Match }) {
  const home = teamById(match.home);
  const away = teamById(match.away);
  const kickoff = new Date(match.kickoff);
  const done = match.status === "finished";

  const homeWon = done && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = done && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <li className={`match-card status-${match.status}`}>
      <div className="match-meta">
        <span className="match-group">Group {match.group}</span>
        {done ? (
          <span className="ft-badge">FT</span>
        ) : (
          <span className="match-when">
            {fmtDate.format(kickoff)} · {fmtTime.format(kickoff)}
          </span>
        )}
      </div>

      <div className="match-body">
        <div className={`side ${homeWon ? "won" : ""}`}>
          <Flag team={home} />
          <span className="side-name">{home.name}</span>
        </div>

        <div className={done ? "score is-final" : "score"}>
          {done ? (
            <>
              <span>{match.homeScore}</span>
              <span className="score-dash">–</span>
              <span>{match.awayScore}</span>
            </>
          ) : (
            <span className="score-vs">vs</span>
          )}
        </div>

        <div className={`side side-away ${awayWon ? "won" : ""}`}>
          <span className="side-name">{away.name}</span>
          <Flag team={away} />
        </div>
      </div>

      <p className="match-venue">
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
      </p>
    </li>
  );
}
