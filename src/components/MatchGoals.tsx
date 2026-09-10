import { clubById } from "../data/clubs";
import { goalsFor, goalClock, type Goal } from "../lib/clLive";
import type { ClFixture } from "../data/clFixtures";

/**
 * A match's scoresheet — who scored, for which side, and when.
 *
 * Laid out as two columns, home scorers on the left and away scorers on the
 * right, which is how a scoresheet reads on TV and in a matchday programme.
 * An own goal is listed under the side it counted *for* (that's what the
 * scoreline says) but marked "(og)" so it doesn't look like the player
 * changed teams.
 *
 * Scorers come from ESPN via the bot and can lag a minute or two behind the
 * score itself, so a match with a result but no goals yet renders a quiet
 * note rather than an empty box.
 */
export function MatchGoals({ f, note = true }: { f: ClFixture; note?: boolean }) {
  const goals = goalsFor(f.id);
  const home = clubById(f.home);
  const away = clubById(f.away);
  if (!home || !away) return null;

  if (goals.length === 0) {
    return note ? (
      <p className="gs-none">Scorers for this match aren't in yet.</p>
    ) : null;
  }

  const side = (id: string) => goals.filter((g) => g.team === id);
  const col = (list: Goal[], align: "l" | "r") => (
    <ul className={`gs-col gs-${align}`}>
      {list.map((g, i) => (
        <li key={`${g.scorer}-${g.minute}-${i}`} className={g.type === "OWN" ? "gs-og" : ""}>
          <span className="gs-who">{g.scorer}</span>
          <span className="gs-min">{goalClock(g)}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="gs" aria-label="Goalscorers">
      {col(side(f.home), "l")}
      <span className="gs-split" aria-hidden="true" />
      {col(side(f.away), "r")}
    </div>
  );
}
