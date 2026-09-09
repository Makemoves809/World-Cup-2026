import { useMemo, useState } from "react";
import { CLUBS, clubById, type Club } from "../data/clubs";
import { CL_FIXTURES, fixturesFor, type ClFixture } from "../data/clFixtures";
import { flagUrl } from "../lib/flags";
import { openClub } from "../lib/clubSheet";
import { Crest as ClubCrest } from "../components/Crest";
import { metaFor, resultFor } from "../lib/clLive";

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

const MATCHDAYS = [1, 2, 3, 4, 5, 6, 7, 8];

/** Matchday whose last kickoff is still ahead — i.e. the one in play or next up. */
function currentMatchday(now: number): number {
  for (const md of MATCHDAYS) {
    const times = CL_FIXTURES.map((f) => metaFor(f.id))
      .filter((m) => m.matchday === md && m.utc)
      .map((m) => new Date(m.utc!).getTime());
    if (times.length && Math.max(...times) + 2 * 60 * 60 * 1000 > now) return md;
  }
  return MATCHDAYS[MATCHDAYS.length - 1];
}

function ScheduleRow({ f }: { f: ClFixture }) {
  const home = clubById(f.home);
  const away = clubById(f.away);
  if (!home || !away) return null;
  const m = metaFor(f.id);
  const r = resultFor(f.id);
  const when = m.utc ? new Date(m.utc) : null;
  return (
    <li className={`sc-row${r ? " sc-played" : ""}`}>
      <span className="sc-time">{when ? fmtTime.format(when) : "TBC"}</span>
      <button type="button" className="sc-side sc-home club-link" onClick={() => openClub(home.id)} title={`${home.name} — squad & fixtures`}>
        <span className="sc-name">{home.short}</span>
        <Flag club={home} />
        <Crest club={home} cls="sc-crest" />
      </button>
      <span className="sc-mid">{r ? `${r[0]}–${r[1]}` : "v"}</span>
      <button type="button" className="sc-side sc-away club-link" onClick={() => openClub(away.id)} title={`${away.name} — squad & fixtures`}>
        <Crest club={away} cls="sc-crest" />
        <Flag club={away} />
        <span className="sc-name">{away.short}</span>
      </button>
    </li>
  );
}

function Schedule() {
  const now = Date.now();
  const [md, setMd] = useState(() => currentMatchday(now));

  const byDate = useMemo(() => {
    const rows = CL_FIXTURES.filter((f) => metaFor(f.id).matchday === md).sort(
      (a, b) => (metaFor(a.id).utc ?? "").localeCompare(metaFor(b.id).utc ?? "")
    );
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
              <ScheduleRow key={f.id} f={f} />
            ))}
          </ol>
        </section>
      ))}

      <p className="section-note sc-foot">
        All 18 matches of each matchday, in your local time. Scores appear here
        as games finish.
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

/* --------------------------------- page --------------------------------- */

export function Fixtures() {
  const [mode, setMode] = useState<"schedule" | "club">("schedule");

  return (
    <section className="fx-page">
      <div className="section-head">
        <span className="kicker">Schedule · league phase</span>
        <h2>Every match</h2>
        <p className="section-note">
          There are no groups — all 36 clubs sit in one league, each playing 8
          different opponents across 8 matchdays. Browse the schedule by
          matchday, or see one club's eight games.
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
          aria-selected={mode === "club"}
          className={`sc-mode${mode === "club" ? " is-on" : ""}`}
          onClick={() => setMode("club")}
        >
          By club
        </button>
      </div>

      {mode === "schedule" ? <Schedule /> : <ByClub />}
    </section>
  );
}
