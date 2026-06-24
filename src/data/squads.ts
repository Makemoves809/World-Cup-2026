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
    { num: 9, name: "Gavi", short: "Gavi", line: "mid", role: "Left winger", club: "Barcelona", at2022: true, photo: "Gavi (footballer).jpg", start: { x: 22, y: 29 } },
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
    { num: 5, name: "John Stones", short: "Stones", line: "def", role: "Centre-back", club: "Manchester City", at2022: true, photo: "1 john stones 2015 (cropped).jpg", start: { x: 62, y: 73 } },
    { num: 2, name: "Ezri Konsa", short: "Konsa", line: "def", role: "Centre-back", club: "Aston Villa", at2022: false, start: { x: 38, y: 73 } },
    { num: 3, name: "Nico O'Reilly", short: "O'Reilly", line: "def", role: "Left-back", club: "Manchester City", at2022: false, start: { x: 16, y: 70 } },
    { num: 8, name: "Elliot Anderson", short: "Anderson", line: "mid", role: "Defensive midfield", club: "Nottingham Forest", at2022: false, start: { x: 64, y: 50 } },
    { num: 4, name: "Declan Rice", short: "Rice", line: "mid", role: "Defensive midfield", club: "Arsenal", at2022: true, photo: "Declan Rice.jpg", start: { x: 36, y: 50 } },
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
    { num: 7, name: "Bukayo Saka", short: "Saka", line: "fwd", role: "Right winger", club: "Arsenal", at2022: true, photo: "1 bukayo saka arsenal 2025 (cropped).jpg" },
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
    { num: 25, name: "Nuno Mendes", short: "N. Mendes", line: "def", role: "Left-back", club: "PSG", at2022: true, photo: "Nuno Mendes (cropped).jpg", start: { x: 16, y: 70 } },
    { num: 15, name: "João Neves", short: "J. Neves", line: "mid", role: "Defensive midfield", club: "PSG", at2022: false, start: { x: 64, y: 50 } },
    { num: 23, name: "Vitinha", short: "Vitinha", line: "mid", role: "Central midfield", club: "PSG", at2022: true, photo: "Vitinha (PSG).jpg", start: { x: 36, y: 50 } },
    { num: 10, name: "Bernardo Silva", short: "B. Silva", line: "mid", role: "Right winger", club: "Manchester City", at2022: true, photo: "Bernardo Silva.jpg", start: { x: 78, y: 29 } },
    { num: 8, name: "Bruno Fernandes", short: "B. Fernandes", line: "mid", role: "Attacking midfield", club: "Manchester United", at2022: true, photo: "Bruno Fernandes Portugal, 2018.jpg", start: { x: 50, y: 31 } },
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
  // Most recent: vs Australia (2–0) — switched to a back-three 3-4-1-2,
  // Pulisic out injured, Pepi in, Dest & Robinson as wing-backs.
  formation: "3-4-1-2",
  players: [
    // ---- Starting XI ----
    { num: 24, name: "Matt Freese", short: "Freese", line: "gk", role: "Goalkeeper", club: "New York City FC", at2022: false, start: { x: 50, y: 90 } },
    { num: 3, name: "Chris Richards", short: "Richards", line: "def", role: "Centre-back", club: "Crystal Palace", at2022: false, start: { x: 28, y: 75 } },
    { num: 13, name: "Tim Ream", short: "Ream", line: "def", role: "Centre-back", club: "Charlotte FC", at2022: true, captain: true, start: { x: 50, y: 77 } },
    { num: 16, name: "Alex Freeman", short: "Freeman", line: "def", role: "Centre-back", club: "Villarreal", at2022: false, start: { x: 72, y: 75 } },
    { num: 5, name: "Antonee Robinson", short: "A. Robinson", line: "def", role: "Left wing-back", club: "Fulham", at2022: true, start: { x: 11, y: 55 } },
    { num: 2, name: "Sergiño Dest", short: "Dest", line: "def", role: "Right wing-back", club: "PSV", at2022: true, photo: "2022 FIFA World Cup United States 1–1 Wales - (210) (cropped).jpg", start: { x: 89, y: 55 } },
    { num: 4, name: "Tyler Adams", short: "Adams", line: "mid", role: "Central midfield", club: "Bournemouth", at2022: true, photo: "Tyler Adams (28160524650).jpg", start: { x: 38, y: 50 } },
    { num: 8, name: "Weston McKennie", short: "McKennie", line: "mid", role: "Central midfield", club: "Juventus", at2022: true, start: { x: 62, y: 50 } },
    { num: 17, name: "Malik Tillman", short: "Tillman", line: "mid", role: "Attacking midfield", club: "Bayer Leverkusen", at2022: false, start: { x: 50, y: 31 } },
    { num: 9, name: "Ricardo Pepi", short: "Pepi", line: "fwd", role: "Striker", club: "PSV", at2022: false, start: { x: 36, y: 14 } },
    { num: 20, name: "Folarin Balogun", short: "Balogun", line: "fwd", role: "Striker", club: "Monaco", at2022: false, start: { x: 64, y: 14 } },

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
    { num: 10, name: "Christian Pulisic", short: "Pulisic", line: "fwd", role: "Winger", club: "AC Milan", at2022: true, photo: "Christian Pulisic 2017 (cropped).jpg" },
    { num: 19, name: "Haji Wright", short: "H. Wright", line: "fwd", role: "Striker", club: "Coventry City", at2022: true },
    { num: 21, name: "Tim Weah", short: "Weah", line: "fwd", role: "Winger", club: "Marseille", at2022: true },
    { num: 26, name: "Alex Zendejas", short: "Zendejas", line: "fwd", role: "Winger", club: "Club América", at2022: false },
  ],
};

const SCOTLAND: TeamSquad = {
  teamId: "sco",
  // Most recent: vs Morocco (0–1) — switched to a back-three 3-4-2-1.
  formation: "3-4-2-1",
  players: [
    // ---- Starting XI ----
    { num: 1, name: "Angus Gunn", short: "Gunn", line: "gk", role: "Goalkeeper", club: "Nottingham Forest", at2022: false, start: { x: 50, y: 90 } },
    { num: 6, name: "Kieran Tierney", short: "Tierney", line: "def", role: "Centre-back", club: "Celtic", at2022: false, start: { x: 28, y: 75 } },
    { num: 5, name: "Grant Hanley", short: "Hanley", line: "def", role: "Centre-back", club: "Birmingham City", at2022: false, start: { x: 50, y: 77 } },
    { num: 13, name: "Jack Hendry", short: "Hendry", line: "def", role: "Centre-back", club: "Al-Ettifaq", at2022: false, start: { x: 72, y: 75 } },
    { num: 3, name: "Andy Robertson", short: "Robertson", line: "def", role: "Left wing-back", club: "Liverpool", at2022: false, captain: true, photo: "LFC Parade 2019 01 Andy Robertson.jpg", start: { x: 11, y: 55 } },
    { num: 22, name: "Nathan Patterson", short: "Patterson", line: "def", role: "Right wing-back", club: "Everton", at2022: false, start: { x: 89, y: 55 } },
    { num: 19, name: "Lewis Ferguson", short: "Ferguson", line: "mid", role: "Central midfield", club: "Bologna", at2022: false, start: { x: 38, y: 50 } },
    { num: 4, name: "Scott McTominay", short: "McTominay", line: "mid", role: "Central midfield", club: "Napoli", at2022: false, start: { x: 62, y: 50 } },
    { num: 7, name: "John McGinn", short: "McGinn", line: "mid", role: "Attacking midfield", club: "Aston Villa", at2022: false, start: { x: 32, y: 30 } },
    { num: 11, name: "Ryan Christie", short: "Christie", line: "mid", role: "Attacking midfield", club: "Bournemouth", at2022: false, start: { x: 68, y: 30 } },
    { num: 10, name: "Ché Adams", short: "Adams", line: "fwd", role: "Striker", club: "Torino", at2022: false, start: { x: 50, y: 13 } },

    // ---- Bench ----
    { num: 21, name: "Craig Gordon", short: "Gordon", line: "gk", role: "Goalkeeper", club: "Hearts", at2022: false },
    { num: 12, name: "Liam Kelly", short: "Kelly", line: "gk", role: "Goalkeeper", club: "Rangers", at2022: false },
    { num: 2, name: "Aaron Hickey", short: "Hickey", line: "def", role: "Right-back", club: "Brentford", at2022: false },
    { num: 15, name: "John Souttar", short: "J. Souttar", line: "def", role: "Centre-back", club: "Rangers", at2022: false },
    { num: 16, name: "Dominic Hyam", short: "Hyam", line: "def", role: "Centre-back", club: "Blackburn", at2022: false },
    { num: 24, name: "Anthony Ralston", short: "Ralston", line: "def", role: "Right-back", club: "Celtic", at2022: false },
    { num: 26, name: "Scott McKenna", short: "McKenna", line: "def", role: "Centre-back", club: "Las Palmas", at2022: false },
    { num: 8, name: "Tyler Fletcher", short: "Fletcher", line: "mid", role: "Central midfield", club: "West Ham", at2022: false },
    { num: 23, name: "Kenny McLean", short: "McLean", line: "mid", role: "Central midfield", club: "Norwich City", at2022: false },
    { num: 25, name: "Findlay Curtis", short: "Curtis", line: "mid", role: "Winger", club: "Rangers", at2022: false },
    { num: 17, name: "Ben Gannon-Doak", short: "Gannon-Doak", line: "mid", role: "Winger", club: "Liverpool", at2022: false },
    { num: 9, name: "Lyndon Dykes", short: "Dykes", line: "fwd", role: "Striker", club: "Birmingham City", at2022: false },
    { num: 14, name: "Ross Stewart", short: "Stewart", line: "fwd", role: "Striker", club: "Southampton", at2022: false },
    { num: 18, name: "George Hirst", short: "Hirst", line: "fwd", role: "Striker", club: "Ipswich Town", at2022: false },
    { num: 20, name: "Lawrence Shankland", short: "Shankland", line: "fwd", role: "Striker", club: "Hearts", at2022: false },
  ],
};

const MOROCCO: TeamSquad = {
  teamId: "mar",
  // Opener vs Brazil (1–1): a 4-2-3-1.
  formation: "4-2-3-1",
  players: [
    // ---- Starting XI ----
    { num: 1, name: "Yassine Bounou", short: "Bounou", line: "gk", role: "Goalkeeper", club: "Al-Hilal", at2022: true, photo: "Yassine Bounou.jpg", start: { x: 50, y: 90 } },
    { num: 2, name: "Achraf Hakimi", short: "Hakimi", line: "def", role: "Right-back", club: "PSG", at2022: true, captain: true, photo: "HakimiAchraf.jpg", start: { x: 84, y: 70 } },
    { num: 14, name: "Issa Diop", short: "Diop", line: "def", role: "Centre-back", club: "Fulham", at2022: false, start: { x: 62, y: 73 } },
    { num: 18, name: "Chadi Riad", short: "Riad", line: "def", role: "Centre-back", club: "Crystal Palace", at2022: false, start: { x: 38, y: 73 } },
    { num: 3, name: "Noussair Mazraoui", short: "Mazraoui", line: "def", role: "Left-back", club: "Manchester United", at2022: true, photo: "Noussair Mazraoui.jpg", start: { x: 16, y: 70 } },
    { num: 24, name: "Neil El Aynaoui", short: "El Aynaoui", line: "mid", role: "Defensive midfield", club: "AS Roma", at2022: false, start: { x: 64, y: 50 } },
    { num: 6, name: "Ayyoub Bouaddi", short: "Bouaddi", line: "mid", role: "Defensive midfield", club: "Lille", at2022: false, start: { x: 36, y: 50 } },
    { num: 10, name: "Brahim Díaz", short: "Brahim", line: "mid", role: "Right winger", club: "Real Madrid", at2022: false, start: { x: 78, y: 29 } },
    { num: 8, name: "Azzedine Ounahi", short: "Ounahi", line: "mid", role: "Attacking midfield", club: "Girona", at2022: true, photo: "Ounahi.jpg", start: { x: 50, y: 31 } },
    { num: 23, name: "Bilal El Khannouss", short: "El Khannouss", line: "mid", role: "Left winger", club: "Stuttgart", at2022: false, photo: "Bilal El Khannouss.jpg", start: { x: 22, y: 29 } },
    { num: 11, name: "Ismael Saibari", short: "Saibari", line: "fwd", role: "Striker", club: "PSV", at2022: false, start: { x: 50, y: 13 } },

    // ---- Bench ----
    { num: 12, name: "Munir Mohamedi", short: "Munir", line: "gk", role: "Goalkeeper", club: "RS Berkane", at2022: true },
    { num: 22, name: "Reda Tagnaouti", short: "Tagnaouti", line: "gk", role: "Goalkeeper", club: "AS FAR", at2022: true },
    { num: 5, name: "Marwane Saadane", short: "Saadane", line: "def", role: "Centre-back", club: "Al-Fateh", at2022: false },
    { num: 13, name: "Zakaria El Ouahdi", short: "El Ouahdi", line: "def", role: "Right-back", club: "Genk", at2022: false },
    { num: 19, name: "Youssef Belammari", short: "Belammari", line: "def", role: "Centre-back", club: "Al Ahly", at2022: false },
    { num: 25, name: "Redouane Halhal", short: "Halhal", line: "def", role: "Centre-back", club: "KV Mechelen", at2022: false },
    { num: 26, name: "Anass Salah-Eddine", short: "Salah-Eddine", line: "def", role: "Left-back", club: "PSV", at2022: false },
    { num: 4, name: "Sofyan Amrabat", short: "Amrabat", line: "mid", role: "Defensive midfield", club: "Real Betis", at2022: true },
    { num: 15, name: "Samir El Mourabet", short: "El Mourabet", line: "mid", role: "Central midfield", club: "Strasbourg", at2022: false },
    { num: 7, name: "Chemsdine Talbi", short: "Talbi", line: "fwd", role: "Winger", club: "Sunderland", at2022: false },
    { num: 9, name: "Soufiane Rahimi", short: "Rahimi", line: "fwd", role: "Striker", club: "Al Ain", at2022: false },
    { num: 16, name: "Ayoub El Kaabi", short: "El Kaabi", line: "fwd", role: "Striker", club: "Olympiacos", at2022: false },
    { num: 17, name: "Hamza Igamane", short: "Igamane", line: "fwd", role: "Striker", club: "Lille", at2022: false },
    { num: 20, name: "Yassine Gessime", short: "Gessime", line: "fwd", role: "Forward", club: "Strasbourg", at2022: false },
    { num: 21, name: "Ayoube Amaimouni", short: "Amaimouni", line: "fwd", role: "Forward", club: "Eintracht Frankfurt", at2022: false },
  ],
};

const BRAZIL: TeamSquad = {
  teamId: "bra",
  // Most recent: vs Haiti (3–0) — a 4-3-3 with Matheus Cunha through the middle.
  formation: "4-3-3",
  players: [
    { num: 1, name: "Alisson", short: "Alisson", line: "gk", role: "Goalkeeper", club: "Liverpool", at2022: true, start: { x: 50, y: 90 } },
    { num: 13, name: "Danilo", short: "Danilo", line: "def", role: "Right-back", club: "Flamengo", at2022: true, start: { x: 84, y: 70 } },
    { num: 4, name: "Marquinhos", short: "Marquinhos", line: "def", role: "Centre-back", club: "PSG", at2022: true, captain: true, photo: "Marquinhos (Marcos Aoás Corrêa), PSG.JPG", start: { x: 62, y: 73 } },
    { num: 3, name: "Gabriel Magalhães", short: "Gabriel M.", line: "def", role: "Centre-back", club: "Arsenal", at2022: false, start: { x: 38, y: 73 } },
    { num: 6, name: "Alex Sandro", short: "A. Sandro", line: "def", role: "Left-back", club: "Flamengo", at2022: true, start: { x: 16, y: 70 } },
    { num: 5, name: "Casemiro", short: "Casemiro", line: "mid", role: "Defensive midfield", club: "Manchester United", at2022: true, photo: "Casemiro.jpg", start: { x: 50, y: 48 } },
    { num: 8, name: "Bruno Guimarães", short: "Bruno G.", line: "mid", role: "Central midfield", club: "Newcastle", at2022: true, start: { x: 30, y: 40 } },
    { num: 20, name: "Lucas Paquetá", short: "Paquetá", line: "mid", role: "Central midfield", club: "West Ham", at2022: true, start: { x: 70, y: 40 } },
    { num: 11, name: "Raphinha", short: "Raphinha", line: "fwd", role: "Right winger", club: "Barcelona", at2022: true, photo: "Raphinha (2025) (cropped).png", start: { x: 82, y: 18 } },
    { num: 9, name: "Matheus Cunha", short: "M. Cunha", line: "fwd", role: "Forward", club: "Manchester United", at2022: false, start: { x: 50, y: 13 } },
    { num: 7, name: "Vinícius Júnior", short: "Vini Jr", line: "fwd", role: "Left winger", club: "Real Madrid", at2022: true, photo: "Vinicius Jr 2021.jpg", start: { x: 18, y: 18 } },

    { num: 12, name: "Weverton", short: "Weverton", line: "gk", role: "Goalkeeper", club: "Palmeiras", at2022: true },
    { num: 23, name: "Ederson", short: "Ederson", line: "gk", role: "Goalkeeper", club: "Fenerbahçe", at2022: true },
    { num: 24, name: "Roger Ibañez", short: "Ibañez", line: "def", role: "Right-back", club: "Al-Ahli", at2022: false },
    { num: 16, name: "Douglas Santos", short: "D. Santos", line: "def", role: "Left-back", club: "Zenit", at2022: false },
    { num: 14, name: "Bremer", short: "Bremer", line: "def", role: "Centre-back", club: "Juventus", at2022: true },
    { num: 15, name: "Léo Pereira", short: "L. Pereira", line: "def", role: "Centre-back", club: "Flamengo", at2022: false },
    { num: 2, name: "Éderson", short: "Éderson", line: "mid", role: "Central midfield", club: "Atalanta", at2022: false },
    { num: 17, name: "Fabinho", short: "Fabinho", line: "mid", role: "Defensive midfield", club: "Al-Ittihad", at2022: true },
    { num: 18, name: "Danilo", short: "Danilo S.", line: "mid", role: "Central midfield", club: "Botafogo", at2022: false },
    { num: 10, name: "Neymar", short: "Neymar", line: "fwd", role: "Forward", club: "Santos", at2022: true, photo: "Neymar (cropped).jpg" },
    { num: 25, name: "Igor Thiago", short: "I. Thiago", line: "fwd", role: "Striker", club: "Brentford", at2022: false },
    { num: 19, name: "Endrick", short: "Endrick", line: "fwd", role: "Striker", club: "Real Madrid", at2022: false },
    { num: 21, name: "Luiz Henrique", short: "L. Henrique", line: "fwd", role: "Winger", club: "Zenit", at2022: false },
    { num: 22, name: "Gabriel Martinelli", short: "Martinelli", line: "fwd", role: "Winger", club: "Arsenal", at2022: true },
    { num: 26, name: "Rayan", short: "Rayan", line: "fwd", role: "Winger", club: "Vasco da Gama", at2022: false },
  ],
};

