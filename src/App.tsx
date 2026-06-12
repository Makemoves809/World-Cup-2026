import { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
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
        <Hero />

        <section className="groups" id="groups">
          <div className="section-head">
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
        <p>
          Unofficial fan project · Standings update automatically from match
          results, entered manually after full time — see the README to wire a
          live feed.
        </p>
        <p className="footer-meta">WC26 Hub · Built with React + TypeScript</p>
      </footer>
    </div>
  );
}
