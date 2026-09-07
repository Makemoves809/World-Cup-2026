/**
 * Champions League 2026/27 clubs — the beginner-facing "who's who".
 *
 * Kept deliberately simple: the facts a newcomer actually needs to get
 * oriented — what country/league a club is from, how much European pedigree
 * they carry (titles = European Cup + Champions League wins), and a one-line
 * "why they matter". `status` marks the 29 confirmed direct entrants vs clubs
 * still coming through the qualifying rounds (decided by 26 Aug 2026; the
 * league-phase draw is 27 Aug). `flag` is a flag-icons country slug reused
 * from the World Cup site (src/lib/flags.ts) as a small national accent —
 * clubs don't get a crest yet, they fall back to a monogram token.
 *
 * `watch` (a marquee player) is illustrative and can drift with the summer
 * transfer window; the country / league / titles are the stable facts.
 */

export interface Club {
  id: string;
  name: string;
  short: string;
  country: string;
  /** flag-icons slug for the club's country (national accent). */
  flag: string;
  league: string;
  /** European Cup + Champions League titles won. */
  titles: number;
  status: "confirmed" | "qualifying";
  /** One-line "why they matter" for a newcomer. */
  blurb: string;
  /** A well-known name to watch (illustrative — rosters shift in the window). */
  watch?: string;
}

