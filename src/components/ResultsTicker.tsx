import type { Team } from "../data/types";
import { matches } from "../data/fixtures";
import { teamById } from "../data/teams";
import { resolveBracket } from "../lib/bracket";
import { Flag } from "./Flag";

const fmtDay = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

const ROUND_ABBR: Record<string, string> = {
  "Round of 32": "R32",
  "Round of 16": "R16",
  "Quarter-finals": "QF",
  "Semi-finals": "SF",
  Final: "Final",
};

interface TickerRow {
  id: string;
  label: string;
  ko: boolean;
  /** Sortable timestamp (newest first). */
  sortKey: string;
  date: Date;
  home: Team;
  away: Team;
  hs: number;
  as: number;
  /** Which side advanced (knockout games only). */
  adv?: "home" | "away";
}

function buildRows(): TickerRow[] {
  const rows: TickerRow[] = [];

  for (const m of matches) {
    if (m.status !== "finished" || m.homeScore == null || m.awayScore == null) continue;
    rows.push({
      id: m.id,
      label: `Grp ${m.group}`,
      ko: false,
      sortKey: m.kickoff,
      date: new Date(m.kickoff),
      home: teamById(m.home),
      away: teamById(m.away),
      hs: m.homeScore,
      as: m.awayScore,
    });
  }

  for (const round of resolveBracket()) {
    for (const m of round.matches) {
      if (!m.finished || m.homeScore == null || m.awayScore == null) continue;
      if (!m.home.id || !m.away.id) continue;
      rows.push({
        id: m.id,
        label: ROUND_ABBR[round.name] ?? round.name,
        ko: true,
        // KO dates are date-only; bias to noon so they order cleanly vs group games.
        sortKey: `${m.date}T12:00:00Z`,
        date: new Date(`${m.date}T12:00:00Z`),
        home: teamById(m.home.id),
        away: teamById(m.away.id),
        hs: m.homeScore,
        as: m.awayScore,
        adv: m.winner,
      });
    }
  }

  return rows.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}

/** Horizontal strip of the most recent final scores, newest first (KO + group). */
export function ResultsTicker() {
  const rows = buildRows();
  if (rows.length === 0) return null;

  return (
    <div className="ticker" aria-label="Latest results">
      <span className="ticker-label">Results</span>
      <ul className="ticker-list">
        {rows.map((r) => (
          <li className={`ticker-item${r.ko ? " is-ko" : ""}`} key={r.id}>
            <span className="ticker-meta">
              {r.label} · {fmtDay.format(r.date)}
            </span>
            <span className="ticker-score">
              <Flag team={r.home} size={14} />
              <span className={r.adv === "home" ? "tk-adv" : undefined}>
                {r.home.code}
              </span>
              <b>
                {r.hs}–{r.as}
              </b>
              <span className={r.adv === "away" ? "tk-adv" : undefined}>
                {r.away.code}
              </span>
              <Flag team={r.away} size={14} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
