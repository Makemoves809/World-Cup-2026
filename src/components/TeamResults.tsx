import { matchesForTeam } from "../data/fixtures";
import { teamById } from "../data/teams";
import type { Match, Team } from "../data/types";
import { koMatchesForTeam } from "../lib/bracket";
import { Flag } from "./Flag";

/** Group-stage matchday label for a match id like "m-J-2" → "MD2". */
function matchdayLabel(match: Match): string {
  if (match.stage !== "group") return match.stage.toUpperCase();
  const n = match.id.split("-")[2];
  return n ? `MD${n}` : "Group";
}

function safeTeam(id: string): Team | undefined {
  try {
    return teamById(id);
  } catch {
    return undefined;
  }
}

interface HistoryRow {
  id: string;
  kickoff: string;
  pill: "W" | "D" | "L";
  roundLabel: string;
  oppTeam?: Team;
  oppName: string;
  scoreText: string;
}

interface NextRow {
  id: string;
  kickoff: string;
  roundLabel: string;
  isHome: boolean;
  oppTeam?: Team;
  oppName: string;
}

/**
 * A team's tournament so far — finished results from that team's perspective
 * (their goals first, a W/D/L pill) plus their next scheduled fixture. Pulls
 * from both the group-stage schedule and the knockout bracket, since those
 * live in two separate data sources — group-only would silently freeze a
 * team's history the moment R32 kicks off.
 */
export function TeamResults({ teamId }: { teamId: string }) {
  const groupAll = matchesForTeam(teamId);
  const groupFinished = groupAll.filter(
    (m) => m.status === "finished" && m.homeScore != null && m.awayScore != null
  );
  const groupNext = groupAll.find((m) => m.status !== "finished");

  const koAll = koMatchesForTeam(teamId);
  const koFinished = koAll.filter((m) => m.finished);
  const koNext = koAll.find((m) => !m.finished);

  const history: HistoryRow[] = [
    ...groupFinished.map((m): HistoryRow => {
      const isHome = m.home === teamId;
      const oppId = isHome ? m.away : m.home;
      const oppTeam = safeTeam(oppId);
      const gf = isHome ? m.homeScore! : m.awayScore!;
      const ga = isHome ? m.awayScore! : m.homeScore!;
      return {
        id: m.id,
        kickoff: m.kickoff,
        pill: gf > ga ? "W" : gf < ga ? "L" : "D",
        roundLabel: matchdayLabel(m),
        oppTeam,
        oppName: oppTeam ? oppTeam.name : oppId.toUpperCase(),
        scoreText: `${gf}–${ga}`,
      };
    }),
    ...koFinished.map((m): HistoryRow => {
      const isHome = m.home.id === teamId;
      const oppSeed = isHome ? m.away : m.home;
      const gf = (isHome ? m.homeScore : m.awayScore) ?? 0;
      const ga = (isHome ? m.awayScore : m.homeScore) ?? 0;
      let scoreText = `${gf}–${ga}`;
      if (m.penaltiesHome != null && m.penaltiesAway != null) {
        const pf = isHome ? m.penaltiesHome : m.penaltiesAway;
        const pa = isHome ? m.penaltiesAway : m.penaltiesHome;
        scoreText += ` (${pf}–${pa} pens)`;
      }
      return {
        id: m.id,
        kickoff: m.kickoff,
        pill: m.winner === (isHome ? "home" : "away") ? "W" : "L",
        roundLabel: m.roundLabel,
        oppTeam: oppSeed.id ? safeTeam(oppSeed.id) : undefined,
        oppName: oppSeed.name,
        scoreText,
      };
    }),
  ].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());

  const next: NextRow | undefined = groupNext
    ? (() => {
        const isHome = groupNext.home === teamId;
        const oppId = isHome ? groupNext.away : groupNext.home;
        const oppTeam = safeTeam(oppId);
        return {
          id: groupNext.id,
          kickoff: groupNext.kickoff,
          roundLabel: matchdayLabel(groupNext),
          isHome,
          oppTeam,
          oppName: oppTeam ? oppTeam.name : oppId.toUpperCase(),
        };
      })()
    : koNext
    ? (() => {
        const isHome = koNext.home.id === teamId;
        const oppSeed = isHome ? koNext.away : koNext.home;
        return {
          id: koNext.id,
          kickoff: koNext.kickoff,
          roundLabel: koNext.roundLabel,
          isHome,
          oppTeam: oppSeed.id ? safeTeam(oppSeed.id) : undefined,
          oppName: oppSeed.name,
        };
      })()
    : undefined;

  if (history.length === 0 && !next) return null;

  return (
    <section className="team-results">
      <h4 className="team-results-title">Tournament so far</h4>
      <ul className="team-results-list">
        {history.map((row) => (
          <li key={row.id} className="team-result-row">
            <span className={`tr-pill tr-${row.pill}`}>{row.pill}</span>
            <span className="tr-md">{row.roundLabel}</span>
            <span className="tr-opp">
              {row.oppTeam ? <Flag team={row.oppTeam} size={16} /> : null}
              <span className="tr-opp-name">{row.oppName}</span>
            </span>
            <span className="tr-score">{row.scoreText}</span>
          </li>
        ))}
        {next &&
          (() => {
            const kickoff = new Date(next.kickoff).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
            return (
              <li key={next.id} className="team-result-row is-next">
                <span className="tr-pill tr-next">{next.roundLabel}</span>
                <span className="tr-md">{next.isHome ? "vs" : "at"}</span>
                <span className="tr-opp">
                  {next.oppTeam ? <Flag team={next.oppTeam} size={16} /> : null}
                  <span className="tr-opp-name">{next.oppName}</span>
                </span>
                <span className="tr-score tr-when">{kickoff}</span>
              </li>
            );
          })()}
      </ul>
    </section>
  );
}