const NETHERLANDS: TeamSquad = {
  teamId: "ned",
  // Most recent: vs Sweden (5–1) — a 4-3-3, Brobbey leading the line. Numbers
  // from the match sheet; Jurriën Timber is out injured (Geertruida in).
  formation: "4-3-3",
  players: [
    { num: 1, name: "Bart Verbruggen", short: "Verbruggen", line: "gk", role: "Goalkeeper", club: "Brighton", at2022: false, start: { x: 50, y: 90 } },
    { num: 22, name: "Denzel Dumfries", short: "Dumfries", line: "def", role: "Right-back", club: "Inter Milan", at2022: true, start: { x: 84, y: 70 } },
    { num: 6, name: "Jan Paul van Hecke", short: "van Hecke", line: "def", role: "Centre-back", club: "Brighton", at2022: false, start: { x: 62, y: 73 } },
    { num: 4, name: "Virgil van Dijk", short: "van Dijk", line: "def", role: "Centre-back", club: "Liverpool", at2022: true, captain: true, photo: "LFC Parade 2019 01-Virgil van Dijk.jpg", start: { x: 38, y: 73 } },
    { num: 15, name: "Micky van de Ven", short: "van de Ven", line: "def", role: "Left-back", club: "Tottenham", at2022: false, start: { x: 16, y: 70 } },
    { num: 8, name: "Ryan Gravenberch", short: "Gravenberch", line: "mid", role: "Defensive midfield", club: "Liverpool", at2022: false, start: { x: 50, y: 48 } },
    { num: 21, name: "Frenkie de Jong", short: "de Jong", line: "mid", role: "Central midfield", club: "Barcelona", at2022: true, start: { x: 30, y: 40 } },
    { num: 14, name: "Tijjani Reijnders", short: "Reijnders", line: "mid", role: "Central midfield", club: "Manchester City", at2022: false, start: { x: 70, y: 40 } },
    { num: 11, name: "Cody Gakpo", short: "Gakpo", line: "fwd", role: "Left winger", club: "Liverpool", at2022: true, start: { x: 18, y: 18 } },
    { num: 19, name: "Brian Brobbey", short: "Brobbey", line: "fwd", role: "Striker", club: "Sunderland", at2022: false, start: { x: 50, y: 13 } },
    { num: 18, name: "Donyell Malen", short: "Malen", line: "fwd", role: "Right winger", club: "Aston Villa", at2022: false, start: { x: 82, y: 18 } },

    { num: 13, name: "Robin Roefs", short: "Roefs", line: "gk", role: "Goalkeeper", club: "Sunderland", at2022: false },
    { num: 23, name: "Mark Flekken", short: "Flekken", line: "gk", role: "Goalkeeper", club: "Bayer Leverkusen", at2022: false },
    { num: 2, name: "Lutsharel Geertruida", short: "Geertruida", line: "def", role: "Right-back", club: "Sunderland", at2022: false },
    { num: 5, name: "Nathan Aké", short: "Aké", line: "def", role: "Centre-back", club: "Manchester City", at2022: true },
    { num: 25, name: "Jorrel Hato", short: "Hato", line: "def", role: "Centre-back", club: "Chelsea", at2022: false },
    { num: 3, name: "Marten de Roon", short: "de Roon", line: "mid", role: "Defensive midfield", club: "Atalanta", at2022: true },
    { num: 12, name: "Mats Wieffer", short: "Wieffer", line: "mid", role: "Defensive midfield", club: "Brighton", at2022: false },
    { num: 20, name: "Teun Koopmeiners", short: "Koopmeiners", line: "mid", role: "Central midfield", club: "Juventus", at2022: true },
    { num: 16, name: "Quinten Timber", short: "Q. Timber", line: "mid", role: "Central midfield", club: "Feyenoord", at2022: false },
    { num: 17, name: "Guus Til", short: "Til", line: "mid", role: "Central midfield", club: "PSV", at2022: false },
    { num: 7, name: "Justin Kluivert", short: "Kluivert", line: "fwd", role: "Winger", club: "Bournemouth", at2022: false },
    { num: 10, name: "Memphis Depay", short: "Depay", line: "fwd", role: "Forward", club: "Corinthians", at2022: true, photo: "Memphis Depay.jpg" },
    { num: 9, name: "Wout Weghorst", short: "Weghorst", line: "fwd", role: "Striker", club: "Ajax", at2022: true },
    { num: 24, name: "Noa Lang", short: "Lang", line: "fwd", role: "Winger", club: "Napoli", at2022: true },
    { num: 26, name: "Crysencio Summerville", short: "Summerville", line: "fwd", role: "Winger", club: "West Ham", at2022: false },
  ],
};

const HAITI: TeamSquad = {
  teamId: "hai",
  // Opener vs Scotland (0–1): a 4-4-2.
  formation: "4-4-2",
  players: [
    { num: 1, name: "Johny Placide", short: "Placide", line: "gk", role: "Goalkeeper", club: "Bastia", at2022: false, captain: true, start: { x: 50, y: 90 } },
    { num: 2, name: "Carlens Arcus", short: "Arcus", line: "def", role: "Right-back", club: "Angers", at2022: false, start: { x: 84, y: 70 } },
    { num: 4, name: "Ricardo Adé", short: "Adé", line: "def", role: "Centre-back", club: "LDU Quito", at2022: false, start: { x: 62, y: 73 } },
    { num: 5, name: "Hannes Delcroix", short: "Delcroix", line: "def", role: "Centre-back", club: "Lugano", at2022: false, start: { x: 38, y: 73 } },
    { num: 8, name: "Martin Experience", short: "Experience", line: "def", role: "Left-back", club: "Nancy", at2022: false, start: { x: 16, y: 70 } },
    { num: 18, name: "Ruben Providence", short: "Providence", line: "mid", role: "Right midfield", club: "RWD Molenbeek", at2022: false, start: { x: 84, y: 44 } },
    { num: 17, name: "Danley Jean Jacques", short: "Jean Jacques", line: "mid", role: "Central midfield", club: "Philadelphia Union", at2022: false, start: { x: 58, y: 50 } },
    { num: 10, name: "Jean-Ricner Bellegarde", short: "Bellegarde", line: "mid", role: "Central midfield", club: "Wolves", at2022: false, start: { x: 38, y: 50 } },
    { num: 19, name: "Louicius Deedson", short: "Deedson", line: "mid", role: "Left midfield", club: "Famalicão", at2022: false, start: { x: 14, y: 44 } },
    { num: 11, name: "Frantzdy Pierrot", short: "Pierrot", line: "fwd", role: "Striker", club: "Gaziantep", at2022: false, start: { x: 62, y: 16 } },
    { num: 20, name: "Wilson Isidor", short: "Isidor", line: "fwd", role: "Striker", club: "Sunderland", at2022: false, start: { x: 38, y: 16 } },

    { num: 12, name: "Alexandre Pierre", short: "A. Pierre", line: "gk", role: "Goalkeeper", club: "Sochaux", at2022: false },
    { num: 23, name: "Josué Duverger", short: "Duverger", line: "gk", role: "Goalkeeper", club: "Cosmos Koblenz", at2022: false },
    { num: 3, name: "Keeto Thermoncy", short: "Thermoncy", line: "def", role: "Centre-back", club: "Young Boys", at2022: false },
    { num: 13, name: "Duke Lacroix", short: "Lacroix", line: "def", role: "Right-back", club: "Colorado Springs", at2022: false },
    { num: 22, name: "Jean-Kévin Duverne", short: "Duverne", line: "def", role: "Centre-back", club: "Gent", at2022: false },
    { num: 24, name: "Wilguens Paugain", short: "Paugain", line: "def", role: "Full-back", club: "Zulte Waregem", at2022: false },
    { num: 6, name: "Carl Sainté", short: "Sainté", line: "mid", role: "Central midfield", club: "El Paso", at2022: false },
    { num: 14, name: "Leverton Pierre", short: "L. Pierre", line: "mid", role: "Central midfield", club: "Vizela", at2022: false },
    { num: 25, name: "Dominique Simon", short: "D. Simon", line: "mid", role: "Central midfield", club: "Tatran Prešov", at2022: false },
    { num: 26, name: "Woodensky Pierre", short: "W. Pierre", line: "mid", role: "Midfielder", club: "Violette", at2022: false },
    { num: 7, name: "Derrick Etienne Jr", short: "Etienne", line: "fwd", role: "Winger", club: "Toronto FC", at2022: false },
    { num: 15, name: "Josué Casimir", short: "Casimir", line: "mid", role: "Left midfield", club: "Le Havre", at2022: false },
    { num: 16, name: "Yassin Fortuné", short: "Fortuné", line: "fwd", role: "Winger", club: "Le Havre", at2022: false },
    { num: 9, name: "Duckens Nazon", short: "Nazon", line: "fwd", role: "Striker", club: "Esteghlal", at2022: false },
    { num: 21, name: "Lenny Joseph", short: "L. Joseph", line: "fwd", role: "Striker", club: "Bordeaux", at2022: false },
  ],
};

const SWEDEN: TeamSquad = {
  teamId: "swe",
  // Most recent: vs Netherlands (1–5) — switched to a 3-5-2. Some bench
  // shirt numbers are best-effort pending the official list.
  formation: "3-5-2",
  players: [
    { num: 23, name: "Kristoffer Nordfeldt", short: "Nordfeldt", line: "gk", role: "Goalkeeper", club: "AIK", at2022: false, start: { x: 50, y: 90 } },
    { num: 2, name: "Gustaf Lagerbielke", short: "Lagerbielke", line: "def", role: "Centre-back", club: "Braga", at2022: false, start: { x: 28, y: 75 } },
    { num: 4, name: "Isak Hien", short: "Hien", line: "def", role: "Centre-back", club: "Atalanta", at2022: false, start: { x: 50, y: 77 } },
    { num: 3, name: "Victor Lindelöf", short: "Lindelöf", line: "def", role: "Centre-back", club: "Aston Villa", at2022: false, captain: true, start: { x: 72, y: 75 } },
    { num: 5, name: "Gabriel Gudmundsson", short: "Gudmundsson", line: "def", role: "Left wing-back", club: "Leeds United", at2022: false, start: { x: 11, y: 52 } },
    { num: 22, name: "Alexander Bernhardsson", short: "Bernhardsson", line: "mid", role: "Right wing-back", club: "Brann", at2022: false, start: { x: 89, y: 52 } },
    { num: 16, name: "Jesper Karlström", short: "Karlström", line: "mid", role: "Defensive midfield", club: "Udinese", at2022: false, start: { x: 50, y: 50 } },
    { num: 17, name: "Benjamin Nygren", short: "Nygren", line: "mid", role: "Central midfield", club: "Celtic", at2022: false, start: { x: 30, y: 40 } },
    { num: 18, name: "Yasin Ayari", short: "Ayari", line: "mid", role: "Central midfield", club: "Brighton", at2022: false, start: { x: 70, y: 40 } },
    { num: 11, name: "Alexander Isak", short: "Isak", line: "fwd", role: "Striker", club: "Liverpool", at2022: false, photo: "Alexander Isak (training 2016, cropped 3).jpg", start: { x: 62, y: 15 } },
    { num: 9, name: "Viktor Gyökeres", short: "Gyökeres", line: "fwd", role: "Striker", club: "Arsenal", at2022: false, photo: "Viktor Gyökeres 2018.jpg", start: { x: 38, y: 15 } },

    { num: 1, name: "Jacob Widell Zetterström", short: "Zetterström", line: "gk", role: "Goalkeeper", club: "Derby County", at2022: false },
    { num: 12, name: "Viktor Johansson", short: "V. Johansson", line: "gk", role: "Goalkeeper", club: "Stoke City", at2022: false },
    { num: 6, name: "Herman Johansson", short: "H. Johansson", line: "def", role: "Right-back", club: "FC Dallas", at2022: false },
    { num: 8, name: "Daniel Svensson", short: "Svensson", line: "def", role: "Left-back", club: "Borussia Dortmund", at2022: false },
    { num: 14, name: "Hjalmar Ekdal", short: "Ekdal", line: "def", role: "Centre-back", club: "Burnley", at2022: false },
    { num: 15, name: "Carl Starfelt", short: "Starfelt", line: "def", role: "Centre-back", club: "Celta Vigo", at2022: false },
    { num: 20, name: "Eric Smith", short: "E. Smith", line: "def", role: "Centre-back", club: "St. Pauli", at2022: false },
    { num: 24, name: "Elliot Stroud", short: "Stroud", line: "def", role: "Full-back", club: "Mjällby", at2022: false },
    { num: 7, name: "Lucas Bergvall", short: "Bergvall", line: "mid", role: "Central midfield", club: "Tottenham", at2022: false },
    { num: 13, name: "Ken Sema", short: "Sema", line: "mid", role: "Winger", club: "Pafos", at2022: false },
    { num: 10, name: "Mattias Svanberg", short: "Svanberg", line: "mid", role: "Central midfield", club: "Wolfsburg", at2022: false },
    { num: 25, name: "Besfort Zeneli", short: "Zeneli", line: "mid", role: "Winger", club: "Rosenborg", at2022: false },
    { num: 21, name: "Anthony Elanga", short: "Elanga", line: "fwd", role: "Winger", club: "Newcastle", at2022: false },
    { num: 19, name: "Gustaf Nilsson", short: "G. Nilsson", line: "fwd", role: "Striker", club: "Club Brugge", at2022: false },
    { num: 26, name: "Taha Ali", short: "Taha Ali", line: "fwd", role: "Winger", club: "Sirius", at2022: false },
  ],
};

const GERMANY: TeamSquad = {
  teamId: "ger",
  // Opener vs Curaçao (7–1): a 4-2-3-1. Some bench shirt numbers best-effort.
  formation: "4-2-3-1",
  players: [
    { num: 1, name: "Manuel Neuer", short: "Neuer", line: "gk", role: "Goalkeeper", club: "Bayern Munich", at2022: true, start: { x: 50, y: 90 } },
    { num: 6, name: "Joshua Kimmich", short: "Kimmich", line: "def", role: "Right-back", club: "Bayern Munich", at2022: true, captain: true, start: { x: 84, y: 70 } },
    { num: 4, name: "Jonathan Tah", short: "Tah", line: "def", role: "Centre-back", club: "Bayern Munich", at2022: false, start: { x: 62, y: 73 } },
    { num: 15, name: "Nico Schlotterbeck", short: "Schlotterbeck", line: "def", role: "Centre-back", club: "Borussia Dortmund", at2022: true, start: { x: 38, y: 73 } },
    { num: 5, name: "Nathaniel Brown", short: "Brown", line: "def", role: "Left-back", club: "Eintracht Frankfurt", at2022: false, start: { x: 16, y: 70 } },
    { num: 8, name: "Aleksandar Pavlović", short: "Pavlović", line: "mid", role: "Defensive midfield", club: "Bayern Munich", at2022: false, start: { x: 64, y: 50 } },
    { num: 14, name: "Felix Nmecha", short: "Nmecha", line: "mid", role: "Central midfield", club: "Borussia Dortmund", at2022: false, start: { x: 36, y: 50 } },
    { num: 19, name: "Leroy Sané", short: "Sané", line: "fwd", role: "Right winger", club: "Galatasaray", at2022: true, start: { x: 78, y: 29 } },
    { num: 10, name: "Jamal Musiala", short: "Musiala", line: "mid", role: "Attacking midfield", club: "Bayern Munich", at2022: true, photo: "Jamal Musiala 2022 (cropped).jpg", start: { x: 50, y: 31 } },
    { num: 17, name: "Florian Wirtz", short: "Wirtz", line: "fwd", role: "Left winger", club: "Liverpool", at2022: false, photo: "Florian Wirtz, 2022-07-31, Saisoneröffnung Bayer 04, Leverkusen (1) (cropped).jpg", start: { x: 22, y: 29 } },
    { num: 7, name: "Kai Havertz", short: "Havertz", line: "fwd", role: "Striker", club: "Arsenal", at2022: true, photo: "Kai-Havertz-August-2018.jpg", start: { x: 50, y: 13 } },

    { num: 12, name: "Oliver Baumann", short: "Baumann", line: "gk", role: "Goalkeeper", club: "Hoffenheim", at2022: false },
    { num: 21, name: "Alexander Nübel", short: "Nübel", line: "gk", role: "Goalkeeper", club: "Stuttgart", at2022: false },
    { num: 2, name: "Antonio Rüdiger", short: "Rüdiger", line: "def", role: "Centre-back", club: "Real Madrid", at2022: true },
    { num: 3, name: "Waldemar Anton", short: "Anton", line: "def", role: "Centre-back", club: "Borussia Dortmund", at2022: false },
    { num: 22, name: "David Raum", short: "Raum", line: "def", role: "Left-back", club: "RB Leipzig", at2022: true },
    { num: 24, name: "Malick Thiaw", short: "Thiaw", line: "def", role: "Centre-back", club: "Newcastle", at2022: false },
    { num: 13, name: "Pascal Groß", short: "Groß", line: "mid", role: "Central midfield", club: "Borussia Dortmund", at2022: false },
    { num: 16, name: "Nadiem Amiri", short: "Amiri", line: "mid", role: "Central midfield", club: "Mainz", at2022: false },
    { num: 18, name: "Leon Goretzka", short: "Goretzka", line: "mid", role: "Central midfield", club: "Bayern Munich", at2022: true },
    { num: 20, name: "Angelo Stiller", short: "Stiller", line: "mid", role: "Defensive midfield", club: "Stuttgart", at2022: false },
    { num: 9, name: "Jamie Leweling", short: "Leweling", line: "fwd", role: "Winger", club: "Stuttgart", at2022: false },
    { num: 11, name: "Nick Woltemade", short: "Woltemade", line: "fwd", role: "Striker", club: "Newcastle", at2022: false },
    { num: 23, name: "Maximilian Beier", short: "Beier", line: "fwd", role: "Forward", club: "Borussia Dortmund", at2022: false },
    { num: 25, name: "Assan Ouédraogo", short: "Ouédraogo", line: "mid", role: "Central midfield", club: "RB Leipzig", at2022: false },
    { num: 26, name: "Deniz Undav", short: "Undav", line: "fwd", role: "Striker", club: "Stuttgart", at2022: false },
  ],
};

