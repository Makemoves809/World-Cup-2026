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

const SPAIN: TeamSquad = {
  teamId: "esp",
  // Actual opener vs Cabo Verde (0–0): a 4-2-3-1, Yamal & Nico Williams rested.
  formation: "4-2-3-1",
  players: [
    // ---- Starting XI ----
    { num: 23, name: "Unai Simón", short: "U. Simón", line: "gk", role: "Goalkeeper", club: "Athletic Club", at2022: true, start: { x: 50, y: 90 } },
    { num: 5, name: "Marcos Llorente", short: "Llorente", line: "def", role: "Right-back", club: "Atlético Madrid", at2022: true, photo: "Marcos Llorente.JPG", start: { x: 84, y: 70 } },
    { num: 22, name: "Pau Cubarsí", short: "Cubarsí", line: "def", role: "Centre-back", club: "Barcelona", at2022: false, start: { x: 62, y: 73 } },
    { num: 14, name: "Aymeric Laporte", short: "Laporte", line: "def", role: "Centre-back", club: "Athletic Club", at2022: true, photo: "Aymeric Laporte 2023 (cropped).jpg", start: { x: 38, y: 73 } },
    { num: 24, name: "Marc Cucurella", short: "Cucurella", line: "def", role: "Left-back", club: "Chelsea", at2022: false, photo: "Marc Cucurella (cropped).jpg", start: { x: 16, y: 70 } },
    { num: 16, name: "Rodri", short: "Rodri", line: "mid", role: "Defensive midfield", club: "Manchester City", at2022: true, captain: true, photo: "Yokohama F. Marinos - Manchester City (3-5) - 53075487835 (Rodri) (cropped).jpg", start: { x: 64, y: 50 } },
    { num: 8, name: "Fabián Ruiz", short: "Fabián", line: "mid", role: "Central midfield", club: "PSG", at2022: false, photo: "UEFA EURO qualifiers Sweden vs Spain 20191015 Fabian Ruiz.jpg", start: { x: 36, y: 50 } },
    { num: 7, name: "Ferran Torres", short: "Ferran", line: "fwd", role: "Right winger", club: "Barcelona", at2022: true, start: { x: 78, y: 29 } },
    { num: 20, name: "Pedri", short: "Pedri", line: "mid", role: "Attacking midfield", club: "Barcelona", at2022: true, photo: "Pedri.jpg", start: { x: 50, y: 31 } },
    { num: 9, name: "Gavi", short: "Gavi", line: "mid", role: "Left winger", club: "Barcelona", at2022: true, start: { x: 22, y: 29 } },
    { num: 21, name: "Mikel Oyarzabal", short: "Oyarzabal", line: "fwd", role: "Striker", club: "Real Sociedad", at2022: false, photo: "Mikel Oyarzabal.jpg", start: { x: 50, y: 13 } },

    // ---- Bench ----
    { num: 1, name: "David Raya", short: "Raya", line: "gk", role: "Goalkeeper", club: "Arsenal", at2022: true },
    { num: 13, name: "Joan García", short: "J. García", line: "gk", role: "Goalkeeper", club: "Barcelona", at2022: false },
    { num: 2, name: "Marc Pubill", short: "Pubill", line: "def", role: "Right-back", club: "Atlético Madrid", at2022: false },
    { num: 3, name: "Alejandro Grimaldo", short: "Grimaldo", line: "def", role: "Left-back", club: "Bayer Leverkusen", at2022: false },
    { num: 4, name: "Eric García", short: "E. García", line: "def", role: "Centre-back", club: "Barcelona", at2022: true },
    { num: 12, name: "Pedro Porro", short: "Porro", line: "def", role: "Right-back", club: "Tottenham", at2022: false },
    { num: 6, name: "Mikel Merino", short: "Merino", line: "mid", role: "Central midfield", club: "Arsenal", at2022: false },
    { num: 10, name: "Dani Olmo", short: "Olmo", line: "mid", role: "Attacking midfield", club: "Barcelona", at2022: true },
    { num: 15, name: "Álex Baena", short: "Baena", line: "mid", role: "Attacking midfield", club: "Atlético Madrid", at2022: false },
    { num: 18, name: "Martín Zubimendi", short: "Zubimendi", line: "mid", role: "Defensive midfield", club: "Arsenal", at2022: false },
    { num: 25, name: "Víctor Muñoz", short: "V. Muñoz", line: "mid", role: "Central midfield", club: "Girona", at2022: false },
    { num: 11, name: "Yeremy Pino", short: "Y. Pino", line: "fwd", role: "Winger", club: "Crystal Palace", at2022: true },
    { num: 17, name: "Nico Williams", short: "N. Williams", line: "fwd", role: "Left winger", club: "Athletic Club", at2022: true },
    { num: 19, name: "Lamine Yamal", short: "Yamal", line: "fwd", role: "Right winger", club: "Barcelona", at2022: false, photo: "Lamine Yamal in 2025 (cropped).jpg" },
    { num: 26, name: "Borja Iglesias", short: "B. Iglesias", line: "fwd", role: "Striker", club: "Celta Vigo", at2022: false },
  ],
};

