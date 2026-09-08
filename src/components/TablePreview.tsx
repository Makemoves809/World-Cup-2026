import { Crest } from "./Crest";
import { flagUrl } from "../lib/flags";
import { navigate } from "../router";
import { openClub } from "../lib/clubSheet";
import { leagueTable, bandFor } from "../lib/clStandings";

/** Top of the 36-club league table, for the home page. */
export function TablePreview({ rows = 8 }: { rows?: number }) {
  const table = leagueTable().slice(0, rows);
  const anyPlayed = leagueTable().some((r) => r.played > 0);

  return (
    <section className="tp" aria-label="League table">
      <div className="section-head">
        <span className="kicker">League phase · standings</span>
        <h2>{anyPlayed ? "The table" : "The field"}</h2>
        <p className="section-note">
          {anyPlayed
            ? "Top 8 go straight through to the Round of 16."
            : "One table, 36 clubs. Standings begin with Matchday 1 — the top 8 go straight to the Round of 16."}
        </p>
      </div>

      <ol className="tp-list">
        {table.map((r, i) => {
          const pos = i + 1;
          const src = flagUrl(r.club.flag);
          return (
            <li className={`tp-row tp-${bandFor(pos)}`} key={r.club.id}>
              <button
                type="button"
                className="tp-hit club-link"
                onClick={() => openClub(r.club.id)}
                title={`${r.club.name} — squad & fixtures`}
                aria-label={r.club.name}
              />
              <span className="tp-pos">{pos}</span>
              <Crest club={r.club} className="tp-crest" />
              <span className="tp-name">{r.club.short}</span>
              {src && (
                <img className="flag" src={src} width={15} height={10} alt="" aria-hidden="true" />
              )}
              <span className="tp-pld">{r.played}</span>
              <span className="tp-gd">{r.gd > 0 ? `+${r.gd}` : r.gd}</span>
              <span className="tp-pts">{r.pts}</span>
            </li>
          );
        })}
      </ol>

      <button className="mb-more" onClick={() => navigate("/table")}>
        Full 36-club table
        <span aria-hidden="true"> →</span>
      </button>
    </section>
  );
}
