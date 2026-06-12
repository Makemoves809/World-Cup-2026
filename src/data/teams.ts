import type { Team } from "./types";

/**
 * The 48 qualified nations for the 2026 FIFA World Cup, as drawn on
 * 5 December 2025 in Washington, DC. The four playoff places (Group F,
 * Group I, Group K, and the late UEFA spot) resolved in March 2026.
 *
 * Note: a few inter-confederation / UEFA playoff winners are best-known
 * placeholders — update them here if a result differs.
 */
export const teams: Team[] = [
  // Group A
  { id: "mex", name: "Mexico", code: "MEX", flag: "mx", group: "A", host: true },
  { id: "rsa", name: "South Africa", code: "RSA", flag: "za", group: "A" },
  { id: "kor", name: "Korea Republic", code: "KOR", flag: "kr", group: "A" },
  { id: "cze", name: "Czechia", code: "CZE", flag: "cz", group: "A" },

  // Group B
  { id: "can", name: "Canada", code: "CAN", flag: "ca", group: "B", host: true },
  { id: "sui", name: "Switzerland", code: "SUI", flag: "ch", group: "B" },
  { id: "qat", name: "Qatar", code: "QAT", flag: "qa", group: "B" },
  { id: "bih", name: "Bosnia & Herzegovina", code: "BIH", flag: "ba", group: "B" },

  // Group C
  { id: "bra", name: "Brazil", code: "BRA", flag: "br", group: "C" },
  { id: "mar", name: "Morocco", code: "MAR", flag: "ma", group: "C" },
  { id: "sco", name: "Scotland", code: "SCO", flag: "gb-sct", group: "C" },
  { id: "hai", name: "Haiti", code: "HAI", flag: "ht", group: "C" },

  // Group D
  { id: "usa", name: "United States", code: "USA", flag: "us", group: "D", host: true },
  { id: "par", name: "Paraguay", code: "PAR", flag: "py", group: "D" },
  { id: "aus", name: "Australia", code: "AUS", flag: "au", group: "D" },
  { id: "tur", name: "Türkiye", code: "TUR", flag: "tr", group: "D" },

  // Group E
  { id: "ger", name: "Germany", code: "GER", flag: "de", group: "E" },
  { id: "cuw", name: "Curaçao", code: "CUW", flag: "cw", group: "E" },
  { id: "civ", name: "Côte d'Ivoire", code: "CIV", flag: "ci", group: "E" },
  { id: "ecu", name: "Ecuador", code: "ECU", flag: "ec", group: "E" },

  // Group F
  { id: "ned", name: "Netherlands", code: "NED", flag: "nl", group: "F" },
  { id: "jpn", name: "Japan", code: "JPN", flag: "jp", group: "F" },
  { id: "tun", name: "Tunisia", code: "TUN", flag: "tn", group: "F" },
  { id: "swe", name: "Sweden", code: "SWE", flag: "se", group: "F" },

  // Group G
  { id: "bel", name: "Belgium", code: "BEL", flag: "be", group: "G" },
  { id: "egy", name: "Egypt", code: "EGY", flag: "eg", group: "G" },
  { id: "irn", name: "Iran", code: "IRN", flag: "ir", group: "G" },
  { id: "nzl", name: "New Zealand", code: "NZL", flag: "nz", group: "G" },

  // Group H
  { id: "esp", name: "Spain", code: "ESP", flag: "es", group: "H" },
  { id: "cpv", name: "Cabo Verde", code: "CPV", flag: "cv", group: "H" },
  { id: "uru", name: "Uruguay", code: "URU", flag: "uy", group: "H" },
  { id: "ksa", name: "Saudi Arabia", code: "KSA", flag: "sa", group: "H" },

  // Group I
  { id: "fra", name: "France", code: "FRA", flag: "fr", group: "I" },
  { id: "sen", name: "Senegal", code: "SEN", flag: "sn", group: "I" },
  { id: "nor", name: "Norway", code: "NOR", flag: "no", group: "I" },
  { id: "irq", name: "Iraq", code: "IRQ", flag: "iq", group: "I" },

  // Group J
  { id: "arg", name: "Argentina", code: "ARG", flag: "ar", group: "J" },
  { id: "alg", name: "Algeria", code: "ALG", flag: "dz", group: "J" },
  { id: "aut", name: "Austria", code: "AUT", flag: "at", group: "J" },
  { id: "jor", name: "Jordan", code: "JOR", flag: "jo", group: "J" },

  // Group K
  { id: "por", name: "Portugal", code: "POR", flag: "pt", group: "K" },
  { id: "col", name: "Colombia", code: "COL", flag: "co", group: "K" },
  { id: "uzb", name: "Uzbekistan", code: "UZB", flag: "uz", group: "K" },
  { id: "cod", name: "DR Congo", code: "COD", flag: "cd", group: "K" },

  // Group L
  { id: "eng", name: "England", code: "ENG", flag: "gb-eng", group: "L" },
  { id: "cro", name: "Croatia", code: "CRO", flag: "hr", group: "L" },
  { id: "gha", name: "Ghana", code: "GHA", flag: "gh", group: "L" },
  { id: "pan", name: "Panama", code: "PAN", flag: "pa", group: "L" },
];

export const teamById = (id: string): Team => {
  const t = teams.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown team id: ${id}`);
  return t;
};

export const GROUP_IDS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
] as const;

export const teamsInGroup = (group: string): Team[] =>
  teams.filter((t) => t.group === group);
