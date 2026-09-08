import { useEffect } from "react";
import { clubById } from "../data/clubs";
import { fixturesFor, type ClFixture } from "../data/clFixtures";
import { initials } from "../data/squads";
import { flagUrl } from "../lib/flags";
import { closeClub, useClubSheet } from "../lib/clubSheet";
import { leagueTable } from "../lib/clStandings";
import { metaFor, resultFor, liveScoreFor, kickoffOf } from "../lib/clLive";
import squadData from "../data/clSquads.json";

const fmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

interface SquadPlayer {
  name: string;
  position: string | null;
  number?: number | null;
}
const squads = (squadData as { squads?: Record<string, { players?: SquadPlayer[]; coach?: string | null }> })
  .squads ?? {};

/** Group a squad by position, in a sensible order. */
const POS_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Attacker", "Offence", "Forward"];
function byPosition(players: SquadPlayer[]) {
  const groups = new Map<string, SquadPlayer[]>();
  for (const p of players) {
    const k = p.position ?? "Squad";
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  return [...groups.entries()].sort(
    (a, b) =>
      (POS_ORDER.indexOf(a[0]) + 1 || 99) - (POS_ORDER.indexOf(b[0]) + 1 || 99)
  );
}

function FixtureLine({ f, me }: { f: ClFixture; me: string }) {
  const isHome = f.home === me;
  const opp = clubById(isHome ? f.away : f.home);
  if (!opp) return null;
  const r = resultFor(f.id);
  const ls = liveScoreFor(f.id);
  const score = r ?? (ls ? [ls.home, ls.away] : null);
  const mine = score ? (isHome ? score[0] : score[1]) : null;
  const theirs = score ? (isHome ? score[1] : score[0]) : null;
  const t = kickoffOf(f);
  const outcome =
    mine == null || theirs == null ? "" : mine > theirs ? "w" : mine < theirs ? "l" : "d";

  return (
    <li className="cs-fx">
      <span className={`cs-venue ${isHome ? "is-h" : "is-a"}`}>{isHome ? "H" : "A"}</span>
      <span className="cs-opp">{opp.short}</span>
      {score ? (
        <span className={`cs-res cs-${outcome}`}>
          {mine}–{theirs}
        </span>
      ) : (
        <span className="cs-when">{t ? fmt.format(new Date(t)) : "TBC"}</span>
      )}
    </li>
  );
}

export function ClubSheet() {
  const id = useClubSheet();

  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeClub();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [id]);

  if (!id) return null;
  const club = clubById(id);
  if (!club) return null;

  const row = leagueTable().find((r) => r.club.id === id);
  const { home, away } = fixturesFor(id);
  const fixtures = [...home, ...away].sort(
    (a, b) => (metaFor(a.id).matchday ?? 99) - (metaFor(b.id).matchday ?? 99)
  );
  const squad = squads[id];
  const players = squad?.players ?? [];
  const src = flagUrl(club.flag);

  return (
    <div className="cs-backdrop" onClick={closeClub} role="dialog" aria-modal="true" aria-label={club.name}>
      <div className="cs-panel" onClick={(e) => e.stopPropagation()}>
        <button className="cs-close" onClick={closeClub} aria-label="Close">
          ×
        </button>

        <header className="cs-head">
          <span className="club-crest cs-crest">{initials(club.short)}</span>
          <div className="cs-id">
            <h2>{club.name}</h2>
            <span className="cs-meta">
              {src && <img className="flag" src={src} width={18} height={12} alt="" aria-hidden="true" />}
              {club.country} · {club.league}
              {club.titles > 0 && (
                <span className="cs-titles">★ {club.titles}× European champion</span>
              )}
            </span>
          </div>
        </header>

        <p className="cs-blurb">{club.blurb}</p>

        {row && row.played > 0 && (
          <div className="cs-record">
            {[
              ["Pld", row.played],
              ["W", row.won],
              ["D", row.drawn],
              ["L", row.lost],
              ["GD", row.gd > 0 ? `+${row.gd}` : row.gd],
              ["Pts", row.pts],
            ].map(([k, v]) => (
              <div className="cs-stat" key={String(k)}>
                <span className="cs-stat-k">{k}</span>
                <span className="cs-stat-v">{v}</span>
              </div>
            ))}
          </div>
        )}

        <h3 className="cs-sub">League phase · 8 games</h3>
        <ol className="cs-fxlist">
          {fixtures.map((f) => (
            <FixtureLine key={f.id} f={f} me={id} />
          ))}
        </ol>

        <h3 className="cs-sub">Squad</h3>
        {players.length > 0 ? (
          <>
            {squad?.coach && <p className="cs-coach">Coach · {squad.coach}</p>}
            {byPosition(players).map(([pos, list]) => (
              <div className="cs-posgroup" key={pos}>
                <span className="cs-pos">{pos}</span>
                <ul className="cs-players">
                  {list.map((p) => (
                    <li key={`${p.name}-${p.number ?? ""}`}>
                      {p.number != null && <span className="cs-num">{p.number}</span>}
                      {p.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        ) : (
          <p className="cs-empty">
            Squad lists aren't available yet — the free results feed doesn't
            include them. They'll appear here automatically once a player-data
            key is connected.
          </p>
        )}
      </div>
    </div>
  );
}
