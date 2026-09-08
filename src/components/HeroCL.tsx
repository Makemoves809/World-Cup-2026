import { useEffect, useState } from "react";
import { navigate } from "../router";
import { confirmedClubs, clubById, type Club } from "../data/clubs";
import { Crest } from "./Crest";
import { flagUrl } from "../lib/flags";
import {
  nextFixture,
  liveFixtures,
  recentResults,
  resultFor,
  liveScoreFor,
  kickoffOf,
  metaFor,
} from "../lib/clLive";
import type { ClFixture } from "../data/clFixtures";

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
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

const fmtTime = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
const fmtDay = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" });

const STATS = [
  { v: "36", l: "Clubs" },
  { v: "1", l: "League table" },
  { v: "8", l: "Games each" },
  { v: "16", l: "Countries" },
];

/**
 * One club per row, score right-aligned — the layout live-score apps use on
 * phones. Squeezing both clubs and the score onto a single line wrapped the
 * names ("Club / Brugge") and even split the score at narrow widths.
 */
function TeamRow({ club, goals, lead }: { club: Club; goals?: number | null; lead?: boolean }) {
  const src = flagUrl(club.flag);
  return (
    <div className={`ml-row${lead ? " ml-lead" : ""}`}>
      <Crest club={club} className="ml-crest" />
      {src && <img className="flag" src={src} width={16} height={11} alt="" aria-hidden="true" />}
      <span className="ml-name">{club.name}</span>
      {goals != null && <span className="ml-score">{goals}</span>}
    </div>
  );
}

function MatchLine({ f, score }: { f: ClFixture; score?: [number, number] | null }) {
  const home = clubById(f.home);
  const away = clubById(f.away);
  if (!home || !away) return null;
  const [h, a] = score ?? [null, null];
  return (
    <div className="ml">
      <TeamRow club={home} goals={h} lead={h != null && a != null && h > a} />
      <TeamRow club={away} goals={a} lead={h != null && a != null && a > h} />
    </div>
  );
}

export function HeroCL() {
  const now = useNow();
  const confirmed = confirmedClubs().length;

  const liveList = liveFixtures(now);
  const liveMatch = liveList[0];
  const next = nextFixture(now);
  const latest = recentResults(1)[0];

  const target = next ? kickoffOf(next) : null;
  const { days, hours, mins, secs } = split((target ?? now) - now);
  const cells = [
    { v: days, l: "days" },
    { v: hours, l: "hrs" },
    { v: mins, l: "min" },
    { v: secs, l: "sec" },
  ];

  const ls = liveMatch ? liveScoreFor(liveMatch.id) : undefined;
  const nextKo = next ? kickoffOf(next) : null;
  const nextMd = next ? metaFor(next.id).matchday : null;

  return (
    <section className="hero" id="top">
      <div className="hero-pitch" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-inner">
        <p className="eyebrow">
          <span className="dot" />
          {liveMatch ? "Matches live now" : "New to the Champions League? Start here"}
        </p>

        <h1 className="hero-title">
          Champions League <em>2026/27</em>
        </h1>
        <p className="hero-sub">
          Europe's biggest club competition, explained for football fans who've
          never followed it. The reigning champions are Paris Saint-Germain.
        </p>

        <div className="hero-actions">
          <CtaButton to="/schedule" label="Schedule & scores" />
          <CtaButton to="/learn" label="How it works" />
        </div>

        <div className="hero-row">
          {liveMatch ? (
            <div className="countdown livepanel hero-open" aria-live="polite" onClick={() => navigate("/schedule")}>
              <span className="panel-label panel-label-live">
                <span className="live-dot" aria-hidden="true" /> Live now
                {liveList.length > 1 && <span className="live-more"> · {liveList.length} games</span>}
              </span>
              <MatchLine f={liveMatch} score={ls ? [ls.home, ls.away] : null} />
              <span className="next-venue">
                {ls?.minute != null ? `${ls.minute}'` : "In play"}
                <span className="hero-open-hint">Scoreboard ›</span>
              </span>
            </div>
          ) : (
            <div className="countdown" role="timer" aria-live="off">
              <span className="panel-label">
                {next ? "Next kickoff in" : "Season complete"}
              </span>
              <div className="countdown-cells">
                {cells.map((c) => (
                  <div className="cell" key={c.l}>
                    <span className="cell-num">{String(c.v).padStart(2, "0")}</span>
                    <span className="cell-lab">{c.l}</span>
                  </div>
                ))}
              </div>
              {next && (
                <div className="next-fixture hero-open" onClick={() => navigate("/schedule")}>
                  <MatchLine f={next} />
                  <span className="next-venue">
                    {nextMd ? `Matchday ${nextMd} · ` : ""}
                    {nextKo ? `${fmtDay.format(new Date(nextKo))}, ${fmtTime.format(new Date(nextKo))}` : ""}
                    <span className="hero-open-hint">Schedule ›</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {latest ? (
            <div className="latest-card hero-open" onClick={() => navigate("/schedule")}>
              <span className="panel-label panel-label-gold">Latest result</span>
              <MatchLine f={latest} score={resultFor(latest.id)} />
              <span className="next-venue">
                Matchday {metaFor(latest.id).matchday}
                <span className="hero-open-hint">Scoreboard ›</span>
              </span>
            </div>
          ) : (
            <div className="latest-card">
              <span className="panel-label panel-label-gold">The field</span>
              <p className="hero-field-line">
                All <strong>{confirmed}</strong> clubs confirmed
              </p>
              <span className="next-venue">
                8 matchdays, then the knockouts · final 5 Jun 2027, Madrid
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
