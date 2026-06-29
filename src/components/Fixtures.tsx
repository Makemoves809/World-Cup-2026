import { useEffect, useMemo, useState } from "react";
import type { Match } from "../data/types";
import { matches } from "../data/fixtures";
import { GROUP_IDS } from "../data/teams";
import { isLive } from "../lib/live";
import { modelAccuracy } from "../lib/accuracy";
import {
  resolveBracket,
  type ResolvedSeed,
  type ResolvedMatch,
} from "../lib/bracket";
import { openRoster } from "../lib/roster";
import { navigate } from "../router";
import { MatchCard } from "./MatchCard";
import { MatchDetail } from "./MatchDetail";

const koDayFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const koDay = (iso: string) => koDayFmt.format(new Date(`${iso}T12:00:00Z`));

/** Current time, ticking so matches flip to "live" as kickoff passes. */
function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

const dayKey = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

type StatusFilter = "upcoming" | "results" | "all";

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "results", label: "Results" },
  { id: "all", label: "All" },
];

export function Fixtures() {
  const [status, setStatus] = useState<StatusFilter>("upcoming");
  const [group, setGroup] = useState<string>("all");
  const [selected, setSelected] = useState<Match | null>(null);
  const now = useNow(30_000);
  const acc = modelAccuracy();

  // Matches in the selected group (matches[] is already sorted by kickoff).
  const groupList = useMemo(
    () => (group === "all" ? matches : matches.filter((m) => m.group === group)),
    [group]
  );

  // Knockout fixtures (from the resolved bracket) — shown alongside the group
  // schedule once the group stage is done, since the 72-match `matches` list
  // has nothing left to come.
  const koMatches = useMemo(
    () =>
      resolveBracket().flatMap((r) =>
        r.matches.map((m) => ({ ...m, round: r.name }))
      ),
    []
  );
  const showKo = group === "all";

  const counts = useMemo(() => {
    const gResults = groupList.filter((m) => m.status === "finished").length;
    const g = {
      upcoming: groupList.length - gResults,
      results: gResults,
      all: groupList.length,
    };
    if (!showKo) return g;
    const koResults = koMatches.filter((m) => m.finished).length;
    return {
      upcoming: g.upcoming + (koMatches.length - koResults),
      results: g.results + koResults,
      all: g.all + koMatches.length,
    };
  }, [groupList, koMatches, showKo]);

  const koByRound = useMemo(() => {
    if (!showKo) return [] as { name: string; matches: typeof koMatches }[];
    let list = koMatches;
    if (status === "upcoming") list = list.filter((m) => !m.finished);
    else if (status === "results") list = list.filter((m) => m.finished);
    const rounds: { name: string; matches: typeof koMatches }[] = [];
    for (const m of list) {
      let r = rounds.find((x) => x.name === m.round);
      if (!r) {
        r = { name: m.round, matches: [] };
        rounds.push(r);
      }
      r.matches.push(m);
    }
    return rounds;
  }, [koMatches, status, showKo]);

  const visible = useMemo(() => {
    let list = groupList;
    if (status === "upcoming") list = list.filter((m) => m.status !== "finished");
    else if (status === "results")
      list = [...list].filter((m) => m.status === "finished").reverse();
    return list;
  }, [groupList, status]);

  // Live matches are pinned to the top; everything else is grouped by day.
  const { liveMatches, byDay } = useMemo(() => {
    const live: Match[] = [];
    const rest: Match[] = [];
    for (const m of visible) (isLive(m, now) ? live : rest).push(m);

    const days = new Map<string, Match[]>();
    for (const m of rest) {
      const k = dayKey.format(new Date(m.kickoff));
      if (!days.has(k)) days.set(k, []);
      days.get(k)!.push(m);
    }
    return { liveMatches: live, byDay: [...days.entries()] };
  }, [visible, now]);

  return (
    <section className="fixtures" id="fixtures">
      <div className="section-head">
        <span className="kicker">Official schedule · times shown in your timezone</span>
        <h2>Fixtures</h2>
        <p className="section-note">
          Every match — group stage and knockouts. Switch between what's still
          to come and finished results; click a group match for the Script, red
          cards and availability.
        </p>
        {acc.graded > 0 && (
          <span
            className="script-badge"
            title={`The Script model's pre-match calls: ${acc.outcomeCorrect} of ${acc.graded} results correct${acc.exactCorrect > 0 ? `, ${acc.exactCorrect} exact scorelines` : ""}. Open any played match to see its call.`}
          >
            <span className="script-badge-tag">Script</span>
            <span className="script-badge-pct">{acc.outcomePct}%</span>
            <span className="script-badge-sub">
              {acc.outcomeCorrect}/{acc.graded} results
              {acc.exactCorrect > 0 && ` · ${acc.exactCorrect} exact`}
            </span>
          </span>
        )}
      </div>

      <div className="seg" role="tablist" aria-label="Filter by status">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={status === t.id}
            className={status === t.id ? "seg-btn is-active" : "seg-btn"}
            onClick={() => setStatus(t.id)}
          >
            {t.label}
            <span className="seg-count">{counts[t.id]}</span>
          </button>
        ))}
      </div>

      <div className="filter-row" role="group" aria-label="Filter by group">
        <button
          className={group === "all" ? "chip is-active" : "chip"}
          onClick={() => setGroup("all")}
        >
          All
        </button>
        {GROUP_IDS.map((g) => (
          <button
            key={g}
            className={group === g ? "chip is-active" : "chip"}
            onClick={() => setGroup(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {liveMatches.length > 0 && (
        <div className="day-block">
          <h4 className="day-label day-label-live">
            <span className="live-dot" aria-hidden="true" /> Live now
            <span className="day-count">
              {liveMatches.length}{" "}
              {liveMatches.length === 1 ? "match" : "matches"}
            </span>
          </h4>
          <ul className="match-list">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} live onSelect={setSelected} />
            ))}
          </ul>
        </div>
      )}

      {koByRound.map((round) => (
        <div className="day-block" key={round.name}>
          <h4 className="day-label day-label-ko">
            {round.name}
            <span className="day-count">
              {round.matches.length}{" "}
              {round.matches.length === 1 ? "match" : "matches"}
            </span>
          </h4>
          <ul className="ko-fx-list">
            {round.matches.map((m) => (
              <KoFixture key={m.id} m={m} />
            ))}
          </ul>
        </div>
      ))}

      {byDay.length === 0 && liveMatches.length === 0 && koByRound.length === 0 ? (
        <p className="fixtures-empty">
          {status === "upcoming"
            ? "No upcoming matches — every game here has been played."
            : "No results yet — check back once these matches kick off."}
        </p>
      ) : (
        byDay.map(([day, dayMatches]) => (
          <div className="day-block" key={day}>
            <h4 className="day-label">
              {day}
              <span className="day-count">
                {dayMatches.length} {dayMatches.length === 1 ? "match" : "matches"}
              </span>
            </h4>
            <ul className="match-list">
              {dayMatches.map((m) => (
                <MatchCard key={m.id} match={m} onSelect={setSelected} />
              ))}
            </ul>
          </div>
        ))
      )}

      {selected && (
        <MatchDetail match={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}

function KoSeed({ seed, won }: { seed: ResolvedSeed; won?: boolean }) {
  const flag = seed.flag ? (
    <img
      className="flag"
      src={`https://flagcdn.com/w40/${seed.flag}.png`}
      srcSet={`https://flagcdn.com/w80/${seed.flag}.png 2x`}
      width={20}
      height={14}
      loading="lazy"
      alt=""
      aria-hidden="true"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  ) : (
    <span className="ko-fx-pip" aria-hidden="true" />
  );
  const cls = `ko-fx-team${won ? " is-won" : ""}`;
  if (seed.id) {
    return (
      <button
        className={`team-link ${cls}`}
        onClick={() => openRoster(seed.id!)}
        title={`${seed.name} squad`}
      >
        {flag}
        <span className="ko-fx-name">{seed.name}</span>
      </button>
    );
  }
  return (
    <span className={`${cls} is-tbd`}>
      {flag}
      <span className="ko-fx-name">{seed.name}</span>
    </span>
  );
}

function KoFixture({ m }: { m: ResolvedMatch & { round: string } }) {
  return (
    <li className="ko-fx">
      <span className="ko-fx-meta">
        #{m.num} · {koDay(m.date)} · {m.venue}
      </span>
      <span className="ko-fx-body">
        <KoSeed seed={m.home} won={m.finished && m.winner === "home"} />
        <span className={m.finished ? "ko-fx-score is-final" : "ko-fx-score"}>
          {m.finished ? `${m.homeScore}–${m.awayScore}` : "vs"}
        </span>
        <KoSeed seed={m.away} won={m.finished && m.winner === "away"} />
      </span>
      <button className="ko-fx-link" onClick={() => navigate("/knockout")}>
        Bracket ›
      </button>
    </li>
  );
}
