/**
 * The 2026/27 Champions League league-phase fixtures — all 144 matches, as
 * drawn on 27 August 2026. Each of the 36 clubs plays 8 different opponents:
 * 4 at home, 4 away (two drawn from each pot).
 *
 * Source: the published draw grid, cross-checked club-by-club against the
 * clubs' own official fixture lists. The full matrix is self-consistent —
 * every fixture is reciprocated (a home game here is the opponent's away
 * game), and every club lands on exactly 4 home / 4 away.
 *
 * Each entry is [home, away] in club ids (see clubs.ts). Match ids are
 * `cl-{home}-{away}`; the live-results feed (scripts/update-data.ts) keys
 * scores, kickoff times and matchdays to these ids.
 */

export interface ClFixture {
  id: string;
  home: string;
  away: string;
}

const PAIRS: [string, string][] = [
  // Pot 1 hosts
  ["rma", "int"], ["rma", "psv"], ["rma", "rbl"], ["rma", "las"],
  ["bar", "mci"], ["bar", "avl"], ["bar", "fey"], ["bar", "com"],
  ["psg", "bar"], ["psg", "rom"], ["psg", "gal"], ["psg", "slb"],
  ["bay", "ars"], ["bay", "bet"], ["bay", "bod"], ["bay", "sla"],
  ["mci", "psg"], ["mci", "spo"], ["mci", "nap"], ["mci", "aek"],
  ["liv", "atm"], ["liv", "por"], ["liv", "vil"], ["liv", "len"],
  ["int", "liv"], ["int", "clb"], ["int", "sha"], ["int", "stu"],
  ["ars", "lil"], ["ars", "dor"], ["ars", "rma"], ["ars", "sab"],
  ["atm", "bay"], ["atm", "mun"], ["atm", "fen"], ["atm", "vik"],
  // Pot 2 hosts
  ["dor", "int"], ["dor", "vil"], ["dor", "bet"], ["dor", "aek"],
  ["rom", "rma"], ["rom", "lil"], ["rom", "spo"], ["rom", "slb"],
  ["spo", "gal"], ["spo", "las"], ["spo", "bar"], ["spo", "mun"],
  ["avl", "psg"], ["avl", "dor"], ["avl", "fen"], ["avl", "vik"],
  ["por", "mci"], ["por", "psv"], ["por", "nap"], ["por", "sla"],
  ["mun", "bay"], ["mun", "rbl"], ["mun", "rom"], ["mun", "sab"],
  ["clb", "liv"], ["clb", "avl"], ["clb", "bod"], ["clb", "len"],
  ["bet", "ars"], ["bet", "por"], ["bet", "fey"], ["bet", "com"],
  ["psv", "atm"], ["psv", "clb"], ["psv", "sha"], ["psv", "stu"],
  // Pot 3 hosts
  ["nap", "ars"], ["nap", "clb"], ["nap", "bod"], ["nap", "vik"],
  ["lil", "bay"], ["lil", "bet"], ["lil", "gal"], ["lil", "slb"],
  ["bod", "atm"], ["bod", "dor"], ["bod", "lil"], ["bod", "las"],
  ["rbl", "mci"], ["rbl", "psv"], ["rbl", "sha"], ["rbl", "len"],
  ["vil", "psg"], ["vil", "mun"], ["vil", "nap"], ["vil", "sab"],
  ["fen", "rom"], ["fen", "sla"], ["fen", "liv"], ["fen", "vil"],
  ["sha", "rma"], ["sha", "spo"], ["sha", "fen"], ["sha", "aek"],
  ["gal", "bar"], ["gal", "avl"], ["gal", "fey"], ["gal", "stu"],
  ["fey", "int"], ["fey", "rbl"], ["fey", "por"], ["fey", "com"],
  // Pot 4 hosts
  ["sla", "ars"], ["sla", "avl"], ["sla", "vil"], ["sla", "len"],
  ["slb", "int"], ["slb", "bet"], ["slb", "sha"], ["slb", "stu"],
  ["stu", "atm"], ["stu", "clb"], ["stu", "lil"], ["stu", "vik"],
  ["aek", "rma"], ["aek", "rom"], ["aek", "gal"], ["aek", "las"],
  ["las", "liv"], ["las", "por"], ["las", "fen"], ["las", "slb"],
  ["com", "psg"], ["com", "mun"], ["com", "rbl"], ["com", "aek"],
  ["len", "mci"], ["len", "spo"], ["len", "bod"], ["len", "com"],
  ["vik", "bay"], ["vik", "psv"], ["vik", "fey"], ["vik", "sab"],
  ["sab", "bar"], ["sab", "dor"], ["sab", "nap"], ["sab", "sla"],
];

export const CL_FIXTURES: ClFixture[] = PAIRS.map(([home, away]) => ({
  id: `cl-${home}-${away}`,
  home,
  away,
}));

/** A club's 8 league-phase games, split by venue. */
export function fixturesFor(clubId: string): { home: ClFixture[]; away: ClFixture[] } {
  return {
    home: CL_FIXTURES.filter((f) => f.home === clubId),
    away: CL_FIXTURES.filter((f) => f.away === clubId),
  };
}
