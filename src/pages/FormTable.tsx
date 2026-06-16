import { teams } from "../data/teams";
import { formRating, type FormRating } from "../lib/form";
import { Flag } from "../components/Flag";
import type { Team } from "../data/types";

interface Row {
  team: Team;
  f: FormRating;
}

function MoverCard({ row, kind }: { row: Row; kind: "riser" | "faller" }) {
  const up = kind === "riser";
  return (
    <div className={`mover ${up ? "is-up" : "is-down"}`}>
      <span className="mover-label">{up ? "Biggest riser" : "Biggest faller"}</span>
      <div className="mover-main">
        <Flag team={row.team} size={20} />
        <span className="mover-name">{row.team.name}</span>
        <span className={`vs-form ${up ? "up" : "down"}`}>
          {up ? "▲" : "▼"}
          {Math.abs(row.f.delta)}
        </span>
      </div>
      <span className="mover-sub">
        FIFA {row.f.base} → {row.f.rating}
      </span>
    </div>
  );
}

export function FormTable() {
  const rows: Row[] = teams
    .map((team) => ({ team, f: formRating(team.id) }))
    .sort((a, b) => b.f.rating - a.f.rating || b.f.base - a.f.base);

  const played = rows.filter((r) => r.f.played > 0);
  const riser = [...played].sort((a, b) => b.f.delta - a.f.delta)[0];
  const faller = [...played].sort((a, b) => a.f.delta - b.f.delta)[0];

  return (
    <section className="formpage" id="form">
      <div className="section-head">
        <span className="kicker">Power rankings · live form</span>
        <h2>Form table</h2>
        <p className="section-note">
          All 48 teams by their form-adjusted rating — the FIFA-ranking base
          shifted up (▲) or down (▼) by how they've actually played.
        </p>
      </div>

      {riser && faller && riser.f.delta !== 0 && (
        <div className="movers">
          <MoverCard row={riser} kind="riser" />
          <MoverCard row={faller} kind="faller" />
        </div>
      )}

      <ol className="form-list">
        <li className="form-head" aria-hidden="true">
          <span className="form-rank">#</span>
          <span className="form-team">Team</span>
          <span className="form-col">Pld</span>
          <span className="form-col form-fifa">FIFA</span>
          <span className="form-col form-col-rating">Form</span>
          <span className="form-col">+/−</span>
        </li>
        {rows.map((r, i) => (
          <li className="form-row" key={r.team.id}>
            <span className="form-rank">{i + 1}</span>
            <span className="form-team">
              <Flag team={r.team} />
              <span className="form-name">{r.team.name}</span>
              <span className="form-grp">{r.team.group}</span>
            </span>
            <span className="form-col">{r.f.played}</span>
            <span className="form-col form-faint form-fifa">{r.f.base}</span>
            <span className="form-col form-col-rating">{r.f.rating}</span>
            <span className="form-col">
              {r.f.delta === 0 ? (
                <span className="form-flat">–</span>
              ) : (
                <span className={`vs-form ${r.f.delta > 0 ? "up" : "down"}`}>
                  {r.f.delta > 0 ? "▲" : "▼"}
                  {Math.abs(r.f.delta)}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>

      <p className="section-note form-foot">
        Form is a fan heuristic for tracking who's over- or under-performing
        their seed — not a betting predictor.
      </p>
    </section>
  );
}
