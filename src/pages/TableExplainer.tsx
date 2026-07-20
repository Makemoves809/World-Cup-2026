import { navigate } from "../router";

interface Band {
  range: string;
  from: number;
  to: number;
  title: string;
  detail: string;
  kind: "go" | "playoff" | "out";
}

const BANDS: Band[] = [
  {
    range: "1st – 8th",
    from: 1,
    to: 8,
    title: "Straight to the Round of 16",
    detail: "Finish in the top eight of the 36 and you skip the play-off — you're in the last 16 already.",
    kind: "go",
  },
  {
    range: "9th – 24th",
    from: 9,
    to: 24,
    title: "Into the knockout play-offs",
    detail: "Sixteen clubs here play a two-legged round; the eight winners join the top eight in the Round of 16.",
    kind: "playoff",
  },
  {
    range: "25th – 36th",
    from: 25,
    to: 36,
    title: "Eliminated",
    detail: "The bottom twelve are out of Europe entirely — there's no longer a drop into a second competition.",
    kind: "out",
  },
];

/** A visual of how the single 36-team table decides who advances. */
export function TableExplainer() {
  return (
    <section className="table-page">
      <div className="section-head">
        <span className="kicker">Reading the table</span>
        <h2>One table, 36 clubs</h2>
        <p className="section-note">
          The whole league phase is a single ranking. Where a club finishes in
          it is the whole story — these three bands are all that matter.
        </p>
      </div>

      <div className="band-chart" role="img" aria-label="The 36-team table split into three qualification bands">
        {BANDS.map((b) => {
          const rows = b.to - b.from + 1;
          return (
            <div className={`band band-${b.kind}`} key={b.range} style={{ flexGrow: rows }}>
              <div className="band-pips" aria-hidden="true">
                {Array.from({ length: rows }).map((_, i) => (
                  <span className="band-pip" key={i} />
                ))}
              </div>
              <div className="band-text">
                <span className="band-range">{b.range}</span>
                <span className="band-title">{b.title}</span>
                <span className="band-detail">{b.detail}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="section-note table-foot">
        There are no standings yet — the table starts filling in from the first
        matchday in September, once the 27 August draw has set every club's
        eight fixtures. This page will become the live table then.
      </p>

      <div className="learn-next">
        <button className="home-link" onClick={() => navigate("/calendar")}>
          <span className="home-link-title">Season calendar →</span>
          <span className="home-link-desc">Every stage and date, start to final.</span>
        </button>
        <button className="home-link" onClick={() => navigate("/glossary")}>
          <span className="home-link-title">Jargon buster →</span>
          <span className="home-link-desc">"Aggregate", "coefficient" and the rest, explained.</span>
        </button>
      </div>
    </section>
  );
}
