import { useEffect, useState } from "react";
import {
  FRANCE,
  LINE_LABEL,
  playerPhoto,
  initials,
  type Line,
  type Player,
} from "../data/france";

const LINES: Line[] = ["fwd", "mid", "def", "gk"];

/** Circular headshot with a lettered fallback when the photo can't load. */
function Avatar({ player, size }: { player: Player; size: number }) {
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
    <div className="modal-backdrop" onClick={onClose}>
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
            ? "One of the 11 players carried over from France's Qatar 2022 squad."
            : "A fresh face since Qatar 2022 — part of the 58% of the squad that has turned over."}
        </p>
      </div>
    </div>
  );
}

export function FranceSquad() {
  const [active, setActive] = useState<Player | null>(null);
  const returning = FRANCE.filter((p) => p.at2022).length;

  return (
    <section className="squadpage" id="france">
      <div className="section-head">
        <span className="kicker">Squad map · Les Bleus</span>
        <h2>France · the 26</h2>
        <p className="section-note">
          Didier Deschamps' 2026 World Cup squad, laid out by position. Tap any
          player for their details. {returning} of 26 also played at Qatar 2022
          ({Math.round((returning / 26) * 100)}% continuity).
        </p>
      </div>

      <div className="pitch" role="group" aria-label="France squad on a pitch">
        <div className="pitch-lines" aria-hidden="true">
          <span className="pitch-circle" />
          <span className="pitch-spot" />
          <span className="pitch-box pitch-box-top" />
          <span className="pitch-box pitch-box-bot" />
        </div>

        {LINES.map((line) => (
          <div className={`pitch-line line-${line}`} key={line}>
            {FRANCE.filter((p) => p.line === line).map((p) => (
              <button
                className="pl-token"
                key={p.num}
                onClick={() => setActive(p)}
                aria-label={`${p.name}, ${p.role}`}
              >
                <Avatar player={p} size={64} />
                <span className="pl-name">{p.short}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <p className="section-note squad-foot">
        Headshots via Wikimedia Commons; players without a free photo show their
        initials. <strong>{returning}/26</strong> returning from Qatar 2022 — see
        how France compares on the Continuity page.
      </p>

      {active && <PlayerModal player={active} onClose={() => setActive(null)} />}
    </section>
  );
}
