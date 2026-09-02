import { useEffect, useState } from "react";
import { navigate } from "../router";
import { confirmedClubs } from "../data/clubs";

/** Matchday 1 — the first games of the league phase. */
const KICKOFF = new Date("2026-09-08T16:45:00Z");

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function split(ms: number) {
  const c = Math.max(0, ms);
  return {
    days: Math.floor(c / 86_400_000),
    hours: Math.floor((c % 86_400_000) / 3_600_000),
    mins: Math.floor((c % 3_600_000) / 60_000),
    secs: Math.floor((c % 60_000) / 1000),
  };
}

const STATS = [
  { v: "36", l: "Clubs" },
  { v: "1", l: "League table" },
  { v: "8", l: "Games each" },
  { v: "15", l: "Countries" },
];

export function HeroCL() {
  const now = useNow();
  const { days, hours, mins, secs } = split(KICKOFF.getTime() - now.getTime());
  const started = now >= KICKOFF;
  const cells = [
    { v: days, l: "days" },
    { v: hours, l: "hrs" },
    { v: mins, l: "min" },
    { v: secs, l: "sec" },
  ];
  const confirmed = confirmedClubs().length;

  return (
    <section className="hero" id="top">
      <div className="hero-pitch" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-inner">
        <p className="eyebrow">
          <span className="dot" />
          New to the Champions League? Start here
        </p>

        <h1 className="hero-title">
          Champions League <em>2026/27</em>
        </h1>
        <p className="hero-sub">
          Europe's biggest club competition, explained for football fans who've
          never followed it. The reigning champions are Paris Saint-Germain.
        </p>

        <div className="hero-actions">
          <CtaButton to="/learn" label="How it works" />
          <CtaButton to="/clubs" label="Meet the clubs" />
        </div>

        <div className="hero-row">
          <div className="countdown" role="timer" aria-live="off">
            <span className="panel-label">
              {started ? "The season is under way" : "First matches kick off in"}
            </span>
            <div className="countdown-cells">
              {cells.map((c) => (
                <div className="cell" key={c.l}>
                  <span className="cell-num">{String(c.v).padStart(2, "0")}</span>
                  <span className="cell-lab">{c.l}</span>
                </div>
              ))}
            </div>
            <span className="next-venue">
              Matchday 1 · 8 Sep 2026 · the league phase begins
            </span>
          </div>

          <div className="latest-card">
            <span className="panel-label panel-label-gold">The field</span>
            <p className="hero-field-line">
              All <strong>{confirmed}</strong> clubs confirmed
            </p>
            <span className="next-venue">
              The draw is made — 8 matchdays, then the knockouts · final 5 Jun
              2027, Madrid
            </span>
          </div>
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

function CtaButton({ to, label }: { to: string; label: string }) {
  const [selected, setSelected] = useState(false);
  const go = () => {
    setSelected(true);
    window.setTimeout(() => navigate(to), 170);
  };
  return (
    <button className={`btn btn-cta${selected ? " is-selected" : ""}`} onClick={go}>
      {label}
      <span className="btn-arrow" aria-hidden="true">→</span>
    </button>
  );
}
