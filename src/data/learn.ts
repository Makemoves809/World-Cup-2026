/**
 * Beginner teaching content for the Champions League hub. Written for someone
 * who knows football well but has never followed this competition — so it
 * assumes the reader understands the game, and only explains what's specific
 * to the Champions League (its format, entry, calendar, and jargon).
 */

export interface LearnSection {
  heading: string;
  /** One or more short paragraphs. */
  body: string[];
}

export const HOW_IT_WORKS: LearnSection[] = [
  {
    heading: "What it actually is",
    body: [
      "The Champions League is the annual tournament that crowns the best football club in Europe. Not national teams — clubs. The strongest teams from each country's domestic league qualify and play each other over a season that runs September to June.",
      "Winning it is the biggest prize in club football. The reigning champions are Paris Saint-Germain, who won it in 2025 and again in 2026 — the first club to retain the trophy since Real Madrid in 2017.",
    ],
  },
  {
    heading: "How a club gets in",
    body: [
      "You earn your place by how you finish in your own country's league the season before. The strongest leagues (England, Spain, Italy, Germany, France) send four or five clubs each; smaller nations send their champions.",
      "There are 36 clubs in total. 29 are already confirmed for 2026/27; the last 7 fight through knockout qualifying rounds over the summer, decided by 26 August. The all-important draw that sets the schedule is on 27 August 2026.",
    ],
  },
  {
    heading: "The league phase — the part that's new",
    body: [
      "This is the one thing even long-time fans had to relearn. Until 2024 the 36 teams were split into small groups. Now there are no groups at all: all 36 clubs sit in one single combined table.",
      "Each club plays 8 matches against 8 different opponents — four at home, four away — and everyone is ranked together in that one table. More games, more variety, one league.",
    ],
  },
  {
    heading: "Who advances, who's out",
    body: [
      "When the league phase ends (late January), your position in the 36-team table decides your fate:",
      "Finish 1st–8th and you go straight through to the Round of 16. Finish 9th–24th and you drop into a two-legged knockout play-off round to fight for the remaining last-16 spots. Finish 25th–36th and you're eliminated — out of Europe entirely (there's no longer a parachute into a lesser competition).",
    ],
  },
  {
    heading: "Two-legged ties",
    body: [
      "From the Round of 16 onward, every round except the final is played over two matches — once at each club's home ground. The two scores are added together (the \"aggregate\"), and the higher total wins.",
      "There's no away-goals rule anymore (it was scrapped in 2021), so a tie level on aggregate after both legs simply goes to extra time and, if needed, penalties. The final is a one-off single match at a neutral stadium.",
    ],
  },
  {
    heading: "The season at a glance",
    body: [
      "Draw: 27 August 2026. League phase: September 2026 – late January 2027. Knockout play-offs: February. Round of 16: March. Quarter- and semi-finals: April–May.",
      "Final: a single match at the Estadio Metropolitano in Madrid on 5 June 2027.",
    ],
  },
];

export interface GlossaryTerm {
  term: string;
  /** A five-word gist for scanning. */
  short: string;
  def: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "League phase",
    short: "One 36-team table, 8 games",
    def: "The opening stage since 2024/25. All 36 clubs sit in a single combined table; each plays 8 different opponents (4 home, 4 away). It replaced the old system of small groups.",
  },
  {
    term: "Group stage",
    short: "The old format, now gone",
    def: "How the competition used to start: the field split into groups of four. Replaced by the single league phase in 2024/25 — you'll still hear the phrase from habit.",
  },
  {
    term: "Two-legged tie",
    short: "One knockout over two matches",
    def: "A knockout round played as two matches, one at each team's home ground. Used from the Round of 16 through the semi-finals. The final is a single match instead.",
  },
  {
    term: "Aggregate",
    short: "Both legs' goals added up",
    def: "The combined score across the two legs of a tie. If Team A wins 2–1 then loses 1–0, it's 2–2 on aggregate — level, so the tie goes to extra time and penalties.",
  },
  {
    term: "Away goals rule",
    short: "Abolished in 2021",
    def: "An old tiebreaker where goals scored away counted double if a tie was level. It was scrapped in 2021, so away goals no longer carry extra weight — level ties just go to extra time.",
  },
  {
    term: "Knockout play-off round",
    short: "9th–24th fight for last-16 spots",
    def: "A two-legged round between the league-phase teams that finished 9th to 24th. The eight winners join the top eight in the Round of 16.",
  },
  {
    term: "Coefficient",
    short: "A club/country ranking score",
    def: "UEFA's points-based ranking of clubs and countries from recent European results. It decides seedings and how many entries each country gets.",
  },
  {
    term: "European Performance Spot",
    short: "Two bonus places for best countries",
    def: "Two extra league-phase places awarded to the two countries whose clubs did best in Europe the previous season. For 2026/27 they went to England (Liverpool) and Spain (Real Betis).",
  },
  {
    term: "Pots & seeding",
    short: "Strength tiers for the draw",
    def: "For the draw, the 36 clubs are split into four pots of nine by coefficient. Each club is drawn two opponents from each pot, so everyone faces a spread of strong and weaker sides.",
  },
  {
    term: "The treble",
    short: "League + cup + Champions League",
    def: "Winning your domestic league, your main domestic cup, and the Champions League all in one season — the rare pinnacle of a club campaign.",
  },
];
