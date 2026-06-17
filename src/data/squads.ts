/**
 * Per-team squad maps. Keyed by team id so any team can be added without a new
 * nav tab — the squad map is reached by drilling in from the Continuity page.
 *
 * Each squad lists its 26 players; the eleven with a `start` coordinate make up
 * the starting XI drawn on the pitch (x/y are percentages, attack toward the
 * top). The rest sit on the bench list below. Line-ups mirror each team's
 * actual opening-match XI and shape — keep them current (see CLAUDE.md). Photos
 * are real headshots hotlinked from Wikimedia Commons; any that can't be found
 * fall back to a lettered token, so a missing file never breaks the layout.
 */

export type Line = "gk" | "def" | "mid" | "fwd";

export interface Player {
  num: number;
  name: string;
  short: string;
  line: Line;
  role: string;
  club: string;
  at2022: boolean;
  captain?: boolean;
  /** Wikimedia Commons file name (no "File:" prefix). */
  photo?: string;
  /** Position on the pitch (% from left / top) — present only for starters. */
  start?: { x: number; y: number };
}

export interface TeamSquad {
  teamId: string;
  formation: string;
  players: Player[];
}

const FILEPATH = "https://commons.wikimedia.org/wiki/Special:FilePath/";

/** Browser-resolvable thumbnail URL for a Commons file name. */
export function playerPhoto(file: string, width = 256): string {
  return `${FILEPATH}${encodeURIComponent(file)}?width=${width}`;
}

export const LINE_LABEL: Record<Line, string> = {
  fwd: "Forward",
  mid: "Midfield",
  def: "Defence",
  gk: "Goalkeeper",
};

