import { GroupTable } from "../components/GroupTable";
import { GROUP_IDS } from "../data/teams";

export function GroupsPage() {
  return (
    <section className="groups" id="groups">
      <div className="section-head">
        <span className="kicker">12 groups · 48 nations · final</span>
        <h2>Final group tables</h2>
        <p className="section-note">
          The group stage is complete — this is how all 12 groups finished. Top
          two advanced, and the eight best third-placed teams joined them in the
          Round of 32. Coloured rows show who went <strong>through</strong> (✓)
          and who went <strong>out</strong> (✗).
        </p>
      </div>

      <div className="legend">
        <span className="legend-item">
          <i className="swatch sw-qualified" /> Top 2
        </span>
        <span className="legend-item">
          <i className="swatch sw-playoff" /> Best thirds
        </span>
        <span className="legend-item">
          <i className="swatch sw-out" /> Bottom
        </span>
        <span className="legend-item">
          <span className="qual-badge qual-through">✓ Through</span> clinched
        </span>
        <span className="legend-item">
          <span className="qual-badge qual-out">✗ Out</span> eliminated
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
