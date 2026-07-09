import type { ImpactLevel, PlayerAbsence } from "./types";
import { matches } from "./fixtures";
import { koKey } from "../lib/koKey";

/** All match ids a team plays in — used for tournament-long absences. */
const teamMatchIds = (teamId: string): string[] =>
  matches
    .filter((m) => m.home === teamId || m.away === teamId)
    .map((m) => m.id);

/**
 * Player availability ledger — manually curated red cards, suspensions, and
 * injuries. football-data.org's free tier doesn't include card/lineup data
 * (that's gated behind their paid Deep Data add-on), so there's no live feed
 * to merge in — this list is the only source, refreshed by hand. A red card
 * carries an automatic one-match ban; add further matches to `missesMatchIds`
 * if FIFA extends it.
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
  {
    player: "Jarell Quansah",
    position: "Right-back",
    team: "eng",
    type: "red",
    reason: "Red card · 54' vs Mexico (R16) — challenge on Jesús Gallardo, confirmed by VAR",
    sourceMatchId: koKey("mex", "eng"),
    missesMatchIds: ["m99"],
    impact: 4,
    note: "England's first sending-off at a World Cup since Wayne Rooney in 2006.",
  },

  /* ----- Injuries (hand-curated; no free feed — refresh manually) ----- */
  {
    player: "Rodrygo",
    position: "Forward",
    team: "bra",
    type: "injury",
    reason: "Torn ACL & meniscus (right knee)",
    missesMatchIds: teamMatchIds("bra"),
    outForTournament: true,
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
    outForTournament: true,
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
    outForTournament: true,
    impact: 3,
    note: "Left out of Brazil's squad.",
  },
  {
    player: "Neymar",
    position: "Forward",
    team: "bra",
    type: "injury",
    reason: "Calf injury (grade 2)",
    missesMatchIds: ["m-C-4"],
    impact: 4,
    note: "Missed the opener; doubtful for June 20 vs Haiti.",
  },
  {
    player: "Aurélien Tchouaméni",
    position: "Defensive midfielder",
    team: "fra",
    type: "injury",
    reason: "Groin injury, picked up in training after the R32 win over Sweden — missed the R16 win over Paraguay",
    sourceMatchId: koKey("fra", "par"),
    missesMatchIds: ["m89"],
    impact: 4,
    note: "Returned to full training July 9; a game-time decision for the QF vs Morocco, with Deschamps only starting him if fully fit. Koné/Rabiot set to continue as the pivot otherwise.",
  },
  {
    player: "Serge Gnabry",
    position: "Winger",
    team: "ger",
    type: "injury",
    reason: "Adductor tear (right thigh)",
    missesMatchIds: teamMatchIds("ger"),
    outForTournament: true,
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
    outForTournament: true,
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
    outForTournament: true,
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
    outForTournament: true,
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
    outForTournament: true,
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
    outForTournament: true,
    impact: 4,
    note: "Ruled out of the tournament.",
  },
  {
    player: "Christian Pulisic",
    position: "Winger",
    team: "usa",
    type: "injury",
    reason: "Calf strain — sat out the Australia game",
    missesMatchIds: ["m-D-3"],
    impact: 5,
    note: "Captain; in doubt — hoping to return for the final group game.",
  },
  {
    player: "Billy Gilmour",
    position: "Midfielder",
    team: "sco",
    type: "injury",
    reason: "Knee injury",
    missesMatchIds: teamMatchIds("sco"),
    outForTournament: true,
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
    outForTournament: true,
    impact: 3,
    note: "Ruled out of the tournament.",
  },
  {
    player: "Alphonso Davies",
    position: "Left-back",
    team: "can",
    type: "injury",
    reason: "Grade-2 hamstring tear",
    missesMatchIds: ["m-B-4"],
    impact: 5,
    note: "Returning from injury — doubtful for the next match.",
  },
  {
    player: "Ismael Saibari",
    position: "Striker",
    team: "mar",
    type: "injury",
    reason: "Hamstring strain — off in the 22nd minute of the R16 win over Canada, replaced by Rahimi",
    sourceMatchId: koKey("can", "mar"),
    missesMatchIds: ["m97"],
    impact: 4,
    note: "Ruled out of the QF vs France (coach Ouahbi confirmed July 8 the game \"comes too soon\"). MRI reportedly showed the strain isn't severe enough to end his tournament — hopeful to return for the semifinal if Morocco advance. Rahimi is the favourite to start up front in his place.",
  },
  {
    player: "Luca Jaquez",
    position: "Centre-back",
    team: "sui",
    type: "injury",
    reason: "Injury — unavailable",
    missesMatchIds: teamMatchIds("sui"),
    outForTournament: true,
    impact: 2,
  },
  {
    player: "Sead Kolašinac",
    position: "Left-back",
    team: "bih",
    type: "injury",
    reason: "Forced off injured 84' vs Canada",
    sourceMatchId: "m-B-1",
    missesMatchIds: ["m-B-3"],
    impact: 4,
    note: "Captain; severity unconfirmed — doubtful for the next match.",
  },
  {
    player: "Amadou Onana",
    position: "Defensive midfielder",
    team: "bel",
    type: "injury",
    reason: "Torn ACL — collision in the 18th minute vs USA (R16), off in the 21st",
    sourceMatchId: koKey("usa", "bel"),
    missesMatchIds: teamMatchIds("bel"),
    outForTournament: true,
    impact: 4,
    note: "Ruled out of the tournament. Started the R16 win before going off injured.",
  },
];

