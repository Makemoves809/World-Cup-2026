import { CL_FIXTURES } from "../data/clFixtures";
import { MATCHDAYS, metaFor, resultFor } from "../lib/clLive";

/**
 * The path from the 36-club table to the trophy.
 *
 * The single most common beginner question about this competition is "so who
 * wins the league phase?" — and the answer is nobody: the table only sorts
 * clubs into three fates. This shows that split, and then the knockout chain
 * that actually produces a champion, so the table on this page reads as a
 * sorting step rather than a competition of its own.
 */

/** Matchdays where every fixture has a final score. */
function matchdaysComplete(): number {
  return MATCHDAYS.filter((md) => {
    const games = CL_FIXTURES.filter((f) => metaFor(f.id).matchday === md);
    return games.length > 0 && games.every((f) => resultFor(f.id));
  }).length;
}

const BANDS = [
  {
    key: "go",
    range: "1st – 8th",
    dest: "Straight to the Round of 16",
    note: "Two fewer matches, and seeded in the draw.",
  },
  {
    key: "playoff",
    range: "9th – 24th",
    dest: "Knockout play-off round",
    note: "Two legs in February for the last eight Round-of-16 places.",
  },
  {
    key: "out",
    range: "25th – 36th",
    dest: "Eliminated",
    note: "Out of Europe entirely — there's no drop into a lesser competition.",
  },
] as const;

const CHAIN = [
  { label: "Play-off", when: "Feb", legs: "2 legs" },
  { label: "Round of 16", when: "Mar", legs: "2 legs" },
  { label: "Quarter-finals", when: "Apr", legs: "2 legs" },
  { label: "Semi-finals", when: "Apr–May", legs: "2 legs" },
  { label: "Final", when: "5 Jun", legs: "One match" },
];

export function RoadToFinal() {
  const done = matchdaysComplete();

  return (
    <section className="rtf">
      <div className="section-head rtf-head">
        <span className="kicker">The point of the table</span>
        <h3>So who actually wins it?</h3>
        <p className="section-note">
          Nobody wins the league phase — there's no trophy for finishing 1st.
          Every match is worth the usual <strong>3 points for a win, 1 for a
          draw</strong>, and after all eight games this table's only job is to
          sort 36 clubs into three fates.
        </p>
      </div>

      <ol className="rtf-bands">
        {BANDS.map((b) => (
          <li className={`rtf-band rtf-${b.key}`} key={b.key}>
            <span className="rtf-range">{b.range}</span>
            <span className="rtf-dest">{b.dest}</span>
            <span className="rtf-note">{b.note}</span>
          </li>
        ))}
      </ol>

      <p className="rtf-bridge">
        Those two surviving routes meet in the Round of 16. From there it's
        knockout football until someone is left holding the trophy.
      </p>

      <ol className="rtf-chain">
        {CHAIN.map((c, i) => (
          <li className={`rtf-step${i === CHAIN.length - 1 ? " rtf-cup" : ""}`} key={c.label}>
            <span className="rtf-step-when">{c.when}</span>
            <span className="rtf-step-name">{c.label}</span>
            <span className="rtf-step-legs">{c.legs}</span>
          </li>
        ))}
      </ol>

      <p className="section-note rtf-foot">
        The champion of Europe is whoever wins that last match — a single game
        on neutral ground, at the Estadio Metropolitano in Madrid on{" "}
        <strong>5 June 2027</strong>.{" "}
        {done > 0 && done < MATCHDAYS.length
          ? `The league phase is ${done} matchday${done === 1 ? "" : "s"} of ${MATCHDAYS.length} in, so the table above is still early.`
          : done === 0
          ? "The league phase hasn't started yet."
          : "The league phase is complete."}
      </p>
    </section>
  );
}
