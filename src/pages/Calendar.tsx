import { CALENDAR } from "../data/learn";

const KIND_LABEL: Record<string, string> = {
  pre: "Pre-season",
  league: "League phase",
  knockout: "Knockouts",
  final: "Final",
};

// The feed is served as a static file from the deployment root. `webcal://`
// makes Apple/Google Calendar *subscribe* (and keep re-fetching) rather than
// import a one-time snapshot.
const ICS_PATH = "/champions-league.ics";
const webcalUrl = () =>
  `webcal://${typeof window !== "undefined" ? window.location.host : ""}${ICS_PATH}`;

function SubscribeCard() {
  return (
    <div className="cal-subscribe">
      <div className="cal-sub-text">
        <span className="cal-sub-head">Add this to your calendar</span>
        <p>
          Subscribe once and it stays in sync — when fixtures are set or a
          kickoff moves, your calendar updates on its own. Right now it carries
          the key dates; every match lands in it after the 27 August draw.
        </p>
      </div>
      <div className="cal-sub-actions">
        <a className="btn btn-cta" href={webcalUrl()}>
          Subscribe
          <span className="btn-arrow" aria-hidden="true">→</span>
        </a>
        <a className="cal-sub-alt" href={ICS_PATH} download>
          Download .ics
        </a>
      </div>
    </div>
  );
}

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

      <SubscribeCard />

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