const PARAGUAY: TeamSquad = {
  teamId: "par",
  // Most recent: vs Türkiye (1–0) — a 4-4-2. Some bench numbers best-effort.
  formation: "4-4-2",
  players: [
    { num: 12, name: "Orlando Gill", short: "Gill", line: "gk", role: "Goalkeeper", club: "San Lorenzo", at2022: false, start: { x: 50, y: 90 } },
    { num: 4, name: "Juan José Cáceres", short: "Cáceres", line: "def", role: "Right-back", club: "Dynamo Moscow", at2022: false, start: { x: 84, y: 70 } },
    { num: 15, name: "Gustavo Gómez", short: "G. Gómez", line: "def", role: "Centre-back", club: "Palmeiras", at2022: false, captain: true, start: { x: 62, y: 73 } },
    { num: 3, name: "Omar Alderete", short: "Alderete", line: "def", role: "Centre-back", club: "Sunderland", at2022: false, start: { x: 38, y: 73 } },
    { num: 6, name: "Junior Alonso", short: "Alonso", line: "def", role: "Left-back", club: "Atlético Mineiro", at2022: false, start: { x: 16, y: 70 } },
    { num: 8, name: "Diego Gómez", short: "D. Gómez", line: "mid", role: "Right midfield", club: "Brighton", at2022: false, start: { x: 84, y: 44 } },
    { num: 14, name: "Andrés Cubas", short: "Cubas", line: "mid", role: "Central midfield", club: "Vancouver Whitecaps", at2022: false, start: { x: 58, y: 50 } },
    { num: 16, name: "Damián Bobadilla", short: "Bobadilla", line: "mid", role: "Central midfield", club: "São Paulo", at2022: false, start: { x: 38, y: 50 } },
    { num: 10, name: "Miguel Almirón", short: "Almirón", line: "mid", role: "Left midfield", club: "Atlanta United", at2022: false, start: { x: 14, y: 44 } },
    { num: 19, name: "Julio Enciso", short: "Enciso", line: "fwd", role: "Forward", club: "Brighton", at2022: false, start: { x: 62, y: 16 } },
    { num: 9, name: "Antonio Sanabria", short: "Sanabria", line: "fwd", role: "Striker", club: "Cremonese", at2022: false, start: { x: 38, y: 16 } },

    { num: 1, name: "Roberto Fernández", short: "Gatito", line: "gk", role: "Goalkeeper", club: "Cerro Porteño", at2022: false },
    { num: 22, name: "Gastón Olveira", short: "Olveira", line: "gk", role: "Goalkeeper", club: "Olimpia", at2022: false },
    { num: 2, name: "Gustavo Velázquez", short: "Velázquez", line: "def", role: "Centre-back", club: "Cerro Porteño", at2022: false },
    { num: 5, name: "Fabián Balbuena", short: "Balbuena", line: "def", role: "Centre-back", club: "Grêmio", at2022: false },
    { num: 13, name: "José Canale", short: "Canale", line: "def", role: "Centre-back", club: "Lanús", at2022: false },
    { num: 24, name: "Robert Rojas", short: "R. Rojas", line: "def", role: "Right-back", club: "Vélez Sarsfield", at2022: false },
    { num: 7, name: "Ramón Sosa", short: "Sosa", line: "mid", role: "Winger", club: "Nottingham Forest", at2022: false },
    { num: 20, name: "Braian Ojeda", short: "Ojeda", line: "mid", role: "Central midfield", club: "Orlando City", at2022: false },
    { num: 23, name: "Matías Galarza", short: "Galarza", line: "mid", role: "Central midfield", club: "Atlanta United", at2022: false },
    { num: 11, name: "Diego González", short: "D. González", line: "mid", role: "Winger", club: "Lanús", at2022: false },
    { num: 17, name: "Alejandro Romero", short: "Kaku", line: "mid", role: "Attacking midfield", club: "Always Ready", at2022: false },
    { num: 18, name: "Ramón Martínez", short: "Martínez", line: "def", role: "Centre-back", club: "Cerro Porteño", at2022: false },
    { num: 21, name: "Adam Bareiro", short: "Bareiro", line: "fwd", role: "Striker", club: "River Plate", at2022: false },
    { num: 25, name: "Alex Arce", short: "Arce", line: "fwd", role: "Striker", club: "LDU Quito", at2022: false },
    { num: 26, name: "Alexandro Maidana", short: "Maidana", line: "def", role: "Full-back", club: "Talleres", at2022: false },
  ],
};

const TURKIYE: TeamSquad = {
  teamId: "tur",
  // Most recent: vs Paraguay (0–1) — a 4-2-3-1. Numbers from the match sheet.
  formation: "4-2-3-1",
  players: [
    { num: 23, name: "Uğurcan Çakır", short: "Çakır", line: "gk", role: "Goalkeeper", club: "Galatasaray", at2022: false, start: { x: 50, y: 90 } },
    { num: 2, name: "Zeki Çelik", short: "Çelik", line: "def", role: "Right-back", club: "Roma", at2022: false, start: { x: 84, y: 70 } },
    { num: 3, name: "Merih Demiral", short: "Demiral", line: "def", role: "Centre-back", club: "Al-Ahli", at2022: false, start: { x: 62, y: 73 } },
    { num: 14, name: "Abdülkerim Bardakcı", short: "Bardakcı", line: "def", role: "Centre-back", club: "Galatasaray", at2022: false, start: { x: 38, y: 73 } },
    { num: 20, name: "Ferdi Kadıoğlu", short: "Kadıoğlu", line: "def", role: "Left-back", club: "Brighton", at2022: false, start: { x: 16, y: 70 } },
    { num: 16, name: "İsmail Yüksek", short: "Yüksek", line: "mid", role: "Defensive midfield", club: "Fenerbahçe", at2022: false, start: { x: 64, y: 50 } },
    { num: 10, name: "Hakan Çalhanoğlu", short: "Çalhanoğlu", line: "mid", role: "Central midfield", club: "Inter Milan", at2022: false, captain: true, photo: "Hakan Calhanoglu 2014.jpg", start: { x: 36, y: 50 } },
    { num: 8, name: "Arda Güler", short: "Güler", line: "mid", role: "Right winger", club: "Real Madrid", at2022: false, photo: "Arda Güler (2021-22 Süper Lig) - Resim3 (cropped).png", start: { x: 78, y: 29 } },
    { num: 6, name: "Orkun Kökçü", short: "Kökçü", line: "mid", role: "Attacking midfield", club: "Beşiktaş", at2022: false, start: { x: 50, y: 31 } },
    { num: 11, name: "Kenan Yıldız", short: "Yıldız", line: "fwd", role: "Left winger", club: "Juventus", at2022: false, start: { x: 22, y: 29 } },
    { num: 19, name: "Deniz Gül", short: "Gül", line: "fwd", role: "Striker", club: "Porto", at2022: false, start: { x: 50, y: 13 } },

    { num: 1, name: "Mert Günok", short: "Günok", line: "gk", role: "Goalkeeper", club: "Beşiktaş", at2022: false },
    { num: 12, name: "Altay Bayındır", short: "Bayındır", line: "gk", role: "Goalkeeper", club: "Manchester United", at2022: false },
    { num: 5, name: "Kaan Ayhan", short: "Ayhan", line: "def", role: "Centre-back", club: "Galatasaray", at2022: false },
    { num: 4, name: "Samet Akaydın", short: "Akaydın", line: "def", role: "Centre-back", club: "Panathinaikos", at2022: false },
    { num: 18, name: "Mert Müldür", short: "Müldür", line: "def", role: "Right-back", club: "Fenerbahçe", at2022: false },
    { num: 21, name: "Eren Elmalı", short: "Elmalı", line: "def", role: "Left-back", club: "Galatasaray", at2022: false },
    { num: 13, name: "Salih Özcan", short: "Özcan", line: "mid", role: "Defensive midfield", club: "Borussia Dortmund", at2022: false },
    { num: 17, name: "Yunus Akgün", short: "Akgün", line: "mid", role: "Winger", club: "Galatasaray", at2022: false },
    { num: 7, name: "Kerem Aktürkoğlu", short: "Aktürkoğlu", line: "fwd", role: "Winger", club: "Fenerbahçe", at2022: false },
    { num: 9, name: "Barış Alper Yılmaz", short: "Barış", line: "fwd", role: "Winger", club: "Galatasaray", at2022: false },
    { num: 15, name: "İrfan Can Kahveci", short: "Kahveci", line: "mid", role: "Attacking midfield", club: "Fenerbahçe", at2022: false },
    { num: 22, name: "Can Uzun", short: "Uzun", line: "fwd", role: "Forward", club: "Eintracht Frankfurt", at2022: false },
    { num: 24, name: "Oğuz Aydın", short: "Aydın", line: "fwd", role: "Winger", club: "Fenerbahçe", at2022: false },
    { num: 25, name: "Yusuf Yazıcı", short: "Yazıcı", line: "mid", role: "Attacking midfield", club: "Hull City", at2022: false },
    { num: 26, name: "Bertuğ Yıldırım", short: "Yıldırım", line: "fwd", role: "Striker", club: "Rennes", at2022: false },
  ],
};

const IVORY_COAST: TeamSquad = {
  teamId: "civ",
  // Most recent: vs Germany (1–2) — a 4-3-3 (Kossounou, Oulaï, Bonny, Amad,
  // Yan Diomandé in). Some shirt numbers best-effort.
  formation: "4-3-3",
  players: [
    { num: 1, name: "Yahia Fofana", short: "Fofana", line: "gk", role: "Goalkeeper", club: "Çaykur Rizespor", at2022: false, start: { x: 50, y: 90 } },
    { num: 5, name: "Wilfried Singo", short: "Singo", line: "def", role: "Right-back", club: "Monaco", at2022: false, start: { x: 84, y: 70 } },
    { num: 7, name: "Odilon Kossounou", short: "Kossounou", line: "def", role: "Centre-back", club: "Atalanta", at2022: false, start: { x: 62, y: 73 } },
    { num: 6, name: "Emmanuel Agbadou", short: "Agbadou", line: "def", role: "Centre-back", club: "Wolves", at2022: false, start: { x: 38, y: 73 } },
    { num: 3, name: "Ghislain Konan", short: "Konan", line: "def", role: "Left-back", club: "Al-Ittihad", at2022: false, start: { x: 16, y: 70 } },
    { num: 18, name: "Ibrahim Sangaré", short: "Sangaré", line: "mid", role: "Defensive midfield", club: "Nottingham Forest", at2022: false, start: { x: 50, y: 48 } },
    { num: 8, name: "Franck Kessié", short: "Kessié", line: "mid", role: "Central midfield", club: "Al-Ahli", at2022: false, captain: true, start: { x: 30, y: 40 } },
    { num: 14, name: "Christ Inao Oulaï", short: "Oulaï", line: "mid", role: "Central midfield", club: "Hoffenheim", at2022: false, start: { x: 70, y: 40 } },
    { num: 15, name: "Amad Diallo", short: "Amad", line: "fwd", role: "Right winger", club: "Manchester United", at2022: false, start: { x: 82, y: 18 } },
    { num: 26, name: "Ange-Yoan Bonny", short: "Bonny", line: "fwd", role: "Striker", club: "Inter Milan", at2022: false, start: { x: 50, y: 13 } },
    { num: 10, name: "Yan Diomandé", short: "Y. Diomandé", line: "fwd", role: "Left winger", club: "RB Leipzig", at2022: false, start: { x: 18, y: 18 } },

    { num: 16, name: "Mohamed Koné", short: "M. Koné", line: "gk", role: "Goalkeeper", club: "Stade Tunisien", at2022: false },
    { num: 23, name: "Alban Lafont", short: "Lafont", line: "gk", role: "Goalkeeper", club: "Nantes", at2022: false },
    { num: 2, name: "Ousmane Diomande", short: "Diomande", line: "def", role: "Centre-back", club: "Sporting CP", at2022: false },
    { num: 17, name: "Guéla Doué", short: "Doué", line: "def", role: "Right-back", club: "Strasbourg", at2022: false },
    { num: 21, name: "Evan Ndicka", short: "Ndicka", line: "def", role: "Centre-back", club: "Roma", at2022: false },
    { num: 12, name: "Christopher Operi", short: "Operi", line: "def", role: "Left-back", club: "Le Havre", at2022: false },
    { num: 13, name: "Seko Fofana", short: "S. Fofana", line: "mid", role: "Central midfield", club: "Al-Nassr", at2022: false },
    { num: 4, name: "Jean-Michaël Seri", short: "Seri", line: "mid", role: "Central midfield", club: "Al-Gharafa", at2022: false },
    { num: 20, name: "Parfait Guiagon", short: "Guiagon", line: "mid", role: "Attacking midfield", club: "Le Havre", at2022: false },
    { num: 11, name: "Simon Adingra", short: "Adingra", line: "fwd", role: "Winger", club: "Sunderland", at2022: false },
    { num: 9, name: "Evann Guessand", short: "Guessand", line: "fwd", role: "Striker", club: "Aston Villa", at2022: false },
    { num: 19, name: "Nicolas Pépé", short: "Pépé", line: "fwd", role: "Winger", club: "Villarreal", at2022: false },
    { num: 22, name: "Oumar Diakité", short: "Diakité", line: "fwd", role: "Striker", club: "Reims", at2022: false },
    { num: 24, name: "Bazoumana Touré", short: "B. Touré", line: "fwd", role: "Winger", club: "Salzburg", at2022: false },
    { num: 25, name: "Elye Wahi", short: "Wahi", line: "fwd", role: "Striker", club: "Eintracht Frankfurt", at2022: false },
  ],
};

const BELGIUM: TeamSquad = {
  teamId: "bel",
  // Opener vs Egypt (1–1): a 4-2-3-1. Some shirt numbers best-effort.
  formation: "4-2-3-1",
  players: [
    { num: 1, name: "Thibaut Courtois", short: "Courtois", line: "gk", role: "Goalkeeper", club: "Real Madrid", at2022: true, start: { x: 50, y: 90 } },
    { num: 15, name: "Thomas Meunier", short: "Meunier", line: "def", role: "Right-back", club: "Lille", at2022: true, start: { x: 84, y: 70 } },
    { num: 4, name: "Brandon Mechele", short: "Mechele", line: "def", role: "Centre-back", club: "Club Brugge", at2022: false, start: { x: 62, y: 73 } },
    { num: 21, name: "Timothy Castagne", short: "Castagne", line: "def", role: "Centre-back", club: "Fulham", at2022: true, start: { x: 38, y: 73 } },
    { num: 24, name: "Nathan Ngoy", short: "Ngoy", line: "def", role: "Left-back", club: "Lille", at2022: false, start: { x: 16, y: 70 } },
    { num: 8, name: "Youri Tielemans", short: "Tielemans", line: "mid", role: "Defensive midfield", club: "Aston Villa", at2022: true, start: { x: 64, y: 50 } },
    { num: 20, name: "Amadou Onana", short: "Onana", line: "mid", role: "Defensive midfield", club: "Aston Villa", at2022: true, start: { x: 36, y: 50 } },
    { num: 22, name: "Jérémy Doku", short: "Doku", line: "fwd", role: "Right winger", club: "Manchester City", at2022: true, start: { x: 78, y: 29 } },
    { num: 7, name: "Kevin De Bruyne", short: "De Bruyne", line: "mid", role: "Attacking midfield", club: "Napoli", at2022: true, captain: true, photo: "Kevin De Bruyne.jpg", start: { x: 50, y: 31 } },
    { num: 11, name: "Leandro Trossard", short: "Trossard", line: "fwd", role: "Left winger", club: "Arsenal", at2022: true, start: { x: 22, y: 29 } },
    { num: 9, name: "Charles De Ketelaere", short: "De Ketelaere", line: "fwd", role: "Striker", club: "Atalanta", at2022: true, start: { x: 50, y: 13 } },

    { num: 12, name: "Senne Lammens", short: "Lammens", line: "gk", role: "Goalkeeper", club: "Manchester United", at2022: false },
    { num: 23, name: "Mike Penders", short: "Penders", line: "gk", role: "Goalkeeper", club: "Strasbourg", at2022: false },
    { num: 2, name: "Zeno Debast", short: "Debast", line: "def", role: "Centre-back", club: "Sporting CP", at2022: false },
    { num: 3, name: "Arthur Theate", short: "Theate", line: "def", role: "Centre-back", club: "Eintracht Frankfurt", at2022: true },
    { num: 5, name: "Koni De Winter", short: "De Winter", line: "def", role: "Centre-back", club: "AC Milan", at2022: false },
    { num: 17, name: "Maxim De Cuyper", short: "De Cuyper", line: "def", role: "Left-back", club: "Brighton", at2022: false },
    { num: 13, name: "Joaquin Seys", short: "Seys", line: "def", role: "Right-back", club: "Club Brugge", at2022: false },
    { num: 6, name: "Nicolas Raskin", short: "Raskin", line: "mid", role: "Central midfield", club: "Rangers", at2022: false },
    { num: 14, name: "Hans Vanaken", short: "Vanaken", line: "mid", role: "Central midfield", club: "Club Brugge", at2022: true },
    { num: 18, name: "Axel Witsel", short: "Witsel", line: "mid", role: "Defensive midfield", club: "Girona", at2022: true },
    { num: 10, name: "Romelu Lukaku", short: "Lukaku", line: "fwd", role: "Striker", club: "Napoli", at2022: true },
    { num: 16, name: "Dodi Lukebakio", short: "Lukebakio", line: "fwd", role: "Winger", club: "Benfica", at2022: false },
    { num: 19, name: "Alexis Saelemaekers", short: "Saelemaekers", line: "fwd", role: "Winger", club: "AC Milan", at2022: false },
    { num: 25, name: "Matías Fernández-Pardo", short: "Fdez-Pardo", line: "fwd", role: "Winger", club: "Lille", at2022: false },
    { num: 26, name: "Diego Moreira", short: "Moreira", line: "fwd", role: "Winger", club: "Strasbourg", at2022: false },
  ],
};

