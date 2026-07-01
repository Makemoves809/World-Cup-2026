import { Hero } from "../components/Hero";
import { ResultsTicker } from "../components/ResultsTicker";
import { TournamentProgress } from "../components/TournamentProgress";
import { navigate } from "../router";

const LINKS = [
  {
    to: "/knockout",
    title: "Knockout bracket",
    desc: "Round of 32 to the final — the road to MetLife.",
  },
  {
    to: "/schedule",
    title: "Match schedule",
    desc: "Every knockout tie by date, with kick-off times.",
  },
  {
    to: "/groups",
    title: "Final group tables",
    desc: "How all 12 groups finished, A–L.",
  },
  {
    to: "/qatar2022",
    title: "Qatar 2022",
    desc: "Relive the last World Cup — full results & bracket.",
  },
];

export function Home() {
  return (
    <>
      <Hero />
      <ResultsTicker />
      <TournamentProgress />

      <section className="home-links" aria-label="Explore the hub">
        {LINKS.map((l) => (
          <button
            className="home-link"
            key={l.to}
            onClick={() => navigate(l.to)}
          >
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
