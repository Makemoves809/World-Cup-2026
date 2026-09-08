import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { HowItWorks } from "./pages/HowItWorks";
import { Clubs } from "./pages/Clubs";
import { Glossary } from "./pages/Glossary";
import { TableExplainer } from "./pages/TableExplainer";
import { Calendar } from "./pages/Calendar";
import { Fixtures } from "./pages/Fixtures";
import { navigate, useRoute } from "./router";
import { ClubSheet } from "./components/ClubSheet";

export function App() {
  const path = useRoute();

  let page;
  switch (path) {
    case "/learn":
    case "/how-it-works":
      page = <HowItWorks />;
      break;
    case "/clubs":
      page = <Clubs />;
      break;
    case "/fixtures":
    case "/schedule":
      page = <Fixtures />;
      break;
    case "/table":
      page = <TableExplainer />;
      break;
    case "/calendar":
      page = <Calendar />;
      break;
    case "/glossary":
      page = <Glossary />;
      break;
    default:
      page = <Home />;
  }

  return (
    <div className="app">
      <Header path={path} />

      <main>{page}</main>

      <ClubSheet />

      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="brand-kicker">UEFA</span>
            <span className="brand-mark">Champions League</span>
            <p>
              An unofficial beginner's guide to the UEFA Champions League
              2026/27 — the new 36-team league-phase format, the clubs, and the
              jargon, for football fans new to the competition. Results and the
              table fill in automatically once the season kicks off.
            </p>
          </div>

          <nav className="footer-nav" aria-label="Footer">
            <span className="footer-head">Explore</span>
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate("/learn")}>How it works</button>
            <button onClick={() => navigate("/clubs")}>Clubs</button>
            <button onClick={() => navigate("/fixtures")}>Schedule</button>
            <button onClick={() => navigate("/table")}>The table</button>
            <button onClick={() => navigate("/calendar")}>Calendar</button>
            <button onClick={() => navigate("/glossary")}>Glossary</button>
          </nav>

          <div className="footer-notes">
            <span className="footer-head">Data</span>
            <p>
              Confirmed clubs and format per UEFA · the final field and fixtures
              are set by the 27 August 2026 draw · flags from the flag-icons
              project (MIT).
            </p>
            <p>Not affiliated with UEFA. MIT licensed.</p>
          </div>
        </div>

        <p className="footer-meta">
          UEFA Champions League 2026/27 · a beginner's guide · Built with React + TypeScript
        </p>
      </footer>
    </div>
  );
}
