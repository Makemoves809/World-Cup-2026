import { SQUADS } from "../data/squads";
import { teamById } from "../data/teams";
import { navigate } from "../router";
import { SquadView } from "../components/SquadView";

/** Full-page squad map — used for direct /squad/<id> links. */
export function SquadPitch({ teamId }: { teamId: string }) {
  const squad = SQUADS[teamId];

  let team;
  try {
    team = teamById(teamId);
  } catch {
    team = undefined;
  }
  const name = team ? team.name : teamId.toUpperCase();

  if (!squad) {
    return (
      <section className="squadpage" id="squad">
        <div className="section-head">
          <span className="kicker">Squad map</span>
          <h2>{name} · coming soon</h2>
          <p className="section-note">
            A pitch line-up for this team hasn't been added yet.
          </p>
        </div>
        <button className="cont-france" onClick={() => navigate("/continuity")}>
          ← Back to squad turnover
        </button>
      </section>
    );
  }

  return (
    <section className="squadpage" id="squad">
      <div className="section-head">
        <span className="kicker">Starting XI · {squad.formation}</span>
        <h2>{name} · starting line-up</h2>
        <p className="section-note">
          A likely first eleven for {name}. Tap any player — on the pitch or the
          bench — for their details.
        </p>
      </div>

      <SquadView teamId={teamId} />

      <button className="cont-france back-link" onClick={() => navigate("/continuity")}>
        ← Back to squad turnover
      </button>
    </section>
  );
}
