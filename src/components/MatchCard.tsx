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
        <span className="match-group">Grp {match.group}</span>
        <span className="match-when">
          {done ? "FT" : `${fmtDate.format(kickoff)} · ${fmtTime.format(kickoff)}`}
        </span>
      </div>

      <div className="match-body">
        <div className={`side ${homeWon ? "won" : ""}`}>
          <Flag team={home} />
          <span className="side-name">{home.name}</span>
        </div>

        <div className="score">
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
        {match.venue.stadium} · {match.venue.city}
      </p>
    </li>
  );
}
