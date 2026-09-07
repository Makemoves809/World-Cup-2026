import { useState } from "react";
import { CLUBS, clubById, type Club } from "../data/clubs";
import { fixturesFor, type ClFixture } from "../data/clFixtures";
import { flagUrl } from "../lib/flags";
import { initials } from "../data/squads";
import live from "../data/live.json";

/** Kickoff time + matchday, filled in by the live feed once known. */
interface FixtureMeta {
  utc?: string;
  matchday?: number;
}
const liveAny = live as {
  fixtures?: Record<string, FixtureMeta>;
  results?: Record<string, [number, number]>;
};
const metaFor = (id: string): FixtureMeta => liveAny.fixtures?.[id] ?? {};
const resultFor = (id: string) => liveAny.results?.[id];

const fmtDay = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const fmtTime = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

function Crest({ club }: { club: Club }) {
  return <span className="club-crest fx-crest">{initials(club.short)}</span>;
}
function Flag({ club }: { club: Club }) {
  const src = flagUrl(club.flag);
  return src ? <img className="flag" src={src} width={18} height={12} alt="" aria-hidden="true" /> : null;
}

function FixtureRow({ f, me }: { f: ClFixture; me: string }) {
  const isHome = f.home === me;
  const opp = clubById(isHome ? f.away : f.home);
  if (!opp) return null;
  const m = metaFor(f.id);
  const r = resultFor(f.id);
  // Result is stored home-first; flip it to "my goals – their goals".
  const mine = r ? (isHome ? r[0] : r[1]) : null;
  const theirs = r ? (isHome ? r[1] : r[0]) : null;
  const when = m.utc ? new Date(m.utc) : null;
  return (
    <li className={`fx-row${r ? " fx-played" : ""}`}>
      <span className={`fx-venue ${isHome ? "fx-h" : "fx-a"}`}>{isHome ? "H" : "A"}</span>
      <span className="fx-opp">
        <Crest club={opp} />
        <span className="fx-opp-name">
          {opp.name}
          <span className="fx-opp-meta">
            <Flag club={opp} /> {opp.country}
          </span>
        </span>
      </span>
      <span className="fx-when">
        {r ? (
          <span className="fx-score">
            {mine}–{theirs}
          </span>
        ) : when ? (
          <>
            <span className="fx-day">{fmtDay.format(when)}</span>
            <span className="fx-time">{fmtTime.format(when)}</span>
          </>
        ) : (
          <span className="fx-tbc">
            {m.matchday ? `Matchday ${m.matchday}` : "Date TBC"}
          </span>
        )}
      </span>
    </li>
  );
}

const byMatchday = (x: ClFixture, y: ClFixture) =>
  (metaFor(x.id).matchday ?? 99) - (metaFor(y.id).matchday ?? 99);

/** Every club's 8 league-phase games — who they play, where, and when. */
export function Fixtures() {
  const [clubId, setClubId] = useState("rma");
  const club = clubById(clubId) ?? CLUBS[0];
  const { home, away } = fixturesFor(club.id);
  const all = [...home, ...away].sort(byMatchday);
  const hasDates = all.some((f) => metaFor(f.id).utc);

  return (
    <section className="fx-page">
      <div className="section-head">
        <span className="kicker">Fixtures · league phase</span>
        <h2>Who plays who</h2>
        <p className="section-note">
          There are no groups — each of the 36 clubs plays its own 8 opponents,
          4 at home and 4 away, drawn on 27 August. Pick a club to see its
          eight games.
        </p>
      </div>

      <label className="fx-pick">
        <span className="fx-pick-label">Club</span>
        <select value={club.id} onChange={(e) => setClubId(e.target.value)}>
          {[...CLUBS].sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
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
          <FixtureRow key={f.id} f={f} me={club.id} />
        ))}
      </ol>

      <p className="section-note fx-foot">
        <strong>H</strong> = at home, <strong>A</strong> = away.{" "}
        {hasDates
          ? "Kickoff times are shown in your local time. Scores fill in as matches finish."
          : "Kickoff times and matchdays arrive automatically once the live feed is connected; scores fill in as matches finish."}
      </p>
    </section>
  );
}
