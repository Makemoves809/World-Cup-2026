import { useEffect, useState } from "react";
import {
  SQUADS,
  LINE_LABEL,
  playerPhoto,
  initials,
  type Player,
} from "../data/squads";

/** Circular headshot with a lettered fallback when the photo can't load. */
export function Avatar({ player, size }: { player: Player; size: number }) {
  const [failed, setFailed] = useState(false);
  const show = player.photo && !failed;
  return (
    <span className="pl-disc" style={{ width: size, height: size }}>
      {show ? (
        <img
          className="pl-photo"
          src={playerPhoto(player.photo!, size >= 120 ? 256 : 160)}
          alt={player.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="pl-initials">{initials(player.short)}</span>
      )}
      <span className="pl-num">{player.num}</span>
      {player.captain && <span className="pl-capt" title="Captain">C</span>}
    </span>
  );
}

function PlayerModal({ player, onClose }: { player: Player; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop player-backdrop" onClick={onClose}>
      <div className="modal pl-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="pl-modal-head">
          <Avatar player={player} size={120} />
          <div className="pl-modal-id">
            <span className="pl-modal-kicker">
              {player.captain ? "Captain · " : ""}#{player.num} · {LINE_LABEL[player.line]}
            </span>
            <h3>{player.name}</h3>
            <span className="pl-modal-role">{player.role}</span>
          </div>
        </div>

        <dl className="pl-facts">
          <div>
            <dt>Club</dt>
            <dd>{player.club}</dd>
          </div>
          <div>
            <dt>Shirt</dt>
            <dd>#{player.num}</dd>
          </div>
          <div>
            <dt>Position</dt>
            <dd>{player.role}</dd>
          </div>
          <div>
            <dt>Qatar 2022</dt>
            <dd className={player.at2022 ? "pl-yes" : "pl-no"}>
              {player.at2022 ? "In the squad" : "New since 2022"}
            </dd>
          </div>
        </dl>

        <p className="pl-modal-note">
          {player.at2022
            ? "Carried over from this team's Qatar 2022 squad."
            : "A new face since Qatar 2022."}
        </p>
      </div>
    </div>
  );
}

/** Pitch (starting XI) + bench list for a team. Returns null if no squad data. */
export function SquadView({ teamId }: { teamId: string }) {
  const [active, setActive] = useState<Player | null>(null);
  const squad = SQUADS[teamId];
  if (!squad) return null;

  const xi = squad.players.filter((p) => p.start);
  const bench = squad.players.filter((p) => !p.start);

  return (
    <>
      <div className="pitch" role="group" aria-label="Starting eleven">
        <div className="pitch-lines" aria-hidden="true">
          <span className="pitch-circle" />
          <span className="pitch-spot" />
          <span className="pitch-box pitch-box-top" />
          <span className="pitch-box pitch-box-bot" />
        </div>

        {xi.map((p) => (
          <div
            className="pitch-pos"
            key={p.num}
            style={{ left: `${p.start!.x}%`, top: `${p.start!.y}%` }}
          >
            <button
              className="pl-token"
              onClick={() => setActive(p)}
              aria-label={`${p.name}, ${p.role}`}
            >
              <Avatar player={p} size={60} />
              <span className="pl-name">{p.short}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="bench">
        <h3 className="bench-head">Bench &amp; squad</h3>
        <div className="bench-grid">
          {bench.map((p) => (
            <button
              className="bench-item"
              key={p.num}
              onClick={() => setActive(p)}
              aria-label={`${p.name}, ${p.role}`}
            >
              <Avatar player={p} size={40} />
              <span className="bench-meta">
                <span className="bench-name">{p.short}</span>
                <span className="bench-role">{p.role}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {active && <PlayerModal player={active} onClose={() => setActive(null)} />}
    </>
  );
}
