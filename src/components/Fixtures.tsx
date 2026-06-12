import { useMemo, useState } from "react";
import { matches } from "../data/fixtures";
import { GROUP_IDS } from "../data/teams";
import { MatchCard } from "./MatchCard";

const dayKey = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export function Fixtures() {
  const [filter, setFilter] = useState<string>("all");

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
        <h2>Fixtures</h2>
        <p className="section-note">All 72 group-stage matches.</p>
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
          <h4 className="day-label">{day}</h4>
          <ul className="match-list">
            {dayMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