const IRAN: TeamSquad = {
  teamId: "irn",
  // Opener vs New Zealand (2–2): a 4-2-3-1. Some shirt numbers best-effort.
  formation: "4-2-3-1",
  players: [
    { num: 1, name: "Alireza Beiranvand", short: "Beiranvand", line: "gk", role: "Goalkeeper", club: "Tractor", at2022: true, start: { x: 50, y: 90 } },
    { num: 13, name: "Saleh Hardani", short: "Hardani", line: "def", role: "Right-back", club: "Esteghlal", at2022: false, start: { x: 84, y: 70 } },
    { num: 19, name: "Shoja Khalilzadeh", short: "Khalilzadeh", line: "def", role: "Centre-back", club: "Tractor", at2022: false, start: { x: 62, y: 73 } },
    { num: 8, name: "Hossein Kanaani", short: "Kanaani", line: "def", role: "Centre-back", club: "Persepolis", at2022: false, start: { x: 38, y: 73 } },
    { num: 5, name: "Milad Mohammadi", short: "Mohammadi", line: "def", role: "Left-back", club: "Persepolis", at2022: true, start: { x: 16, y: 70 } },
    { num: 6, name: "Saeid Ezatolahi", short: "Ezatolahi", line: "mid", role: "Defensive midfield", club: "Shabab Al-Ahli", at2022: true, start: { x: 64, y: 50 } },
    { num: 21, name: "Saman Ghoddos", short: "Ghoddos", line: "mid", role: "Central midfield", club: "Al-Kalba", at2022: true, start: { x: 36, y: 50 } },
    { num: 7, name: "Alireza Jahanbakhsh", short: "Jahanbakhsh", line: "fwd", role: "Right winger", club: "Dender", at2022: true, start: { x: 78, y: 29 } },
    { num: 18, name: "Mehdi Ghaedi", short: "Ghaedi", line: "mid", role: "Attacking midfield", club: "Al-Nasr", at2022: false, start: { x: 50, y: 31 } },
    { num: 11, name: "Mohammad Mohebi", short: "Mohebi", line: "fwd", role: "Left winger", club: "Rostov", at2022: false, start: { x: 22, y: 29 } },
    { num: 9, name: "Mehdi Taremi", short: "Taremi", line: "fwd", role: "Striker", club: "Olympiacos", at2022: true, captain: true, start: { x: 50, y: 13 } },

    { num: 12, name: "Hossein Hosseini", short: "Hosseini", line: "gk", role: "Goalkeeper", club: "Sepahan", at2022: false },
    { num: 22, name: "Payam Niazmand", short: "Niazmand", line: "gk", role: "Goalkeeper", club: "Persepolis", at2022: false },
    { num: 3, name: "Ehsan Hajsafi", short: "Hajsafi", line: "def", role: "Left-back", club: "Sepahan", at2022: true },
    { num: 2, name: "Ramin Rezaeian", short: "Rezaeian", line: "def", role: "Right-back", club: "Foolad", at2022: true },
    { num: 4, name: "Omid Noorafkan", short: "Noorafkan", line: "def", role: "Left-back", club: "Foolad", at2022: false },
    { num: 15, name: "Danial Eiri", short: "Eiri", line: "def", role: "Full-back", club: "Malavan", at2022: false },
    { num: 23, name: "Ali Nemati", short: "Nemati", line: "def", role: "Centre-back", club: "Persepolis", at2022: false },
    { num: 14, name: "Rouzbeh Cheshmi", short: "Cheshmi", line: "mid", role: "Defensive midfield", club: "Esteghlal", at2022: true },
    { num: 16, name: "Mehdi Torabi", short: "Torabi", line: "mid", role: "Attacking midfield", club: "Tractor", at2022: true },
    { num: 17, name: "Mohammad Ghorbani", short: "Ghorbani", line: "mid", role: "Central midfield", club: "Al-Wahda", at2022: false },
    { num: 25, name: "Aria Yousefi", short: "Yousefi", line: "mid", role: "Central midfield", club: "Sepahan", at2022: false },
    { num: 10, name: "Ali Alipour", short: "Alipour", line: "fwd", role: "Striker", club: "Persepolis", at2022: false },
    { num: 20, name: "Amirhossein Hosseinzadeh", short: "Hosseinzadeh", line: "fwd", role: "Winger", club: "Tractor", at2022: false },
    { num: 24, name: "Shahriyar Moghanlou", short: "Moghanlou", line: "fwd", role: "Striker", club: "Al-Kalba", at2022: false },
    { num: 26, name: "Amir Razzaghnia", short: "Razzaghnia", line: "fwd", role: "Winger", club: "Esteghlal", at2022: false },
  ],
};

const URUGUAY: TeamSquad = {
  teamId: "uru",
  // Opener vs Saudi Arabia (1–1): a 4-4-2. Some shirt numbers best-effort.
  formation: "4-4-2",
  players: [
    { num: 1, name: "Fernando Muslera", short: "Muslera", line: "gk", role: "Goalkeeper", club: "Estudiantes", at2022: true, start: { x: 50, y: 90 } },
    { num: 22, name: "Guillermo Varela", short: "Varela", line: "def", role: "Right-back", club: "Flamengo", at2022: true, start: { x: 84, y: 70 } },
    { num: 2, name: "Sebastián Cáceres", short: "S. Cáceres", line: "def", role: "Centre-back", club: "América", at2022: false, start: { x: 62, y: 73 } },
    { num: 17, name: "Mathías Olivera", short: "Olivera", line: "def", role: "Centre-back", club: "Napoli", at2022: true, start: { x: 38, y: 73 } },
    { num: 4, name: "Matías Viña", short: "Viña", line: "def", role: "Left-back", club: "Flamengo", at2022: false, start: { x: 16, y: 70 } },
    { num: 15, name: "Federico Valverde", short: "Valverde", line: "mid", role: "Right midfield", club: "Real Madrid", at2022: true, captain: true, start: { x: 84, y: 44 } },
    { num: 5, name: "Manuel Ugarte", short: "Ugarte", line: "mid", role: "Central midfield", club: "Manchester United", at2022: true, start: { x: 58, y: 50 } },
    { num: 6, name: "Rodrigo Bentancur", short: "Bentancur", line: "mid", role: "Central midfield", club: "Tottenham", at2022: true, start: { x: 38, y: 50 } },
    { num: 11, name: "Maximiliano Araújo", short: "M. Araújo", line: "mid", role: "Left midfield", club: "Portland Timbers", at2022: false, start: { x: 14, y: 44 } },
    { num: 21, name: "Federico Viñas", short: "Viñas", line: "fwd", role: "Striker", club: "León", at2022: false, start: { x: 62, y: 16 } },
    { num: 19, name: "Darwin Núñez", short: "Núñez", line: "fwd", role: "Striker", club: "Al-Hilal", at2022: true, start: { x: 38, y: 16 } },

    { num: 23, name: "Sergio Rochet", short: "Rochet", line: "gk", role: "Goalkeeper", club: "Inter Miami", at2022: true },
    { num: 12, name: "Santiago Mele", short: "Mele", line: "gk", role: "Goalkeeper", club: "Junior", at2022: false },
    { num: 3, name: "José María Giménez", short: "Giménez", line: "def", role: "Centre-back", club: "Atlético Madrid", at2022: true },
    { num: 13, name: "Santiago Bueno", short: "Bueno", line: "def", role: "Centre-back", club: "Wolves", at2022: false },
    { num: 16, name: "Joaquín Piquerez", short: "Piquerez", line: "def", role: "Left-back", club: "Palmeiras", at2022: false },
    { num: 8, name: "Nicolás de la Cruz", short: "de la Cruz", line: "mid", role: "Attacking midfield", club: "Flamengo", at2022: true },
    { num: 10, name: "Giorgian de Arrascaeta", short: "de Arrascaeta", line: "mid", role: "Attacking midfield", club: "Flamengo", at2022: true },
    { num: 7, name: "Facundo Pellistri", short: "Pellistri", line: "mid", role: "Winger", club: "Panathinaikos", at2022: true },
    { num: 14, name: "Emiliano Martínez", short: "E. Martínez", line: "mid", role: "Central midfield", club: "Sporting CP", at2022: false },
    { num: 20, name: "Agustín Canobbio", short: "Canobbio", line: "fwd", role: "Winger", club: "Fortaleza", at2022: true },
    { num: 18, name: "Brian Rodríguez", short: "B. Rodríguez", line: "fwd", role: "Winger", club: "América", at2022: false },
    { num: 9, name: "Rodrigo Aguirre", short: "Aguirre", line: "fwd", role: "Striker", club: "América", at2022: false },
    { num: 24, name: "Cristian Olivera", short: "C. Olivera", line: "fwd", role: "Winger", club: "Los Angeles FC", at2022: false },
    { num: 25, name: "Rodrigo Zalazar", short: "Zalazar", line: "mid", role: "Attacking midfield", club: "Braga", at2022: false },
    { num: 26, name: "Kevin Amaro", short: "Amaro", line: "def", role: "Right-back", club: "Nacional", at2022: false },
  ],
};

const SAUDI_ARABIA: TeamSquad = {
  teamId: "ksa",
  // Opener vs Uruguay (1–1): a 4-4-2. Shirt numbers best-effort.
  formation: "4-4-2",
  players: [
    { num: 21, name: "Mohammed Al-Owais", short: "Al-Owais", line: "gk", role: "Goalkeeper", club: "Al-Hilal", at2022: true, start: { x: 50, y: 90 } },
    { num: 13, name: "Saud Abdulhamid", short: "Abdulhamid", line: "def", role: "Right-back", club: "Lens", at2022: true, start: { x: 84, y: 70 } },
    { num: 5, name: "Hassan Tambakti", short: "Tambakti", line: "def", role: "Centre-back", club: "Al-Hilal", at2022: false, start: { x: 62, y: 73 } },
    { num: 3, name: "Abdulelah Al-Amri", short: "Al-Amri", line: "def", role: "Centre-back", club: "Al-Nassr", at2022: true, start: { x: 38, y: 73 } },
    { num: 2, name: "Moteb Al-Harbi", short: "Al-Harbi", line: "def", role: "Left-back", club: "Al-Shabab", at2022: false, start: { x: 16, y: 70 } },
    { num: 7, name: "Nasser Al-Dawsari", short: "N. Al-Dawsari", line: "mid", role: "Right midfield", club: "Al-Hilal", at2022: false, start: { x: 84, y: 44 } },
    { num: 28, name: "Mohamed Kanno", short: "Kanno", line: "mid", role: "Central midfield", club: "Al-Hilal", at2022: true, start: { x: 58, y: 50 } },
    { num: 14, name: "Abdullah Al-Khaibari", short: "Al-Khaibari", line: "mid", role: "Central midfield", club: "Al-Nassr", at2022: false, start: { x: 38, y: 50 } },
    { num: 10, name: "Salem Al-Dawsari", short: "S. Al-Dawsari", line: "mid", role: "Left midfield", club: "Al-Hilal", at2022: true, captain: true, start: { x: 14, y: 44 } },
    { num: 9, name: "Firas Al-Buraikan", short: "Al-Buraikan", line: "fwd", role: "Striker", club: "Al-Ahli", at2022: true, start: { x: 62, y: 16 } },
    { num: 20, name: "Musab Al-Juwayr", short: "Al-Juwayr", line: "fwd", role: "Forward", club: "Al-Hilal", at2022: false, start: { x: 38, y: 16 } },

    { num: 1, name: "Nawaf Al-Aqidi", short: "Al-Aqidi", line: "gk", role: "Goalkeeper", club: "Al-Nassr", at2022: false },
    { num: 22, name: "Ahmed Al-Kassar", short: "Al-Kassar", line: "gk", role: "Goalkeeper", club: "Al-Ettifaq", at2022: false },
    { num: 4, name: "Ali Al-Bulaihi", short: "Al-Bulaihi", line: "def", role: "Centre-back", club: "Al-Hilal", at2022: true },
    { num: 6, name: "Abdullah Madu", short: "Madu", line: "def", role: "Centre-back", club: "Al-Nassr", at2022: true },
    { num: 12, name: "Yasser Al-Shahrani", short: "Al-Shahrani", line: "def", role: "Left-back", club: "Al-Hilal", at2022: true },
    { num: 15, name: "Ali Lajami", short: "Lajami", line: "def", role: "Centre-back", club: "Al-Nassr", at2022: false },
    { num: 8, name: "Abdullah Otayf", short: "Otayf", line: "mid", role: "Defensive midfield", club: "Al-Hilal", at2022: false },
    { num: 16, name: "Nasser Al-Omran", short: "Al-Omran", line: "mid", role: "Attacking midfield", club: "Al-Ahli", at2022: false },
    { num: 17, name: "Ayman Yahya", short: "Yahya", line: "mid", role: "Winger", club: "Al-Nassr", at2022: false },
    { num: 23, name: "Mohamed Al-Shamat", short: "Al-Shamat", line: "mid", role: "Winger", club: "Al-Ahli", at2022: false },
    { num: 18, name: "Sami Al-Najei", short: "Al-Najei", line: "mid", role: "Central midfield", club: "Al-Nassr", at2022: true },
    { num: 11, name: "Saleh Al-Shehri", short: "Al-Shehri", line: "fwd", role: "Striker", club: "Al-Hilal", at2022: true },
    { num: 19, name: "Abdullah Radif", short: "Radif", line: "fwd", role: "Striker", club: "Al-Taawoun", at2022: false },
    { num: 24, name: "Marwan Al-Sahafi", short: "Al-Sahafi", line: "fwd", role: "Winger", club: "Al-Ahli", at2022: false },
    { num: 25, name: "Abdulrahman Al-Aboud", short: "Al-Aboud", line: "fwd", role: "Winger", club: "Al-Ittihad", at2022: false },
  ],
};

const CABO_VERDE: TeamSquad = {
  teamId: "cpv",
  // Opener vs Spain (0–0): a 4-3-3. Shirt numbers best-effort.
  formation: "4-3-3",
  players: [
    { num: 1, name: "Vozinha", short: "Vozinha", line: "gk", role: "Goalkeeper", club: "Marília", at2022: false, start: { x: 50, y: 90 } },
    { num: 2, name: "Wagner Pina", short: "W. Pina", line: "def", role: "Right-back", club: "Casa Pia", at2022: false, start: { x: 84, y: 70 } },
    { num: 4, name: "Roberto Lopes", short: "Lopes", line: "def", role: "Centre-back", club: "Shamrock Rovers", at2022: false, captain: true, start: { x: 62, y: 73 } },
    { num: 5, name: "Diney Borges", short: "Borges", line: "def", role: "Centre-back", club: "Anderlecht", at2022: false, start: { x: 38, y: 73 } },
    { num: 3, name: "Sidny Cabral", short: "S. Cabral", line: "def", role: "Left-back", club: "Estoril", at2022: false, start: { x: 16, y: 70 } },
    { num: 6, name: "Jamiro Monteiro", short: "Monteiro", line: "mid", role: "Central midfield", club: "San Jose", at2022: false, start: { x: 64, y: 50 } },
    { num: 8, name: "Kevin Pina", short: "K. Pina", line: "mid", role: "Central midfield", club: "Casa Pia", at2022: false, start: { x: 36, y: 50 } },
    { num: 10, name: "Telmo Arcanjo", short: "Arcanjo", line: "mid", role: "Attacking midfield", club: "Vitória", at2022: false, start: { x: 50, y: 33 } },
    { num: 7, name: "Jovane Cabral", short: "J. Cabral", line: "fwd", role: "Right winger", club: "Çaykur Rizespor", at2022: false, start: { x: 80, y: 18 } },
    { num: 9, name: "Nuno da Costa", short: "da Costa", line: "fwd", role: "Striker", club: "Cova Piedade", at2022: false, start: { x: 50, y: 13 } },
    { num: 11, name: "Ryan Mendes", short: "R. Mendes", line: "fwd", role: "Left winger", club: "Radnički", at2022: false, start: { x: 20, y: 18 } },

    { num: 12, name: "Jozimar Dias", short: "Dias", line: "gk", role: "Goalkeeper", club: "Mineros", at2022: false },
    { num: 22, name: "Márcio Rosa", short: "Rosa", line: "gk", role: "Goalkeeper", club: "Os Belenenses", at2022: false },
    { num: 13, name: "Steven Moreira", short: "Moreira", line: "def", role: "Right-back", club: "Columbus Crew", at2022: false },
    { num: 14, name: "Logan Costa", short: "L. Costa", line: "def", role: "Centre-back", club: "Toulouse", at2022: false },
    { num: 15, name: "Stopira", short: "Stopira", line: "def", role: "Left-back", club: "Fehérvár", at2022: false },
    { num: 16, name: "Kelvin Pires", short: "Pires", line: "def", role: "Centre-back", club: "Felgueiras", at2022: false },
    { num: 17, name: "João Paulo", short: "J. Paulo", line: "def", role: "Centre-back", club: "Estrela", at2022: false },
    { num: 18, name: "Laros Duarte", short: "L. Duarte", line: "mid", role: "Central midfield", club: "Heracles", at2022: false },
    { num: 19, name: "Deroy Duarte", short: "D. Duarte", line: "mid", role: "Central midfield", club: "Sparta", at2022: false },
    { num: 20, name: "Yannick Semedo", short: "Y. Semedo", line: "mid", role: "Winger", club: "Casa Pia", at2022: false },
    { num: 21, name: "Gilson Benchimol", short: "Benchimol", line: "fwd", role: "Winger", club: "Lausanne", at2022: false },
    { num: 23, name: "Garry Rodrigues", short: "Rodrigues", line: "fwd", role: "Winger", club: "PAOK", at2022: false },
    { num: 24, name: "Willy Semedo", short: "W. Semedo", line: "fwd", role: "Striker", club: "Keçiörengücü", at2022: false },
    { num: 25, name: "Dailon Livramento", short: "Livramento", line: "fwd", role: "Striker", club: "Casa Pia", at2022: false },
    { num: 26, name: "Hélio Varela", short: "H. Varela", line: "fwd", role: "Striker", club: "Al-Najma", at2022: false },
  ],
};

