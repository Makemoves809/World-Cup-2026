import { useEffect, useState } from "react";
import {
  SQUADS,
  LINE_LABEL,
  playerPhoto,
  initials,
  type Player,
} from "../data/squads";
import { cardStatus, type CardStatus } from "../data/discipline";

/** Which coloured ring/badge a player's status warrants (most severe first). */
function statusKind(cs: CardStatus): "red" | "yellow" | "out" | null {
  if (cs.red || cs.suspended) return "red";
  if (cs.yellows > 0) return "yellow";
  if (cs.injured) return "out";
  return null;
}

/** Circular headshot with a lettered fallback + a card/availability badge. */
export function Avatar({
  player,
  size,
  status,
}: {
  player: Player;
  size: number;
  status?: CardStatus;
}) {
  const [failed, setFailed] = useState(false);
  const show = player.photo && !failed;
  const kind = status ? statusKind(status) : null;

  return (
    <span className={`pl-disc${kind ? ` ring-${kind}` : ""}`} style={{ width: size, height: size }}>
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

      {kind === "red" && (
        <span className="pl-card pl-card-red" title={status?.note || "Suspended"} />
      )}
      {kind === "yellow" && (
        <span className="pl-card pl-card-yellow" title={status?.note || "Booked"}>
          {status!.yellows > 1 ? status!.yellows : ""}
        </span>
      )}
      {kind === "out" && (
        <span className="pl-out" title={status?.note || "Out injured"}>
          +
        </span>
      )}
    </span>
  );
}

function StatusLine({ status }: { status: CardStatus }) {
  const kind = statusKind(status);
  if (!kind) return null;
  const label =
    kind === "red"
      ? status.red
        ? "Sent off · suspended"
        : "Suspended (two yellows)"
      : kind === "yellow"
      ? status.yellows > 1
        ? "Two yellows"
        : "One booking"
      : "Out injured";
  return (
    <p className={`pl-status pl-status-${kind}`}>
      <span className="pl-status-tag">{label}</span>
      {status.note && <span className="pl-status-note">{status.note}</span>}
    </p>
  );
}

function PlayerModal({
  player,
  status,
  onClose,
}: {
  player: Player;
  status: CardStatus;
  onClose: () => void;
}) {
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
          <Avatar player={player} size={120} status={status} />
          <div className="pl-modal-id">
            <span className="pl-modal-kicker">
              {player.captain ? "Captain · " : ""}#{player.num} · {LINE_LABEL[player.line]}
            </span>
            <h3>{player.name}</h3>
            <span className="pl-modal-role">{player.role}</span>
          </div>
        </div>

        <StatusLine status={status} />

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
  const statusOf = (p: Player) => cardStatus(teamId, p.name);

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
              <Avatar player={p} size={60} status={statusOf(p)} />
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
              <Avatar player={p} size={40} status={statusOf(p)} />
              <span className="bench-meta">
                <span className="bench-name">{p.short}</span>
                <span className="bench-role">{p.role}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <PlayerModal
          player={active}
          status={statusOf(active)}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
