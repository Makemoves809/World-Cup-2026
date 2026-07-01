import {
  bestThirds,
  finalInfo,
  groupOutcomes,
  resolveBracket,
  type ResolvedSeed,
} from "../lib/bracket";
import { openRoster } from "../lib/roster";

const fmtDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const dayLabel = (iso: string) => fmtDate.format(new Date(`${iso}T12:00:00Z`));

const fmtTime = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});
const timeLabel = (iso: string) => fmtTime.format(new Date(iso));

function SeedChip({
  seed,
  score,
  won,
  faded,
}: {
  seed: ResolvedSeed;
  score?: number;
  won?: boolean;
  faded?: boolean;
}) {
  const cls = ["bk-seed"];
  if (seed.firm) cls.push("is-firm");
  if (won) cls.push("is-won");
  if (faded) cls.push("is-faded");

  const flagEl = seed.flag ? (
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
  );

  return (
    <div className={cls.join(" ")}>
      {seed.id ? (
        <button
          className="team-link bk-seed-link"
          onClick={() => openRoster(seed.id!)}
          title={`${seed.name} squad`}
        >
          {flagEl}
          <span className="bk-seed-name">{seed.name}</span>
          {seed.host && <span className="host-pin">Host</span>}
        </button>
      ) : (
        <>
          {flagEl}
          <span className="bk-seed-name">{seed.name}</span>
          {seed.host && <span className="host-pin">Host</span>}
        </>
      )}
      {score != null && <span className="bk-score">{score}</span>}
    </div>
  );
}

export function Knockout() {
  const outcomes = groupOutcomes();
  const thirds = bestThirds();
  const rounds = resolveBracket();
  const anyPlayed = outcomes.some((o) => o.started);

  return (
    <section className="knockout" id="knockout">
      <div className="section-head">
        <span className="kicker">32 advance · road to the final</span>
        <h2>Knockout bracket</h2>
        <p className="section-note">
          The official Round of 32 → Final (matches 73–104).
          {anyPlayed
            ? " Group winners and runners-up are projected live from the standings — firm once each group is decided."
            : " Slots fill automatically as group results come in."}
        </p>
      </div>

      <div className="bracket-scroll">
        <div className="bracket" role="group" aria-label="Knockout bracket">
          {rounds.map((round) => (
            <div className="bk-round" key={round.id} data-round={round.id}>
              <div className="bk-round-head">{round.name}</div>
              <div className="bk-round-body">
                {round.matches.map((m) => (
                  <div
                    className="bk-match"
                    key={m.id}
                    title={`Match ${m.num} · ${m.venue}`}
                  >
                    <div className="bk-match-meta">
                      <span>#{m.num}</span>
                      <span>
                        {dayLabel(m.date)} · {timeLabel(m.kickoff)}
                      </span>
                    </div>
                    <SeedChip
                      seed={m.home}
                      score={m.homeScore}
                      won={m.finished && m.winner === "home"}
                      faded={m.finished && m.winner === "away"}
                    />
                    <SeedChip
                      seed={m.away}
                      score={m.awayScore}
                      won={m.finished && m.winner === "away"}
                      faded={m.finished && m.winner === "home"}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="bracket-foot">
        {finalInfo.thirdPlace} · {finalInfo.final}. The eight matches with a
        “3rd …” slot host a best third-placed team; FIFA assigns the exact team
        after the group stage, and live results fill the bracket as the
        knockouts are played.
      </p>

      <div className="third-race">
        <div className="third-head">
          <h3>Best third-placed teams</h3>
          <span className="third-note">The 8 who reached the Round of 32</span>
        </div>
        <ol className="third-list">
          {thirds.map((t) => (
            <li
              key={t.row.team.id}
              className={t.qualifies ? "third-row is-in" : "third-row is-out"}
            >
              <span className="third-rank">{t.rank}</span>
              <button
                className="team-link third-team-link"
                onClick={() => openRoster(t.row.team.id)}
                title={`${t.row.team.name} squad`}
              >
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
              </button>
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
    </section>
  );
}