const AUSTRIA: TeamSquad = {
  teamId: "aut",
  // Opener vs Jordan (3–1): a 4-2-3-1. Some shirt numbers best-effort.
  formation: "4-2-3-1",
  players: [
    { num: 1, name: "Alexander Schlager", short: "A. Schlager", line: "gk", role: "Goalkeeper", club: "Red Bull Salzburg", at2022: false, start: { x: 50, y: 90 } },
    { num: 6, name: "Konrad Laimer", short: "Laimer", line: "def", role: "Right-back", club: "Bayern Munich", at2022: false, start: { x: 84, y: 70 } },
    { num: 4, name: "Philipp Lienhart", short: "Lienhart", line: "def", role: "Centre-back", club: "Freiburg", at2022: false, start: { x: 62, y: 73 } },
    { num: 8, name: "David Alaba", short: "Alaba", line: "def", role: "Centre-back", club: "Real Madrid", at2022: false, captain: true, photo: "David Alaba 2013.JPG", start: { x: 38, y: 73 } },
    { num: 3, name: "Phillipp Mwene", short: "Mwene", line: "def", role: "Left-back", club: "Mainz", at2022: false, start: { x: 16, y: 70 } },
    { num: 14, name: "Xaver Schlager", short: "X. Schlager", line: "mid", role: "Defensive midfield", club: "RB Leipzig", at2022: false, start: { x: 64, y: 50 } },
    { num: 13, name: "Nicolas Seiwald", short: "Seiwald", line: "mid", role: "Defensive midfield", club: "RB Leipzig", at2022: false, start: { x: 36, y: 50 } },
    { num: 20, name: "Romano Schmid", short: "Schmid", line: "fwd", role: "Right winger", club: "Werder Bremen", at2022: false, start: { x: 78, y: 29 } },
    { num: 7, name: "Marcel Sabitzer", short: "Sabitzer", line: "mid", role: "Attacking midfield", club: "Borussia Dortmund", at2022: false, start: { x: 50, y: 31 } },
    { num: 11, name: "Michael Gregoritsch", short: "Gregoritsch", line: "fwd", role: "Left winger", club: "Augsburg", at2022: false, start: { x: 22, y: 29 } },
    { num: 9, name: "Marko Arnautović", short: "Arnautović", line: "fwd", role: "Striker", club: "Red Star Belgrade", at2022: false, start: { x: 50, y: 13 } },

    { num: 12, name: "Patrick Pentz", short: "Pentz", line: "gk", role: "Goalkeeper", club: "Brøndby", at2022: false },
    { num: 23, name: "Niklas Hedl", short: "Hedl", line: "gk", role: "Goalkeeper", club: "Rapid Wien", at2022: false },
    { num: 2, name: "Stefan Posch", short: "Posch", line: "def", role: "Right-back", club: "Mainz", at2022: false },
    { num: 15, name: "Kevin Danso", short: "Danso", line: "def", role: "Centre-back", club: "Tottenham", at2022: false },
    { num: 5, name: "David Affengruber", short: "Affengruber", line: "def", role: "Centre-back", club: "Elche", at2022: false },
    { num: 16, name: "Marco Friedl", short: "Friedl", line: "def", role: "Centre-back", club: "Werder Bremen", at2022: false },
    { num: 22, name: "Michael Svoboda", short: "Svoboda", line: "def", role: "Centre-back", club: "Venezia", at2022: false },
    { num: 24, name: "Alexander Prass", short: "Prass", line: "def", role: "Left-back", club: "Hoffenheim", at2022: false },
    { num: 10, name: "Florian Grillitsch", short: "Grillitsch", line: "mid", role: "Central midfield", club: "Braga", at2022: false },
    { num: 18, name: "Carney Chukwuemeka", short: "Chukwuemeka", line: "mid", role: "Central midfield", club: "Borussia Dortmund", at2022: false },
    { num: 19, name: "Christoph Baumgartner", short: "Baumgartner", line: "mid", role: "Attacking midfield", club: "RB Leipzig", at2022: false },
    { num: 21, name: "Patrick Wimmer", short: "Wimmer", line: "mid", role: "Winger", club: "Wolfsburg", at2022: false },
    { num: 17, name: "Paul Wanner", short: "Wanner", line: "mid", role: "Attacking midfield", club: "PSV", at2022: false },
    { num: 25, name: "Alessandro Schöpf", short: "Schöpf", line: "mid", role: "Central midfield", club: "Wolfsberger AC", at2022: false },
    { num: 26, name: "Saša Kalajdžić", short: "Kalajdžić", line: "fwd", role: "Striker", club: "LASK", at2022: false },
  ],
};

const NEW_ZEALAND: TeamSquad = {
  teamId: "nzl",
  // Opener vs Iran (2–2): a 4-3-3. Several shirt numbers / bench best-effort.
  formation: "4-3-3",
  players: [
    { num: 1, name: "Max Crocombe", short: "Crocombe", line: "gk", role: "Goalkeeper", club: "Millwall", at2022: false, start: { x: 50, y: 90 } },
    { num: 2, name: "Tyler Bindon", short: "Bindon", line: "def", role: "Right-back", club: "Nottingham Forest", at2022: false, start: { x: 84, y: 70 } },
    { num: 5, name: "Michael Boxall", short: "Boxall", line: "def", role: "Centre-back", club: "Minnesota United", at2022: false, start: { x: 62, y: 73 } },
    { num: 13, name: "Finn Surman", short: "Surman", line: "def", role: "Centre-back", club: "Portland Timbers", at2022: false, start: { x: 38, y: 73 } },
    { num: 3, name: "Liberato Cacace", short: "Cacace", line: "def", role: "Left-back", club: "Wrexham", at2022: false, start: { x: 16, y: 70 } },
    { num: 6, name: "Joe Bell", short: "Bell", line: "mid", role: "Central midfield", club: "Viking", at2022: false, start: { x: 64, y: 50 } },
    { num: 8, name: "Marko Stamenić", short: "Stamenić", line: "mid", role: "Central midfield", club: "Olympiacos", at2022: false, start: { x: 36, y: 50 } },
    { num: 10, name: "Sarpreet Singh", short: "Singh", line: "mid", role: "Attacking midfield", club: "Hansa Rostock", at2022: false, start: { x: 50, y: 33 } },
    { num: 7, name: "Elijah Just", short: "Just", line: "fwd", role: "Right winger", club: "Motherwell", at2022: false, start: { x: 80, y: 18 } },
    { num: 9, name: "Chris Wood", short: "Wood", line: "fwd", role: "Striker", club: "Nottingham Forest", at2022: false, captain: true, start: { x: 50, y: 13 } },
    { num: 11, name: "Ben Waine", short: "Waine", line: "fwd", role: "Left winger", club: "Port Vale", at2022: false, start: { x: 20, y: 18 } },

    { num: 12, name: "Oliver Sail", short: "Sail", line: "gk", role: "Goalkeeper", club: "Wellington Phoenix", at2022: false },
    { num: 23, name: "Alex Paulsen", short: "Paulsen", line: "gk", role: "Goalkeeper", club: "Bournemouth", at2022: false },
    { num: 4, name: "Nando Pijnaker", short: "Pijnaker", line: "def", role: "Centre-back", club: "Rosenborg", at2022: false },
    { num: 15, name: "Tim Payne", short: "Payne", line: "def", role: "Right-back", club: "Auckland", at2022: false },
    { num: 16, name: "Francis de Vries", short: "de Vries", line: "def", role: "Left-back", club: "Auckland", at2022: false },
    { num: 18, name: "Storm Roux", short: "Roux", line: "def", role: "Full-back", club: "Auckland", at2022: false },
    { num: 22, name: "Dane Ingham", short: "Ingham", line: "def", role: "Right-back", club: "Western Sydney", at2022: false },
    { num: 14, name: "Matthew Garbett", short: "Garbett", line: "mid", role: "Central midfield", club: "Spezia", at2022: false },
    { num: 17, name: "Marko Rojas", short: "Rojas", line: "mid", role: "Winger", club: "Melbourne Victory", at2022: false },
    { num: 19, name: "Clayton Lewis", short: "Lewis", line: "mid", role: "Central midfield", club: "Auckland", at2022: false },
    { num: 20, name: "Ben Old", short: "Old", line: "mid", role: "Winger", club: "St. Mirren", at2022: false },
    { num: 21, name: "Kosta Barbarouses", short: "Barbarouses", line: "fwd", role: "Winger", club: "Auckland", at2022: false },
    { num: 24, name: "Alex Greive", short: "Greive", line: "fwd", role: "Striker", club: "St. Mirren", at2022: false },
    { num: 25, name: "Callum McCowatt", short: "McCowatt", line: "fwd", role: "Striker", club: "Hibernian", at2022: false },
    { num: 26, name: "Bill Tuiloma", short: "Tuiloma", line: "def", role: "Centre-back", club: "Charlotte FC", at2022: false },
  ],
};

const EGYPT: TeamSquad = {
  teamId: "egy",
  // Opener vs Belgium (1–1): a 3-4-1-2. Some shirt numbers best-effort.
  formation: "3-4-1-2",
  players: [
    { num: 16, name: "Mostafa Shoubir", short: "Shoubir", line: "gk", role: "Goalkeeper", club: "Al Ahly", at2022: false, start: { x: 50, y: 90 } },
    { num: 2, name: "Mohamed Hany", short: "Hany", line: "def", role: "Centre-back", club: "Al Ahly", at2022: false, start: { x: 28, y: 75 } },
    { num: 3, name: "Yasser Ibrahim", short: "Y. Ibrahim", line: "def", role: "Centre-back", club: "Al Ahly", at2022: false, start: { x: 50, y: 77 } },
    { num: 12, name: "Ahmed Fatouh", short: "Fatouh", line: "def", role: "Centre-back", club: "Zamalek", at2022: false, start: { x: 72, y: 75 } },
    { num: 8, name: "Emam Ashour", short: "Ashour", line: "mid", role: "Right wing-back", club: "Al Ahly", at2022: false, start: { x: 88, y: 52 } },
    { num: 17, name: "Hamdi Fathi", short: "Fathi", line: "mid", role: "Central midfield", club: "Wydad", at2022: false, start: { x: 38, y: 48 } },
    { num: 4, name: "Marwan Attia", short: "Attia", line: "mid", role: "Central midfield", club: "Al Ahly", at2022: false, start: { x: 62, y: 48 } },
    { num: 21, name: "Mohanad Lashin", short: "Lashin", line: "mid", role: "Left wing-back", club: "Zamalek", at2022: false, start: { x: 12, y: 52 } },
    { num: 14, name: "Mostafa Zico", short: "Zico", line: "mid", role: "Attacking midfield", club: "Pyramids", at2022: false, start: { x: 50, y: 32 } },
    { num: 10, name: "Mohamed Salah", short: "Salah", line: "fwd", role: "Forward", club: "Liverpool", at2022: false, captain: true, photo: "Mo Salah 2018 (cropped).jpg", start: { x: 62, y: 15 } },
    { num: 9, name: "Omar Marmoush", short: "Marmoush", line: "fwd", role: "Forward", club: "Manchester City", at2022: false, start: { x: 38, y: 15 } },

    { num: 1, name: "Mohamed Elshenawy", short: "Elshenawy", line: "gk", role: "Goalkeeper", club: "Al Ahly", at2022: false },
    { num: 22, name: "Mahdy Soliman", short: "Soliman", line: "gk", role: "Goalkeeper", club: "Ceramica", at2022: false },
    { num: 23, name: "Mohamed Alaa", short: "M. Alaa", line: "gk", role: "Goalkeeper", club: "Smouha", at2022: false },
    { num: 5, name: "Hossam Abdelmagid", short: "Abdelmagid", line: "def", role: "Centre-back", club: "Al Ahly", at2022: false },
    { num: 6, name: "Mohamed Abdelmonem", short: "Abdelmonem", line: "def", role: "Centre-back", club: "Nice", at2022: false },
    { num: 13, name: "Tarek Alaa", short: "T. Alaa", line: "def", role: "Centre-back", club: "Zamalek", at2022: false },
    { num: 15, name: "Karim Hafez", short: "Hafez", line: "def", role: "Left-back", club: "ZED", at2022: false },
    { num: 20, name: "Rami Rabia", short: "Rabia", line: "def", role: "Centre-back", club: "Al Ahly", at2022: false },
    { num: 18, name: "Nabil Emad", short: "Emad", line: "mid", role: "Defensive midfield", club: "Pyramids", at2022: false },
    { num: 19, name: "Haitham Hassan", short: "H. Hassan", line: "mid", role: "Central midfield", club: "Modern Future", at2022: false },
    { num: 24, name: "Mahmoud Saber", short: "Saber", line: "mid", role: "Central midfield", club: "Al Ahly", at2022: false },
    { num: 7, name: "Mahmoud Trezeguet", short: "Trezeguet", line: "fwd", role: "Winger", club: "Al Ahly", at2022: false },
    { num: 25, name: "Ahmed Sayed Zizo", short: "Zizo", line: "fwd", role: "Winger", club: "Al Ahly", at2022: false },
    { num: 11, name: "Ibrahim Adel", short: "I. Adel", line: "fwd", role: "Winger", club: "Pyramids", at2022: false },
    { num: 26, name: "Hamza Abdulkarim", short: "Abdulkarim", line: "fwd", role: "Striker", club: "Zamalek", at2022: false },
  ],
};

const IRAQ: TeamSquad = {
  teamId: "irq",
  // Opener vs Norway (1–4): a 4-4-2. Some shirt numbers best-effort.
  formation: "4-4-2",
  players: [
    { num: 1, name: "Jalal Hassan", short: "J. Hassan", line: "gk", role: "Goalkeeper", club: "Al-Zawraa", at2022: false, captain: true, start: { x: 50, y: 90 } },
    { num: 2, name: "Hussein Ali", short: "Hussein Ali", line: "def", role: "Right-back", club: "Pogoń Szczecin", at2022: false, start: { x: 84, y: 70 } },
    { num: 5, name: "Rebin Sulaka", short: "Sulaka", line: "def", role: "Centre-back", club: "Port", at2022: false, start: { x: 62, y: 73 } },
    { num: 4, name: "Merchas Doski", short: "Doski", line: "def", role: "Centre-back", club: "Viktoria Plzeň", at2022: false, start: { x: 38, y: 73 } },
    { num: 3, name: "Zaid Tahseen", short: "Tahseen", line: "def", role: "Left-back", club: "Pakhtakor", at2022: false, start: { x: 16, y: 70 } },
    { num: 17, name: "Ahmed Qasem", short: "Qasem", line: "mid", role: "Right midfield", club: "Nashville SC", at2022: false, start: { x: 84, y: 44 } },
    { num: 8, name: "Amir Al-Ammari", short: "Al-Ammari", line: "mid", role: "Central midfield", club: "Cracovia", at2022: false, start: { x: 58, y: 50 } },
    { num: 10, name: "Zidane Iqbal", short: "Iqbal", line: "mid", role: "Central midfield", club: "Utrecht", at2022: false, start: { x: 38, y: 50 } },
    { num: 7, name: "Ali Jassim", short: "Jassim", line: "mid", role: "Left midfield", club: "Al-Najma", at2022: false, start: { x: 14, y: 44 } },
    { num: 9, name: "Aymen Hussein", short: "A. Hussein", line: "fwd", role: "Striker", club: "Al-Karma", at2022: false, start: { x: 62, y: 16 } },
    { num: 11, name: "Mohanad Ali", short: "Mohanad Ali", line: "fwd", role: "Striker", club: "Dibba", at2022: false, start: { x: 38, y: 16 } },

    { num: 22, name: "Fahad Talib", short: "Talib", line: "gk", role: "Goalkeeper", club: "Al-Talaba", at2022: false },
    { num: 23, name: "Ahmed Basil", short: "Basil", line: "gk", role: "Goalkeeper", club: "Al-Shorta", at2022: false },
    { num: 6, name: "Manaf Younis", short: "Younis", line: "def", role: "Right-back", club: "Al-Shorta", at2022: false },
    { num: 13, name: "Ahmed Yahya", short: "Yahya", line: "def", role: "Centre-back", club: "Al-Quwa", at2022: false },
    { num: 15, name: "Mustafa Saadoon", short: "Saadoon", line: "def", role: "Centre-back", club: "Al-Shorta", at2022: false },
    { num: 16, name: "Akam Hashim", short: "Hashim", line: "def", role: "Centre-back", club: "Al-Zawraa", at2022: false },
    { num: 18, name: "Zaid Ismail", short: "Ismail", line: "def", role: "Left-back", club: "Al-Talaba", at2022: false },
    { num: 20, name: "Frans Putros", short: "Putros", line: "def", role: "Centre-back", club: "Persib", at2022: false },
    { num: 14, name: "Kevin Yakob", short: "Yakob", line: "mid", role: "Central midfield", club: "Aarhus", at2022: false },
    { num: 19, name: "Aimar Sher", short: "Sher", line: "mid", role: "Central midfield", club: "Sarpsborg", at2022: false },
    { num: 21, name: "Ibrahim Bayesh", short: "Bayesh", line: "mid", role: "Attacking midfield", club: "Al-Dhafra", at2022: false },
    { num: 24, name: "Youssef Amyn", short: "Amyn", line: "fwd", role: "Winger", club: "AEK Larnaca", at2022: false },
    { num: 25, name: "Marko Farji", short: "Farji", line: "fwd", role: "Winger", club: "Venezia", at2022: false },
    { num: 12, name: "Ali Al-Hamadi", short: "Al-Hamadi", line: "fwd", role: "Striker", club: "Luton Town", at2022: false },
    { num: 26, name: "Ali Yousef", short: "Yousef", line: "fwd", role: "Winger", club: "Al-Talaba", at2022: false },
  ],
};

