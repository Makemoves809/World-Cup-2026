import { standingsForGroup, zoneFor } from "../lib/standings";
import { Flag } from "./Flag";

interface GroupTableProps {
  group: string;
}

export function GroupTable({ group }: GroupTableProps) {
  const rows = standingsForGroup(group);
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
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th className="c-gd">GD</th>
            <th className="c-pts">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.team.id} className={`zone-${zoneFor(r.position)}`}>
              <td className="c-pos">
                <span className="pos-pip">{r.position}</span>
              </td>
              <td className="c-team">
                <Flag team={r.team} />
                <span className="team-name">{r.team.name}</span>
                {r.team.host && <span className="host-pin">Host</span>}
              </td>
              <td>{r.played}</td>
              <td>{r.won}</td>
              <td>{r.drawn}</td>
              <td>{r.lost}</td>
              <td className="c-gd">
                {r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}
              </td>
              <td className="c-pts">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
