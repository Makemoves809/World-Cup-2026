import type { ImpactLevel, PlayerAbsence } from "./types";
import { matches } from "./fixtures";
import live from "./live.json";

/**
 * Player availability ledger — manually curated red cards, suspensions, and
 * injuries. The scheduled update-data workflow appends new red cards via
 * live.json; manual entries here take precedence (richer notes, curated
 * impact and positions). A red card carries an automatic one-match ban; add
 * further matches to `missesMatchIds` if FIFA extends it.
 */
const curated: PlayerAbsence[] = [
  {
    player: "Sphephelo Sithole",
    position: "Midfielder",
    team: "rsa",
    type: "red",
    reason: "Red card · 49' vs Mexico — denied a goal-scoring opportunity",
    sourceMatchId: "m-A-1",
    missesMatchIds: ["m-A-3"],
    impact: 3,
  },
  {
    player: "Themba Zwane",
    position: "Attacking midfielder",
    team: "rsa",
    type: "red",
    reason: "Red card · 84' vs Mexico — violent conduct",
    sourceMatchId: "m-A-1",
    missesMatchIds: ["m-A-3"],
    impact: 4,
    note: "Violent conduct can draw an extended FIFA ban — length to be confirmed.",
  },
  {
    player: "César Montes",
    position: "Centre-back",
    team: "mex",
    type: "red",
    reason: "Red card · 90+2' vs South Africa — denied a goal-scoring opportunity",
    sourceMatchId: "m-A-1",
    missesMatchIds: ["m-A-4"],
    impact: 4,
  },
];

export const IMPACT_LABELS: Record<ImpactLevel, string> = {
  1: "Fringe player",
  2: "Rotation option",
  3: "Regular starter",
  4: "Key player",
  5: "Star player",
};

/* ----- Live red cards from the update-data workflow ----- */

interface LiveRedCard {
  player: string;
  team: string;
  matchId: string;
  minute: number | null;
  extra: number | null;
  detail: string;
}

/**
 * Curated impact ratings for live red cards, matched on team + any word of
 * the player's name (API names arrive as e.g. "K. Mbappé"). Players not
 * listed default to 3 (regular starter) — adjust here after the fact.
 */
const STAR_RATINGS: Array<{ team: string; name: string; impact: ImpactLevel }> = [
  { team: "fra", name: "mbappe", impact: 5 },
  { team: "fra", name: "griezmann", impact: 4 },
  { team: "arg", name: "messi", impact: 5 },
  { team: "por", name: "ronaldo", impact: 5 },
  { team: "bra", name: "vinicius", impact: 5 },
  { team: "bra", name: "raphinha", impact: 4 },
  { team: "eng", name: "bellingham", impact: 5 },
  { team: "eng", name: "kane", impact: 5 },
  { team: "eng", name: "saka", impact: 4 },
  { team: "nor", name: "haaland", impact: 5 },
  { team: "nor", name: "odegaard", impact: 4 },
  { team: "kor", name: "son", impact: 5 },
  { team: "egy", name: "salah", impact: 5 },
  { team: "esp", name: "yamal", impact: 5 },
  { team: "esp", name: "pedri", impact: 4 },
  { team: "ger", name: "musiala", impact: 5 },
  { team: "ger", name: "kimmich", impact: 4 },
  { team: "bel", name: "bruyne", impact: 5 },
  { team: "bel", name: "doku", impact: 4 },
  { team: "mar", name: "hakimi", impact: 5 },
  { team: "uru", name: "valverde", impact: 5 },
  { team: "col", name: "diaz", impact: 5 },
  { team: "sen", name: "mane", impact: 5 },
  { team: "can", name: "davies", impact: 5 },
  { team: "usa", name: "pulisic", impact: 5 },
  { team: "ned", name: "dijk", impact: 5 },
  { team: "ned", name: "gakpo", impact: 4 },
  { team: "cro", name: "modric", impact: 5 },
  { team: "sui", name: "xhaka", impact: 4 },
  { team: "tur", name: "guler", impact: 4 },
  { team: "gha", name: "kudus", impact: 4 },
  { team: "jpn", name: "mitoma", impact: 4 },
  { team: "mex", name: "gimenez", impact: 4 },
];

const normName = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const nameWords = (s: string) => normName(s).split(/[^a-z]+/).filter(Boolean);

function impactFor(team: string, player: string): ImpactLevel {
  const words = nameWords(player);
  const hit = STAR_RATINGS.find(
    (r) => r.team === team && words.includes(r.name)
  );
  return hit ? hit.impact : 3;
}

/** The team's next group match after the one where the card was shown. */
function nextMatchFor(team: string, sourceMatchId: string): string[] {
  const src = matches.find((m) => m.id === sourceMatchId);
  if (!src) return [];
  const next = matches
    .filter(
      (m) => (m.home === team || m.away === team) && m.kickoff > src.kickoff
    )
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff))[0];
  return next ? [next.id] : [];
}

/** True when a curated entry already covers this live red card. */
function coveredByCurated(rc: LiveRedCard): boolean {
  const words = nameWords(rc.player);
  return curated.some(
    (a) =>
      a.team === rc.team &&
      a.sourceMatchId === rc.matchId &&
      nameWords(a.player).some((w) => words.includes(w))
  );
}

const liveAbsences: PlayerAbsence[] = (
  live.redCards as unknown as LiveRedCard[]
)
  .filter((rc) => !coveredByCurated(rc))
  .map((rc) => {
    const when =
      rc.minute == null ? "" : ` · ${rc.minute}${rc.extra ? `+${rc.extra}` : ""}'`;
    return {
      player: rc.player,
      team: rc.team,
      type: "red" as const,
      reason: `Red card${when} — ${rc.detail}`,
      sourceMatchId: rc.matchId,
      missesMatchIds: nextMatchFor(rc.team, rc.matchId),
      impact: impactFor(rc.team, rc.player),
    };
  });

export const absences: PlayerAbsence[] = [...curated, ...liveAbsences];

/** Players shown a red card during the given match. */
export const sentOffIn = (matchId: string): PlayerAbsence[] =>
  absences.filter((a) => a.type === "red" && a.sourceMatchId === matchId);

/** Players unavailable (suspended/injured) for the given match. */
export const unavailableFor = (matchId: string): PlayerAbsence[] =>
  absences.filter((a) => a.missesMatchIds.includes(matchId));
