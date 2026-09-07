import { HeroCL } from "../components/HeroCL";
import { navigate } from "../router";

const LEARN_CARDS = [
  {
    to: "/learn",
    title: "How it works",
    desc: "The 36-team league phase, how clubs qualify, two-legged ties — the whole format in plain language.",
  },
  {
    to: "/clubs",
    title: "Meet the clubs",
    desc: "Who's in for 2026/27, where they're from, and why each one matters.",
  },
  {
    to: "/fixtures",
    title: "Fixtures",
    desc: "Every club's 8 games — who they play, where, and when.",
  },
  {
    to: "/table",
    title: "The table",
    desc: "The live 36-club standings, with the qualification bands.",
  },
  {
    to: "/glossary",
    title: "Jargon buster",
    desc: "League phase, aggregate, coefficient — every term decoded.",
  },
];

/** The three ideas a newcomer most needs, up front. */
const PRIMER = [
  {
    k: "One big table",
    v: "Since 2024 there are no groups. All 36 clubs sit in a single league table and each plays 8 different opponents.",
  },
  {
    k: "Top 8 sail through",
    v: "Finish 1st–8th and you're straight into the last 16. 9th–24th play a knockout play-off; 25th–36th are out.",
  },
  {
    k: "Two legs, then a final",
    v: "Knockout rounds are played home and away, scores added together. Only the final is a single match.",
  },
];

export function Home() {
  return (
    <>
      <HeroCL />

      <section className="primer" aria-label="The basics">
        <div className="section-head">
          <span className="kicker">The 30-second version</span>
          <h2>New here? Three things to know</h2>
        </div>
        <div className="primer-grid">
          {PRIMER.map((p) => (
            <div className="primer-card" key={p.k}>
              <span className="primer-k">{p.k}</span>
              <p className="primer-v">{p.v}</p>
            </div>
          ))}
        </div>
        <button className="primer-cta" onClick={() => navigate("/learn")}>
          Read the full guide
          <span aria-hidden="true"> →</span>
        </button>
      </section>

      <section className="home-links" aria-label="Explore the guide">
        {LEARN_CARDS.map((l) => (
          <button className="home-link" key={l.to} onClick={() => navigate(l.to)}>
            <span className="home-link-title">{l.title}</span>
            <span className="home-link-desc">{l.desc}</span>
            <span className="home-link-arrow" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </section>
    </>
  );
}
