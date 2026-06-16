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
};

const liveAttendance =
  (live as { attendance?: Record<string, number> }).attendance ?? {};

/** Announced attendance for a match, if known. */
export const attendanceFor = (matchId: string): number | undefined =>
  curated[matchId] ?? liveAttendance[matchId];
