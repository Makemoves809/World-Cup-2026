import {
  QATAR_GROUPS,
  QATAR_KO,
  QATAR_SUMMARY,
  type ArchiveGroup,
  type ArchiveMatch,
  type ArchiveRow,
} from "../data/qatar2022";
import { flagUrl } from "../lib/flags";

function AFlag({ slug }: { slug: string }) {
  const src = flagUrl(slug);
  if (!src) return null;
  return <img className="flag" src={src} width={24} height={16} alt="" aria-hidden="true" />;
}

function gd(row: ArchiveRow) {
  const v = row.gf - row.ga;
  return v > 0 ? `+${v}` : `${v}`;
}

function GroupTable({ group }: { group: ArchiveGroup }) {
  return (
    <article className="group-card">
      <span className="group-watermark" aria-hidden="true">
        {group.id}
      </span>
      <div className="group-head">
        <h3>
          Group <span className="group-letter">{group.id}</span>
        </h3>
        <span className="group-tag">Final</span>
      </div>
      <table className="group-table">
        <thead>
          <tr>
            <th className="c-pos">#</th>
            <th className="c-team">Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th className="c-gd">GD</th>
            <th className="c-pts">Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.rows.map((row, i) => (
            <tr key={row.team} className={i < 2 ? "zone-qualified" : "zone-out"}>
              <td className="c-pos">
                <span className="pos-pip">{i + 1}</span>
              </td>
              <td className="c-team">
                <AFlag slug={row.flag} />
                <span className="team-name">{row.team}</span>
              </td>
              <td>{row.p}</td>
              <td>{row.w}</td>
              <td>{row.d}</td>
              <td>{row.l}</td>
              <td className="c-gd">{gd(row)}</td>
              <td className="c-pts">{row.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

function KoMatch({ match }: { match: ArchiveMatch }) {
  const sides = [
    {
      team: match.home,
      flag: match.homeFlag,
      score: match.homeScore,
      won: match.winner === "home",
    },
    {
      team: match.away,
      flag: match.awayFlag,
      score: match.awayScore,
      won: match.winner === "away",
    },
  ];
  return (
    <div className="bk-match">
      {sides.map((s) => (
        <div
          key={s.team}
          className={`bk-seed is-firm${s.won ? " is-won" : " is-faded"}`}
        >
          <AFlag slug={s.flag} />
          <span className="bk-seed-name">{s.team}</span>
          <span className="bk-score">{s.score}</span>
        </div>
      ))}
      {match.pens && (
        <div className="bk-pens">
          {match.pens[0]}–{match.pens[1]} on penalties
        </div>
      )}
    </div>
  );
}

export function Qatar2022() {
  return (
    <section className="archive" id="qatar2022">
      <div className="section-head">
        <span className="kicker">Archive · Qatar 2022</span>
        <h2>World Cup 2022</h2>
        <p className="section-note">
          The last World Cup — final group tables and the full knockout bracket.
        </p>
      </div>

      <div className="champ-banner">
        <div className="champ-main">
          <span className="champ-trophy" aria-hidden="true">
            🏆
          </span>
          <AFlag slug={QATAR_SUMMARY.champion.flag} />
          <span className="champ-name">{QATAR_SUMMARY.champion.team}</span>
          <span className="champ-label">Champions</span>
        </div>
        <div className="champ-meta">
          <span>
            <em>Runner-up</em> {QATAR_SUMMARY.runnerUp.team}
          </span>
          <span>
            <em>3rd</em> {QATAR_SUMMARY.third.team}
          </span>
          <span>
            <em>4th</em> {QATAR_SUMMARY.fourth.team}
          </span>
          <span>
            <em>Golden Boot</em> {QATAR_SUMMARY.goldenBoot.player} (
            {QATAR_SUMMARY.goldenBoot.goals})
          </span>
        </div>
      </div>

      <div className="section-head archive-sub">
        <h3>Group stage</h3>
        <p className="section-note">Top two of each group advanced (green).</p>
      </div>
      <div className="group-grid">
        {QATAR_GROUPS.map((g) => (
          <GroupTable key={g.id} group={g} />
        ))}
      </div>

      <div className="section-head archive-sub">
        <h3>Knockout stage</h3>
      </div>
      <div className="bracket-scroll">
        <div className="bracket" role="group" aria-label="Qatar 2022 bracket">
          {QATAR_KO.map((round) => (
            <div className="bk-round" key={round.id} data-round={round.id}>
              <div className="bk-round-head">{round.name}</div>
              <div className="bk-round-body">
                {round.matches.map((mt, i) => (
                  <KoMatch key={`${round.id}-${i}`} match={mt} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
