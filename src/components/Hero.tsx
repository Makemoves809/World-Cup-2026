import { useEffect, useMemo, useState } from "react";
import type { Match } from "../data/types";
import { matches } from "../data/fixtures";
import { teamById } from "../data/teams";
import { isLive, liveScore } from "../lib/live";
import { navigate } from "../router";
import { Flag } from "./Flag";

const TOURNAMENT_START = new Date("2026-06-11T19:00:00Z");
const TOURNAMENT_END = new Date("2026-07-19T23:00:00Z");

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function splitDuration(ms: number) {
  const clamp = Math.max(0, ms);
  const days = Math.floor(clamp / 86_400_000);
  const hours = Math.floor((clamp % 86_400_000) / 3_600_000);
  const mins = Math.floor((clamp % 3_600_000) / 60_000);
  const secs = Math.floor((clamp % 60_000) / 1000);
  return { days, hours, mins, secs };
}

const STATS = [
  { v: "48", l: "Nations" },
  { v: "12", l: "Groups" },
  { v: "104", l: "Matches" },
  { v: "16", l: "Host cities" },
];

export function Hero() {
  const now = useNow();

  const nextMatch = useMemo(
    () =>
      matches
        .filter((m) => new Date(m.kickoff).getTime() > now.getTime())
        .sort((a, b) => a.kickoff.localeCompare(b.kickoff))[0],
    [now]
  );

  const latestResult = useMemo(
    () =>
      matches
        .filter((m) => m.status === "finished")
        .sort((a, b) => b.kickoff.localeCompare(a.kickoff))[0],
    []
  );

  const liveList = useMemo(
    () => matches.filter((m) => isLive(m, now.getTime())),
    [now]
  );
  const liveMatch = liveList[0];

  const target = nextMatch ? new Date(nextMatch.kickoff) : TOURNAMENT_START;
  const { days, hours, mins, secs } = splitDuration(
    target.getTime() - now.getTime()
  );

  const started = now >= TOURNAMENT_START;
  const ended = now > TOURNAMENT_END;

  const status = ended
    ? "Tournament complete"
    : started
    ? "Tournament live"
    : "Counting down to kickoff";

  const cells = [
    { v: days, l: "days" },
    { v: hours, l: "hrs" },
    { v: mins, l: "min" },
    { v: secs, l: "sec" },
  ];

  return (
    <section className="hero" id="top">
      <div className="hero-pitch" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-inner">
        <p className="eyebrow">
          <span className="dot" />
          {started && !ended ? "Live now" : status} · Canada · México · USA
        </p>

        <h1 className="hero-title">
          The 23rd <em>World Cup</em>
        </h1>
        <p className="hero-sub">
          Three nations. Forty-eight teams. One summer — Jun 11 to Jul 19, 2026.
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => navigate("/groups")}>
            Group standings
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/fixtures")}>
            Match schedule
          </button>
        </div>

        <div className="hero-row">
          {liveMatch ? (
            <div className="countdown livepanel" aria-live="polite">
              <span className="panel-label panel-label-live">
                <span className="live-dot" aria-hidden="true" /> Live now
                {liveList.length > 1 && (
                  <span className="live-more"> · {liveList.length} games</span>
                )}
              </span>
              <LiveLine match={liveMatch} />
              <span className="next-venue">
                {liveMatch.venue.stadium} · {liveMatch.venue.city}
              </span>
            </div>
          ) : (
            <div className="countdown" role="timer" aria-live="off">
              <span className="panel-label">
                {nextMatch ? "Next kickoff in" : status}
              </span>
              <div className="countdown-cells">
                {cells.map((c) => (
                  <div className="cell" key={c.l}>
                    <span className="cell-num">
                      {String(c.v).padStart(2, "0")}
                    </span>
                    <span className="cell-lab">{c.l}</span>
                  </div>
                ))}
              </div>
              {nextMatch && (
                <div className="next-fixture">
                  <FixtureLine match={nextMatch} />
                  <span className="next-venue">
                    {nextMatch.venue.stadium} · {nextMatch.venue.city}
                  </span>
                </div>
              )}
            </div>
          )}

          {latestResult && (
            <div className="latest-card">
              <span className="panel-label panel-label-gold">Latest result</span>
              <ResultLine match={latestResult} />
              <span className="next-venue">
                {latestResult.venue.stadium} · {latestResult.venue.city}
              </span>
            </div>
          )}
        </div>

        <dl className="hero-stats">
          {STATS.map((s) => (
            <div className="stat" key={s.l}>
              <dt className="stat-label">{s.l}</dt>
              <dd className="stat-value">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function FixtureLine({ match }: { match: Match }) {
  const home = teamById(match.home);
  const away = teamById(match.away);
  return (
    <div className="next-teams">
      <span className="nt">
        <Flag team={home} size={18} /> {home.code}
      </span>
      <span className="nt-v">vs</span>
      <span className="nt">
        {away.code} <Flag team={away} size={18} />
      </span>
    </div>
  );
}

function LiveLine({ match }: { match: Match }) {
  const home = teamById(match.home);
  const away = teamById(match.away);
  const ls = liveScore(match.id);
  return (
    <div className="next-teams">
      <span className="nt">
        <Flag team={home} size={18} /> {home.code}
      </span>
      <span className="nt-score">
        {ls ? `${ls.home}–${ls.away}` : "–"}
        {ls?.minute != null && <span className="live-min"> {ls.minute}'</span>}
      </span>
      <span className="nt">
        {away.code} <Flag team={away} size={18} />
      </span>
    </div>
  );
}

function ResultLine({ match }: { match: Match }) {
  const home = teamById(match.home);
  const away = teamById(match.away);
  return (
    <div className="next-teams">
      <span className="nt">
        <Flag team={home} size={18} /> {home.code}
      </span>
      <span className="nt-score">
        {match.homeScore}–{match.awayScore}
      </span>
      <span className="nt">
        {away.code} <Flag team={away} size={18} />
      </span>
    </div>
  );
}
