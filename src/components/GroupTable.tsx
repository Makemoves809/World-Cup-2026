import { standingsForGroup, zoneFor } from "../lib/standings";
import { groupQualification, type GroupStatus } from "../lib/qualification";
import { openRoster } from "../lib/roster";
import { Flag } from "./Flag";

interface GroupTableProps {
  group: string;
}

const STATUS_BADGE: Record<GroupStatus, { mark: string; text: string; title: string } | null> = {
  through: { mark: "✓", text: "Through", title: "Clinched a top-2 place — into the Round of 32" },
  out: { mark: "✗", text: "Out", title: "Eliminated — can only finish 4th" },
  contention: null,
};

export function GroupTable({ group }: GroupTableProps) {
  const rows = standingsForGroup(group);
  const qual = groupQualification(group);
  const anyPlayed = rows.some((r) => r.played > 0);

  return (
    <article className="group-card">
      <span className="group-watermark" aria-hidden="true">
        {group}
      </span>
      <div className="group-head">
        <h3>
          Group <span className="group-letter">{group}</span>
        </h3>
        <span className={anyPlayed ? "group-tag is-live" : "group-tag"}>
          {anyPlayed ? "In play" : "Not started"}
        </span>
      </div>

      <table className="group-table">
        <thead>
          <tr>
            <th className="c-pos">#</th>
            <th className="c-team">Team</th>
            <th>P</th>
            <th className="col-secondary">W</th>
            <th className="col-secondary">D</th>
            <th className="col-secondary">L</th>
            <th className="c-gd">GD</th>
            <th className="c-pts">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const badge = STATUS_BADGE[qual[r.team.id]];
            return (
            <tr key={r.team.id} className={`zone-${zoneFor(r.position)} stat-${qual[r.team.id]}`}>
              <td className="c-pos">
                <span className="pos-pip">{r.position}</span>
              </td>
              <td className="c-team">
                <button
                  className="team-link team-cell"
                  onClick={() => openRoster(r.team.id)}
                  title={`${r.team.name} squad`}
                >
                  <Flag team={r.team} />
                  <span className="team-name">{r.team.name}</span>
                  {r.team.host && <span className="host-pin">Host</span>}
                  {badge && (
                    <span className={`qual-badge qual-${qual[r.team.id]}`} title={badge.title}>
                      <span className="qb-mark">{badge.mark}</span>
                      <span className="qb-text"> {badge.text}</span>
                    </span>
                  )}
                  <span className="team-link-cue" aria-hidden="true">›</span>
                </button>
              </td>
              <td>{r.played}</td>
              <td className="col-secondary">{r.won}</td>
              <td className="col-secondary">{r.drawn}</td>
              <td className="col-secondary">{r.lost}</td>
              <td className="c-gd">
                {r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}
              </td>
              <td className="c-pts">{r.points}</td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </article>
  );
}
