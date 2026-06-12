import { useEffect, useMemo, useState } from "react";
import { matches } from "../data/fixtures";
import { teamById } from "../data/teams";
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

export function Hero() {
  const now = useNow();

  const nextMatch = useMemo(
    () =>
      matches
        .filter((m) => new Date(m.kickoff).getTime() > now.getTime())
        .sort((a, b) => a.kickoff.localeCompare(b.kickoff))[0],
    [now]
  );

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
      <div className="hero-inner">
        <p className="eyebrow">
          <span className="dot" />
          {started && !ended ? "Live now" : status} · Canada · Mexico · USA
        </p>

        <h1 className="hero-title">
          The 23rd <em>World Cup</em>
          <span className="hero-sub">
            48 nations · 16 cities · 104 matches · Jun 11 – Jul 19, 2026
          </span>
        </h1>

        <div className="countdown" role="timer" aria-live="off">
          <span className="countdown-label">
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
        </div>

        {nextMatch && (
          <div className="next-fixture">
            <FixtureLine matchHome={nextMatch.home} matchAway={nextMatch.away} />
            <span className="next-venue">
              {nextMatch.venue.stadium}, {nextMatch.venue.city}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function FixtureLine({
  matchHome,
  matchAway,
}: {
  matchHome: string;
  matchAway: string;
}) {
  const home = teamById(matchHome);
  const away = teamById(matchAway);
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
