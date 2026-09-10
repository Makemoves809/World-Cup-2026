import { useMemo, useState } from "react";
import { CLUBS, clubById, type Club } from "../data/clubs";
import { fixturesFor, type ClFixture } from "../data/clFixtures";
import { flagUrl } from "../lib/flags";
import { openClub } from "../lib/clubSheet";
import { Crest as ClubCrest } from "../components/Crest";
import {
  metaFor,
  resultFor,
  MATCHDAYS,
  currentMatchday,
  matchdayFixtures,
  playedFixtures,
  goalsFor,
} from "../lib/clLive";
import { MatchGoals } from "../components/MatchGoals";

const fmtDayFull = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const fmtDayShort = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const fmtTime = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

function Crest({ club, cls = "" }: { club: Club; cls?: string }) {
  return <ClubCrest club={club} className={cls} />;
}
function Flag({ club }: { club: Club }) {
  const src = flagUrl(club.flag);
  return src ? (
    <img className="flag" src={src} width={16} height={11} alt="" aria-hidden="true" />
  ) : null;
}

/* ------------------------------- schedule ------------------------------- */

function ScheduleRow({
  f,
  open,
  onToggle,
}: {
  f: ClFixture;
  open?: boolean;
  onToggle?: () => void;
}) {
  const home = clubById(f.home);
  const away = clubById(f.away);
  if (!home || !away) return null;
  const m = metaFor(f.id);
  const r = resultFor(f.id);
  const when = m.utc ? new Date(m.utc) : null;
  // Only played matches have a scoresheet to open.
  const hasGoals = !!r && goalsFor(f.id).length > 0;

  return (
    <li className={`sc-row${r ? " sc-played" : ""}${open ? " sc-open" : ""}`}>
      <span className="sc-time">{when ? fmtTime.format(when) : "TBC"}</span>
      <button type="button" className="sc-side sc-home club-link" onClick={() => openClub(home.id)} title={`${home.name} — squad & fixtures`}>
        <span className="sc-name">{home.short}</span>
        <Flag club={home} />
        <Crest club={home} cls="sc-crest" />
      </button>
      {hasGoals && onToggle ? (
        <button
          type="button"
          className="sc-mid sc-mid-btn"
          onClick={onToggle}
          aria-expanded={!!open}
          title={open ? "Hide goalscorers" : "Who scored?"}
        >
          {r![0]}–{r![1]}
          <span className="sc-caret" aria-hidden="true">
            {open ? "▴" : "▾"}
          </span>
        </button>
      ) : (
        <span className="sc-mid">{r ? `${r[0]}–${r[1]}` : "v"}</span>
      )}
      <button type="button" className="sc-side sc-away club-link" onClick={() => openClub(away.id)} title={`${away.name} — squad & fixtures`}>
        <Crest club={away} cls="sc-crest" />
        <Flag club={away} />
        <span className="sc-name">{away.short}</span>
      </button>
      {open && (
        <div className="sc-sheet">
          <MatchGoals f={f} />
        </div>
      )}
    </li>
  );
}

function Schedule() {
  const now = Date.now();
  const [md, setMd] = useState(() => currentMatchday(now));
  const [open, setOpen] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const rows = matchdayFixtures(md);
    const groups = new Map<string, ClFixture[]>();
    for (const f of rows) {
      const key = (metaFor(f.id).utc ?? "").slice(0, 10);
      groups.set(key, [...(groups.get(key) ?? []), f]);
    }
    return [...groups.entries()];
  }, [md]);

  return (
    <>
      <div className="sc-pills" role="tablist" aria-label="Matchday">
        {MATCHDAYS.map((n) => (
          <button
            key={n}
            role="tab"
            aria-selected={n === md}
            className={`sc-pill${n === md ? " is-on" : ""}`}
            onClick={() => setMd(n)}
          >
            MD{n}
          </button>
        ))}
      </div>

      {byDate.map(([date, rows]) => (
        <section className="sc-day" key={date}>
          <h3 className="sc-date">
            {date ? fmtDayFull.format(new Date(`${date}T12:00:00Z`)) : "Date to be confirmed"}
          </h3>
          <ol className="sc-list">
            {rows.map((f) => (
              <ScheduleRow
                key={f.id}
                f={f}
                open={open === f.id}
                onToggle={() => setOpen(open === f.id ? null : f.id)}
              />
            ))}
          </ol>
        </section>
      ))}

      <p className="section-note sc-foot">
        All 18 matches of each matchday, in your local time. Scores appear here
        as games finish — tap a score to see who scored.
      </p>
    </>
  );
}

/* -------------------------------- by club ------------------------------- */

function ClubRow({ f, me }: { f: ClFixture; me: string }) {
  const isHome = f.home === me;
  const opp = clubById(isHome ? f.away : f.home);
  if (!opp) return null;
  const m = metaFor(f.id);
  const r = resultFor(f.id);
  const mine = r ? (isHome ? r[0] : r[1]) : null;
  const theirs = r ? (isHome ? r[1] : r[0]) : null;
  const when = m.utc ? new Date(m.utc) : null;
  return (
    <li className={`fx-row${r ? " fx-played" : ""}`}>
      <span className={`fx-venue ${isHome ? "fx-h" : "fx-a"}`}>{isHome ? "H" : "A"}</span>
      <button type="button" className="fx-opp club-link" onClick={() => openClub(opp.id)} title={`${opp.name} — squad & fixtures`}>
        <Crest club={opp} cls="fx-crest" />
        <span className="fx-opp-name">
          {opp.name}
          <span className="fx-opp-meta">
            <Flag club={opp} /> {opp.country}
            {m.matchday ? ` · MD${m.matchday}` : ""}
          </span>
        </span>
      </button>
      <span className="fx-when">
        {r ? (
          <span className="fx-score">
            {mine}–{theirs}
          </span>
        ) : when ? (
          <>
            <span className="fx-day">{fmtDayShort.format(when)}</span>
            <span className="fx-time">{fmtTime.format(when)}</span>
          </>
        ) : (
          <span className="fx-tbc">Date TBC</span>
        )}
      </span>
    </li>
  );
}

