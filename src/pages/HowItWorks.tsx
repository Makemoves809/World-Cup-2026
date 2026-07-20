import { HOW_IT_WORKS } from "../data/learn";
import { navigate } from "../router";

/** The front-door explainer: the Champions League format in plain language. */
export function HowItWorks() {
  return (
    <section className="learn-page">
      <div className="section-head">
        <span className="kicker">The basics · start here</span>
        <h2>How the Champions League works</h2>
        <p className="section-note">
          You know football — this is just what's specific to this competition:
          how it's structured, how clubs get in, and how a team goes from the
          opening games to lifting the trophy.
        </p>
      </div>

      <ol className="learn-list">
        {HOW_IT_WORKS.map((s, i) => (
          <li className="learn-block" key={s.heading}>
            <span className="learn-num">{i + 1}</span>
            <div className="learn-body">
              <h3>{s.heading}</h3>
              {s.body.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <div className="learn-next">
        <button className="home-link" onClick={() => navigate("/clubs")}>
          <span className="home-link-title">Meet the clubs →</span>
          <span className="home-link-desc">
            Who's in for 2026/27, and why each one matters.
          </span>
        </button>
        <button className="home-link" onClick={() => navigate("/glossary")}>
          <span className="home-link-title">Jargon buster →</span>
          <span className="home-link-desc">
            Every term you'll hear on the broadcast, in plain English.
          </span>
        </button>
      </div>
    </section>
  );
}
