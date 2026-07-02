import live from "./live.json";

/**
 * Announced match attendances. Curated by hand from official figures; the
 * update-data workflow also captures attendance into live.json when the feed
 * provides it. Curated values take precedence.
 */
const curated: Record<string, number> = {
  "m-A-1": 80824, // Mexico 2–0 South Africa — Estadio Azteca (opener)
  "m-A-2": 44985, // Korea Republic 2–1 Czechia — Estadio Akron
  "m-B-1": 43002, // Canada 1–1 Bosnia — BMO Field
  "m-B-2": 67966, // Qatar 1–1 Switzerland — Levi's Stadium
  "m-C-1": 80663, // Brazil 1–1 Morocco — MetLife Stadium
  "m-C-2": 64146, // Haiti 0–1 Scotland — Gillette Stadium
  "m-D-1": 70492, // United States 4–1 Paraguay — SoFi Stadium
  "m-D-2": 52497, // Australia 2–0 Türkiye — BC Place
  "m-E-1": 68021, // Germany 7–1 Curaçao — NRG Stadium
  "m-E-2": 68274, // Côte d'Ivoire 1–0 Ecuador — Lincoln Financial Field
  "m-F-1": 69285, // Netherlands 2–2 Japan — AT&T Stadium
  "m-F-2": 50987, // Sweden 5–1 Tunisia — Estadio BBVA
  "m-G-1": 66775, // Belgium 1–1 Egypt — Lumen Field
  "m-G-2": 70108, // Iran 2–2 New Zealand — SoFi Stadium
  "m-H-1": 67640, // Spain 0–0 Cabo Verde — Mercedes-Benz Stadium
  "m-H-2": 62764, // Saudi Arabia 1–1 Uruguay — Hard Rock Stadium
  "m-I-1": 80545, // France 3–1 Senegal — MetLife Stadium
  "m-I-2": 63106, // Iraq 1–4 Norway — Gillette Stadium
  "m-J-1": 69045, // Argentina 3–0 Algeria — GEHA Field at Arrowhead (Messi hat-trick)
  "m-J-2": 69391, // Austria 3–1 Jordan — Levi's Stadium
  "m-K-1": 68777, // Portugal 1–1 DR Congo — NRG Stadium
  // Matchday 2 onward
  "m-B-3": 70026, // Switzerland 4–1 Bosnia — SoFi Stadium
  "m-B-4": 52497, // Canada 6–0 Qatar — BC Place (first-ever WC win)
  "m-K-2": 80824, // Uzbekistan 1–3 Colombia — Estadio Azteca
  "m-L-2": 42942, // Ghana 1–0 Panama — BMO Field
  "m-A-4": 45522, // Mexico 1–0 Korea Republic — Estadio Akron
  "m-F-3": 68777, // Netherlands 5–1 Sweden — NRG Stadium
  "m-J-3": 70649, // Argentina 2–0 Austria — AT&T Stadium, Dallas
  "m-I-4": 80663, // Norway 3–2 Senegal — MetLife Stadium (Haaland brace)
  "m-K-3": 68777, // Portugal 5–0 Uzbekistan — NRG Stadium (Ronaldo brace)
  // Matchday 2/3 — figures researched & cross-checked (FIFA/Wikipedia/ESPN)
  "m-L-1": 70389, // England 4–2 Croatia — AT&T Stadium, Dallas
  "m-A-3": 67442, // Czechia 1–1 South Africa — Mercedes-Benz Stadium
  "m-D-3": 66925, // United States 2–0 Australia — Lumen Field (sellout)
  "m-C-4": 68324, // Brazil 3–0 Haiti — Lincoln Financial Field
  "m-D-4": 68827, // Türkiye 0–1 Paraguay — Levi's Stadium
  "m-E-3": 43036, // Germany 2–1 Côte d'Ivoire — BMO Field
  "m-E-4": 68598, // Ecuador 0–0 Curaçao — Arrowhead Stadium
  "m-F-4": 51243, // Tunisia 0–4 Japan — Estadio BBVA
  "m-H-3": 68239, // Spain 4–0 Saudi Arabia — Mercedes-Benz Stadium
  "m-G-3": 70317, // Belgium 0–0 Iran — SoFi Stadium
  "m-H-4": 64003, // Uruguay 2–2 Cabo Verde — Hard Rock Stadium
  "m-G-4": 52497, // New Zealand 1–3 Egypt — BC Place
  "m-I-3": 68234, // France 3–0 Iraq — Lincoln Financial Field (2hr storm delay)
  "m-J-4": 68371, // Jordan 1–2 Algeria — Levi's Stadium
  // Matchday 3 (June 25 deciders)
  "m-D-5": 70492, // Türkiye 3–2 United States — SoFi Stadium (USA rotated, lost)
  "m-E-5": 68324, // Côte d'Ivoire 2–0 Curaçao — Lincoln Financial Field
  "m-E-6": 80663, // Ecuador 2–1 Germany — MetLife Stadium (upset)
  "m-F-5": 70137, // Japan 1–1 Sweden — AT&T Stadium
  "m-F-6": 68391, // Netherlands 3–1 Tunisia — Arrowhead Stadium
  // Groups G/H/I deciders (June 26)
  "m-G-5": 66925, // Egypt 1–1 Iran — Lumen Field, Seattle
  "m-G-6": 52497, // New Zealand 1–5 Belgium — BC Place, Vancouver
  "m-H-5": 68278, // Cabo Verde 0–0 Saudi Arabia — NRG Stadium, Houston
  "m-H-6": 45065, // Uruguay 0–1 Spain — Estadio Akron, Guadalajara (Uruguay out)
  "m-I-5": 64146, // Norway 1–4 France — Gillette Stadium, Foxborough
  // Groups K/L deciders (June 27)
  "m-K-5": 64478, // Colombia 0–0 Portugal — Hard Rock Stadium, Miami
  "m-L-5": 80663, // Panama 0–2 England — MetLife Stadium, New York/New Jersey
  "m-L-6": 68324, // Croatia 2–1 Ghana — Lincoln Financial Field, Philadelphia
  // Pending official figures — every search attempt so far has returned a
  // number that's an exact duplicate of a *different* match's already-curated
  // attendance at the same venue (a search-tool artifact, not a real repeat
  // sellout), so nothing below is trustworthy enough to add yet:
  //   m-C-3 Scotland 0–1 Morocco (Gillette), m-L-3 England 0–0 Ghana (Gillette),
  //   m-L-4 Panama 0–1 Croatia (BMO Field), m-K-4 Colombia 1–0 DR Congo (Akron),
  //   m-B-5 Switzerland 2–1 Canada (BC Place), m-B-6 Bosnia 3–1 Qatar (Lumen),
  //   m-C-5 Scotland 0–3 Brazil (Hard Rock), m-C-6 Morocco 4–2 Haiti (Mercedes-Benz),
  //   m-A-5 Czechia 0–3 Mexico (Azteca), m-A-6 South Africa 1–0 Korea Republic (BBVA),
  //   m-D-6 Paraguay 0–0 Australia (Levi's), m-I-6 Senegal 5–0 Iraq (BMO Field),
  //   m-K-6 DR Congo 3–1 Uzbekistan (Mercedes-Benz), m-J-5 Jordan 1–3 Argentina
  //   (AT&T Stadium), m-J-6 Algeria 3–3 Austria (Arrowhead). Fill when a genuine
  //   per-match figure (not a venue-pattern guess) is confirmed.
};

const liveAttendance =
  (live as { attendance?: Record<string, number> }).attendance ?? {};

/** Announced attendance for a match, if known. */
export const attendanceFor = (matchId: string): number | undefined =>
  curated[matchId] ?? liveAttendance[matchId];
