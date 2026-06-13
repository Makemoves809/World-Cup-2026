import { Hero } from "../components/Hero";
import { ResultsTicker } from "../components/ResultsTicker";
import { TournamentProgress } from "../components/TournamentProgress";
import { navigate } from "../router";

const LINKS = [
  {
    to: "/groups",
    title: "Group standings",
    desc: "Live tables for all 12 groups, A–L.",
  },
  {
    to: "/knockout",
    title: "Knockout bracket",
    desc: "Round of 32 to the final — the road to MetLife.",
  },
  {
    to: "/fixtures",
    title: "Fixtures",
    desc: "All 72 group-stage matches in your timezone.",
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
