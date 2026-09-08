import { useEffect, useState } from "react";
import { clubById, type Club } from "../data/clubs";
import { Crest } from "./Crest";
import { flagUrl } from "../lib/flags";
import { navigate } from "../router";
import { openClub } from "../lib/clubSheet";
import {
  currentMatchday,
  matchdayFixtures,
  resultFor,
  liveScoreFor,
  kickoffOf,
} from "../lib/clLive";
import type { ClFixture } from "../data/clFixtures";

const fmtDay = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const fmtTime = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

function Side({ club, align }: { club: Club; align: "l" | "r" }) {
  const src = flagUrl(club.flag);
  const crest = <Crest club={club} className="mb-crest" />;
  const name = <span className="mb-name">{club.short}</span>;
  const flag = src ? (
    <img className="flag" src={src} width={15} height={10} alt="" aria-hidden="true" />
  ) : null;
  return (
    <button
      type="button"
      className={`mb-side club-link ${align === "l" ? "mb-l" : "mb-r"}`}
      onClick={() => openClub(club.id)}
      title={`${club.name} — squad & fixtures`}
    >
      {align === "l" ? (
        <>
          {name}
          {flag}
          {crest}
        </>
      ) : (
        <>
          {crest}
          {flag}
          {name}
        </>
      )}
    </button>
  );
}

function Row({ f, now }: { f: ClFixture; now: number }) {
  const home = clubById(f.home);
  const away = clubById(f.away);
  if (!home || !away) return null;
  const done = resultFor(f.id);
  const ls = liveScoreFor(f.id);
  const t = kickoffOf(f);
  const isLive = !done && (!!ls || (t != null && t <= now && now < t + 2 * 60 * 60 * 1000));
  const score = done ?? (ls ? [ls.home, ls.away] : null);

  return (
    <li className={`mb-row${done ? " mb-done" : ""}${isLive ? " mb-live" : ""}`}>
      <Side club={home} align="l" />
      <span className="mb-mid">
        {score ? (
          <span className="mb-score">
            {score[0]}–{score[1]}
          </span>
        ) : (
          <span className="mb-ko">{t ? fmtTime.format(new Date(t)) : "TBC"}</span>
        )}
        {isLive && (
          <span className="mb-livetag">
            <span className="live-dot" aria-hidden="true" />
            {ls?.minute != null ? `${ls.minute}'` : "LIVE"}
          </span>
        )}
        {!isLive && !score && t && (
          <span className="mb-date">{fmtDay.format(new Date(t))}</span>
        )}
      </span>
      <Side club={away} align="r" />
    </li>
  );
}

/** The current matchday's scoreboard — live scores, results, kickoff times. */
export function MatchdayBoard() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const md = currentMatchday(now);
  const fixtures = matchdayFixtures(md);
  if (fixtures.length === 0) return null;

  const played = fixtures.filter((f) => resultFor(f.id)).length;

  return (
    <section className="mb" aria-label={`Matchday ${md}`}>
      <div className="section-head mb-head">
        <span className="kicker">Matchday {md}</span>
        <h2>The scoreboard</h2>
        <p className="section-note">
          {played === fixtures.length
            ? `All ${fixtures.length} matches played.`
            : played > 0
            ? `${played} of ${fixtures.length} played — scores update automatically.`
            : `All ${fixtures.length} matches, in your local time. Scores appear here as they're played.`}
        </p>
      </div>

      <ol className="mb-list">
        {fixtures.map((f) => (
          <Row key={f.id} f={f} now={now} />
        ))}
      </ol>

      <button className="mb-more" onClick={() => navigate("/schedule")}>
        Full schedule — all 8 matchdays
        <span aria-hidden="true"> →</span>
      </button>
    </section>
  );
}
