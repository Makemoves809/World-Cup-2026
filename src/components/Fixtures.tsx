import { useMemo, useState } from "react";
import type { Match } from "../data/types";
import { matches } from "../data/fixtures";
import { GROUP_IDS } from "../data/teams";
import { MatchCard } from "./MatchCard";
import { MatchDetail } from "./MatchDetail";

const dayKey = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function Fixtures() {
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Match | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? matches : matches.filter((m) => m.group === filter)),
    [filter]
  );

  const byDay = useMemo(() => {
    const groups = new Map<string, typeof visible>();
    for (const m of visible) {
      const k = dayKey.format(new Date(m.kickoff));
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(m);
    }
    return [...groups.entries()];
  }, [visible]);

  return (
    <section className="fixtures" id="fixtures">
      <div className="section-head">
        <span className="kicker">Official schedule · times shown in your timezone</span>
        <h2>Fixtures</h2>
        <p className="section-note">
          All 72 group-stage matches across the 16 host venues — click a match
          for red cards and player availability.
        </p>
      </div>

      <div className="filter-row" role="group" aria-label="Filter by group">
        <button
          className={filter === "all" ? "chip is-active" : "chip"}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {GROUP_IDS.map((g) => (
          <button
            key={g}
            className={filter === g ? "chip is-active" : "chip"}
            onClick={() => setFilter(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {byDay.map(([day, dayMatches]) => (
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
      ))}

      {selected && (
        <MatchDetail match={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
