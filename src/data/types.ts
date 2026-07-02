export type GroupId =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export type Stage = "group" | "r32" | "r16" | "qf" | "sf" | "final";

export type MatchStatus = "scheduled" | "live" | "finished";

export interface Team {
  /** Lowercase short id, e.g. "mex" */
  id: string;
  name: string;
  /** Three-letter FIFA code, e.g. "MEX" */
  code: string;
  /** flagcdn slug, e.g. "mx" or "gb-eng" */
  flag: string;
  group: GroupId;
  /** true for the three host nations */
  host?: boolean;
}

export interface Venue {
  city: string;
  stadium: string;
  country: "USA" | "Canada" | "Mexico";
  /** Seating capacity for the tournament (used for turnout %). */
  capacity?: number;
}

export interface Match {
  id: string;
  stage: Stage;
  group?: GroupId;
  /** Team id */
  home: string;
  /** Team id */
  away: string;
  /** ISO 8601 kickoff time (UTC) */
  kickoff: string;
  venue: Venue;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
}

/** A computed row in a group table. */
export interface StandingRow {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  /** 1-based finishing position within the group */
  position: number;
}

export type AbsenceType = "red" | "suspension" | "injury";

/** How big a loss the player is for their team, 1 (fringe) – 5 (star). */
export type ImpactLevel = 1 | 2 | 3 | 4 | 5;

/** A player ruled out of one or more matches (red card, ban, injury). */
export interface PlayerAbsence {
  player: string;
  position?: string;
  /** Team id */
  team: string;
  type: AbsenceType;
  /** Human-readable cause, e.g. "Red card · 49' vs Mexico (DOGSO)" */
  reason: string;
  /** Match id where the card/injury happened, if applicable */
  sourceMatchId?: string;
  /** Match ids the player is unavailable for */
  missesMatchIds: string[];
  /**
   * Ruled out for the rest of the tournament (season-ending injury, cut from
   * squad), not just the group-stage matches listed in `missesMatchIds` —
   * knockout match ids aren't known ahead of the bracket resolving, so this
   * keeps the player flagged unavailable through the knockouts too.
   */
  outForTournament?: boolean;
  impact: ImpactLevel;
  note?: string;
}