const CROATIA: TeamSquad = {
  teamId: "cro",
  // Opener vs England (2–4): a 4-3-3. Some shirt numbers best-effort.
  formation: "4-3-3",
  players: [
    { num: 1, name: "Dominik Livaković", short: "Livaković", line: "gk", role: "Goalkeeper", club: "Fenerbahçe", at2022: true, start: { x: 50, y: 90 } },
    { num: 22, name: "Josip Stanišić", short: "Stanišić", line: "def", role: "Right-back", club: "Bayern Munich", at2022: true, start: { x: 84, y: 70 } },
    { num: 6, name: "Joško Gvardiol", short: "Gvardiol", line: "def", role: "Centre-back", club: "Manchester City", at2022: true, start: { x: 62, y: 73 } },
    { num: 3, name: "Josip Šutalo", short: "Šutalo", line: "def", role: "Centre-back", club: "Ajax", at2022: true, start: { x: 38, y: 73 } },
    { num: 19, name: "Borna Sosa", short: "Sosa", line: "def", role: "Left-back", club: "Ajax", at2022: true, start: { x: 16, y: 70 } },
    { num: 10, name: "Luka Modrić", short: "Modrić", line: "mid", role: "Central midfield", club: "AC Milan", at2022: true, captain: true, start: { x: 50, y: 48 } },
    { num: 8, name: "Mateo Kovačić", short: "Kovačić", line: "mid", role: "Central midfield", club: "Manchester City", at2022: true, start: { x: 30, y: 40 } },
    { num: 15, name: "Luka Sučić", short: "L. Sučić", line: "mid", role: "Central midfield", club: "Real Sociedad", at2022: true, start: { x: 70, y: 40 } },
    { num: 4, name: "Nikola Vlašić", short: "Vlašić", line: "fwd", role: "Right winger", club: "Torino", at2022: true, start: { x: 82, y: 18 } },
    { num: 17, name: "Ante Budimir", short: "Budimir", line: "fwd", role: "Striker", club: "Osasuna", at2022: true, start: { x: 50, y: 13 } },
    { num: 7, name: "Ivan Perišić", short: "Perišić", line: "fwd", role: "Left winger", club: "PSV", at2022: true, start: { x: 18, y: 18 } },

    { num: 12, name: "Ivica Ivušić", short: "Ivušić", line: "gk", role: "Goalkeeper", club: "Pafos", at2022: false },
    { num: 23, name: "Dominik Kotarski", short: "Kotarski", line: "gk", role: "Goalkeeper", club: "PAOK", at2022: false },
    { num: 2, name: "Duje Ćaleta-Car", short: "Ćaleta-Car", line: "def", role: "Centre-back", club: "Lyon", at2022: false },
    { num: 5, name: "Marin Pongračić", short: "Pongračić", line: "def", role: "Centre-back", club: "Fiorentina", at2022: false },
    { num: 13, name: "Martin Erlić", short: "Erlić", line: "def", role: "Centre-back", club: "Sassuolo", at2022: true },
    { num: 24, name: "Luka Vušković", short: "Vušković", line: "def", role: "Centre-back", club: "Hamburger SV", at2022: false },
    { num: 11, name: "Marcelo Brozović", short: "Brozović", line: "mid", role: "Defensive midfield", club: "Al-Nassr", at2022: true },
    { num: 14, name: "Kristijan Jakić", short: "Jakić", line: "mid", role: "Central midfield", club: "Fortuna Düsseldorf", at2022: true },
    { num: 16, name: "Martin Baturina", short: "Baturina", line: "mid", role: "Attacking midfield", club: "Como", at2022: false },
    { num: 25, name: "Petar Sučić", short: "P. Sučić", line: "mid", role: "Central midfield", club: "Inter Milan", at2022: false },
    { num: 26, name: "Nikola Moro", short: "Moro", line: "mid", role: "Defensive midfield", club: "Bologna", at2022: false },
    { num: 18, name: "Toni Fruk", short: "Fruk", line: "mid", role: "Attacking midfield", club: "Rijeka", at2022: false },
    { num: 9, name: "Andrej Kramarić", short: "Kramarić", line: "fwd", role: "Forward", club: "Hoffenheim", at2022: true },
    { num: 20, name: "Mario Pašalić", short: "Pašalić", line: "mid", role: "Attacking midfield", club: "Atalanta", at2022: true },
    { num: 21, name: "Marco Pašalić", short: "M. Pašalić", line: "fwd", role: "Winger", club: "Orlando City", at2022: false },
  ],
};

const SENEGAL: TeamSquad = {
  teamId: "sen",
  // Opener vs France (1–3): a 4-2-3-1. Some shirt numbers best-effort.
  formation: "4-2-3-1",
  players: [
    { num: 16, name: "Édouard Mendy", short: "Mendy", line: "gk", role: "Goalkeeper", club: "Al-Ahli", at2022: true, start: { x: 50, y: 90 } },
    { num: 4, name: "Krépin Diatta", short: "Diatta", line: "def", role: "Right-back", club: "Monaco", at2022: true, start: { x: 84, y: 70 } },
    { num: 3, name: "Kalidou Koulibaly", short: "Koulibaly", line: "def", role: "Centre-back", club: "Al-Hilal", at2022: true, captain: true, start: { x: 62, y: 73 } },
    { num: 21, name: "Moussa Niakhaté", short: "Niakhaté", line: "def", role: "Centre-back", club: "Lyon", at2022: false, start: { x: 38, y: 73 } },
    { num: 12, name: "El Hadji Malick Diouf", short: "Diouf", line: "def", role: "Left-back", club: "West Ham", at2022: false, start: { x: 16, y: 70 } },
    { num: 6, name: "Pape Gueye", short: "P. Gueye", line: "mid", role: "Defensive midfield", club: "Villarreal", at2022: true, start: { x: 64, y: 50 } },
    { num: 5, name: "Pape Matar Sarr", short: "P.M. Sarr", line: "mid", role: "Central midfield", club: "Tottenham", at2022: true, start: { x: 36, y: 50 } },
    { num: 18, name: "Ismaïla Sarr", short: "I. Sarr", line: "fwd", role: "Right winger", club: "Crystal Palace", at2022: true, start: { x: 78, y: 29 } },
    { num: 17, name: "Habib Diarra", short: "Diarra", line: "mid", role: "Attacking midfield", club: "Sunderland", at2022: false, start: { x: 50, y: 31 } },
    { num: 10, name: "Sadio Mané", short: "Mané", line: "fwd", role: "Left winger", club: "Al-Nassr", at2022: false, start: { x: 22, y: 29 } },
    { num: 9, name: "Nicolas Jackson", short: "Jackson", line: "fwd", role: "Striker", club: "Bayern Munich", at2022: false, start: { x: 50, y: 13 } },

    { num: 1, name: "Mory Diaw", short: "Diaw", line: "gk", role: "Goalkeeper", club: "Lens", at2022: false },
    { num: 23, name: "Yehvann Diouf", short: "Y. Diouf", line: "gk", role: "Goalkeeper", club: "Reims", at2022: false },
    { num: 2, name: "Antoine Mendy", short: "A. Mendy", line: "def", role: "Right-back", club: "Nice", at2022: false },
    { num: 22, name: "Abdoulaye Seck", short: "Seck", line: "def", role: "Centre-back", club: "Maccabi Haifa", at2022: false },
    { num: 13, name: "Ismail Jakobs", short: "Jakobs", line: "def", role: "Left-back", club: "Galatasaray", at2022: true },
    { num: 24, name: "Moustapha Mbow", short: "Mbow", line: "def", role: "Centre-back", club: "Rennes", at2022: false },
    { num: 8, name: "Idrissa Gueye", short: "I. Gueye", line: "mid", role: "Central midfield", club: "Everton", at2022: true },
    { num: 14, name: "Pape Cheikh Diop", short: "P.C. Diop", line: "mid", role: "Central midfield", club: "Cádiz", at2022: false },
    { num: 15, name: "Lamine Camara", short: "Camara", line: "mid", role: "Central midfield", club: "Monaco", at2022: false },
    { num: 7, name: "Iliman Ndiaye", short: "Ndiaye", line: "fwd", role: "Winger", club: "Everton", at2022: false },
    { num: 11, name: "Boulaye Dia", short: "Dia", line: "fwd", role: "Striker", club: "Lazio", at2022: true },
    { num: 19, name: "Cherif Ndiaye", short: "C. Ndiaye", line: "fwd", role: "Striker", club: "Al-Ettifaq", at2022: false },
    { num: 20, name: "Habib Diallo", short: "H. Diallo", line: "fwd", role: "Striker", club: "Al-Shabab", at2022: false },
    { num: 25, name: "Pathé Ciss", short: "Ciss", line: "mid", role: "Defensive midfield", club: "Rayo Vallecano", at2022: true },
    { num: 26, name: "Formose Mendy", short: "F. Mendy", line: "def", role: "Centre-back", club: "Amiens", at2022: true },
  ],
};

const NORWAY: TeamSquad = {
  teamId: "nor",
  // Opener vs Iraq (4–1): a 4-4-2 with Haaland & Sørloth. Numbers best-effort.
  formation: "4-4-2",
  players: [
    { num: 1, name: "Ørjan Nyland", short: "Nyland", line: "gk", role: "Goalkeeper", club: "Sevilla", at2022: false, start: { x: 50, y: 90 } },
    { num: 2, name: "Julian Ryerson", short: "Ryerson", line: "def", role: "Right-back", club: "Borussia Dortmund", at2022: false, start: { x: 84, y: 70 } },
    { num: 5, name: "Kristoffer Ajer", short: "Ajer", line: "def", role: "Centre-back", club: "Brentford", at2022: false, start: { x: 62, y: 73 } },
    { num: 6, name: "Torbjørn Heggem", short: "Heggem", line: "def", role: "Centre-back", club: "West Brom", at2022: false, start: { x: 38, y: 73 } },
    { num: 3, name: "David Møller Wolfe", short: "Wolfe", line: "def", role: "Left-back", club: "AZ Alkmaar", at2022: false, start: { x: 16, y: 70 } },
    { num: 20, name: "Fredrik Aursnes", short: "Aursnes", line: "mid", role: "Right midfield", club: "Benfica", at2022: false, start: { x: 84, y: 44 } },
    { num: 10, name: "Martin Ødegaard", short: "Ødegaard", line: "mid", role: "Central midfield", club: "Arsenal", at2022: false, captain: true, start: { x: 58, y: 50 } },
    { num: 8, name: "Sander Berge", short: "Berge", line: "mid", role: "Central midfield", club: "Fulham", at2022: false, start: { x: 38, y: 50 } },
    { num: 16, name: "Antonio Nusa", short: "Nusa", line: "mid", role: "Left midfield", club: "RB Leipzig", at2022: false, start: { x: 14, y: 44 } },
    { num: 9, name: "Erling Haaland", short: "Haaland", line: "fwd", role: "Striker", club: "Manchester City", at2022: false, start: { x: 62, y: 16 } },
    { num: 11, name: "Alexander Sørloth", short: "Sørloth", line: "fwd", role: "Striker", club: "Atlético Madrid", at2022: false, start: { x: 38, y: 16 } },

    { num: 12, name: "Egil Selvik", short: "Selvik", line: "gk", role: "Goalkeeper", club: "Brann", at2022: false },
    { num: 23, name: "Mads Hansen", short: "Hansen", line: "gk", role: "Goalkeeper", club: "Lillestrøm", at2022: false },
    { num: 4, name: "Leo Østigård", short: "Østigård", line: "def", role: "Centre-back", club: "Rennes", at2022: false },
    { num: 13, name: "Stefan Strandberg", short: "Strandberg", line: "def", role: "Centre-back", club: "Vålerenga", at2022: false },
    { num: 15, name: "Andreas Hanche-Olsen", short: "Hanche-Olsen", line: "def", role: "Centre-back", club: "Mainz", at2022: false },
    { num: 17, name: "Birger Meling", short: "Meling", line: "def", role: "Left-back", club: "Rennes", at2022: false },
    { num: 7, name: "Patrick Berg", short: "P. Berg", line: "mid", role: "Defensive midfield", club: "Bodø/Glimt", at2022: false },
    { num: 14, name: "Morten Thorsby", short: "Thorsby", line: "mid", role: "Central midfield", club: "Genoa", at2022: false },
    { num: 18, name: "Kristian Thorstvedt", short: "Thorstvedt", line: "mid", role: "Central midfield", club: "Sassuolo", at2022: false },
    { num: 19, name: "Oscar Bobb", short: "Bobb", line: "fwd", role: "Winger", club: "Manchester City", at2022: false },
    { num: 21, name: "Jørgen Strand Larsen", short: "Strand Larsen", line: "fwd", role: "Striker", club: "Wolves", at2022: false },
    { num: 22, name: "Mathias Rasmussen", short: "Rasmussen", line: "mid", role: "Central midfield", club: "Brann", at2022: false },
    { num: 24, name: "Aron Dønnum", short: "Dønnum", line: "fwd", role: "Winger", club: "Standard Liège", at2022: false },
    { num: 25, name: "Sverre Nypan", short: "Nypan", line: "mid", role: "Attacking midfield", club: "Manchester City", at2022: false },
    { num: 26, name: "Ola Brynhildsen", short: "Brynhildsen", line: "fwd", role: "Striker", club: "Molde", at2022: false },
  ],
};

const GHANA: TeamSquad = {
  teamId: "gha",
  // Opener vs Panama (1–0): a 4-4-1-1. Some shirt numbers best-effort.
  formation: "4-4-1-1",
  players: [
    { num: 1, name: "Lawrence Ati-Zigi", short: "Ati-Zigi", line: "gk", role: "Goalkeeper", club: "Saint-Étienne", at2022: true, start: { x: 50, y: 90 } },
    { num: 2, name: "Marvin Senaya", short: "Senaya", line: "def", role: "Right-back", club: "Freiburg", at2022: false, start: { x: 84, y: 70 } },
    { num: 5, name: "Jonas Adjetey", short: "Adjetey", line: "def", role: "Centre-back", club: "Basel", at2022: false, start: { x: 62, y: 73 } },
    { num: 4, name: "Jerome Opoku", short: "Opoku", line: "def", role: "Centre-back", club: "Istanbul Başakşehir", at2022: false, start: { x: 38, y: 73 } },
    { num: 3, name: "Gideon Mensah", short: "Mensah", line: "def", role: "Left-back", club: "Auxerre", at2022: true, start: { x: 16, y: 70 } },
    { num: 8, name: "Elisha Owusu", short: "Owusu", line: "mid", role: "Defensive midfield", club: "Beşiktaş", at2022: false, start: { x: 64, y: 52 } },
    { num: 6, name: "Caleb Yirenkyi", short: "Yirenkyi", line: "mid", role: "Defensive midfield", club: "Nordsjælland", at2022: false, start: { x: 36, y: 52 } },
    { num: 7, name: "Antoine Semenyo", short: "Semenyo", line: "fwd", role: "Right winger", club: "Bournemouth", at2022: false, start: { x: 82, y: 38 } },
    { num: 11, name: "Ernest Nuamah", short: "Nuamah", line: "fwd", role: "Left winger", club: "Lyon", at2022: false, start: { x: 18, y: 38 } },
    { num: 18, name: "Kamaldeen Sulemana", short: "Sulemana", line: "mid", role: "Attacking midfield", club: "Atalanta", at2022: false, start: { x: 50, y: 30 } },
    { num: 9, name: "Jordan Ayew", short: "Ayew", line: "fwd", role: "Striker", club: "Leicester City", at2022: true, captain: true, start: { x: 50, y: 13 } },

    { num: 12, name: "Benjamin Asare", short: "Asare", line: "gk", role: "Goalkeeper", club: "Hearts of Oak", at2022: false },
    { num: 22, name: "Joseph Anang", short: "Anang", line: "gk", role: "Goalkeeper", club: "St. Patrick's", at2022: false },
    { num: 13, name: "Alidu Seidu", short: "Seidu", line: "def", role: "Right-back", club: "Rennes", at2022: false },
    { num: 15, name: "Abdul Mumin", short: "Mumin", line: "def", role: "Centre-back", club: "Rayo Vallecano", at2022: true },
    { num: 16, name: "Kingsley Schindler", short: "Schindler", line: "def", role: "Full-back", club: "Samsunspor", at2022: false },
    { num: 17, name: "Razak Simpson", short: "Simpson", line: "def", role: "Centre-back", club: "Nordsjælland", at2022: false },
    { num: 14, name: "Majeed Ashimeru", short: "Ashimeru", line: "mid", role: "Central midfield", club: "Anderlecht", at2022: false },
    { num: 20, name: "Abdul Rahman Baba", short: "Baba", line: "def", role: "Left-back", club: "PAOK", at2022: false },
    { num: 21, name: "Lawrence Agyekum", short: "Agyekum", line: "mid", role: "Winger", club: "Cercle Brugge", at2022: false },
    { num: 10, name: "Joseph Paintsil", short: "Paintsil", line: "fwd", role: "Winger", club: "LA Galaxy", at2022: false },
    { num: 19, name: "Iñaki Williams", short: "I. Williams", line: "fwd", role: "Winger", club: "Athletic Club", at2022: true },
    { num: 23, name: "Christopher Bonsu Baah", short: "Bonsu Baah", line: "fwd", role: "Winger", club: "Genk", at2022: false },
    { num: 24, name: "Brandon Thomas-Asante", short: "Thomas-Asante", line: "fwd", role: "Striker", club: "Coventry", at2022: false },
    { num: 25, name: "Fatawu Issahaku", short: "Fatawu", line: "fwd", role: "Winger", club: "Leicester City", at2022: false },
    { num: 26, name: "Forson Amankwah", short: "Amankwah", line: "mid", role: "Central midfield", club: "RB Salzburg", at2022: false },
  ],
};