/** Initials for the photo fallback token, e.g. "Mbappé" → "MB". */
export function initials(short: string): string {
  const clean = short.replace(/^[A-Z]\.\s*/, "");
  const parts = clean.split(/[\s-]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : clean.slice(0, 2);
  return letters.toUpperCase();
}

const FRANCE: TeamSquad = {
  teamId: "fra",
  // Actual opener vs Senegal (3–1): a 4-2-3-1 with Mbappé through the middle.
  formation: "4-2-3-1",
  players: [
    // ---- Starting XI ----
    { num: 16, name: "Mike Maignan", short: "Maignan", line: "gk", role: "Goalkeeper", club: "AC Milan", at2022: false, photo: "Mike Maignan 2022 Salzburg vs AC Milan 2022-09-06.jpg", start: { x: 50, y: 90 } },
    { num: 5, name: "Jules Koundé", short: "Koundé", line: "def", role: "Right-back", club: "Barcelona", at2022: true, photo: "Jules Koundé (cropped).jpg", start: { x: 84, y: 70 } },
    { num: 17, name: "William Saliba", short: "Saliba", line: "def", role: "Centre-back", club: "Arsenal", at2022: true, photo: "William saliba arsenal 2025.jpg", start: { x: 62, y: 73 } },
    { num: 4, name: "Dayot Upamecano", short: "Upamecano", line: "def", role: "Centre-back", club: "Bayern Munich", at2022: true, start: { x: 38, y: 73 } },
    { num: 19, name: "Theo Hernández", short: "T. Hernández", line: "def", role: "Left-back", club: "Al Hilal", at2022: true, photo: "FC Salzburg vs. AC Mailand (UEFA Championsleague 2022-09-06) Théo Hernandez.jpg", start: { x: 16, y: 70 } },
    { num: 8, name: "Aurélien Tchouaméni", short: "Tchouaméni", line: "mid", role: "Defensive midfield", club: "Real Madrid", at2022: true, photo: "Aurélien Tchouaméni.jpg", start: { x: 64, y: 50 } },
    { num: 14, name: "Adrien Rabiot", short: "Rabiot", line: "mid", role: "Central midfield", club: "AC Milan", at2022: true, photo: "Adrien Rabiot, PSG.JPG", start: { x: 36, y: 50 } },
    { num: 7, name: "Ousmane Dembélé", short: "Dembélé", line: "fwd", role: "Right winger", club: "PSG", at2022: true, photo: "Ousmane Dembélé 2018 (cropped).jpg", start: { x: 78, y: 29 } },
    { num: 11, name: "Michael Olise", short: "Olise", line: "fwd", role: "Attacking midfield", club: "Bayern Munich", at2022: false, photo: "Michael Olise bayern 2025.jpg", start: { x: 50, y: 31 } },
    { num: 20, name: "Désiré Doué", short: "Doué", line: "fwd", role: "Left winger", club: "PSG", at2022: false, start: { x: 22, y: 29 } },
    { num: 10, name: "Kylian Mbappé", short: "Mbappé", line: "fwd", role: "Forward", club: "Real Madrid", at2022: true, captain: true, photo: "Kylian Mbappé.jpg", start: { x: 50, y: 13 } },

    // ---- Bench ----
    { num: 1, name: "Brice Samba", short: "Samba", line: "gk", role: "Goalkeeper", club: "Rennes", at2022: false },
    { num: 23, name: "Robin Risser", short: "Risser", line: "gk", role: "Goalkeeper", club: "Lens", at2022: false },
    { num: 2, name: "Malo Gusto", short: "Gusto", line: "def", role: "Right-back", club: "Chelsea", at2022: false },
    { num: 3, name: "Lucas Digne", short: "Digne", line: "def", role: "Left-back", club: "Aston Villa", at2022: false },
    { num: 15, name: "Ibrahima Konaté", short: "Konaté", line: "def", role: "Centre-back", club: "Liverpool", at2022: true, photo: "Ibrahima Konaté 06042025 (1).jpg" },
    { num: 21, name: "Lucas Hernández", short: "L. Hernández", line: "def", role: "Centre-back", club: "PSG", at2022: true },
    { num: 26, name: "Maxence Lacroix", short: "Lacroix", line: "def", role: "Centre-back", club: "Crystal Palace", at2022: false },
    { num: 6, name: "Manu Koné", short: "Koné", line: "mid", role: "Central midfield", club: "AS Roma", at2022: false, photo: "Manu Koné durante il riscaldamento di Roma-Lille.jpg" },
    { num: 13, name: "N'Golo Kanté", short: "Kanté", line: "mid", role: "Central midfield", club: "Fenerbahçe", at2022: false },
    { num: 18, name: "Warren Zaïre-Emery", short: "Zaïre-Emery", line: "mid", role: "Central midfield", club: "PSG", at2022: false },
    { num: 9, name: "Marcus Thuram", short: "Thuram", line: "fwd", role: "Striker", club: "Inter Milan", at2022: true, photo: "Marcus Thuram in 2023 (cropped).jpg" },
    { num: 12, name: "Bradley Barcola", short: "Barcola", line: "fwd", role: "Left winger", club: "PSG", at2022: false },
    { num: 22, name: "Jean-Philippe Mateta", short: "Mateta", line: "fwd", role: "Striker", club: "Crystal Palace", at2022: false },
    { num: 24, name: "Rayan Cherki", short: "Cherki", line: "fwd", role: "Attacking midfield", club: "Manchester City", at2022: false },
    { num: 25, name: "Maghnes Akliouche", short: "Akliouche", line: "fwd", role: "Attacking midfield", club: "Monaco", at2022: false },
  ],
};

const ARGENTINA: TeamSquad = {
  teamId: "arg",
  // Actual opener vs Algeria (3–0, Messi hat-trick): a 4-3-3.
  formation: "4-3-3",
  players: [
    // ---- Starting XI ----
    { num: 23, name: "Emiliano Martínez", short: "E. Martínez", line: "gk", role: "Goalkeeper", club: "Aston Villa", at2022: true, photo: "Dibu Martínez - ARG v CAN - 2024-07-09 (cropped).jpg", start: { x: 50, y: 90 } },
    { num: 4, name: "Gonzalo Montiel", short: "Montiel", line: "def", role: "Right-back", club: "River Plate", at2022: true, photo: "Argentina national football team - 2 - 2022 (Gonzalo Montiel) (cropped).jpg", start: { x: 84, y: 70 } },
    { num: 13, name: "Cristian Romero", short: "Romero", line: "def", role: "Centre-back", club: "Tottenham", at2022: true, photo: "Cuti Romero Tottenham 2022.jpg", start: { x: 62, y: 73 } },
    { num: 6, name: "Lisandro Martínez", short: "L. Martínez", line: "def", role: "Centre-back", club: "Manchester United", at2022: true, photo: "Lisandro Martínez Manchester United v Brighton & Hove Albion, 7 August 2022 (05) (cropped).jpg", start: { x: 38, y: 73 } },
    { num: 25, name: "Facundo Medina", short: "Medina", line: "def", role: "Left-back", club: "Marseille", at2022: false, start: { x: 16, y: 70 } },
    { num: 7, name: "Rodrigo De Paul", short: "De Paul", line: "mid", role: "Central midfield", club: "Inter Miami", at2022: true, start: { x: 72, y: 46 } },
    { num: 24, name: "Enzo Fernández", short: "Enzo", line: "mid", role: "Central midfield", club: "Chelsea", at2022: true, start: { x: 50, y: 52 } },
    { num: 20, name: "Alexis Mac Allister", short: "Mac Allister", line: "mid", role: "Central midfield", club: "Liverpool", at2022: true, photo: "Alexis Mac Allister WC 2022.jpg", start: { x: 28, y: 46 } },
    { num: 10, name: "Lionel Messi", short: "Messi", line: "fwd", role: "Forward", club: "Inter Miami", at2022: true, captain: true, photo: "Lionel-Messi-Argentina-2022-FIFA-World-Cup (cropped).jpg", start: { x: 80, y: 18 } },
    { num: 22, name: "Lautaro Martínez", short: "Lautaro", line: "fwd", role: "Striker", club: "Inter Milan", at2022: true, photo: "Lautaro Martínez (cropped).jpg", start: { x: 50, y: 13 } },
    { num: 16, name: "Thiago Almada", short: "Almada", line: "fwd", role: "Winger", club: "Atlético Madrid", at2022: true, photo: "Thiago Almada (53062996583) (cropped).jpg", start: { x: 20, y: 18 } },

    // ---- Bench ----
    { num: 1, name: "Juan Musso", short: "Musso", line: "gk", role: "Goalkeeper", club: "Atlético Madrid", at2022: false },
    { num: 12, name: "Gerónimo Rulli", short: "Rulli", line: "gk", role: "Goalkeeper", club: "Marseille", at2022: true },
    { num: 2, name: "Leonardo Balerdi", short: "Balerdi", line: "def", role: "Centre-back", club: "Marseille", at2022: false },
    { num: 26, name: "Nahuel Molina", short: "Molina", line: "def", role: "Right-back", club: "Atlético Madrid", at2022: true },
    { num: 19, name: "Nicolás Otamendi", short: "Otamendi", line: "def", role: "Centre-back", club: "Benfica", at2022: true, photo: "Otamendi02.JPG" },
    { num: 3, name: "Nicolás Tagliafico", short: "Tagliafico", line: "def", role: "Left-back", club: "Lyon", at2022: true, photo: "Nicolas Tagliafico.jpg" },
    { num: 5, name: "Leandro Paredes", short: "Paredes", line: "mid", role: "Defensive midfield", club: "Boca Juniors", at2022: true },
    { num: 8, name: "Valentín Barco", short: "Barco", line: "mid", role: "Left-back", club: "Strasbourg", at2022: false },
    { num: 11, name: "Giovani Lo Celso", short: "Lo Celso", line: "mid", role: "Attacking midfield", club: "Real Betis", at2022: false },
    { num: 14, name: "Exequiel Palacios", short: "Palacios", line: "mid", role: "Central midfield", club: "Bayer Leverkusen", at2022: true },
    { num: 9, name: "Julián Álvarez", short: "J. Álvarez", line: "fwd", role: "Forward", club: "Atlético Madrid", at2022: true },
    { num: 15, name: "Nicolás González", short: "N. González", line: "fwd", role: "Winger", club: "Juventus", at2022: false },
    { num: 17, name: "Giuliano Simeone", short: "Simeone", line: "fwd", role: "Winger", club: "Atlético Madrid", at2022: false },
    { num: 18, name: "Nico Paz", short: "Paz", line: "fwd", role: "Attacking midfield", club: "Como", at2022: false },
    { num: 21, name: "José López", short: "J. López", line: "fwd", role: "Striker", club: "Palmeiras", at2022: false },
  ],
};

export const SQUADS: Record<string, TeamSquad> = {
  fra: FRANCE,
  arg: ARGENTINA,
};
