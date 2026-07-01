import { useEffect, useMemo, useState } from "react";
import type { Match } from "../data/types";
import { matches } from "../data/fixtures";
import { teamById } from "../data/teams";
import { isLive, liveScore } from "../lib/live";
import {
  resolveBracket,
  type ResolvedSeed,
  type ResolvedMatch,
} from "../lib/bracket";
import { MatchDetail } from "./MatchDetail";
import { KnockoutDetail } from "./KnockoutDetail";

type KoItem = ResolvedMatch & { round: string };

/** Ticks so matches flip to "live" as kickoff passes. */
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
const timeFmt = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});
const ROUND_ABBR: Record<string, string> = {
  "Round of 32": "R32",
  "Round of 16": "R16",
  "Quarter-finals": "QF",
  "Semi-finals": "SF",
  Final: "Final",
};

type StatusFilter = "upcoming" | "results" | "all";
const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "results", label: "Results" },
  { id: "all", label: "All" },
];

type Item =
  | { kind: "group"; ts: number; date: Date; m: Match }
  | { kind: "ko"; ts: number; date: Date; m: ResolvedMatch & { round: string } };

interface Side {
  name: string;
  flag?: string;
  id?: string;
}

function SideView({ side, away }: { side: Side; away?: boolean }) {
  const flag = side.flag ? (
    <img
      className="flag"
      src={`https://flagcdn.com/w40/${side.flag}.png`}
      srcSet={`https://flagcdn.com/w80/${side.flag}.png 2x`}
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
    <span className="sch-pip" aria-hidden="true" />
  );
  return (
    <span className={`sch-side${away ? " sch-side-away" : ""}`}>
      {flag}
      <span className="sch-name">{side.name}</span>
    </span>
  );
}