export const CLUBS: Club[] = [
  // ---------- England (5) ----------
  { id: "ars", name: "Arsenal", short: "Arsenal", country: "England", flag: "gb-eng", league: "Premier League", titles: 0, status: "confirmed", blurb: "London's slick, young side — beaten finalists in 2006 and 2026, still chasing a first European crown.", watch: "Bukayo Saka" },
  { id: "mci", name: "Manchester City", short: "Man City", country: "England", flag: "gb-eng", league: "Premier League", titles: 1, status: "confirmed", blurb: "England's modern powerhouse; won their first Champions League in 2023.", watch: "Erling Haaland" },
  { id: "mun", name: "Manchester United", short: "Man United", country: "England", flag: "gb-eng", league: "Premier League", titles: 3, status: "confirmed", blurb: "Historic giants and 1999 treble winners — three European crowns.", watch: "Bruno Fernandes" },
  { id: "avl", name: "Aston Villa", short: "Aston Villa", country: "England", flag: "gb-eng", league: "Premier League", titles: 1, status: "confirmed", blurb: "Shock European champions in 1982, now back among the elite." },
  { id: "liv", name: "Liverpool", short: "Liverpool", country: "England", flag: "gb-eng", league: "Premier League", titles: 6, status: "confirmed", blurb: "England's most decorated in Europe (six titles) — of Istanbul 2005 fame.", watch: "Mohamed Salah" },

  // ---------- Spain (5) ----------
  { id: "bar", name: "Barcelona", short: "Barcelona", country: "Spain", flag: "es", league: "La Liga", titles: 5, status: "confirmed", blurb: "The tiki-taka icons; five European crowns and a golden academy.", watch: "Lamine Yamal" },
  { id: "rma", name: "Real Madrid", short: "Real Madrid", country: "Spain", flag: "es", league: "La Liga", titles: 15, status: "confirmed", blurb: "The competition's defining club — a record 15 titles, more than double anyone else.", watch: "Kylian Mbappé" },
  { id: "vil", name: "Villarreal", short: "Villarreal", country: "Spain", flag: "es", league: "La Liga", titles: 0, status: "confirmed", blurb: "\"The Yellow Submarine\" — a small-town side punching far above its weight." },
  { id: "atm", name: "Atlético Madrid", short: "Atlético", country: "Spain", flag: "es", league: "La Liga", titles: 0, status: "confirmed", blurb: "Madrid's gritty other half; twice runners-up, both times to Real.", watch: "Julián Álvarez" },
  { id: "bet", name: "Real Betis", short: "Betis", country: "Spain", flag: "es", league: "La Liga", titles: 0, status: "confirmed", blurb: "Seville's passionate underdogs, in the league phase via Spain's performance spot." },

  // ---------- Italy (4) ----------
  { id: "int", name: "Inter Milan", short: "Inter", country: "Italy", flag: "it", league: "Serie A", titles: 3, status: "confirmed", blurb: "2010 treble winners and recent finalists — Italy's standard-bearers.", watch: "Lautaro Martínez" },
  { id: "nap", name: "Napoli", short: "Napoli", country: "Italy", flag: "it", league: "Serie A", titles: 0, status: "confirmed", blurb: "Maradona's old club; Italian champions who play with flair." },
  { id: "com", name: "Como", short: "Como", country: "Italy", flag: "it", league: "Serie A", titles: 0, status: "confirmed", blurb: "The field's great newcomer story — a glamour-backed rise to the elite." },
  { id: "rom", name: "Roma", short: "Roma", country: "Italy", flag: "it", league: "Serie A", titles: 0, status: "confirmed", blurb: "The capital's giants, roared on by a fervent Curva Sud." },

  // ---------- Germany (4) ----------
  { id: "bay", name: "Bayern Munich", short: "Bayern", country: "Germany", flag: "de", league: "Bundesliga", titles: 6, status: "confirmed", blurb: "Germany's superpower — six titles and relentless domestic dominance.", watch: "Harry Kane" },
  { id: "dor", name: "Borussia Dortmund", short: "Dortmund", country: "Germany", flag: "de", league: "Bundesliga", titles: 1, status: "confirmed", blurb: "Home of the \"Yellow Wall\" — electric atmosphere, 2024 finalists." },
  { id: "rbl", name: "RB Leipzig", short: "Leipzig", country: "Germany", flag: "de", league: "Bundesliga", titles: 0, status: "confirmed", blurb: "A young, fast, modern project side." },
  { id: "stu", name: "VfB Stuttgart", short: "Stuttgart", country: "Germany", flag: "de", league: "Bundesliga", titles: 0, status: "confirmed", blurb: "Former German champions back on the European stage." },

  // ---------- France (4) ----------
  { id: "psg", name: "Paris Saint-Germain", short: "PSG", country: "France", flag: "fr", league: "Ligue 1", titles: 2, status: "confirmed", blurb: "The reigning champions — back-to-back winners (2025 & 2026) and France's dominant force.", watch: "Ousmane Dembélé" },
  { id: "len", name: "Lens", short: "Lens", country: "France", flag: "fr", league: "Ligue 1", titles: 0, status: "confirmed", blurb: "Northern France's fervent, working-class club." },
  { id: "lil", name: "Lille", short: "Lille", country: "France", flag: "fr", league: "Ligue 1", titles: 0, status: "confirmed", blurb: "Northern France's 2021 champions, back among Europe's elite." },
  { id: "sha", name: "Shakhtar Donetsk", short: "Shakhtar", country: "Ukraine", flag: "ua", league: "Ukrainian Premier League", titles: 0, status: "confirmed", blurb: "Ukraine's exiled powerhouse — playing its \"home\" games abroad (Stamford Bridge, London) while war continues." },

  // ---------- Netherlands (2) ----------
  { id: "psv", name: "PSV Eindhoven", short: "PSV", country: "Netherlands", flag: "nl", league: "Eredivisie", titles: 1, status: "confirmed", blurb: "Dutch champions and 1988 European Cup winners." },
  { id: "fey", name: "Feyenoord", short: "Feyenoord", country: "Netherlands", flag: "nl", league: "Eredivisie", titles: 1, status: "confirmed", blurb: "Rotterdam's fierce club — the first Dutch side to win Europe (1970)." },

  // ---------- Portugal (2) ----------
  { id: "por", name: "FC Porto", short: "Porto", country: "Portugal", flag: "pt", league: "Primeira Liga", titles: 2, status: "confirmed", blurb: "Two-time champions, including Mourinho's famous 2004 winners." },
  { id: "spo", name: "Sporting CP", short: "Sporting", country: "Portugal", flag: "pt", league: "Primeira Liga", titles: 0, status: "confirmed", blurb: "Lisbon academy powerhouse — Cristiano Ronaldo's first club." },

  // ---------- One-club associations ----------
  { id: "clb", name: "Club Brugge", short: "Club Brugge", country: "Belgium", flag: "be", league: "Pro League", titles: 0, status: "confirmed", blurb: "Belgium's European standard-bearers; runners-up back in 1978." },
  { id: "sla", name: "Slavia Prague", short: "Slavia Prague", country: "Czechia", flag: "cz", league: "Czech First League", titles: 0, status: "confirmed", blurb: "Czech champions and one of Prague's grand old clubs." },
  { id: "gal", name: "Galatasaray", short: "Galatasaray", country: "Turkey", flag: "tr", league: "Süper Lig", titles: 0, status: "confirmed", blurb: "Istanbul giants with one of the most hostile home atmospheres in Europe." },

  // ---------- Through the qualifying rounds (Aug 2026) ----------
  { id: "bod", name: "Bodø/Glimt", short: "Bodø/Glimt", country: "Norway", flag: "no", league: "Eliteserien", titles: 0, status: "confirmed", blurb: "Arctic-circle overachievers who came through qualifying — one of two Norwegian clubs in the field." },
  { id: "vik", name: "Viking FK", short: "Viking", country: "Norway", flag: "no", league: "Eliteserien", titles: 0, status: "confirmed", blurb: "Stavanger's club, through a separate qualifying path — the other Norwegian side in the draw." },
  { id: "fen", name: "Fenerbahçe", short: "Fenerbahçe", country: "Turkey", flag: "tr", league: "Süper Lig", titles: 0, status: "confirmed", blurb: "Istanbul giants with a vast, fervent support, still chasing a first European crown." },
  { id: "aek", name: "AEK Athens", short: "AEK Athens", country: "Greece", flag: "gr", league: "Super League Greece", titles: 0, status: "confirmed", blurb: "One of Greece's grand old clubs, back among Europe's elite through qualifying." },
  { id: "las", name: "LASK", short: "LASK", country: "Austria", flag: "at", league: "Austrian Bundesliga", titles: 0, status: "confirmed", blurb: "Linz side that battled through the play-off round to the league phase." },
  { id: "slb", name: "Slovan Bratislava", short: "Slovan", country: "Slovakia", flag: "sk", league: "Slovak Super Liga", titles: 0, status: "confirmed", blurb: "Slovakia's dominant club and a perennial European qualifier." },
  { id: "sab", name: "Sabah FK", short: "Sabah", country: "Azerbaijan", flag: "az", league: "Azerbaijan Premier League", titles: 0, status: "confirmed", blurb: "Baku-based side making a landmark Champions League league-phase debut." },
];

export const clubById = (id: string): Club | undefined =>
  CLUBS.find((c) => c.id === id);

export const confirmedClubs = (): Club[] =>
  CLUBS.filter((c) => c.status === "confirmed");

/** Confirmed clubs grouped by country, countries ordered by how many they have. */
export function clubsByCountry(): { country: string; flag: string; clubs: Club[] }[] {
  const map = new Map<string, Club[]>();
  for (const c of confirmedClubs()) {
    const list = map.get(c.country) ?? [];
    list.push(c);
    map.set(c.country, list);
  }
  return [...map.entries()]
    .map(([country, clubs]) => ({ country, flag: clubs[0].flag, clubs }))
    .sort((a, b) => b.clubs.length - a.clubs.length || a.country.localeCompare(b.country));
}
