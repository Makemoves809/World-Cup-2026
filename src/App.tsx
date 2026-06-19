import { Header } from "./components/Header";
import { ProgressStrip } from "./components/ProgressStrip";
import { Knockout } from "./components/Knockout";
import { Fixtures } from "./components/Fixtures";
import { Home } from "./pages/Home";
import { GroupsPage } from "./pages/GroupsPage";
import { Qatar2022 } from "./pages/Qatar2022";
import { FormTable } from "./pages/FormTable";
import { Continuity } from "./pages/Continuity";
import { SquadPitch } from "./pages/SquadPitch";
import { RosterModal } from "./components/RosterModal";
import { navigate, useRoute } from "./router";
import { useRoster } from "./lib/roster";

export function App() {
  const path = useRoute();
  const roster = useRoster();

  let page;
  if (path.startsWith("/squad/")) {
    page = <SquadPitch teamId={path.slice("/squad/".length)} />;
  } else
  switch (path) {
    case "/groups":
      page = <GroupsPage />;
      break;
    case "/knockout":
      page = <Knockout />;
      break;
    case "/fixtures":
      page = <Fixtures />;
      break;
    case "/form":
      page = <FormTable />;
      break;
    case "/qatar2022":
      page = <Qatar2022 />;
      break;
    case "/continuity":
      page = <Continuity />;
      break;
    default:
      page = <Home />;
  }

  return (
    <div className="app">
      <Header path={path} />
      {path !== "/" && <ProgressStrip />}

      <main>{page}</main>

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
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate("/groups")}>Group standings</button>
            <button onClick={() => navigate("/knockout")}>Knockout</button>
            <button onClick={() => navigate("/fixtures")}>Fixtures</button>
            <button onClick={() => navigate("/form")}>Form table</button>
            <button onClick={() => navigate("/continuity")}>Squad turnover</button>
            <button onClick={() => navigate("/qatar2022")}>Qatar 2022</button>
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

      {roster && <RosterModal teamId={roster} />}
    </div>
  );
}
