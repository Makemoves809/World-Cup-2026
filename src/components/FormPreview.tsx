import { teams } from "../data/teams";
import { formRating } from "../lib/form";
import { openRoster } from "../lib/roster";
import { navigate } from "../router";
import { Flag } from "./Flag";

/** Top-5 form-table snippet for the home page, linking through to the full page. */
export function FormPreview() {
  const rows = teams
    .map((team) => ({ team, f: formRating(team.id) }))
    .sort((a, b) => b.f.rating - a.f.rating || b.f.base - a.f.base)
    .slice(0, 5);

  return (
    <section className="form-preview">
      <div className="form-preview-head">
        <div>
          <span className="kicker">Power rankings · live form</span>
          <h2>Form table</h2>
        </div>
        <button className="form-preview-link" onClick={() => navigate("/form")}>
          Full table
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <ol className="form-preview-list">
        {rows.map((r, i) => (
          <li className="form-preview-row" key={r.team.id}>
            <span className="form-preview-rank">{i + 1}</span>
            <button
              className="form-preview-team team-link"
              onClick={() => openRoster(r.team.id)}
              title={`${r.team.name} squad`}
            >
              <Flag team={r.team} size={18} />
              <span className="form-preview-name">{r.team.name}</span>
            </button>
            <span className="form-preview-rating">{r.f.rating}</span>
            {r.f.delta !== 0 && (
              <span className={`vs-form ${r.f.delta > 0 ? "up" : "down"}`}>
                {r.f.delta > 0 ? "▲" : "▼"}
                {Math.abs(r.f.delta)}
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
