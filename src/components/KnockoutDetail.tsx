import { useEffect } from "react";
import type { PlayerAbsence } from "../data/types";
import { teamById } from "../data/teams";
import { IMPACT_LABELS, sentOffIn, unavailableFor } from "../data/discipline";
import { matchupTeams } from "../lib/matchup";
import { openRoster, isRosterOpen } from "../lib/roster";
import { Flag } from "./Flag";
import { MatchupPanel } from "./MatchupPanel";
import type { ResolvedMatch, ResolvedSeed } from "../lib/bracket";

const fmtFull = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

interface KnockoutDetailProps {
  match: ResolvedMatch & { round: string };
  onClose: () => void;
}

/**
 * Match detail for a knockout tie — the bracket equivalent of `MatchDetail`.
 * Shows both sides (each opening its squad), the score when played, and the
 * team-strength comparison once both teams are decided.
 */
export function KnockoutDetail({ match, onClose }: KnockoutDetailProps) {
  const { home, away } = match;
  const bothFirm = Boolean(home.id && away.id);
  const reds = sentOffIn(match.id);
  const out = unavailableFor(match.id);
  const m = bothFirm ? matchupTeams(home.id!, away.id!, match.id) : null;

  const openSquad = (teamId: string) => openRoster(teamId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isRosterOpen()) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${home.name} vs ${away.name} match details`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <p className="modal-kicker">
          {match.round} · Match {match.num} ·{" "}
          {fmtFull.format(new Date(match.kickoff))}
          {match.finished && <span className="ft-badge">FT</span>}
        </p>

        <div className="modal-tie">
          <TeamSide seed={home} onOpen={openSquad} />
          <span className={match.finished ? "modal-score is-final" : "modal-score"}>
            {match.finished ? `${match.homeScore}–${match.awayScore}` : "vs"}
          </span>
          <TeamSide seed={away} onOpen={openSquad} away />
        </div>

        <p className="modal-venue">{match.venue}</p>

        {m ? (
          <MatchupPanel m={m} onOpen={openSquad} />
        ) : (
          <p className="modal-clean">
            This tie isn't set yet — one or both teams are decided by an earlier
            round. Check back once those matches are played.
          </p>
        )}

        {reds.length > 0 && (
          <section className="modal-section">
            <h4 className="modal-head">
              <i className="rc" aria-hidden="true" /> Red cards in this match
            </h4>
            <ul className="player-list">
              {reds.map((a) => (
                <PlayerRow key={a.player} a={a} />
              ))}
            </ul>
          </section>
        )}

        {out.length > 0 && (
          <section className="modal-section">
            <h4 className="modal-head">
              <i className="sus-dot" aria-hidden="true" /> Ruled out of this match
            </h4>
            <ul className="player-list">
              {out.map((a) => (
                <PlayerRow key={a.player} a={a} />
              ))}
            </ul>
          </section>
        )}

        {bothFirm && reds.length === 0 && out.length === 0 && (
          <p className="modal-clean">
            No red cards or suspensions affect this match — both squads at full
            strength.
          </p>
        )}
      </div>
    </div>
  );
}

function SeedFlag({ seed, size }: { seed: ResolvedSeed; size: number }) {
  if (seed.id) {
    try {
      return <Flag team={teamById(seed.id)} size={size} />;
    } catch {
      /* fall through to slug/pip */
    }
  }
  if (!seed.flag) return <span className="bk-seed-pip" aria-hidden="true" />;
  return (
    <img
      className="flag"
      src={`https://flagcdn.com/w40/${seed.flag}.png`}
      srcSet={`https://flagcdn.com/w80/${seed.flag}.png 2x`}
      width={size}
      height={Math.round(size * 0.68)}
      loading="lazy"
      alt=""
      aria-hidden="true"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

function TeamSide({
  seed,
  onOpen,
  away,
}: {
  seed: ResolvedSeed;
  onOpen: (teamId: string) => void;
  away?: boolean;
}) {
  const cls = `modal-team${away ? " modal-team-away" : ""}`;
  const flag = <SeedFlag seed={seed} size={22} />;
  if (seed.id) {
    return (
      <button
        type="button"
        className={`${cls} team-link`}
        onClick={() => onOpen(seed.id!)}
        title={`${seed.name} squad`}
      >
        {away ? (
          <>
            {seed.name} {flag}
          </>
        ) : (
          <>
            {flag} {seed.name}
          </>
        )}
      </button>
    );
  }
  return (
    <span className={cls}>
      {away ? (
        <>
          {seed.name} {flag}
        </>
      ) : (
        <>
          {flag} {seed.name}
        </>
      )}
    </span>
  );
}

function PlayerRow({ a }: { a: PlayerAbsence }) {
  const team = teamById(a.team);
  return (
    <li className="player-row">
      <div className="player-main">
        <span className="player-name">
          <Flag team={team} size={14} /> {a.player}
          {a.position && <em className="player-pos">{a.position}</em>}
        </span>
        <span className="player-reason">{a.reason}</span>
        {a.note && <span className="player-note">{a.note}</span>}
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