function ByClub() {
  const [clubId, setClubId] = useState("rma");
  const club = clubById(clubId) ?? CLUBS[0];
  const { home, away } = fixturesFor(club.id);
  const all = [...home, ...away].sort(
    (a, b) => (metaFor(a.id).matchday ?? 99) - (metaFor(b.id).matchday ?? 99)
  );

  return (
    <>
      <label className="fx-pick">
        <span className="fx-pick-label">Club</span>
        <select value={club.id} onChange={(e) => setClubId(e.target.value)}>
          {[...CLUBS]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.country}
              </option>
            ))}
        </select>
      </label>

      <div className="fx-club-head">
        <Crest club={club} />
        <div>
          <span className="fx-club-name">{club.name}</span>
          <span className="fx-club-meta">
            <Flag club={club} /> {club.country} · {club.league}
          </span>
        </div>
      </div>

      <ol className="fx-list">
        {all.map((f) => (
          <ClubRow key={f.id} f={f} me={club.id} />
        ))}
      </ol>

      <p className="section-note fx-foot">
        <strong>H</strong> = at home, <strong>A</strong> = away. Each club plays
        8 different opponents — 4 home, 4 away.
      </p>
    </>
  );
}

/* ------------------------------ match history ---------------------------- */

/**
 * Every match played so far, newest first, with the scorers under each — the
 * "what have I missed?" view. Grouped by matchday so a beginner can see the
 * season's shape (a matchday is a round, not a date), with the date on each
 * match.
 */
function Results() {
  const played = playedFixtures();

  if (played.length === 0) {
    return (
      <p className="section-note rs-empty">
        No matches have been played yet. Once the league phase kicks off,
        every result lands here with its goalscorers.
      </p>
    );
  }

  const byMd = new Map<number, ClFixture[]>();
  for (const f of played) {
    const md = metaFor(f.id).matchday ?? 0;
    byMd.set(md, [...(byMd.get(md) ?? []), f]);
  }
  const rounds = [...byMd.entries()].sort((a, b) => b[0] - a[0]);

  return (
    <>
      {rounds.map(([md, rows]) => (
        <section className="rs-round" key={md}>
          <h3 className="sc-date">{md ? `Matchday ${md}` : "Matches"}</h3>
          <ol className="rs-list">
            {rows.map((f) => {
              const home = clubById(f.home);
              const away = clubById(f.away);
              const r = resultFor(f.id);
              if (!home || !away || !r) return null;
              const utc = metaFor(f.id).utc;
              return (
                <li className="rs-item" key={f.id}>
                  <div className="rs-head">
                    <button
                      type="button"
                      className="rs-side club-link"
                      onClick={() => openClub(home.id)}
                      title={`${home.name} — squad & fixtures`}
                    >
                      <span className="rs-name">{home.short}</span>
                      <Flag club={home} />
                      <Crest club={home} cls="sc-crest" />
                    </button>
                    <span className="rs-score">
                      {r[0]}–{r[1]}
                    </span>
                    <button
                      type="button"
                      className="rs-side rs-away club-link"
                      onClick={() => openClub(away.id)}
                      title={`${away.name} — squad & fixtures`}
                    >
                      <Crest club={away} cls="sc-crest" />
                      <Flag club={away} />
                      <span className="rs-name">{away.short}</span>
                    </button>
                  </div>
                  <MatchGoals f={f} />
                  {utc && (
                    <span className="rs-when">
                      {fmtDayShort.format(new Date(utc))}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <p className="section-note sc-foot">
        Goalscorers and minutes are pulled in automatically as matches finish.
        <strong> (pen)</strong> marks a penalty, <strong>(og)</strong> an own
        goal — listed under the side it counted for.
      </p>
    </>
  );
}

/* --------------------------------- page --------------------------------- */

export function Fixtures() {
  const [mode, setMode] = useState<"schedule" | "results" | "club">("schedule");

  return (
    <section className="fx-page">
      <div className="section-head">
        <span className="kicker">Schedule · league phase</span>
        <h2>Every match</h2>
        <p className="section-note">
          There are no groups — all 36 clubs sit in one league, each playing 8
          different opponents across 8 matchdays. Browse the schedule by
          matchday, catch up on results with the goalscorers, or see one club's
          eight games.
        </p>
      </div>

      <div className="sc-modes" role="tablist" aria-label="View">
        <button
          role="tab"
          aria-selected={mode === "schedule"}
          className={`sc-mode${mode === "schedule" ? " is-on" : ""}`}
          onClick={() => setMode("schedule")}
        >
          By matchday
        </button>
        <button
          role="tab"
          aria-selected={mode === "results"}
          className={`sc-mode${mode === "results" ? " is-on" : ""}`}
          onClick={() => setMode("results")}
        >
          Results
        </button>
        <button
          role="tab"
          aria-selected={mode === "club"}
          className={`sc-mode${mode === "club" ? " is-on" : ""}`}
          onClick={() => setMode("club")}
        >
          By club
        </button>
      </div>

      {mode === "schedule" ? <Schedule /> : mode === "results" ? <Results /> : <ByClub />}
    </section>
  );
}
