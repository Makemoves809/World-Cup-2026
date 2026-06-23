import { matchesForTeam } from "../data/fixtures";
import { teamById } from "../data/teams";
import type { Match } from "../data/types";
import { Flag } from "./Flag";

/** Group-stage matchday label for a match id like "m-J-2" → "MD2". */
function matchdayLabel(match: Match): string {
  if (match.stage !== "group") return match.stage.toUpperCase();
  const n = match.id.split("-")[2];
  return n ? `MD${n}` : "Group";
}

function safeTeam(id: string) {
  try {
    return teamById(id);
  } catch {
    return undefined;
  }
}

/**
 * A team's tournament so far — finished results from that team's perspective
 * (their goals first, a W/D/L pill) plus their next scheduled fixture.
 */
export function TeamResults({ teamId }: { teamId: string }) {
  const all = matchesForTeam(teamId);
  const finished = all.filter(
    (m) => m.status === "finished" && m.homeScore != null && m.awayScore != null
  );
  const next = all.find((m) => m.status !== "finished");

  if (finished.length === 0 && !next) return null;

  return (
    <section className="team-results">
      <h4 className="team-results-title">Tournament so far</h4>
      <ul className="team-results-list">
        {finished.map((m) => {
          const isHome = m.home === teamId;
          const oppId = isHome ? m.away : m.home;
          const opp = safeTeam(oppId);
          const gf = isHome ? m.homeScore! : m.awayScore!;
          const ga = isHome ? m.awayScore! : m.homeScore!;
          const outcome = gf > ga ? "W" : gf < ga ? "L" : "D";
          return (
            <li key={m.id} className="team-result-row">
              <span className={`tr-pill tr-${outcome}`}>{outcome}</span>
              <span className="tr-md">{matchdayLabel(m)}</span>
              <span className="tr-opp">
                {opp ? <Flag team={opp} size={16} /> : null}
                <span className="tr-opp-name">{opp ? opp.name : oppId.toUpperCase()}</span>
              </span>
              <span className="tr-score">
                {gf}–{ga}
              </span>
            </li>
          );
        })}
        {next &&
          (() => {
            const isHome = next.home === teamId;
            const oppId = isHome ? next.away : next.home;
            const opp = safeTeam(oppId);
            const kickoff = new Date(next.kickoff).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
            return (
              <li key={next.id} className="team-result-row is-next">
                <span className="tr-pill tr-next">{matchdayLabel(next)}</span>
                <span className="tr-md">{isHome ? "vs" : "at"}</span>
                <span className="tr-opp">
                  {opp ? <Flag team={opp} size={16} /> : null}
                  <span className="tr-opp-name">
                    {opp ? opp.name : oppId.toUpperCase()}
                  </span>
                </span>
                <span className="tr-score tr-when">{kickoff}</span>
              </li>
            );
          })()}
      </ul>
    </section>
  );
}