const ALGERIA: TeamSquad = {
  teamId: "alg",
  // Opener vs Argentina (0–3): a 4-3-3. Some shirt numbers best-effort.
  formation: "4-3-3",
  players: [
    { num: 1, name: "Luca Zidane", short: "Zidane", line: "gk", role: "Goalkeeper", club: "Granada", at2022: false, start: { x: 50, y: 90 } },
    { num: 2, name: "Rafik Belghali", short: "Belghali", line: "def", role: "Right-back", club: "Mechelen", at2022: false, start: { x: 84, y: 70 } },
    { num: 4, name: "Aïssa Mandi", short: "Mandi", line: "def", role: "Centre-back", club: "Lille", at2022: false, captain: true, start: { x: 62, y: 73 } },
    { num: 5, name: "Ramy Bensebaini", short: "Bensebaini", line: "def", role: "Centre-back", club: "Borussia Dortmund", at2022: false, start: { x: 38, y: 73 } },
    { num: 3, name: "Rayan Aït-Nouri", short: "Aït-Nouri", line: "def", role: "Left-back", club: "Manchester City", at2022: false, start: { x: 16, y: 70 } },
    { num: 6, name: "Nabil Bentaleb", short: "Bentaleb", line: "mid", role: "Defensive midfield", club: "Lille", at2022: false, start: { x: 50, y: 48 } },
    { num: 8, name: "Hicham Boudaoui", short: "Boudaoui", line: "mid", role: "Central midfield", club: "Nice", at2022: false, start: { x: 30, y: 40 } },
    { num: 7, name: "Farès Chaïbi", short: "Chaïbi", line: "mid", role: "Central midfield", club: "Eintracht Frankfurt", at2022: false, start: { x: 70, y: 40 } },
    { num: 11, name: "Ibrahim Maza", short: "Maza", line: "fwd", role: "Right winger", club: "Bayer Leverkusen", at2022: false, start: { x: 82, y: 18 } },
    { num: 9, name: "Amine Gouiri", short: "Gouiri", line: "fwd", role: "Striker", club: "Marseille", at2022: false, start: { x: 50, y: 13 } },
    { num: 18, name: "Anis Hadj Moussa", short: "Hadj Moussa", line: "fwd", role: "Left winger", club: "Feyenoord", at2022: false, start: { x: 18, y: 18 } },

    { num: 16, name: "Alexandre Oukidja", short: "Oukidja", line: "gk", role: "Goalkeeper", club: "Metz", at2022: false },
    { num: 23, name: "Anthony Mandrea", short: "Mandrea", line: "gk", role: "Goalkeeper", club: "Angers", at2022: false },
    { num: 12, name: "Mohamed Amine Tougai", short: "Tougai", line: "def", role: "Centre-back", club: "Espérance", at2022: false },
    { num: 13, name: "Jaouen Hadjam", short: "Hadjam", line: "def", role: "Left-back", club: "Young Boys", at2022: false },
    { num: 15, name: "Ahmed Touba", short: "Touba", line: "def", role: "Centre-back", club: "Al-Wakrah", at2022: false },
    { num: 20, name: "Mohamed Farsi", short: "Farsi", line: "def", role: "Right-back", club: "Columbus Crew", at2022: false },
    { num: 14, name: "Adem Zorgane", short: "Zorgane", line: "mid", role: "Defensive midfield", club: "Sporting CP", at2022: false },
    { num: 17, name: "Ramiz Zerrouki", short: "Zerrouki", line: "mid", role: "Central midfield", club: "Feyenoord", at2022: false },
    { num: 19, name: "Himad Abdelli", short: "Abdelli", line: "mid", role: "Attacking midfield", club: "Angers", at2022: false },
    { num: 22, name: "Ismael Bennacer", short: "Bennacer", line: "mid", role: "Central midfield", club: "AC Milan", at2022: false },
    { num: 10, name: "Riyad Mahrez", short: "Mahrez", line: "fwd", role: "Winger", club: "Al-Ahli", at2022: false },
    { num: 21, name: "Mohamed Amoura", short: "Amoura", line: "fwd", role: "Forward", club: "Wolfsburg", at2022: false },
    { num: 24, name: "Baghdad Bounedjah", short: "Bounedjah", line: "fwd", role: "Striker", club: "Al-Sadd", at2022: false },
    { num: 25, name: "Yassine Benzia", short: "Benzia", line: "fwd", role: "Winger", club: "Al-Adalah", at2022: false },
    { num: 26, name: "Badredine Bouanani", short: "Bouanani", line: "fwd", role: "Winger", club: "Nice", at2022: false },
  ],
};

const JORDAN: TeamSquad = {
  teamId: "jor",
  // Opener vs Austria (1–3): a 4-2-3-1. Some shirt numbers best-effort.
  formation: "4-2-3-1",
  players: [
    { num: 1, name: "Yazeed Abulaila", short: "Abulaila", line: "gk", role: "Goalkeeper", club: "Al-Hussein", at2022: false, start: { x: 50, y: 90 } },
    { num: 2, name: "Mahmoud Al-Mardi", short: "Al-Mardi", line: "def", role: "Right-back", club: "Al-Hussein", at2022: false, start: { x: 84, y: 70 } },
    { num: 5, name: "Yazan Al-Arab", short: "Al-Arab", line: "def", role: "Centre-back", club: "FC Seoul", at2022: false, start: { x: 62, y: 73 } },
    { num: 4, name: "Abdallah Nasib", short: "Nasib", line: "def", role: "Centre-back", club: "Al-Zawraa", at2022: false, start: { x: 38, y: 73 } },
    { num: 3, name: "Mohammad Abualnadi", short: "Abualnadi", line: "def", role: "Left-back", club: "Selangor", at2022: false, start: { x: 16, y: 70 } },
    { num: 6, name: "Nizar Al-Rashdan", short: "Al-Rashdan", line: "mid", role: "Defensive midfield", club: "Al-Gharafa", at2022: false, start: { x: 64, y: 50 } },
    { num: 8, name: "Noor Al-Rawabdeh", short: "Al-Rawabdeh", line: "mid", role: "Central midfield", club: "Selangor", at2022: false, start: { x: 36, y: 50 } },
    { num: 7, name: "Mousa Al-Tamari", short: "Al-Tamari", line: "fwd", role: "Right winger", club: "Rennes", at2022: false, captain: true, start: { x: 78, y: 29 } },
    { num: 10, name: "Ibrahim Saadeh", short: "Saadeh", line: "mid", role: "Attacking midfield", club: "Al-Karma", at2022: false, start: { x: 50, y: 31 } },
    { num: 11, name: "Mahmoud Al-Mawas", short: "Al-Mawas", line: "fwd", role: "Left winger", club: "Al-Wehdat", at2022: false, start: { x: 22, y: 29 } },
    { num: 9, name: "Ali Olwan", short: "Olwan", line: "fwd", role: "Striker", club: "Al-Sailiya", at2022: false, start: { x: 50, y: 13 } },

    { num: 12, name: "Abdullah Al-Fakhouri", short: "Al-Fakhouri", line: "gk", role: "Goalkeeper", club: "Al-Wehdat", at2022: false },
    { num: 22, name: "Noor Bani Attiah", short: "Bani Attiah", line: "gk", role: "Goalkeeper", club: "Al-Faisaly", at2022: false },
    { num: 13, name: "Saed Al-Rosan", short: "Al-Rosan", line: "def", role: "Centre-back", club: "Al-Faisaly", at2022: false },
    { num: 15, name: "Ehsan Haddad", short: "Haddad", line: "def", role: "Centre-back", club: "Al-Hussein", at2022: false },
    { num: 16, name: "Salim Obaid", short: "Obaid", line: "def", role: "Left-back", club: "Al-Hussein", at2022: false },
    { num: 17, name: "Anas Banawi", short: "Banawi", line: "def", role: "Right-back", club: "Al-Faisaly", at2022: false },
    { num: 14, name: "Rajaei Ayed", short: "Ayed", line: "mid", role: "Defensive midfield", club: "Al-Hussein", at2022: false },
    { num: 18, name: "Amer Jamous", short: "Jamous", line: "mid", role: "Central midfield", club: "Al-Zawraa", at2022: false },
    { num: 19, name: "Mohammad Al-Dawoud", short: "Al-Dawoud", line: "mid", role: "Central midfield", club: "Al-Wehdat", at2022: false },
    { num: 20, name: "Ibrahim Sabra", short: "Sabra", line: "mid", role: "Attacking midfield", club: "Lokomotiva Zagreb", at2022: false },
    { num: 21, name: "Mohannad Abu Taha", short: "Abu Taha", line: "mid", role: "Central midfield", club: "Al-Quwa", at2022: false },
    { num: 23, name: "Odeh Al-Fakhouri", short: "O. Al-Fakhouri", line: "fwd", role: "Forward", club: "Pyramids", at2022: false },
    { num: 24, name: "Mohammad Abu Zrayq", short: "Abu Zrayq", line: "fwd", role: "Striker", club: "Raja", at2022: false },
    { num: 25, name: "Ali Azaizeh", short: "Azaizeh", line: "fwd", role: "Winger", club: "Al-Shabab", at2022: false },
    { num: 26, name: "Yazan Al-Naimat", short: "Al-Naimat", line: "fwd", role: "Striker", club: "Al-Ahli", at2022: false },
  ],
};

const UZBEKISTAN: TeamSquad = {
  teamId: "uzb",
  // Opener vs Colombia (1–3): a 3-4-2-1. Some shirt numbers best-effort.
  formation: "3-4-2-1",
  players: [
    { num: 1, name: "Utkir Yusupov", short: "Yusupov", line: "gk", role: "Goalkeeper", club: "Pakhtakor", at2022: false, start: { x: 50, y: 90 } },
    { num: 4, name: "Rustamjon Ashurmatov", short: "Ashurmatov", line: "def", role: "Centre-back", club: "Al-Shabab", at2022: false, start: { x: 28, y: 75 } },
    { num: 5, name: "Abdukodir Khusanov", short: "Khusanov", line: "def", role: "Centre-back", club: "Manchester City", at2022: false, start: { x: 50, y: 77 } },
    { num: 3, name: "Abdulla Abdullaev", short: "Abdullaev", line: "def", role: "Centre-back", club: "Pakhtakor", at2022: false, start: { x: 72, y: 75 } },
    { num: 2, name: "Sherzod Nasrullaev", short: "Nasrullaev", line: "def", role: "Right wing-back", club: "Pakhtakor", at2022: false, start: { x: 88, y: 52 } },
    { num: 6, name: "Odiljon Hamrobekov", short: "Hamrobekov", line: "mid", role: "Defensive midfield", club: "Hangzhou", at2022: false, start: { x: 38, y: 50 } },
    { num: 8, name: "Otabek Shukurov", short: "Shukurov", line: "mid", role: "Central midfield", club: "Al-Wakrah", at2022: false, start: { x: 62, y: 50 } },
    { num: 13, name: "Farrukh Sayfiev", short: "Sayfiev", line: "def", role: "Left wing-back", club: "Pakhtakor", at2022: false, start: { x: 12, y: 52 } },
    { num: 10, name: "Abbosbek Fayzullaev", short: "Fayzullaev", line: "mid", role: "Attacking midfield", club: "İstanbul Başakşehir", at2022: false, start: { x: 64, y: 30 } },
    { num: 7, name: "Oston Urunov", short: "Urunov", line: "mid", role: "Attacking midfield", club: "Neftçi", at2022: false, start: { x: 36, y: 30 } },
    { num: 9, name: "Eldor Shomurodov", short: "Shomurodov", line: "fwd", role: "Striker", club: "Roma", at2022: false, captain: true, start: { x: 50, y: 13 } },

    { num: 12, name: "Abduvohid Nematov", short: "Nematov", line: "gk", role: "Goalkeeper", club: "Navbahor", at2022: false },
    { num: 22, name: "Vladimir Nazarov", short: "Nazarov", line: "gk", role: "Goalkeeper", club: "Nasaf", at2022: false },
    { num: 14, name: "Khojiakbar Alijonov", short: "Alijonov", line: "def", role: "Right-back", club: "Pakhtakor", at2022: false },
    { num: 15, name: "Sherzod Esanov", short: "Esanov", line: "def", role: "Centre-back", club: "Nasaf", at2022: false },
    { num: 16, name: "Umarali Rahmonaliev", short: "Rahmonaliev", line: "mid", role: "Defensive midfield", club: "Pakhtakor", at2022: false },
    { num: 17, name: "Jaloliddin Masharipov", short: "Masharipov", line: "mid", role: "Winger", club: "Pakhtakor", at2022: false },
    { num: 18, name: "Khojimat Erkinov", short: "Erkinov", line: "mid", role: "Attacking midfield", club: "FC Seoul", at2022: false },
    { num: 19, name: "Jasurbek Jaloliddinov", short: "Jaloliddinov", line: "mid", role: "Attacking midfield", club: "Lokomotiv Moscow", at2022: false },
    { num: 20, name: "Azizbek Turgunboev", short: "Turgunboev", line: "fwd", role: "Winger", club: "Pakhtakor", at2022: false },
    { num: 21, name: "Igor Sergeev", short: "Sergeev", line: "fwd", role: "Striker", club: "Pakhtakor", at2022: false },
    { num: 11, name: "Bobir Abdixolikov", short: "Abdixolikov", line: "fwd", role: "Striker", club: "Ulsan", at2022: false },
    { num: 23, name: "Diyor Kholmatov", short: "Kholmatov", line: "def", role: "Left-back", club: "Pakhtakor", at2022: false },
    { num: 24, name: "Jamshid Iskanderov", short: "Iskanderov", line: "mid", role: "Attacking midfield", club: "Neftçi", at2022: false },
    { num: 25, name: "Ruslanbek Jiyanov", short: "Jiyanov", line: "mid", role: "Central midfield", club: "Pakhtakor", at2022: false },
    { num: 26, name: "Khusniddin Alikulov", short: "Alikulov", line: "def", role: "Centre-back", club: "Pakhtakor", at2022: false },
  ],
};

const PANAMA: TeamSquad = {
  teamId: "pan",
  // Opener vs Ghana (0–1): a 4-4-2. Some shirt numbers best-effort.
  formation: "4-4-2",
  players: [
    { num: 1, name: "Orlando Mosquera", short: "Mosquera", line: "gk", role: "Goalkeeper", club: "Sporting San Miguelito", at2022: false, start: { x: 50, y: 90 } },
    { num: 2, name: "César Blackman", short: "Blackman", line: "def", role: "Right-back", club: "Cartaginés", at2022: false, start: { x: 84, y: 70 } },
    { num: 5, name: "Jiovany Ramos", short: "J. Ramos", line: "def", role: "Centre-back", club: "Tauro", at2022: false, start: { x: 62, y: 73 } },
    { num: 3, name: "José Córdoba", short: "Córdoba", line: "def", role: "Centre-back", club: "Norwich City", at2022: false, start: { x: 38, y: 73 } },
    { num: 4, name: "Andrés Andrade", short: "Andrade", line: "def", role: "Left-back", club: "Colorado Rapids", at2022: false, start: { x: 16, y: 70 } },
    { num: 6, name: "Cristian Martínez", short: "C. Martínez", line: "mid", role: "Central midfield", club: "Independiente", at2022: false, start: { x: 58, y: 50 } },
    { num: 8, name: "Carlos Harvey", short: "Harvey", line: "mid", role: "Central midfield", club: "Minnesota United", at2022: false, start: { x: 38, y: 50 } },
    { num: 7, name: "Amir Murillo", short: "Murillo", line: "mid", role: "Right midfield", club: "Marseille", at2022: false, captain: true, start: { x: 84, y: 44 } },
    { num: 11, name: "José Luis Rodríguez", short: "JL Rodríguez", line: "mid", role: "Left midfield", club: "Gil Vicente", at2022: false, start: { x: 14, y: 44 } },
    { num: 9, name: "Ismael Díaz", short: "I. Díaz", line: "fwd", role: "Striker", club: "León", at2022: false, start: { x: 62, y: 16 } },
    { num: 10, name: "Cecilio Waterman", short: "Waterman", line: "fwd", role: "Striker", club: "Coquimbo Unido", at2022: false, start: { x: 38, y: 16 } },

    { num: 12, name: "Luis Mejía", short: "Mejía", line: "gk", role: "Goalkeeper", club: "Nacional", at2022: false },
    { num: 22, name: "José Guerra", short: "Guerra", line: "gk", role: "Goalkeeper", club: "Plaza Amador", at2022: false },
    { num: 13, name: "Eric Davis", short: "Davis", line: "def", role: "Left-back", club: "Aris", at2022: false },
    { num: 15, name: "Edgardo Fariña", short: "Fariña", line: "def", role: "Centre-back", club: "Sporting San Miguelito", at2022: false },
    { num: 16, name: "Andrés Salazar", short: "Salazar", line: "def", role: "Centre-back", club: "Tauro", at2022: false },
    { num: 17, name: "Roderick Miller", short: "Miller", line: "def", role: "Centre-back", club: "Cincinnati", at2022: false },
    { num: 14, name: "Adalberto Carrasquilla", short: "Carrasquilla", line: "mid", role: "Central midfield", club: "Houston Dynamo", at2022: false },
    { num: 18, name: "Aníbal Godoy", short: "Godoy", line: "mid", role: "Defensive midfield", club: "San Jose", at2022: false },
    { num: 19, name: "Edward Cedeño", short: "Cedeño", line: "mid", role: "Central midfield", club: "Plaza Amador", at2022: false },
    { num: 20, name: "Ánibal Corro", short: "Corro", line: "mid", role: "Central midfield", club: "Atlético Nacional", at2022: false },
    { num: 21, name: "Azarías Londoño", short: "Londoño", line: "fwd", role: "Winger", club: "Sporting San Miguelito", at2022: false },
    { num: 23, name: "Tomás Rodríguez", short: "T. Rodríguez", line: "fwd", role: "Winger", club: "Sporting San Miguelito", at2022: false },
    { num: 24, name: "Eduardo Guerrero", short: "Guerrero", line: "fwd", role: "Striker", club: "Xelajú", at2022: false },
    { num: 25, name: "Jorge Gutiérrez", short: "Gutiérrez", line: "mid", role: "Winger", club: "Sporting San Miguelito", at2022: false },
    { num: 26, name: "Michael Murillo", short: "M. Murillo", line: "def", role: "Right-back", club: "Olympiacos", at2022: false },
  ],
};

