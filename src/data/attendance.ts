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
  // Pending official figures: m-L-1 England 4–2 Croatia (AT&T), m-A-3 Czechia
  // 1–1 South Africa (Mercedes-Benz),
  // m-D-3 USA 2–0 Australia (Lumen Field — "over 66,000", exact TBC),
  // m-C-3 Scotland 0–1 Morocco (Gillette Stadium), m-C-4 Brazil 3–0 Haiti
  // (Lincoln Financial Field), m-D-4 Türkiye 0–1 Paraguay (Levi's Stadium),
  // m-E-3 Germany 2–1 Côte d'Ivoire (BMO Field), m-E-4 Ecuador–Curaçao,
  // m-F-4 Japan 4–0 Tunisia (Estadio BBVA).
};

const liveAttendance =
  (live as { attendance?: Record<string, number> }).attendance ?? {};

/** Announced attendance for a match, if known. */
export const attendanceFor = (matchId: string): number | undefined =>
  curated[matchId] ?? liveAttendance[matchId];
