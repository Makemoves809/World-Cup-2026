import { useEffect } from "react";
import { SQUADS } from "../data/squads";
import { teamById } from "../data/teams";
import { closeRoster } from "../lib/roster";
import { SquadView } from "./SquadView";

/** In-place team-roster overlay — opens over the current tab without navigating. */
export function RosterModal({ teamId }: { teamId: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRoster();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  const squad = SQUADS[teamId];
  let team;
  try {
    team = teamById(teamId);
  } catch {
    team = undefined;
  }
  const name = team ? team.name : teamId.toUpperCase();

  return (
    <div className="modal-backdrop roster-backdrop" onClick={closeRoster}>
      <div className="modal roster-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeRoster} aria-label="Close">
          ×
        </button>
        <div className="roster-head">
          <span className="modal-kicker">
            {squad ? `Starting XI · ${squad.formation}` : "Squad"}
          </span>
          <h3>{name}</h3>
        </div>

        {squad ? (
          <SquadView teamId={teamId} />
        ) : (
          <p className="section-note roster-empty">
            A pitch line-up for {name} hasn't been added yet — it's on the way.
          </p>
        )}
      </div>
    </div>
  );
}
