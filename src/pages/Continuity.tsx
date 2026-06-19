import { CONTINUITY } from "../data/continuity";
import { SQUADS } from "../data/squads";
import { teams } from "../data/teams";
import { Flag } from "../components/Flag";
import { openRoster } from "../lib/roster";
import type { Team } from "../data/types";

const byId = new Map<string, Team>(teams.map((t) => [t.id, t]));

interface Row {
  team: Team;
  returning: number;
  pct: number;
}

export function Continuity() {
  const known: Row[] = [];
  const pending: Team[] = [];
  const fresh: Team[] = [];

  for (const [id, c] of Object.entries(CONTINUITY)) {
    const team = byId.get(id);
    if (!team) continue;
    if (!c.at2022) fresh.push(team);
    else if (c.returning == null) pending.push(team);
    else
      known.push({
        team,
        returning: c.returning,
        pct: Math.round((c.returning / 26) * 100),
      });
  }

  known.sort((a, b) => b.pct - a.pct || a.team.name.localeCompare(b.team.name));
  fresh.sort((a, b) => a.name.localeCompare(b.name));
  pending.sort((a, b) => a.name.localeCompare(b.name));

  const most = known[0];
  const least = known[known.length - 1];

  return (
    <section className="contpage" id="continuity">
      <div className="section-head">
        <span className="kicker">Squad turnover · vs Qatar 2022</span>
        <h2>How much has each squad changed?</h2>
        <p className="section-note">
          The share of every team's 26-man 2026 World Cup squad that also played
          at Qatar 2022 — a quick read on continuity versus a fresh rebuild.
        </p>
      </div>

      {most && least && (
        <div className="cont-highs">
          <div className="cont-high">
            <span className="cont-high-label">Most continuity</span>
            <div className="cont-high-team">
              <Flag team={most.team} size={22} />
              <span>{most.team.name}</span>
              <strong>{most.pct}%</strong>
            </div>
          </div>
          <div className="cont-high">
            <span className="cont-high-label">Biggest rebuild</span>
            <div className="cont-high-team">
              <Flag team={least.team} size={22} />
              <span>{least.team.name}</span>
              <strong>{least.pct}%</strong>
            </div>
          </div>
        </div>
      )}

      <ol className="cont-list">
        {known.map((r) => {
          const hasSquad = !!SQUADS[r.team.id];
          return (
            <li className="cont-row" key={r.team.id}>
              <button
                className={`cont-rowbtn${hasSquad ? " has-squad" : ""}`}
                onClick={() => hasSquad && openRoster(r.team.id)}
                disabled={!hasSquad}
                title={hasSquad ? `See ${r.team.name}'s line-up` : undefined}
              >
                <span className="cont-team">
                  <Flag team={r.team} size={18} />
                  <span className="cont-name">{r.team.name}</span>
                  {hasSquad && <span className="cont-xi">XI ›</span>}
                </span>
                <span className="cont-bar">
                  <span className="cont-fill" style={{ width: `${r.pct}%` }} />
                </span>
                <span className="cont-val">
                  {r.pct}%
                  <span className="cont-frac">{r.returning}/26</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="cont-aside">
        <button className="cont-france" onClick={() => openRoster("fra")}>
          See France's starting XI on the pitch →
        </button>
      </div>

      {fresh.length > 0 && (
        <div className="cont-group">
          <h3 className="cont-sub">Brand-new at this World Cup</h3>
          <p className="cont-sub-note">
            Weren't at Qatar 2022 (debutants or absentees), so there's no carry-over
            to measure.
          </p>
          <div className="cont-chips">
            {fresh.map((t) => (
              <span className="cont-chip" key={t.id}>
                <Flag team={t} size={16} />
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="cont-group">
          <h3 className="cont-sub">Still being cross-checked</h3>
          <p className="cont-sub-note">
            At Qatar 2022; their exact carry-over is being confirmed against both
            full squad lists.
          </p>
          <div className="cont-chips">
            {pending.map((t) => (
              <span className="cont-chip is-pending" key={t.id}>
                <Flag team={t} size={16} />
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="section-note cont-foot">
        Counts are taken from published squad lists; where a source states the
        figure we use it, otherwise it's computed from both 26-man squads.
      </p>
    </section>
  );
}
