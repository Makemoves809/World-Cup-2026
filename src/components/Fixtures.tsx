import { useEffect, useMemo, useState } from "react";
import type { Match } from "../data/types";
import { matches } from "../data/fixtures";
import { GROUP_IDS } from "../data/teams";
import { isLive } from "../lib/live";
import { MatchCard } from "./MatchCard";
import { MatchDetail } from "./MatchDetail";

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
  const [status, setStatus] = useState<StatusFilter>("all");
  const [group, setGroup] = useState<string>("all");
  const [selected, setSelected] = useState<Match | null>(null);
  const now = useNow(30_000);

  // Matches in the selected group (matches[] is already sorted by kickoff).
  const groupList = useMemo(
    () => (group === "all" ? matches : matches.filter((m) => m.group === group)),
    [group]
  );

  const counts = useMemo(() => {
    const results = groupList.filter((m) => m.status === "finished").length;
    return { upcoming: groupList.length - results, results, all: groupList.length };
  }, [groupList]);

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
          All 72 group-stage matches — switch between what's still to come and
          finished results. Click a match for red cards and availability.
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

      {byDay.length === 0 && liveMatches.length === 0 ? (
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
