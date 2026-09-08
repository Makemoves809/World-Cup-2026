import { clubById } from "../data/clubs";
import { Crest } from "./Crest";
import live from "../data/live.json";

interface Scorer {
  name: string;
  clubId: string | null;
  goals: number;
  assists: number | null;
  penalties: number | null;
  nationality: string | null;
  position: string | null;
}
const scorers = ((live as { scorers?: Scorer[] }).scorers ?? []).filter((s) => s.goals > 0);

/** Top scorers — the Golden Boot race, straight from the feed. */
export function GoldenBoot({ limit = 10 }: { limit?: number }) {
  if (scorers.length === 0) return null;

  // Standard competition ranking: players level on goals share a rank.
  let prevGoals = -1;
  let prevRank = 0;
  const rows = scorers.slice(0, limit).map((s, i) => {
    const rank = s.goals === prevGoals ? prevRank : i + 1;
    prevGoals = s.goals;
    prevRank = rank;
    return { ...s, rank };
  });
  const top = rows[0].goals;

  return (
    <section className="gb" aria-label="Top scorers">
      <div className="section-head">
        <span className="kicker">Golden Boot · top scorers</span>
        <h2>Who's scoring</h2>
        <p className="section-note">
          Every goal in the league phase, updated automatically as matches
          finish.
        </p>
      </div>

      <ol className="gb-rows">
        {rows.map((s) => {
          const club = s.clubId ? clubById(s.clubId) : undefined;
          return (
            <li
              className={`gb-r${s.goals === top ? " gb-lead" : ""}`}
              key={`${s.name}-${s.clubId ?? ""}`}
            >
              <span className="gb-rk">{s.rank}</span>
              {club && <Crest club={club} className="gb-cr" />}
              <span className="gb-who">
                <span className="gb-nm">{s.name}</span>
                <span className="gb-cl">
                  {club?.short ?? "—"}
                  {s.penalties ? ` · ${s.penalties} pen` : ""}
                  {s.assists ? ` · ${s.assists} ast` : ""}
                </span>
              </span>
              <span className="gb-g">{s.goals}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
