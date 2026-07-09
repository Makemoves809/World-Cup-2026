import type { PlayerAbsence } from "../data/types";
import { teamById } from "../data/teams";
import { IMPACT_LABELS, scopeLabel } from "../data/discipline";
import { goalsForPlayer, minuteLabel } from "../data/goals";
import { Flag } from "./Flag";

/** A player ruled out of a match — used in both group and knockout detail modals. */
export function PlayerRow({ a }: { a: PlayerAbsence }) {
  const team = teamById(a.team);
  const scored = goalsForPlayer(a.team, a.player);

  return (
    <li className="player-row">
      <div className="player-main">
        <span className="player-name">
          <Flag team={team} size={14} /> {a.player}
          {a.position && <em className="player-pos">{a.position}</em>}
        </span>
        <span className="player-reason">{a.reason}</span>
        <span
          className="player-scope"
          data-scope={a.outForTournament ? "tournament" : "short"}
        >
          {scopeLabel(a)}
        </span>
        {a.note && <span className="player-note">{a.note}</span>}
        {scored.length > 0 && (
          <span className="player-form">
            {scored.length} goal{scored.length > 1 ? "s" : ""} this World Cup ·{" "}
            {scored.map((g) => minuteLabel(g.minute, g.extra)).join(", ")}
          </span>
        )}
      </div>
      <div className="impact" data-level={a.impact}>
        <span className="impact-label">{IMPACT_LABELS[a.impact]}</span>
        <span
          className="impact-meter"
          role="img"
          aria-label={`Impact ${a.impact} out of 5 — ${IMPACT_LABELS[a.impact]}`}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <i key={i} className={i <= a.impact ? "seg is-on" : "seg"} />
          ))}
        </span>
      </div>
    </li>
  );
}