export function Schedule() {
  const [status, setStatus] = useState<StatusFilter>("upcoming");
  const [selected, setSelected] = useState<Match | null>(null);
  const [selectedKo, setSelectedKo] = useState<KoItem | null>(null);
  const now = useNow(30_000);

  const koMatches = useMemo(
    () =>
      resolveBracket().flatMap((r) =>
        r.matches.map((m) => ({ ...m, round: r.name }))
      ),
    []
  );

  const counts = useMemo(() => {
    const total = matches.length + koMatches.length;
    const played =
      matches.filter((m) => m.status === "finished").length +
      koMatches.filter((m) => m.finished).length;
    return { upcoming: total - played, results: played, all: total };
  }, [koMatches]);

  const items = useMemo<Item[]>(() => {
    const all: Item[] = [];
    for (const m of matches)
      all.push({ kind: "group", ts: new Date(m.kickoff).getTime(), date: new Date(m.kickoff), m });
    for (const m of koMatches) {
      // Group by the official match day (noon-UTC) so day headers match the
      // bracket, but sort by the real kick-off instant for same-day order.
      const day = new Date(`${m.date}T12:00:00Z`);
      const ts = m.kickoff ? new Date(m.kickoff).getTime() : day.getTime();
      all.push({ kind: "ko", ts, date: day, m });
    }
    let list = all;
    if (status === "upcoming")
      list = list.filter((it) =>
        it.kind === "group" ? it.m.status !== "finished" : !it.m.finished
      );
    else if (status === "results")
      list = list.filter((it) =>
        it.kind === "group" ? it.m.status === "finished" : it.m.finished
      );
    list = [...list].sort((a, b) => a.ts - b.ts);
    if (status === "results") list.reverse();
    return list;
  }, [koMatches, status]);

  const { live, byDay } = useMemo(() => {
    const liveItems: Item[] = [];
    const rest: Item[] = [];
    for (const it of items) {
      if (it.kind === "group" && isLive(it.m, now)) liveItems.push(it);
      else rest.push(it);
    }
    const days = new Map<string, Item[]>();
    for (const it of rest) {
      const k = dayKey.format(it.date);
      if (!days.has(k)) days.set(k, []);
      days.get(k)!.push(it);
    }
    return { live: liveItems, byDay: [...days.entries()] };
  }, [items, now]);

  const renderRow = (it: Item) => {
    if (it.kind === "group") {
      const m = it.m;
      const home = teamById(m.home);
      const away = teamById(m.away);
      const done = m.status === "finished";
      const live = isLive(m, now);
      const ls = live ? liveScore(m.id) : undefined;
      const hs = done ? m.homeScore : ls?.home;
      const as = done ? m.awayScore : ls?.away;
      const homeWon = done && (m.homeScore ?? 0) > (m.awayScore ?? 0);
      const awayWon = done && (m.awayScore ?? 0) > (m.homeScore ?? 0);
      return (
        <li
          key={m.id}
          className={`sch-row${live ? " is-live" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => setSelected(m)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelected(m);
            }
          }}
        >
          <span className="sch-when">
            {live ? (
              <span className="sch-livetag">
                <span className="live-dot" aria-hidden="true" />
                {ls?.minute != null ? `${ls.minute}'` : "LIVE"}
              </span>
            ) : (
              timeFmt.format(new Date(m.kickoff))
            )}
          </span>
          <span className="sch-teams">
            <SideView side={{ name: home.name, flag: home.flag }} />
            <span className={hs != null ? "sch-score is-final" : "sch-score"}>
              {hs != null ? `${hs}–${as}` : "vs"}
            </span>
            <SideView side={{ name: away.name, flag: away.flag }} away />
          </span>
          <span className="sch-venue">
            {m.venue.stadium} · {m.venue.city}
          </span>
          <span className={`sch-win${homeWon ? " home" : awayWon ? " away" : ""}`} aria-hidden="true" />
        </li>
      );
    }

    // knockout row
    const m = it.m;
    const toSide = (s: ResolvedSeed): Side => ({ name: s.name, flag: s.flag, id: s.id });
    const hs = m.finished ? m.homeScore : undefined;
    const as = m.finished ? m.awayScore : undefined;
    return (
      <li
        key={m.id}
        className="sch-row is-ko"
        role="button"
        tabIndex={0}
        onClick={() => setSelectedKo(m)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSelectedKo(m);
          }
        }}
      >
        <span className="sch-when">
          {m.kickoff && <span className="sch-time">{timeFmt.format(new Date(m.kickoff))}</span>}
          <span className="sch-round">{ROUND_ABBR[m.round] ?? m.round}</span>
        </span>
        <span className="sch-teams">
          <SideView side={toSide(m.home)} />
          <span className={hs != null ? "sch-score is-final" : "sch-score"}>
            {hs != null ? `${hs}–${as}` : "vs"}
          </span>
          <SideView side={toSide(m.away)} away />
        </span>
        <span className="sch-venue">{m.venue}</span>
        <span
          className={`sch-win${
            m.finished && m.winner === "home"
              ? " home"
              : m.finished && m.winner === "away"
              ? " away"
              : ""
          }`}
          aria-hidden="true"
        />
      </li>
    );
  };

  return (
    <section className="schedule" id="schedule">
      <div className="section-head">
        <span className="kicker">Every match · times in your timezone</span>
        <h2>Schedule</h2>
        <p className="section-note">
          Every match in date order with kick-off times in your timezone.
          Showing what's next by default — switch to Results or All for the
          group stage. Tap any match for both line-ups and the read.
        </p>
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

      {live.length > 0 && (
        <div className="day-block">
          <h4 className="day-label day-label-live">
            <span className="live-dot" aria-hidden="true" /> Live now
            <span className="day-count">
              {live.length} {live.length === 1 ? "match" : "matches"}
            </span>
          </h4>
          <ul className="sch-list">{live.map(renderRow)}</ul>
        </div>
      )}

      {byDay.length === 0 && live.length === 0 ? (
        <p className="fixtures-empty">
          {status === "upcoming"
            ? "No upcoming matches — the tournament is complete."
            : "No results yet — check back once the matches kick off."}
        </p>
      ) : (
        byDay.map(([day, dayItems]) => (
          <div className="day-block" key={day}>
            <h4 className="day-label">
              {day}
              <span className="day-count">
                {dayItems.length} {dayItems.length === 1 ? "match" : "matches"}
              </span>
            </h4>
            <ul className="sch-list">{dayItems.map(renderRow)}</ul>
          </div>
        ))
      )}

      {selected && (
        <MatchDetail match={selected} onClose={() => setSelected(null)} />
      )}
      {selectedKo && (
        <KnockoutDetail match={selectedKo} onClose={() => setSelectedKo(null)} />
      )}
    </section>
  );
}