export const IMPACT_LABELS: Record<ImpactLevel, string> = {
  1: "Fringe player",
  2: "Rotation option",
  3: "Regular starter",
  4: "Key player",
  5: "Star player",
};

const normName = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const nameWords = (s: string) => normName(s).split(/[^a-z]+/).filter(Boolean);

export const absences: PlayerAbsence[] = curated;

/* ----- Per-player card / availability status (for squad maps) ----- */

export interface CardStatus {
  /** Single yellow cards accumulated (2 = a suspension). */
  yellows: number;
  /** Sent off at some point. */
  red: boolean;
  /** Banned from an upcoming match (red or two yellows). */
  suspended: boolean;
  /** Out injured. */
  injured: boolean;
  /** Short reason for the most relevant entry (tooltip / modal). */
  note?: string;
  /**
   * True if the absence rules the player out for the rest of the tournament
   * (season-ending injury, squad cut) rather than just the next match — the
   * distinction a fan actually wants when a key starter is missing: "have
   * they been out the whole tournament, or is this fresh from last game?"
   */
  outForTournament?: boolean;
}

/**
 * Short, structured "how long" label for an absence — pairs with the
 * free-text `reason` (which already says why and when) to make the scope
 * unmissable at a glance: a season-ending injury reads very differently from
 * a one-match suspension, even when both show up in the same list.
 */
export function scopeLabel(a: PlayerAbsence): string {
  if (a.outForTournament) return "Out for the rest of the tournament";
  const n = a.missesMatchIds.length;
  return n > 1 ? `Out for ${n} matches` : "Out for this match only";
}

/** A match counts as already played once it's finished. */
const matchPlayed = (matchId: string): boolean =>
  matches.find((m) => m.id === matchId)?.status === "finished";

/** True while an absence still rules the player out of a match yet to be played. */
const banStillActive = (a: PlayerAbsence): boolean =>
  a.outForTournament || a.missesMatchIds.some((id) => !matchPlayed(id));

/** Card / availability status for a named player on a team. */
export function cardStatus(teamId: string, playerName: string): CardStatus {
  const words = nameWords(playerName);
  // Every word of the curated entry's name must appear in the squad player's
  // name — a shared surname/mononym still matches (tolerating minor
  // formatting differences), but two different players who merely share a
  // common first name (e.g. two "Juan"s on the same squad) no longer collide.
  const mine = (a: { team: string; player: string }) =>
    a.team === teamId && nameWords(a.player).every((w) => words.includes(w));

  const hits = absences.filter(mine);
  // Only count a red/suspension/injury while it still covers an unplayed match,
  // so served bans and one-game injuries clear themselves once that game is in
  // the books (the red card stays in the match history via sentOffIn).
  const redHit = hits.find((a) => a.type === "red" && banStillActive(a));
  const suspHit = hits.find((a) => a.type === "suspension" && banStillActive(a));
  const injHit = hits.find((a) => a.type === "injury" && banStillActive(a));
  const red = !!redHit;
  const susp = !!suspHit;
  const injured = !!injHit;

  // No live single-yellow feed (see the file header) — a "suspension" only
  // ever comes from a curated entry, so 2 is the only non-zero value here.
  const yellows = susp ? 2 : 0;

  const primary = redHit ?? suspHit ?? injHit;

  return {
    yellows,
    red,
    suspended: red || susp,
    injured,
    note: primary?.reason,
    outForTournament: primary?.outForTournament,
  };
}

/** Players shown a red card during the given match. */
export const sentOffIn = (matchId: string): PlayerAbsence[] =>
  absences.filter((a) => a.type === "red" && a.sourceMatchId === matchId);

/**
 * Same as `sentOffIn`, but for a knockout tie — those have no fixed match id
 * until the bracket resolves, so a curated entry for one should use a `ko:`
 * team-id-pair key (see `lib/koKey.ts`) as its `sourceMatchId` instead.
 */
export const sentOffInTie = (homeId: string, awayId: string): PlayerAbsence[] =>
  sentOffIn(koKey(homeId, awayId));

/**
 * Players unavailable (suspended/injured) for the given match. `teamIds`
 * should be the two sides playing — needed to catch tournament-long
 * absences (`outForTournament`) for knockout ties, whose match id was never
 * a fixed group-stage id and so can't appear in `missesMatchIds`.
 */
export const unavailableFor = (matchId: string, teamIds?: string[]): PlayerAbsence[] =>
  absences.filter(
    (a) =>
      a.missesMatchIds.includes(matchId) ||
      (a.outForTournament && teamIds?.includes(a.team))
  );
