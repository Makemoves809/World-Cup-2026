/**
 * 2022 FIFA World Cup (Qatar) — historical archive data. Final group
 * standings and full knockout results, for the read-only Qatar 2022 page.
 * Verified against Wikipedia/FIFA/ESPN (group goal differences sum to zero).
 */

export interface ArchiveRow {
  team: string;
  flag: string; // flagcdn slug
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
}

/** Rows in finishing order; the first two advanced to the Round of 16. */
export interface ArchiveGroup {
  id: string;
  rows: ArchiveRow[];
}

export interface ArchiveMatch {
  home: string;
  homeFlag: string;
  away: string;
  awayFlag: string;
  homeScore: number;
  awayScore: number;
  /** Penalty result [home, away] when the tie went to a shootout. */
  pens?: [number, number];
  winner: "home" | "away";
}

export interface ArchiveRound {
  id: string;
  name: string;
  matches: ArchiveMatch[];
}

const r = (
  team: string,
  flag: string,
  w: number,
  d: number,
  l: number,
  gf: number,
  ga: number
): ArchiveRow => ({ team, flag, p: 3, w, d, l, gf, ga, pts: w * 3 + d });

export const QATAR_GROUPS: ArchiveGroup[] = [
  {
    id: "A",
    rows: [
      r("Netherlands", "nl", 2, 1, 0, 5, 1),
      r("Senegal", "sn", 2, 0, 1, 5, 4),
      r("Ecuador", "ec", 1, 1, 1, 4, 3),
      r("Qatar", "qa", 0, 0, 3, 1, 7),
    ],
  },
  {
    id: "B",
    rows: [
      r("England", "gb-eng", 2, 1, 0, 9, 2),
      r("United States", "us", 1, 2, 0, 2, 1),
      r("Iran", "ir", 1, 0, 2, 4, 7),
      r("Wales", "gb-wls", 0, 1, 2, 1, 6),
    ],
  },
  {
    id: "C",
    rows: [
      r("Argentina", "ar", 2, 0, 1, 5, 2),
      r("Poland", "pl", 1, 1, 1, 2, 2),
      r("Mexico", "mx", 1, 1, 1, 2, 3),
      r("Saudi Arabia", "sa", 1, 0, 2, 3, 5),
    ],
  },
  {
    id: "D",
    rows: [
      r("France", "fr", 2, 0, 1, 6, 3),
      r("Australia", "au", 2, 0, 1, 3, 4),
      r("Tunisia", "tn", 1, 1, 1, 1, 1),
      r("Denmark", "dk", 0, 1, 2, 1, 3),
    ],
  },
  {
    id: "E",
    rows: [
      r("Japan", "jp", 2, 0, 1, 4, 3),
      r("Spain", "es", 1, 1, 1, 9, 3),
      r("Germany", "de", 1, 1, 1, 6, 5),
      r("Costa Rica", "cr", 1, 0, 2, 3, 11),
    ],
  },
  {
    id: "F",
    rows: [
      r("Morocco", "ma", 2, 1, 0, 4, 1),
      r("Croatia", "hr", 1, 2, 0, 4, 1),
      r("Belgium", "be", 1, 1, 1, 1, 2),
      r("Canada", "ca", 0, 0, 3, 2, 7),
    ],
  },
  {
    id: "G",
    rows: [
      r("Brazil", "br", 2, 0, 1, 3, 1),
      r("Switzerland", "ch", 2, 0, 1, 4, 3),
      r("Cameroon", "cm", 1, 1, 1, 4, 4),
      r("Serbia", "rs", 0, 1, 2, 5, 8),
    ],
  },
  {
    id: "H",
    rows: [
      r("Portugal", "pt", 2, 0, 1, 6, 4),
      r("South Korea", "kr", 1, 1, 1, 4, 4),
      r("Uruguay", "uy", 1, 1, 1, 2, 2),
      r("Ghana", "gh", 1, 0, 2, 5, 7),
    ],
  },
];

const m = (
  home: string,
  homeFlag: string,
  homeScore: number,
  awayScore: number,
  away: string,
  awayFlag: string,
  pens?: [number, number]
): ArchiveMatch => {
  const winner: "home" | "away" = pens
    ? pens[0] > pens[1]
      ? "home"
      : "away"
    : homeScore > awayScore
      ? "home"
      : "away";
  return { home, homeFlag, away, awayFlag, homeScore, awayScore, pens, winner };
};

export const QATAR_KO: ArchiveRound[] = [
  {
    id: "r16",
    name: "Round of 16",
    matches: [
      m("Netherlands", "nl", 3, 1, "United States", "us"),
      m("Argentina", "ar", 2, 1, "Australia", "au"),
      m("France", "fr", 3, 1, "Poland", "pl"),
      m("England", "gb-eng", 3, 0, "Senegal", "sn"),
      m("Japan", "jp", 1, 1, "Croatia", "hr", [1, 3]),
      m("Brazil", "br", 4, 1, "South Korea", "kr"),
      m("Morocco", "ma", 0, 0, "Spain", "es", [3, 0]),
      m("Portugal", "pt", 6, 1, "Switzerland", "ch"),
    ],
  },
  {
    id: "qf",
    name: "Quarter-finals",
    matches: [
      m("Croatia", "hr", 1, 1, "Brazil", "br", [4, 2]),
      m("Netherlands", "nl", 2, 2, "Argentina", "ar", [3, 4]),
      m("Morocco", "ma", 1, 0, "Portugal", "pt"),
      m("England", "gb-eng", 1, 2, "France", "fr"),
    ],
  },
  {
    id: "sf",
    name: "Semi-finals",
    matches: [
      m("Argentina", "ar", 3, 0, "Croatia", "hr"),
      m("France", "fr", 2, 0, "Morocco", "ma"),
    ],
  },
  {
    id: "third",
    name: "Third place",
    matches: [m("Croatia", "hr", 2, 1, "Morocco", "ma")],
  },
  {
    id: "final",
    name: "Final",
    matches: [m("Argentina", "ar", 3, 3, "France", "fr", [4, 2])],
  },
];

export const QATAR_SUMMARY = {
  champion: { team: "Argentina", flag: "ar" },
  runnerUp: { team: "France", flag: "fr" },
  third: { team: "Croatia", flag: "hr" },
  fourth: { team: "Morocco", flag: "ma" },
  goldenBoot: { player: "Kylian Mbappé", team: "France", goals: 8 },
  goldenBall: { player: "Lionel Messi", team: "Argentina" },
};
