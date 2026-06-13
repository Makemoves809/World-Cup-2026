import {
  bestThirds,
  bracketRounds,
  groupOutcomes,
  resolveSeed,
  type ResolvedSeed,
} from "../lib/bracket";

function SeedChip({ seed }: { seed: ResolvedSeed }) {
  return (
    <div className={seed.firm ? "bk-seed is-firm" : "bk-seed"}>
      {seed.flag ? (
        <img
          className="flag"
          src={`https://flagcdn.com/w40/${seed.flag}.png`}
          srcSet={`https://flagcdn.com/w80/${seed.flag}.png 2x`}
          width={24}
          height={16}
          loading="lazy"
          alt=""
          aria-hidden="true"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span className="bk-seed-pip" aria-hidden="true" />
      )}
      <span className="bk-seed-name">{seed.name}</span>
      {seed.host && <span className="host-pin">Host</span>}
    </div>
  );
}

export function Knockout() {
  const outcomes = groupOutcomes();
  const thirds = bestThirds();
  const anyPlayed = outcomes.some((o) => o.started);

  return (
    <section className="knockout" id="knockout">
      <div className="section-head">
        <span className="kicker">32 advance · road to the final</span>
        <h2>Knockout bracket</h2>
        <p className="section-note">
          12 group winners · 12 runners-up · 8 best third-placed teams.
          {anyPlayed
            ? " Projected live from the standings — final once each group wraps."
            : " Slots fill automatically as group results come in."}
        </p>
      </div>

      <div className="third-race">
        <div className="third-head">
          <h3>Best third-placed race</h3>
          <span className="third-note">Top 8 reach the Round of 32</span>
        </div>
        <ol className="third-list">
          {thirds.map((t) => (
            <li
              key={t.row.team.id}
              className={t.qualifies ? "third-row is-in" : "third-row is-out"}
            >
              <span className="third-rank">{t.rank}</span>
              <img
                className="flag"
                src={`https://flagcdn.com/w40/${t.row.team.flag}.png`}
                srcSet={`https://flagcdn.com/w80/${t.row.team.flag}.png 2x`}
                width={24}
                height={16}
                loading="lazy"
                alt=""
                aria-hidden="true"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="third-team">{t.row.team.name}</span>
              <span className="third-grp">3{t.row.team.group}</span>
              <span className="third-stat">{t.row.points} pts</span>
              <span className="third-stat third-gd">
                {t.row.goalDiff > 0 ? `+${t.row.goalDiff}` : t.row.goalDiff} GD
              </span>
            </li>
          ))}
        </ol>
        <p className="third-foot">
          Dashed line marks the qualification cut-off (8th vs 9th).
        </p>
      </div>

      <div className="bracket-scroll">
        <div className="bracket" role="group" aria-label="Knockout bracket">
          {bracketRounds.map((round) => (
            <div className="bk-round" key={round.id} data-round={round.id}>
              <div className="bk-round-head">{round.name}</div>
              <div className="bk-round-body">
                {round.matches.map((m) => (
                  <div className="bk-match" key={m.id}>
                    <SeedChip seed={resolveSeed(m.home, outcomes, thirds)} />
                    <SeedChip seed={resolveSeed(m.away, outcomes, thirds)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="bracket-foot">
        Bracket layout is a projection for fun — official Round-of-32 pairings
        are confirmed by FIFA after the group stage. The Final is July 19 at
        MetLife Stadium, New York / New Jersey.
      </p>
    </section>
  );
}
