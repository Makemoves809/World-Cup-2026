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
