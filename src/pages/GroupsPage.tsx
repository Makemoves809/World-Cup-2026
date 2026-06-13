import { GroupTable } from "../components/GroupTable";
import { GROUP_IDS } from "../data/teams";

export function GroupsPage() {
  return (
    <section className="groups" id="groups">
      <div className="section-head">
        <span className="kicker">12 groups · 48 nations</span>
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
  );
}
