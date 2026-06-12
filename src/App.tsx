import { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ResultsTicker } from "./components/ResultsTicker";
import { GroupTable } from "./components/GroupTable";
import { Fixtures } from "./components/Fixtures";
import { GROUP_IDS } from "./data/teams";

export function App() {
  const [active, setActive] = useState("groups");

  const navigate = (id: string) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="app">
      <Header active={active} onNavigate={navigate} />

      <main>
        <Hero onNavigate={navigate} />
        <ResultsTicker />

        <section className="groups" id="groups">
          <div className="section-head">
            <span className="kicker">12 groups · 48 nations</span>
            <h2>Group standings</h2>
            <p className="section-note">
              Top two advance · third place enters the best-third race.
            </p>
          </div>

          <div className="legend">
            <span className="legend-item">
              <i className="swatch sw-qualified" /> Qualifies
            </span>
            <span className="legend-item">
              <i className="swatch sw-playoff" /> Best-third race
            </span>
            <span className="legend-item">
              <i className="swatch sw-out" /> Eliminated
            </span>
          </div>

          <div className="group-grid">
            {GROUP_IDS.map((g) => (
              <GroupTable key={g} group={g} />
            ))}
          </div>
        </section>

        <Fixtures />
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="brand-mark">
              WC<em>26</em>
            </span>
            <p>
              An unofficial fan hub for the 2026 FIFA World Cup across Canada,
              México, and the USA. Standings recompute automatically from match
              results, entered after full time.
            </p>
          </div>

          <nav className="footer-nav" aria-label="Footer">
            <span className="footer-head">Explore</span>
            <button onClick={() => navigate("top")}>Top</button>
            <button onClick={() => navigate("groups")}>Group standings</button>
            <button onClick={() => navigate("fixtures")}>Fixtures</button>
          </nav>

          <div className="footer-notes">
            <span className="footer-head">Data</span>
            <p>
              Schedule per the official match calendar · kickoffs shown in your
              local time · flags via flagcdn.com.
            </p>
            <p>Not affiliated with FIFA. MIT licensed.</p>
          </div>
        </div>

        <p className="footer-meta">
          WC26 Hub · Built with React + TypeScript · Jun 11 – Jul 19, 2026
        </p>
      </footer>
    </div>
  );
}
