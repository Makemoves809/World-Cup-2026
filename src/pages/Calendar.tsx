import { CALENDAR } from "../data/learn";

const KIND_LABEL: Record<string, string> = {
  pre: "Pre-season",
  league: "League phase",
  knockout: "Knockouts",
  final: "Final",
};

/** The season as a timeline — what happens when, for a newcomer. */
export function Calendar() {
  return (
    <section className="cal-page">
      <div className="section-head">
        <span className="kicker">The season · 2026/27</span>
        <h2>When it all happens</h2>
        <p className="section-note">
          A season runs late summer to the following June. Here's the shape of
          it, so you know when to start paying attention (short version:
          September).
        </p>
      </div>

      <ol className="cal-list">
        {CALENDAR.map((s) => (
          <li className={`cal-item cal-${s.kind}`} key={s.stage}>
            <div className="cal-rail" aria-hidden="true">
              <span className="cal-dot" />
            </div>
            <div className="cal-body">
              <span className="cal-when">{s.when}</span>
              <h3 className="cal-stage">
                {s.stage}
                <span className="cal-kind">{KIND_LABEL[s.kind]}</span>
              </h3>
              <p className="cal-detail">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
