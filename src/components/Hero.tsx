import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import type { Match } from "../data/types";
import { matches } from "../data/fixtures";
import { teamById } from "../data/teams";
import { isLive, isKickoffLive, KO_LIVE_MS, liveScore } from "../lib/live";
import { useLiveData } from "../lib/liveData";
import {
  resolveBracket,
  type ResolvedMatch,
  type ResolvedSeed,
} from "../lib/bracket";
import { navigate } from "../router";
import { flagUrl } from "../lib/flags";
import { Flag } from "./Flag";
import { MatchDetail } from "./MatchDetail";
import { KnockoutDetail } from "./KnockoutDetail";

type KoItem = ResolvedMatch & { round: string };

/** Feed phase codes → labels for the live panel. */
const KO_PHASE_LABEL: Record<string, string> = {
  "1H": "1st half",
  HT: "Half-time",
  "2H": "2nd half",
  ET: "Extra time",
  PENS: "Penalties",
};

const fmtKoDay = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const koDay = (iso: string) => fmtKoDay.format(new Date(`${iso}T12:00:00Z`));
const fmtKoTime = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});
const koTime = (iso: string) => fmtKoTime.format(new Date(iso));

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
  const liveData = useLiveData();

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

  // Once the group stage is done, the homepage pivots to the knockouts: the
  // 72-match `matches` list has no KO games, so pull them from the resolved
  // bracket instead.
  const groupStageDone = useMemo(
    () => matches.every((m) => m.status === "finished"),
    []
  );
  const koMatches = useMemo(
    () =>
      resolveBracket().flatMap((r) =>
        r.matches.map((m) => ({ ...m, round: r.name }))
      ),
    // Recompute when the polled live data changes (results/scores land).
    [liveData]
  );
  const koStarted = groupStageDone || koMatches.some((m) => m.finished);
  const koTs = (m: KoItem) => new Date(m.kickoff).getTime();
  // A knockout tie in progress: kicked off, not yet marked finished, both teams
  // known. Once its result lands it drops out of here and into "Latest".
  const liveKo = useMemo(
    () =>
      koMatches
        .filter(
          (m) =>
            m.home.firm &&
            m.away.firm &&
            !m.finished &&
            // Feed says it's in play (survives extra time / penalties), or the
            // clock still puts it inside the extended knockout window.
            (m.live ||
              isKickoffLive(m.kickoff, m.finished, now.getTime(), KO_LIVE_MS))
        )
        .sort((a, b) => koTs(a) - koTs(b))[0],
    [koMatches, now]
  );
  // The soonest tie that hasn't kicked off yet.
  const nextKo = useMemo(
    () =>
      koMatches
        .filter(
          (m) =>
            !m.finished &&
            m.home.firm &&
            m.away.firm &&
            koTs(m) > now.getTime()
        )
        .sort((a, b) => koTs(a) - koTs(b))[0],
    [koMatches, now]
  );
  const latestKo = useMemo(
    () =>
      koMatches
        .filter((m) => m.finished)
        .sort((a, b) => koTs(a) - koTs(b))
        .slice(-1)[0],
    [koMatches]
  );
  const koLs = liveKo
    ? { home: liveKo.liveHome, away: liveKo.liveAway, minute: liveKo.liveMinute }
    : undefined;
  // Only show a minute when the feed reports a real one — never an estimate
  // (an approximation is wrong in extra time / stoppage).
  const koMinute = koLs?.minute ?? null;
  // Accurate phase from the feed (half-time / extra time / penalties).
  const koPhase = liveKo?.livePhase
    ? KO_PHASE_LABEL[liveKo.livePhase] ?? liveKo.livePhase
    : null;

  const [selected, setSelected] = useState<Match | null>(null);
  const [selectedKo, setSelectedKo] = useState<KoItem | null>(null);
  const open = (match: Match) => ({
    role: "button" as const,
    tabIndex: 0,
    onClick: () => setSelected(match),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSelected(match);
      }
    },
  });

  const koOpen = (match: KoItem) => ({
    role: "button" as const,
    tabIndex: 0,
    onClick: () => setSelectedKo(match),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSelectedKo(match);
      }
    },
  });

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
          {koStarted && !ended
            ? "Round of 32 · Knockouts live"
            : started && !ended
            ? "Live now"
            : status}{" "}
          · Canada · México · USA
        </p>

        <h1 className="hero-title">
          The 23rd <em>World Cup</em>
        </h1>
        <p className="hero-sub">
          Three nations. Forty-eight teams. One summer — Jun 11 to Jul 19, 2026.
        </p>

        <div className="hero-actions">
          {koStarted ? (
            <>
              <CtaButton to="/knockout" label="Knockout bracket" />
              <CtaButton to="/schedule" label="Schedule" />
            </>
          ) : (
            <>
              <CtaButton to="/groups" label="Group standings" />
              <CtaButton to="/schedule" label="Match schedule" />
            </>
          )}
        </div>

        <div className="hero-row">
          {koStarted ? (
            <>
              {liveKo ? (
                <div
                  className="countdown livepanel hero-open"
                  aria-live="polite"
                  {...koOpen(liveKo)}
                >
                  <span className="panel-label panel-label-live">
                    <span className="live-dot" aria-hidden="true" /> Live now ·{" "}
                    {liveKo.round}
                    {koPhase && <> · {koPhase}</>}
                  </span>
                  <KoLine
                    home={liveKo.home}
                    away={liveKo.away}
                    hs={koLs?.home}
                    as={koLs?.away}
                    live
                  />
                  <span className="next-venue">
                    {liveKo.venue}
                    {koMinute != null && (
                      <span className="live-min"> · {koMinute}'</span>
                    )}
                    <span className="hero-open-hint">Matchup ›</span>
                  </span>
                </div>
              ) : (
                nextKo && (
                  <div className="countdown ko-panel hero-open" {...koOpen(nextKo)}>
                    <span className="panel-label">Up next · {nextKo.round}</span>
                    <KoLine home={nextKo.home} away={nextKo.away} />
                    <span className="next-venue">
                      {nextKo.venue} · {koDay(nextKo.date)} · {koTime(nextKo.kickoff)}
                      <span className="hero-open-hint">Matchup ›</span>
                    </span>
                  </div>
                )
              )}
              {latestKo && (
                <div className="latest-card hero-open" {...koOpen(latestKo)}>
                  <span className="panel-label panel-label-gold">
                    Latest · {latestKo.round}
                  </span>
                  <KoLine
                    home={latestKo.home}
                    away={latestKo.away}
                    hs={latestKo.homeScore}
                    as={latestKo.awayScore}
                  />
                  <span className="next-venue">
                    {latestKo.venue}
                    <span className="hero-open-hint">Matchup ›</span>
                  </span>
                </div>
              )}
            </>
          ) : (
          <>
          {liveMatch ? (
            <div className="countdown livepanel hero-open" aria-live="polite" {...open(liveMatch)}>
              <span className="panel-label panel-label-live">
                <span className="live-dot" aria-hidden="true" /> Live now
                {liveList.length > 1 && (
                  <span className="live-more"> · {liveList.length} games</span>
                )}
              </span>
              <LiveLine match={liveMatch} />
              <span className="next-venue">
                {liveMatch.venue.stadium} · {liveMatch.venue.city}
                <span className="hero-open-hint">Matchup ›</span>
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
                <div className="next-fixture hero-open" {...open(nextMatch)}>
                  <FixtureLine match={nextMatch} />
                  <span className="next-venue">
                    {nextMatch.venue.stadium} · {nextMatch.venue.city}
                    <span className="hero-open-hint">Matchup ›</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {latestResult && (
            <div className="latest-card hero-open" {...open(latestResult)}>
              <span className="panel-label panel-label-gold">Latest result</span>
              <ResultLine match={latestResult} />
              <span className="next-venue">
                {latestResult.venue.stadium} · {latestResult.venue.city}
                <span className="hero-open-hint">Matchup ›</span>
              </span>
            </div>
          )}
          </>
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

      {selected && (
        <MatchDetail match={selected} onClose={() => setSelected(null)} />
      )}
      {selectedKo && (
        <KnockoutDetail
          match={selectedKo}
          onClose={() => setSelectedKo(null)}
        />
      )}
    </section>
  );
}

/**
 * The two Hero calls-to-action. Both share one look (so neither reads as a
 * pre-selected tab); tapping flashes the button green — the "selected" cue —
 * then navigates.
 */
function CtaButton({ to, label }: { to: string; label: string }) {
  const [selected, setSelected] = useState(false);
  const go = () => {
    setSelected(true);
    window.setTimeout(() => navigate(to), 170);
  };
  return (
    <button
      className={`btn btn-cta${selected ? " is-selected" : ""}`}
      onClick={go}
    >
      {label}
      <span className="btn-arrow" aria-hidden="true">→</span>
    </button>
  );
}

function koCode(seed: ResolvedSeed): string {
  if (seed.id) {
    try {
      return teamById(seed.id).code;
    } catch {
      /* fall through */
    }
  }
  return seed.name;
}

function KoFlag({ seed }: { seed: ResolvedSeed }) {
  const src = flagUrl(seed.flag);
  if (!src) return <span className="nt-pip" aria-hidden="true" />;
  return <img className="flag" src={src} width={18} height={12} alt="" aria-hidden="true" />;
}

function KoLine({
  home,
  away,
  hs,
  as,
  live,
}: {
  home: ResolvedSeed;
  away: ResolvedSeed;
  hs?: number;
  as?: number;
  live?: boolean;
}) {
  const scored = hs != null && as != null;
  return (
    <div className="next-teams">
      <span className="nt">
        <KoFlag seed={home} /> {koCode(home)}
      </span>
      <span className={scored || live ? "nt-score" : "nt-v"}>
        {scored ? `${hs}–${as}` : live ? "–" : "vs"}
      </span>
      <span className="nt">
        {koCode(away)} <KoFlag seed={away} />
      </span>
    </div>
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
