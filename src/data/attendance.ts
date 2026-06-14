import live from "./live.json";

/**
 * Announced match attendances. Curated by hand from official figures; the
 * update-data workflow also captures attendance into live.json when the feed
 * provides it. Curated values take precedence.
 */
const curated: Record<string, number> = {
  // filled from official figures as matches are played
};

const liveAttendance =
  (live as { attendance?: Record<string, number> }).attendance ?? {};

/** Announced attendance for a match, if known. */
export const attendanceFor = (matchId: string): number | undefined =>
  curated[matchId] ?? liveAttendance[matchId];
