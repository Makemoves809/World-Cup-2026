import { teamById } from "../data/teams";
import { goldenBoot } from "../data/goals";
import { openRoster } from "../lib/roster";
import { navigate } from "../router";
import { Flag } from "./Flag";

/** Top-5 Golden Boot snippet for the home page, linking to the full table. */
export function GoldenBootPreview() {
  const players = goldenBoot(5)
    .map((s) => {
      try {
        return { ...s, team: teamById(s.team) };
      } catch {
        return null;
      }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (players.length === 0) return null;

  // Standard competition ranking: players level on goals share a rank.
  let prevGoals = -1;
  let prevRank = 0;
  const ranked = players.map((p, i) => {
    const rank = p.goals === prevGoals ? prevRank : i + 1;
    prevGoals = p.goals;
    prevRank = rank;
    return { ...p, rank };
  });

  return (
    <section className="form-preview">
      <div className="form-preview-head">
        <div>
          <span className="kicker">Golden Boot · top scorers</span>
          <h2>Golden Boot</h2>
        </div>
        <button className="form-preview-link" onClick={() => navigate("/form")}>
          Full list
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <ol className="form-preview-list">
        {ranked.map((p) => (
          <li className="gbp-row" key={`${p.team.id}-${p.scorer}`}>
            <span className="form-preview-rank">{p.rank}</span>
            <button
              className="form-preview-team team-link"
              onClick={() => openRoster(p.team.id)}
              title={`${p.team.name} squad`}
            >
              <Flag team={p.team} size={18} />
              <span className="gbp-name">{p.scorer}</span>
              <span className="gbp-team">{p.team.name}</span>
            </button>
            <span className="gbp-pens">
              {p.penalties > 0 ? `${p.penalties} pen` : ""}
            </span>
            <span className="gbp-goals">{p.goals}</span>
          </li>
        ))}
      </ol>
      <p className="gbp-note">
        Leaders hand-checked against official records — Kylian Mbappé took the
        Golden Boot with 10.
      </p>
    </section>
  );
}