const ENGLAND: TeamSquad = {
  teamId: "eng",
  // Opener vs Croatia: a 4-2-3-1, Saka rested.
  formation: "4-2-3-1",
  players: [
    // ---- Starting XI ----
    { num: 1, name: "Jordan Pickford", short: "Pickford", line: "gk", role: "Goalkeeper", club: "Everton", at2022: true, start: { x: 50, y: 90 } },
    { num: 24, name: "Reece James", short: "James", line: "def", role: "Right-back", club: "Chelsea", at2022: false, start: { x: 84, y: 70 } },
    { num: 5, name: "John Stones", short: "Stones", line: "def", role: "Centre-back", club: "Manchester City", at2022: true, start: { x: 62, y: 73 } },
    { num: 2, name: "Ezri Konsa", short: "Konsa", line: "def", role: "Centre-back", club: "Aston Villa", at2022: false, start: { x: 38, y: 73 } },
    { num: 3, name: "Nico O'Reilly", short: "O'Reilly", line: "def", role: "Left-back", club: "Manchester City", at2022: false, start: { x: 16, y: 70 } },
    { num: 8, name: "Elliot Anderson", short: "Anderson", line: "mid", role: "Defensive midfield", club: "Nottingham Forest", at2022: false, start: { x: 64, y: 50 } },
    { num: 4, name: "Declan Rice", short: "Rice", line: "mid", role: "Defensive midfield", club: "Arsenal", at2022: true, start: { x: 36, y: 50 } },
    { num: 20, name: "Noni Madueke", short: "Madueke", line: "fwd", role: "Right winger", club: "Arsenal", at2022: false, start: { x: 78, y: 29 } },
    { num: 10, name: "Jude Bellingham", short: "Bellingham", line: "mid", role: "Attacking midfield", club: "Real Madrid", at2022: true, photo: "Jude Bellingham 2022-11-21 1.jpg", start: { x: 50, y: 31 } },
    { num: 18, name: "Anthony Gordon", short: "Gordon", line: "fwd", role: "Left winger", club: "Newcastle", at2022: false, start: { x: 22, y: 29 } },
    { num: 9, name: "Harry Kane", short: "Kane", line: "fwd", role: "Striker", club: "Bayern Munich", at2022: true, captain: true, photo: "Harry Kane (24685589756).jpg", start: { x: 50, y: 13 } },

    // ---- Bench ----
    { num: 13, name: "Dean Henderson", short: "D. Henderson", line: "gk", role: "Goalkeeper", club: "Crystal Palace", at2022: false },
    { num: 23, name: "James Trafford", short: "Trafford", line: "gk", role: "Goalkeeper", club: "Manchester City", at2022: false },
    { num: 6, name: "Marc Guéhi", short: "Guéhi", line: "def", role: "Centre-back", club: "Crystal Palace", at2022: false },
    { num: 12, name: "Trevoh Chalobah", short: "Chalobah", line: "def", role: "Centre-back", club: "Chelsea", at2022: false },
    { num: 15, name: "Dan Burn", short: "Burn", line: "def", role: "Centre-back", club: "Newcastle", at2022: false },
    { num: 25, name: "Djed Spence", short: "Spence", line: "def", role: "Full-back", club: "Tottenham", at2022: false },
    { num: 26, name: "Jarell Quansah", short: "Quansah", line: "def", role: "Centre-back", club: "Bayer Leverkusen", at2022: false },
    { num: 14, name: "Jordan Henderson", short: "J. Henderson", line: "mid", role: "Central midfield", club: "Brentford", at2022: true },
    { num: 16, name: "Kobbie Mainoo", short: "Mainoo", line: "mid", role: "Central midfield", club: "Manchester United", at2022: false },
    { num: 17, name: "Morgan Rogers", short: "Rogers", line: "mid", role: "Attacking midfield", club: "Aston Villa", at2022: false },
    { num: 21, name: "Eberechi Eze", short: "Eze", line: "mid", role: "Attacking midfield", club: "Arsenal", at2022: false },
    { num: 7, name: "Bukayo Saka", short: "Saka", line: "fwd", role: "Right winger", club: "Arsenal", at2022: true },
    { num: 11, name: "Marcus Rashford", short: "Rashford", line: "fwd", role: "Forward", club: "Barcelona", at2022: true },
    { num: 19, name: "Ollie Watkins", short: "Watkins", line: "fwd", role: "Striker", club: "Aston Villa", at2022: false },
    { num: 22, name: "Ivan Toney", short: "Toney", line: "fwd", role: "Striker", club: "Al-Ahli", at2022: false },
  ],
};

