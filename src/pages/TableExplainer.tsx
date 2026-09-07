import { Fragment } from "react";
import { navigate } from "../router";
import { leagueTable, bandFor, seasonStarted, type Band } from "../lib/clStandings";
import { flagUrl } from "../lib/flags";
import { initials } from "../data/squads";

const BAND_LABEL: Record<Band, string> = {
  go: "Straight to the Round of 16",
  playoff: "Knockout play-off round",
  out: "Eliminated",
};

/** The live 36-club league table, with the three qualification bands. */
export function TableExplainer() {
  const rows = leagueTable();
  const started = seasonStarted();

  return (
    <section className="table-page">
      <div className="section-head">
        <span className="kicker">The table · league phase</span>
        <h2>One table, 36 clubs</h2>
        <p className="section-note">
          The whole league phase is a single ranking — where a club finishes is
          the whole story.{" "}
          {started
            ? "Updates automatically as results come in."
            : "No matches yet: clubs are listed alphabetically until Matchday 1 on 8 September, when this becomes the live table."}
        </p>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th className="tbl-pos">#</th>
              <th className="tbl-club">Club</th>
              <th title="Played">P</th>
              <th className="tbl-extra" title="Won">W</th>
              <th className="tbl-extra" title="Drawn">D</th>
              <th className="tbl-extra" title="Lost">L</th>
              <th className="tbl-extra" title="Goals for">GF</th>
              <th className="tbl-extra" title="Goals against">GA</th>
              <th title="Goal difference">GD</th>
              <th className="tbl-pts" title="Points">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const pos = i + 1;
              const band = bandFor(pos);
              const src = flagUrl(r.club.flag);
              return (
                <Fragment key={r.club.id}>
                  <tr className={`tbl-row tbl-${band}`}>
                    <td className="tbl-pos">{pos}</td>
                    <td className="tbl-club">
                      <span className="club-crest tbl-crest">{initials(r.club.short)}</span>
                      <span className="tbl-name">{r.club.short}</span>
                      {src && (
                        <img className="flag tbl-flag" src={src} width={16} height={11} alt="" aria-hidden="true" />
                      )}
                    </td>
                    <td>{r.played}</td>
                    <td className="tbl-extra">{r.won}</td>
                    <td className="tbl-extra">{r.drawn}</td>
                    <td className="tbl-extra">{r.lost}</td>
                    <td className="tbl-extra">{r.gf}</td>
                    <td className="tbl-extra">{r.ga}</td>
                    <td>{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                    <td className="tbl-pts">{r.pts}</td>
                  </tr>
                  {(pos === 8 || pos === 24) && (
                    <tr className="tbl-sep" aria-hidden="true">
                      <td colSpan={10}>
                        <span>{pos === 8 ? "↑ Round of 16" : "↑ Knockout play-off · ↓ Eliminated"}</span>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="tbl-legend">
        <li className="tbl-go">
          <span className="tbl-swatch" />
          1st–8th · {BAND_LABEL.go}
        </li>
        <li className="tbl-playoff">
          <span className="tbl-swatch" />
          9th–24th · {BAND_LABEL.playoff}
        </li>
        <li className="tbl-out">
          <span className="tbl-swatch" />
          25th–36th · {BAND_LABEL.out}
        </li>
      </ul>

      <p className="section-note table-foot">
        <strong>P</strong> played · <strong>GD</strong> goal difference ·{" "}
        <strong>Pts</strong> points (3 for a win, 1 for a draw). Clubs level
        on points are split by goal difference, then goals scored.
      </p>

      <div className="learn-next">
        <button className="home-link" onClick={() => navigate("/fixtures")}>
          <span className="home-link-title">Fixtures →</span>
          <span className="home-link-desc">Every club's 8 games — who, where, when.</span>
        </button>
        <button className="home-link" onClick={() => navigate("/glossary")}>
          <span className="home-link-title">Jargon buster →</span>
          <span className="home-link-desc">"Aggregate", "coefficient" and the rest, explained.</span>
        </button>
      </div>
    </section>
  );
}