const SWITZERLAND: TeamSquad = {
  teamId: "sui",
  // 4-3-3 — XI around the Bosnia win / Canada decider. Bench numbers best-effort.
  formation: "4-3-3",
  players: [
    { num: 1, name: "Gregor Kobel", short: "Kobel", line: "gk", role: "Goalkeeper", club: "Borussia Dortmund", at2022: false, start: { x: 50, y: 90 } },
    { num: 2, name: "Silvan Widmer", short: "Widmer", line: "def", role: "Right-back", club: "Mainz", at2022: true, start: { x: 84, y: 70 } },
    { num: 4, name: "Nico Elvedi", short: "Elvedi", line: "def", role: "Centre-back", club: "Borussia M'gladbach", at2022: true, start: { x: 62, y: 73 } },
    { num: 5, name: "Manuel Akanji", short: "Akanji", line: "def", role: "Centre-back", club: "Manchester City", at2022: true, start: { x: 38, y: 73 } },
    { num: 13, name: "Ricardo Rodríguez", short: "R. Rodríguez", line: "def", role: "Left-back", club: "Real Betis", at2022: true, start: { x: 16, y: 70 } },
    { num: 10, name: "Granit Xhaka", short: "Xhaka", line: "mid", role: "Defensive midfield", club: "Sunderland", at2022: true, captain: true, start: { x: 50, y: 48 } },
    { num: 8, name: "Remo Freuler", short: "Freuler", line: "mid", role: "Central midfield", club: "Bologna", at2022: true, start: { x: 70, y: 40 } },
    { num: 15, name: "Johan Manzambi", short: "Manzambi", line: "mid", role: "Central midfield", club: "Freiburg", at2022: false, start: { x: 30, y: 40 } },
    { num: 11, name: "Dan Ndoye", short: "Ndoye", line: "fwd", role: "Right winger", club: "Nottingham Forest", at2022: false, start: { x: 82, y: 18 } },
    { num: 7, name: "Breel Embolo", short: "Embolo", line: "fwd", role: "Striker", club: "Monaco", at2022: true, start: { x: 50, y: 13 } },
    { num: 17, name: "Rubén Vargas", short: "Vargas", line: "fwd", role: "Left winger", club: "Sevilla", at2022: true, start: { x: 18, y: 18 } },

    { num: 12, name: "Marwin Hitz", short: "Hitz", line: "gk", role: "Goalkeeper", club: "Basel", at2022: false },
    { num: 21, name: "Jonas Omlin", short: "Omlin", line: "gk", role: "Goalkeeper", club: "Borussia M'gladbach", at2022: false },
    { num: 3, name: "Cédric Zesiger", short: "Zesiger", line: "def", role: "Centre-back", club: "Augsburg", at2022: false },
    { num: 22, name: "Fabian Schär", short: "Schär", line: "def", role: "Centre-back", club: "Newcastle", at2022: true },
    { num: 20, name: "Becir Omeragic", short: "Omeragic", line: "def", role: "Centre-back", club: "Montpellier", at2022: false },
    { num: 6, name: "Aurèle Amenda", short: "Amenda", line: "def", role: "Centre-back", club: "Eintracht Frankfurt", at2022: false },
    { num: 24, name: "Leonidas Stergiou", short: "Stergiou", line: "def", role: "Right-back", club: "Stuttgart", at2022: false },
    { num: 18, name: "Denis Zakaria", short: "Zakaria", line: "mid", role: "Defensive midfield", club: "Monaco", at2022: true },
    { num: 14, name: "Vincent Sierro", short: "Sierro", line: "mid", role: "Central midfield", club: "Toulouse", at2022: false },
    { num: 23, name: "Michel Aebischer", short: "Aebischer", line: "mid", role: "Central midfield", club: "Bologna", at2022: true },
    { num: 16, name: "Fabian Rieder", short: "Rieder", line: "mid", role: "Attacking midfield", club: "Stuttgart", at2022: false },
    { num: 25, name: "Ardon Jashari", short: "Jashari", line: "mid", role: "Central midfield", club: "Club Brugge", at2022: false },
    { num: 9, name: "Zeki Amdouni", short: "Amdouni", line: "fwd", role: "Striker", club: "Benfica", at2022: false },
    { num: 19, name: "Andi Zeqiri", short: "Zeqiri", line: "fwd", role: "Striker", club: "Getafe", at2022: false },
    { num: 26, name: "Joël Monteiro", short: "Monteiro", line: "fwd", role: "Winger", club: "Young Boys", at2022: false },
  ],
};

const CANADA: TeamSquad = {
  teamId: "can",
  // 4-4-2 — XI around the Qatar rout / Switzerland decider. Bench best-effort.
  formation: "4-4-2",
  players: [
    { num: 16, name: "Maxime Crépeau", short: "Crépeau", line: "gk", role: "Goalkeeper", club: "Portland Timbers", at2022: true, start: { x: 50, y: 90 } },
    { num: 2, name: "Alistair Johnston", short: "Johnston", line: "def", role: "Right-back", club: "Celtic", at2022: true, start: { x: 84, y: 70 } },
    { num: 4, name: "Luc de Fougerolles", short: "de Fougerolles", line: "def", role: "Centre-back", club: "Fulham", at2022: false, start: { x: 62, y: 73 } },
    { num: 5, name: "Derek Cornelius", short: "Cornelius", line: "def", role: "Centre-back", club: "Marseille", at2022: true, start: { x: 38, y: 73 } },
    { num: 22, name: "Richie Laryea", short: "Laryea", line: "def", role: "Left-back", club: "Toronto FC", at2022: true, start: { x: 16, y: 70 } },
    { num: 11, name: "Tajon Buchanan", short: "Buchanan", line: "mid", role: "Right midfield", club: "Villarreal", at2022: true, start: { x: 84, y: 44 } },
    { num: 7, name: "Stephen Eustáquio", short: "Eustáquio", line: "mid", role: "Central midfield", club: "Porto", at2022: true, captain: true, start: { x: 58, y: 50 } },
    { num: 12, name: "Nathan Saliba", short: "Saliba", line: "mid", role: "Central midfield", club: "Anderlecht", at2022: false, start: { x: 38, y: 50 } },
    { num: 17, name: "Ali Ahmed", short: "A. Ahmed", line: "mid", role: "Left midfield", club: "Vancouver Whitecaps", at2022: false, start: { x: 14, y: 44 } },
    { num: 20, name: "Jonathan David", short: "David", line: "fwd", role: "Striker", club: "Juventus", at2022: true, start: { x: 62, y: 16 } },
    { num: 9, name: "Cyle Larin", short: "Larin", line: "fwd", role: "Striker", club: "Mallorca", at2022: true, start: { x: 38, y: 16 } },

    { num: 1, name: "Dayne St. Clair", short: "St. Clair", line: "gk", role: "Goalkeeper", club: "Minnesota United", at2022: false },
    { num: 18, name: "Milan Borjan", short: "Borjan", line: "gk", role: "Goalkeeper", club: "Slovan Bratislava", at2022: true },
    { num: 19, name: "Alphonso Davies", short: "Davies", line: "def", role: "Left-back", club: "Bayern Munich", at2022: true },
    { num: 3, name: "Sam Adekugbe", short: "Adekugbe", line: "def", role: "Left-back", club: "Hatayspor", at2022: true },
    { num: 13, name: "Moïse Bombito", short: "Bombito", line: "def", role: "Centre-back", club: "Nice", at2022: false },
    { num: 15, name: "Joel Waterman", short: "Waterman", line: "def", role: "Centre-back", club: "CF Montréal", at2022: false },
    { num: 6, name: "Ismaël Koné", short: "Koné", line: "mid", role: "Central midfield", club: "Rennes", at2022: true },
    { num: 8, name: "Liam Fraser", short: "Fraser", line: "mid", role: "Defensive midfield", club: "Deinze", at2022: false },
    { num: 24, name: "Jonathan Osorio", short: "Osorio", line: "mid", role: "Attacking midfield", club: "Toronto FC", at2022: true },
    { num: 21, name: "Jacob Shaffelburg", short: "Shaffelburg", line: "fwd", role: "Winger", club: "Nashville", at2022: false },
    { num: 14, name: "Jacen Russell-Rowe", short: "Russell-Rowe", line: "fwd", role: "Striker", club: "Columbus Crew", at2022: false },
    { num: 10, name: "Junior Hoilett", short: "Hoilett", line: "fwd", role: "Winger", club: "Aberdeen", at2022: false },
    { num: 23, name: "Liam Millar", short: "Millar", line: "fwd", role: "Winger", club: "Hull City", at2022: true },
    { num: 25, name: "Niko Sigur", short: "Sigur", line: "def", role: "Right-back", club: "Hajduk Split", at2022: false },
    { num: 26, name: "Promise David", short: "P. David", line: "fwd", role: "Striker", club: "Union SG", at2022: false },
  ],
};

const QATAR: TeamSquad = {
  teamId: "qat",
  // 4-3-3 — XI vs Bosnia (Ahmed & Madibo suspended from the Canada loss). Best-effort numbers.
  formation: "4-3-3",
  players: [
    { num: 22, name: "Meshaal Barsham", short: "Barsham", line: "gk", role: "Goalkeeper", club: "Al-Sadd", at2022: true, start: { x: 50, y: 90 } },
    { num: 2, name: "Pedro Miguel", short: "Pedro Miguel", line: "def", role: "Centre-back", club: "Al-Sadd", at2022: true, start: { x: 62, y: 73 } },
    { num: 15, name: "Bassam Al-Rawi", short: "Al-Rawi", line: "def", role: "Right-back", club: "Al-Duhail", at2022: true, start: { x: 84, y: 70 } },
    { num: 5, name: "Tarek Salman", short: "Salman", line: "def", role: "Centre-back", club: "Al-Sadd", at2022: true, start: { x: 38, y: 73 } },
    { num: 14, name: "Sultan Al-Brake", short: "Al-Brake", line: "def", role: "Left-back", club: "Al-Duhail", at2022: false, start: { x: 16, y: 70 } },
    { num: 12, name: "Karim Boudiaf", short: "Boudiaf", line: "mid", role: "Defensive midfield", club: "Al-Rayyan", at2022: true, start: { x: 50, y: 48 } },
    { num: 23, name: "Mostafa Meshaal", short: "Meshaal", line: "mid", role: "Central midfield", club: "Al-Sadd", at2022: false, start: { x: 70, y: 40 } },
    { num: 8, name: "Ali Asad", short: "Asad", line: "mid", role: "Central midfield", club: "Al-Sadd", at2022: true, start: { x: 30, y: 40 } },
    { num: 19, name: "Almoez Ali", short: "Almoez", line: "fwd", role: "Right winger", club: "Al-Duhail", at2022: true, start: { x: 82, y: 18 } },
    { num: 11, name: "Akram Afif", short: "Afif", line: "fwd", role: "Striker", club: "Al-Sadd", at2022: true, captain: true, start: { x: 50, y: 13 } },
    { num: 17, name: "Ismaeel Mohammad", short: "I. Mohammad", line: "fwd", role: "Left winger", club: "Al-Duhail", at2022: true, start: { x: 18, y: 18 } },

    { num: 1, name: "Saad Al-Sheeb", short: "Al-Sheeb", line: "gk", role: "Goalkeeper", club: "Al-Sadd", at2022: true },
    { num: 21, name: "Yousef Hassan", short: "Y. Hassan", line: "gk", role: "Goalkeeper", club: "Al-Gharafa", at2022: true },
    { num: 3, name: "Abdelkarim Hassan", short: "A. Hassan", line: "def", role: "Left-back", club: "Al-Arabi", at2022: true },
    { num: 4, name: "Homam Ahmed", short: "H. Ahmed", line: "def", role: "Left-back", club: "Al-Gharafa", at2022: true },
    { num: 6, name: "Abdelaziz Hatem", short: "Hatem", line: "mid", role: "Central midfield", club: "Al-Rayyan", at2022: true },
    { num: 13, name: "Assim Madibo", short: "Madibo", line: "mid", role: "Defensive midfield", club: "Al-Duhail", at2022: true },
    { num: 10, name: "Hassan Al-Haydos", short: "Al-Haydos", line: "mid", role: "Attacking midfield", club: "Al-Sadd", at2022: true },
    { num: 16, name: "Boualem Khoukhi", short: "Khoukhi", line: "def", role: "Centre-back", club: "Al-Sadd", at2022: true },
    { num: 7, name: "Ahmed Alaaeldin", short: "Alaaeldin", line: "mid", role: "Right winger", club: "Al-Gharafa", at2022: false },
    { num: 18, name: "Khaled Muneer", short: "Muneer", line: "mid", role: "Central midfield", club: "Al-Wakrah", at2022: false },
    { num: 9, name: "Mohammed Muntari", short: "Muntari", line: "fwd", role: "Striker", club: "Al-Duhail", at2022: false },
    { num: 20, name: "Ahmed Al-Ganehi", short: "Al-Ganehi", line: "def", role: "Right-back", club: "Al-Sadd", at2022: false },
    { num: 24, name: "Jassem Gaber", short: "Gaber", line: "mid", role: "Central midfield", club: "Al-Arabi", at2022: false },
    { num: 25, name: "Yusuf Abdurisag", short: "Abdurisag", line: "fwd", role: "Winger", club: "Al-Sadd", at2022: false },
    { num: 26, name: "Edmilson Junior", short: "Edmilson", line: "fwd", role: "Winger", club: "Al-Duhail", at2022: false },
  ],
};

const BOSNIA: TeamSquad = {
  teamId: "bih",
  // 4-4-2 — XI vs Qatar (Muharemović suspended from the Switzerland loss). Best-effort numbers.
  formation: "4-4-2",
  players: [
    { num: 1, name: "Nikola Vasilj", short: "Vasilj", line: "gk", role: "Goalkeeper", club: "St. Pauli", at2022: false, start: { x: 50, y: 90 } },
    { num: 2, name: "Sead Dedić", short: "Dedić", line: "def", role: "Right-back", club: "Lommel", at2022: false, start: { x: 84, y: 70 } },
    { num: 5, name: "Nikola Katić", short: "Katić", line: "def", role: "Centre-back", club: "Dinamo Zagreb", at2022: false, start: { x: 62, y: 73 } },
    { num: 4, name: "Dennis Hadžikadunić", short: "Hadžikadunić", line: "def", role: "Centre-back", club: "Rizespor", at2022: false, start: { x: 38, y: 73 } },
    { num: 3, name: "Sead Kolašinac", short: "Kolašinac", line: "def", role: "Left-back", club: "Atalanta", at2022: true, start: { x: 16, y: 70 } },
    { num: 18, name: "Nedim Bajraktarević", short: "Bajraktarević", line: "mid", role: "Right midfield", club: "Grasshopper", at2022: false, start: { x: 84, y: 44 } },
    { num: 6, name: "Ivan Šunjić", short: "Šunjić", line: "mid", role: "Central midfield", club: "Hajduk Split", at2022: false, start: { x: 58, y: 50 } },
    { num: 14, name: "Benjamin Tahirović", short: "Tahirović", line: "mid", role: "Central midfield", club: "Ajax", at2022: false, start: { x: 38, y: 50 } },
    { num: 20, name: "Amar Memić", short: "Memić", line: "mid", role: "Left midfield", club: "Lugano", at2022: false, start: { x: 14, y: 44 } },
    { num: 9, name: "Ermedin Demirović", short: "Demirović", line: "fwd", role: "Striker", club: "Stuttgart", at2022: false, start: { x: 62, y: 16 } },
    { num: 11, name: "Edin Džeko", short: "Džeko", line: "fwd", role: "Striker", club: "Fiorentina", at2022: true, captain: true, start: { x: 38, y: 16 } },

    { num: 12, name: "Ibrahim Šehić", short: "Šehić", line: "gk", role: "Goalkeeper", club: "Zrinjski", at2022: false },
    { num: 23, name: "Vladan Kovačević", short: "Kovačević", line: "gk", role: "Goalkeeper", club: "Sporting CP", at2022: false },
    { num: 13, name: "Tarik Muharemović", short: "Muharemović", line: "def", role: "Centre-back", club: "Sassuolo", at2022: false },
    { num: 15, name: "Amar Dedić", short: "A. Dedić", line: "def", role: "Right-back", club: "Benfica", at2022: false },
    { num: 21, name: "Adrian Leon Barišić", short: "Barišić", line: "def", role: "Centre-back", club: "Rijeka", at2022: false },
    { num: 17, name: "Nihad Mujakić", short: "Mujakić", line: "def", role: "Centre-back", club: "Konyaspor", at2022: false },
    { num: 8, name: "Gojko Cimirot", short: "Cimirot", line: "mid", role: "Defensive midfield", club: "Standard Liège", at2022: true },
    { num: 10, name: "Miralem Pjanić", short: "Pjanić", line: "mid", role: "Central midfield", club: "Al-Wasl", at2022: true },
    { num: 7, name: "Edin Višća", short: "Višća", line: "mid", role: "Right winger", club: "Trabzonspor", at2022: true },
    { num: 16, name: "Amar Begić", short: "Begić", line: "mid", role: "Central midfield", club: "Spartak Subotica", at2022: false },
    { num: 19, name: "Haris Tabaković", short: "Tabaković", line: "fwd", role: "Striker", club: "Hoffenheim", at2022: false },
    { num: 22, name: "Dženan Buljugija", short: "Buljugija", line: "def", role: "Right-back", club: "Borac Banja Luka", at2022: false },
    { num: 24, name: "Kerim Alajbegović", short: "Alajbegović", line: "mid", role: "Attacking midfield", club: "RB Salzburg", at2022: false },
    { num: 25, name: "Dal Varešanović", short: "Varešanović", line: "mid", role: "Attacking midfield", club: "Ferencváros", at2022: false },
    { num: 26, name: "Belmin Dizdarević", short: "Dizdarević", line: "fwd", role: "Winger", club: "Sloboda Tuzla", at2022: false },
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
  bra: BRAZIL,
  ned: NETHERLANDS,
  hai: HAITI,
  swe: SWEDEN,
  ger: GERMANY,
  par: PARAGUAY,
  tur: TURKIYE,
  civ: IVORY_COAST,
  bel: BELGIUM,
  irn: IRAN,
  uru: URUGUAY,
  ksa: SAUDI_ARABIA,
  cpv: CABO_VERDE,
  aut: AUSTRIA,
  nzl: NEW_ZEALAND,
  egy: EGYPT,
  irq: IRAQ,
  cro: CROATIA,
  sen: SENEGAL,
  nor: NORWAY,
  gha: GHANA,
  alg: ALGERIA,
  jor: JORDAN,
  uzb: UZBEKISTAN,
  pan: PANAMA,
  sui: SWITZERLAND,
  can: CANADA,
  qat: QATAR,
  bih: BOSNIA,
};