const PORTUGAL: TeamSquad = {
  teamId: "por",
  // Opener vs DR Congo (1–1): a 4-2-3-1 with Ronaldo up top.
  formation: "4-2-3-1",
  players: [
    // ---- Starting XI ----
    { num: 1, name: "Diogo Costa", short: "D. Costa", line: "gk", role: "Goalkeeper", club: "FC Porto", at2022: true, start: { x: 50, y: 90 } },
    { num: 20, name: "João Cancelo", short: "Cancelo", line: "def", role: "Right-back", club: "Barcelona", at2022: true, start: { x: 84, y: 70 } },
    { num: 4, name: "Tomás Araújo", short: "T. Araújo", line: "def", role: "Centre-back", club: "Benfica", at2022: false, start: { x: 62, y: 73 } },
    { num: 13, name: "Renato Veiga", short: "R. Veiga", line: "def", role: "Centre-back", club: "Villarreal", at2022: false, start: { x: 38, y: 73 } },
    { num: 25, name: "Nuno Mendes", short: "N. Mendes", line: "def", role: "Left-back", club: "PSG", at2022: true, start: { x: 16, y: 70 } },
    { num: 15, name: "João Neves", short: "J. Neves", line: "mid", role: "Defensive midfield", club: "PSG", at2022: false, start: { x: 64, y: 50 } },
    { num: 23, name: "Vitinha", short: "Vitinha", line: "mid", role: "Central midfield", club: "PSG", at2022: true, start: { x: 36, y: 50 } },
    { num: 10, name: "Bernardo Silva", short: "B. Silva", line: "mid", role: "Right winger", club: "Manchester City", at2022: true, start: { x: 78, y: 29 } },
    { num: 8, name: "Bruno Fernandes", short: "B. Fernandes", line: "mid", role: "Attacking midfield", club: "Manchester United", at2022: true, start: { x: 50, y: 31 } },
    { num: 18, name: "Pedro Neto", short: "Neto", line: "fwd", role: "Left winger", club: "Chelsea", at2022: false, start: { x: 22, y: 29 } },
    { num: 7, name: "Cristiano Ronaldo", short: "Ronaldo", line: "fwd", role: "Forward", club: "Al Nassr", at2022: true, captain: true, photo: "Cristiano Ronaldo WC2022 - 01 (cropped).jpg", start: { x: 50, y: 13 } },

    // ---- Bench ----
    { num: 12, name: "Rui Silva", short: "Rui Silva", line: "gk", role: "Goalkeeper", club: "Sporting CP", at2022: false },
    { num: 22, name: "José Sá", short: "José Sá", line: "gk", role: "Goalkeeper", club: "Wolves", at2022: true },
    { num: 3, name: "Rúben Dias", short: "R. Dias", line: "def", role: "Centre-back", club: "Manchester City", at2022: true },
    { num: 24, name: "Gonçalo Inácio", short: "Inácio", line: "def", role: "Centre-back", club: "Sporting CP", at2022: false },
    { num: 2, name: "Nélson Semedo", short: "Semedo", line: "def", role: "Right-back", club: "Fenerbahçe", at2022: true },
    { num: 5, name: "Diogo Dalot", short: "Dalot", line: "def", role: "Full-back", club: "Manchester United", at2022: true },
    { num: 26, name: "Matheus Nunes", short: "M. Nunes", line: "mid", role: "Central midfield", club: "Manchester City", at2022: true },
    { num: 14, name: "Samú Costa", short: "Samú", line: "mid", role: "Defensive midfield", club: "Mallorca", at2022: false },
    { num: 21, name: "Rúben Neves", short: "R. Neves", line: "mid", role: "Defensive midfield", club: "Al Hilal", at2022: true },
    { num: 11, name: "Francisco Trincão", short: "Trincão", line: "fwd", role: "Winger", club: "Sporting CP", at2022: false },
    { num: 16, name: "João Félix", short: "Félix", line: "fwd", role: "Forward", club: "Al Nassr", at2022: true },
    { num: 17, name: "Francisco Conceição", short: "Conceição", line: "fwd", role: "Winger", club: "Juventus", at2022: false },
    { num: 19, name: "Rafael Leão", short: "Leão", line: "fwd", role: "Forward", club: "AC Milan", at2022: true },
    { num: 6, name: "Gonçalo Guedes", short: "Guedes", line: "fwd", role: "Winger", club: "Real Sociedad", at2022: false },
    { num: 9, name: "Gonçalo Ramos", short: "G. Ramos", line: "fwd", role: "Striker", club: "PSG", at2022: true },
  ],
};

