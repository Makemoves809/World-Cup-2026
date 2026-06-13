import type { ImpactLevel, PlayerAbsence } from "./types";
import { matches } from "./fixtures";
import live from "./live.json";

/** All match ids a team plays in — used for tournament-long absences. */
const teamMatchIds = (teamId: string): string[] =>
  matches
    .filter((m) => m.home === teamId || m.away === teamId)
    .map((m) => m.id);

/**
 * Player availability ledger — manually curated red cards, suspensions, and
 * injuries. The scheduled update-data workflow appends new red cards and
 * two-yellow suspensions via live.json; manual entries here take precedence
 * (richer notes, curated impact and positions). A red card carries an
 * automatic one-match ban; add further matches to `missesMatchIds` if FIFA
 * extends it. Injuries have no free data feed, so they are refreshed by hand.
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

  /* ----- Injuries (hand-curated; no free feed — refresh manually) ----- */
  {
    player: "Rodrygo",
    position: "Forward",
    team: "bra",
    type: "injury",
    reason: "Torn ACL & meniscus (right knee)",
    missesMatchIds: teamMatchIds("bra"),
    impact: 5,
    note: "Ruled out of the tournament.",
  },
  {
    player: "Éder Militão",
    position: "Centre-back",
    team: "bra",
    type: "injury",
    reason: "Ruptured thigh tendon — surgery",
    missesMatchIds: teamMatchIds("bra"),
    impact: 4,
    note: "Ruled out of the tournament.",
  },
  {
    player: "Estêvão",
    position: "Winger",
    team: "bra",
    type: "injury",
    reason: "Hamstring tear (right leg)",
    missesMatchIds: teamMatchIds("bra"),
    impact: 3,
    note: "Left out of Brazil's squad.",
  },
  {
    player: "Neymar",
    position: "Forward",
    team: "bra",
    type: "injury",
    reason: "Calf injury (grade 2)",
    missesMatchIds: ["m-C-1"],
    impact: 4,
    note: "Doubtful for the opener vs Morocco; making good progress.",
  },
  {
    player: "Hugo Ekitike",
    position: "Striker",
    team: "fra",
    type: "injury",
    reason: "Ruptured Achilles tendon",
    missesMatchIds: teamMatchIds("fra"),
    impact: 3,
    note: "Ruled out of the tournament.",
  },
  {
    player: "Serge Gnabry",
    position: "Winger",
    team: "ger",
    type: "injury",
    reason: "Adductor tear (right thigh)",
    missesMatchIds: teamMatchIds("ger"),
    impact: 4,
    note: "Ruled out of the tournament.",
  },
  {
    player: "Xavi Simons",
    position: "Attacking midfielder",
    team: "ned",
    type: "injury",
    reason: "Torn ACL (right knee)",
    missesMatchIds: teamMatchIds("ned"),
    impact: 4,
    note: "Ruled out of the tournament.",
  },
  {
    player: "Jurriën Timber",
    position: "Defender",
    team: "ned",
    type: "injury",
    reason: "Groin injury",
    missesMatchIds: teamMatchIds("ned"),
    impact: 4,
    note: "Ruled out of the tournament.",
  },
  {
    player: "Juan Foyth",
    position: "Defender",
    team: "arg",
    type: "injury",
    reason: "Ruptured Achilles tendon (left)",
    missesMatchIds: teamMatchIds("arg"),
    impact: 3,
    note: "Ruled out of the tournament.",
  },
  {
    player: "Wataru Endo",
    position: "Defensive midfielder",
    team: "jpn",
    type: "injury",
    reason: "Ankle ligament tear",
    missesMatchIds: teamMatchIds("jpn"),
    impact: 4,
    note: "Captain; ruled out of the tournament.",
  },
  {
    player: "Christoph Baumgartner",
    position: "Attacking midfielder",
    team: "aut",
    type: "injury",
    reason: "Thigh muscle injury",
    missesMatchIds: teamMatchIds("aut"),
    impact: 4,
    note: "Ruled out of the tournament.",
  },
  {
    player: "Billy Gilmour",
    position: "Midfielder",
    team: "sco",
    type: "injury",
    reason: "Knee injury",
    missesMatchIds: teamMatchIds("sco"),
    impact: 4,
    note: "Ruled out of the tournament.",
  },
  {
    player: "Cho Yu-min",
    position: "Centre-back",
    team: "kor",
    type: "injury",
    reason: "Plantar fascia tear (right foot)",
    missesMatchIds: teamMatchIds("kor"),
    impact: 3,
    note: "Ruled out of the tournament.",
  },
  {
    player: "Alphonso Davies",
    position: "Left-back",
    team: "can",
    type: "injury",
    reason: "Grade-2 hamstring tear",
    missesMatchIds: ["m-B-1"],
    impact: 5,
    note: "Missed the opener; expected to feature later in the group stage.",
  },
  {
    player: "Nayef Aguerd",
    position: "Centre-back",
    team: "mar",
    type: "injury",
    reason: "Pubalgia (groin)",
    missesMatchIds: ["m-C-1"],
    impact: 4,
    note: "Doubtful — left out of the predicted XI vs Brazil.",
  },
  {
    player: "Noussair Mazraoui",
    position: "Full-back",
    team: "mar",
    type: "injury",
    reason: "Shoulder injury",
    missesMatchIds: ["m-C-1"],
    impact: 3,
    note: "Doubtful for the opener.",
  },
  {
    player: "Luca Jaquez",
    position: "Centre-back",
    team: "sui",
    type: "injury",
    reason: "Injury — unavailable",
    missesMatchIds: teamMatchIds("sui"),
    impact: 2,
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

/* ----- Two-yellow suspensions from the update-data workflow ----- */

interface LiveYellowCard {
  player: string;
  team: string;
  matchId: string;
  minute: number | null;
}

const kickoffOf = (matchId: string): string =>
  matches.find((m) => m.id === matchId)?.kickoff ?? "";

/**
 * FIFA rule: two yellow cards in separate matches bring a one-match ban, then
 * the tally resets (so a 4th yellow bans again). We sort each player's yellows
 * by kickoff and trigger a suspension on every second booking, for the team's
 * next match after it. (Yellows are wiped after the quarter-finals; with only
 * group-stage fixtures in the data that boundary isn't reached here.)
 */
function buildSuspensions(yellows: LiveYellowCard[]): PlayerAbsence[] {
  const byPlayer = new Map<string, LiveYellowCard[]>();
  for (const y of yellows) {
    const key = `${y.team}|${normName(y.player)}`;
    const arr = byPlayer.get(key);
    if (arr) arr.push(y);
    else byPlayer.set(key, [y]);
  }

  const out: PlayerAbsence[] = [];
  for (const list of byPlayer.values()) {
    list.sort((a, b) =>
      kickoffOf(a.matchId).localeCompare(kickoffOf(b.matchId))
    );
    // Every second booking (index 1, 3, …) completes a pair → one-match ban.
    for (let i = 1; i < list.length; i += 2) {
      const y = list[i];
      const misses = nextMatchFor(y.team, y.matchId);
      if (misses.length === 0) continue; // no further match to miss
      out.push({
        player: y.player,
        team: y.team,
        type: "suspension",
        reason: "Two yellow cards — one-match suspension",
        sourceMatchId: y.matchId,
        missesMatchIds: misses,
        impact: impactFor(y.team, y.player),
      });
    }
  }
  return out;
}

const priorAbsences = [...curated, ...liveAbsences];

/** True when a curated/red entry already rules this player out of that match. */
function alreadyCovered(s: PlayerAbsence): boolean {
  const words = nameWords(s.player);
  return priorAbsences.some(
    (a) =>
      a.team === s.team &&
      nameWords(a.player).some((w) => words.includes(w)) &&
      s.missesMatchIds.some((m) => a.missesMatchIds.includes(m))
  );
}

const liveSuspensions = buildSuspensions(
  (live.yellowCards as unknown as LiveYellowCard[]) ?? []
).filter((s) => !alreadyCovered(s));

export const absences: PlayerAbsence[] = [
  ...curated,
  ...liveAbsences,
  ...liveSuspensions,
];

/** Players shown a red card during the given match. */
export const sentOffIn = (matchId: string): PlayerAbsence[] =>
  absences.filter((a) => a.type === "red" && a.sourceMatchId === matchId);

/** Players unavailable (suspended/injured) for the given match. */
export const unavailableFor = (matchId: string): PlayerAbsence[] =>
  absences.filter((a) => a.missesMatchIds.includes(matchId));
