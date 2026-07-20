import { GLOSSARY } from "../data/learn";

/** Plain-English glossary of Champions League terms. */
export function Glossary() {
  return (
    <section className="glossary-page">
      <div className="section-head">
        <span className="kicker">Jargon buster</span>
        <h2>Champions League, in plain English</h2>
        <p className="section-note">
          The words you'll hear on the broadcast and read in the table — what
          they actually mean.
        </p>
      </div>

      <dl className="glossary-list">
        {GLOSSARY.map((t) => (
          <div className="glossary-item" key={t.term}>
            <dt>
              <span className="glossary-term">{t.term}</span>
              <span className="glossary-short">{t.short}</span>
            </dt>
            <dd>{t.def}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