const USA: TeamSquad = {
  teamId: "usa",
  // Opener vs Paraguay (4–1): a 4-2-3-1.
  formation: "4-2-3-1",
  players: [
    // ---- Starting XI ----
    { num: 24, name: "Matt Freese", short: "Freese", line: "gk", role: "Goalkeeper", club: "New York City FC", at2022: false, start: { x: 50, y: 90 } },
    { num: 16, name: "Alex Freeman", short: "Freeman", line: "def", role: "Right-back", club: "Villarreal", at2022: false, start: { x: 84, y: 70 } },
    { num: 3, name: "Chris Richards", short: "Richards", line: "def", role: "Centre-back", club: "Crystal Palace", at2022: false, start: { x: 62, y: 73 } },
    { num: 13, name: "Tim Ream", short: "Ream", line: "def", role: "Centre-back", club: "Charlotte FC", at2022: true, start: { x: 38, y: 73 } },
    { num: 5, name: "Antonee Robinson", short: "A. Robinson", line: "def", role: "Left-back", club: "Fulham", at2022: true, start: { x: 16, y: 70 } },
    { num: 4, name: "Tyler Adams", short: "Adams", line: "mid", role: "Defensive midfield", club: "Bournemouth", at2022: true, start: { x: 64, y: 50 } },
    { num: 8, name: "Weston McKennie", short: "McKennie", line: "mid", role: "Central midfield", club: "Juventus", at2022: true, start: { x: 36, y: 50 } },
    { num: 2, name: "Sergiño Dest", short: "Dest", line: "def", role: "Right winger", club: "PSV", at2022: true, start: { x: 78, y: 29 } },
    { num: 17, name: "Malik Tillman", short: "Tillman", line: "mid", role: "Attacking midfield", club: "Bayer Leverkusen", at2022: false, start: { x: 50, y: 31 } },
    { num: 10, name: "Christian Pulisic", short: "Pulisic", line: "fwd", role: "Left winger", club: "AC Milan", at2022: true, captain: true, start: { x: 22, y: 29 } },
    { num: 20, name: "Folarin Balogun", short: "Balogun", line: "fwd", role: "Striker", club: "Monaco", at2022: false, start: { x: 50, y: 13 } },

    // ---- Bench ----
    { num: 1, name: "Matt Turner", short: "Turner", line: "gk", role: "Goalkeeper", club: "New England Revolution", at2022: true },
    { num: 25, name: "Chris Brady", short: "Brady", line: "gk", role: "Goalkeeper", club: "Chicago Fire", at2022: false },
    { num: 6, name: "Auston Trusty", short: "Trusty", line: "def", role: "Centre-back", club: "Celtic", at2022: false },
    { num: 12, name: "Miles Robinson", short: "M. Robinson", line: "def", role: "Centre-back", club: "FC Cincinnati", at2022: false },
    { num: 18, name: "Max Arfsten", short: "Arfsten", line: "def", role: "Left-back", club: "Columbus Crew", at2022: false },
    { num: 22, name: "Mark McKenzie", short: "McKenzie", line: "def", role: "Centre-back", club: "Toulouse", at2022: false },
    { num: 23, name: "Joe Scally", short: "Scally", line: "def", role: "Right-back", club: "Mönchengladbach", at2022: true },
    { num: 7, name: "Gio Reyna", short: "Reyna", line: "mid", role: "Attacking midfield", club: "Mönchengladbach", at2022: true },
    { num: 14, name: "Sebastian Berhalter", short: "Berhalter", line: "mid", role: "Central midfield", club: "Vancouver Whitecaps", at2022: false },
    { num: 15, name: "Cristian Roldan", short: "Roldan", line: "mid", role: "Central midfield", club: "Seattle Sounders", at2022: true },
    { num: 11, name: "Brenden Aaronson", short: "Aaronson", line: "mid", role: "Attacking midfield", club: "Leeds United", at2022: true },
    { num: 9, name: "Ricardo Pepi", short: "Pepi", line: "fwd", role: "Striker", club: "PSV", at2022: false },
    { num: 19, name: "Haji Wright", short: "H. Wright", line: "fwd", role: "Striker", club: "Coventry City", at2022: true },
    { num: 21, name: "Tim Weah", short: "Weah", line: "fwd", role: "Winger", club: "Marseille", at2022: true },
    { num: 26, name: "Alex Zendejas", short: "Zendejas", line: "fwd", role: "Winger", club: "Club América", at2022: false },
  ],
};

