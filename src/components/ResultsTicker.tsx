import { matches } from "../data/fixtures";
import { teamById } from "../data/teams";
import { Flag } from "./Flag";

const fmtDay = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

/** Horizontal strip of the most recent final scores, newest first. */
export function ResultsTicker() {
  const finished = matches
    .filter((m) => m.status === "finished")
    .sort((a, b) => b.kickoff.localeCompare(a.kickoff));

  if (finished.length === 0) return null;

  return (
    <div className="ticker" aria-label="Latest results">
      <span className="ticker-label">Results</span>
      <ul className="ticker-list">
        {finished.map((m) => {
          const home = teamById(m.home);
          const away = teamById(m.away);
          return (
            <li className="ticker-item" key={m.id}>
              <span className="ticker-meta">
                Grp {m.group} · {fmtDay.format(new Date(m.kickoff))}
              </span>
              <span className="ticker-score">
                <Flag team={home} size={14} />
                <span>{home.code}</span>
                <b>
                  {m.homeScore}–{m.awayScore}
                </b>
                <span>{away.code}</span>
                <Flag team={away} size={14} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