const SCOTLAND: TeamSquad = {
  teamId: "sco",
  // Opener vs Haiti (1–0): a 4-4-2.
  formation: "4-4-2",
  players: [
    // ---- Starting XI ----
    { num: 1, name: "Angus Gunn", short: "Gunn", line: "gk", role: "Goalkeeper", club: "Nottingham Forest", at2022: false, start: { x: 50, y: 90 } },
    { num: 2, name: "Aaron Hickey", short: "Hickey", line: "def", role: "Right-back", club: "Brentford", at2022: false, start: { x: 84, y: 70 } },
    { num: 13, name: "Jack Hendry", short: "Hendry", line: "def", role: "Centre-back", club: "Al-Ettifaq", at2022: false, start: { x: 62, y: 73 } },
    { num: 5, name: "Grant Hanley", short: "Hanley", line: "def", role: "Centre-back", club: "Birmingham City", at2022: false, start: { x: 38, y: 73 } },
    { num: 3, name: "Andy Robertson", short: "Robertson", line: "def", role: "Left-back", club: "Liverpool", at2022: false, captain: true, start: { x: 16, y: 70 } },
    { num: 17, name: "Ben Gannon-Doak", short: "Gannon-Doak", line: "mid", role: "Right midfield", club: "Liverpool", at2022: false, start: { x: 84, y: 44 } },
    { num: 4, name: "Scott McTominay", short: "McTominay", line: "mid", role: "Central midfield", club: "Napoli", at2022: false, start: { x: 58, y: 50 } },
    { num: 19, name: "Lewis Ferguson", short: "Ferguson", line: "mid", role: "Central midfield", club: "Bologna", at2022: false, start: { x: 38, y: 50 } },
    { num: 7, name: "John McGinn", short: "McGinn", line: "mid", role: "Left midfield", club: "Aston Villa", at2022: false, start: { x: 14, y: 44 } },
    { num: 20, name: "Lawrence Shankland", short: "Shankland", line: "fwd", role: "Striker", club: "Hearts", at2022: false, start: { x: 62, y: 16 } },
    { num: 10, name: "Ché Adams", short: "Adams", line: "fwd", role: "Striker", club: "Torino", at2022: false, start: { x: 38, y: 16 } },

    // ---- Bench ----
    { num: 21, name: "Craig Gordon", short: "Gordon", line: "gk", role: "Goalkeeper", club: "Hearts", at2022: false },
    { num: 12, name: "Liam Kelly", short: "Kelly", line: "gk", role: "Goalkeeper", club: "Rangers", at2022: false },
    { num: 6, name: "Kieran Tierney", short: "Tierney", line: "def", role: "Left-back", club: "Celtic", at2022: false },
    { num: 15, name: "John Souttar", short: "J. Souttar", line: "def", role: "Centre-back", club: "Rangers", at2022: false },
    { num: 16, name: "Dominic Hyam", short: "Hyam", line: "def", role: "Centre-back", club: "Blackburn", at2022: false },
    { num: 22, name: "Nathan Patterson", short: "Patterson", line: "def", role: "Right-back", club: "Everton", at2022: false },
    { num: 24, name: "Anthony Ralston", short: "Ralston", line: "def", role: "Right-back", club: "Celtic", at2022: false },
    { num: 26, name: "Scott McKenna", short: "McKenna", line: "def", role: "Centre-back", club: "Las Palmas", at2022: false },
    { num: 8, name: "Tyler Fletcher", short: "Fletcher", line: "mid", role: "Central midfield", club: "West Ham", at2022: false },
    { num: 11, name: "Ryan Christie", short: "Christie", line: "mid", role: "Attacking midfield", club: "Bournemouth", at2022: false },
    { num: 23, name: "Kenny McLean", short: "McLean", line: "mid", role: "Central midfield", club: "Norwich City", at2022: false },
    { num: 25, name: "Findlay Curtis", short: "Curtis", line: "mid", role: "Winger", club: "Rangers", at2022: false },
    { num: 9, name: "Lyndon Dykes", short: "Dykes", line: "fwd", role: "Striker", club: "Birmingham City", at2022: false },
    { num: 14, name: "Ross Stewart", short: "Stewart", line: "fwd", role: "Striker", club: "Southampton", at2022: false },
    { num: 18, name: "George Hirst", short: "Hirst", line: "fwd", role: "Striker", club: "Ipswich Town", at2022: false },
  ],
};

const MOROCCO: TeamSquad = {
  teamId: "mar",
  // Opener vs Brazil (1–1): a 4-2-3-1.
  formation: "4-2-3-1",
  players: [
    // ---- Starting XI ----
    { num: 1, name: "Yassine Bounou", short: "Bounou", line: "gk", role: "Goalkeeper", club: "Al-Hilal", at2022: true, start: { x: 50, y: 90 } },
    { num: 2, name: "Achraf Hakimi", short: "Hakimi", line: "def", role: "Right-back", club: "PSG", at2022: true, captain: true, start: { x: 84, y: 70 } },
    { num: 14, name: "Issa Diop", short: "Diop", line: "def", role: "Centre-back", club: "Fulham", at2022: false, start: { x: 62, y: 73 } },
    { num: 18, name: "Chadi Riad", short: "Riad", line: "def", role: "Centre-back", club: "Crystal Palace", at2022: false, start: { x: 38, y: 73 } },
    { num: 3, name: "Noussair Mazraoui", short: "Mazraoui", line: "def", role: "Left-back", club: "Manchester United", at2022: true, start: { x: 16, y: 70 } },
    { num: 24, name: "Neil El Aynaoui", short: "El Aynaoui", line: "mid", role: "Defensive midfield", club: "AS Roma", at2022: false, start: { x: 64, y: 50 } },
    { num: 6, name: "Ayyoub Bouaddi", short: "Bouaddi", line: "mid", role: "Defensive midfield", club: "Lille", at2022: false, start: { x: 36, y: 50 } },
    { num: 10, name: "Brahim Díaz", short: "Brahim", line: "mid", role: "Right winger", club: "Real Madrid", at2022: false, start: { x: 78, y: 29 } },
    { num: 8, name: "Azzedine Ounahi", short: "Ounahi", line: "mid", role: "Attacking midfield", club: "Girona", at2022: true, start: { x: 50, y: 31 } },
    { num: 23, name: "Bilal El Khannouss", short: "El Khannouss", line: "mid", role: "Left winger", club: "Stuttgart", at2022: false, start: { x: 22, y: 29 } },
    { num: 11, name: "Ismael Saibari", short: "Saibari", line: "fwd", role: "Striker", club: "PSV", at2022: false, start: { x: 50, y: 13 } },

    // ---- Bench ----
    { num: 12, name: "Munir Mohamedi", short: "Munir", line: "gk", role: "Goalkeeper", club: "RS Berkane", at2022: true },
    { num: 22, name: "Reda Tagnaouti", short: "Tagnaouti", line: "gk", role: "Goalkeeper", club: "AS FAR", at2022: true },
    { num: 5, name: "Nayef Aguerd", short: "Aguerd", line: "def", role: "Centre-back", club: "Marseille", at2022: true },
    { num: 13, name: "Zakaria El Ouahdi", short: "El Ouahdi", line: "def", role: "Right-back", club: "Genk", at2022: false },
    { num: 19, name: "Youssef Belammari", short: "Belammari", line: "def", role: "Centre-back", club: "Al Ahly", at2022: false },
    { num: 25, name: "Redouane Halhal", short: "Halhal", line: "def", role: "Centre-back", club: "KV Mechelen", at2022: false },
    { num: 26, name: "Anass Salah-Eddine", short: "Salah-Eddine", line: "def", role: "Left-back", club: "PSV", at2022: false },
    { num: 4, name: "Sofyan Amrabat", short: "Amrabat", line: "mid", role: "Defensive midfield", club: "Real Betis", at2022: true },
    { num: 15, name: "Samir El Mourabet", short: "El Mourabet", line: "mid", role: "Central midfield", club: "Strasbourg", at2022: false },
    { num: 7, name: "Chemsdine Talbi", short: "Talbi", line: "fwd", role: "Winger", club: "Sunderland", at2022: false },
    { num: 9, name: "Soufiane Rahimi", short: "Rahimi", line: "fwd", role: "Striker", club: "Al Ain", at2022: false },
    { num: 16, name: "Ayoub El Kaabi", short: "El Kaabi", line: "fwd", role: "Striker", club: "Olympiacos", at2022: false },
    { num: 17, name: "Abde Ezzalzouli", short: "Ezzalzouli", line: "fwd", role: "Winger", club: "Real Betis", at2022: false },
    { num: 20, name: "Yassine Gessime", short: "Gessime", line: "fwd", role: "Forward", club: "Strasbourg", at2022: false },
    { num: 21, name: "Ayoube Amaimouni", short: "Amaimouni", line: "fwd", role: "Forward", club: "Eintracht Frankfurt", at2022: false },
  ],
};

export const SQUADS: Record<string, TeamSquad> = {
  fra: FRANCE,
  arg: ARGENTINA,
  esp: SPAIN,
  eng: ENGLAND,
  por: PORTUGAL,
  usa: USA,
  sco: SCOTLAND,
  mar: MOROCCO,
};
