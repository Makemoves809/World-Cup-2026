import { matches } from "../data/fixtures";
import { teams } from "../data/teams";

/**
 * Maps a football-data.org `/competitions/{id}/matches` payload into the
 * live.json shape (results, in-play scores, knockout results). Shared by the
 * scheduled update job's live view and the runtime `/api/live` proxy so the two
 * can't diverge. Post-match bookings/attendance detail stays in the job (it
 * needs extra per-match requests); this only covers what the list endpoint has.
 */

export interface FdScore {
  home: number;
  away: number;
  minute: number | null;
}
export interface FdKo {
  stage: string;
  homeId: string;
  awayId: string;
  homeScore: number;
  awayScore: number;
  minute?: number | null;
  /** Match phase for a live tie: "HT" | "ET" | "PENS" (else undefined). */
  phase?: string | null;
  winnerId?: string | null;
}
export interface FdLive {
  results: Record<string, [number, number]>;
  liveScores: Record<string, FdScore>;
  liveKo: FdKo[];
  koResults: FdKo[];
  attendance: Record<string, number>;
}

/** Merge fresh knockout results over a base set, keyed by stage + teams. */
export function upsertKo(base: FdKo[], fresh: FdKo[]): FdKo[] {
  const out = base.map((k) => ({ ...k }));
  for (const k of fresh) {
    const i = out.findIndex(
      (e) => e.stage === k.stage && e.homeId === k.homeId && e.awayId === k.awayId
    );
    if (i >= 0) out[i] = { ...out[i], ...k };
    else out.push(k);
  }
  return out;
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

/** football-data.org team names that differ from ours. */
const ALIASES: Record<string, string> = {
  southkorea: "kor",
  korearepublic: "kor",
  czechrepublic: "cze",
  turkey: "tur",
  turkiye: "tur",
  ivorycoast: "civ",
  capeverdeislands: "cpv",
  capeverde: "cpv",
  usa: "usa",
  unitedstates: "usa",
  bosniaandherzegovina: "bih",
  congodr: "cod",
  drcongo: "cod",
};

const teamIdByName = new Map<string, string>();
for (const t of teams) teamIdByName.set(norm(t.name), t.id);
for (const [k, v] of Object.entries(ALIASES)) teamIdByName.set(k, v);
const teamIdByCode = new Map(teams.map((t) => [t.code, t.id]));

function mapTeam(t: { name?: string; tla?: string } | null): string | undefined {
  if (!t) return undefined;
  return (
    (t.name && teamIdByName.get(norm(t.name))) ||
    (t.tla && teamIdByCode.get(t.tla)) ||
    undefined
  );
}

const matchByPair = new Map<string, { id: string; reversed: boolean }>();
for (const m of matches) {
  matchByPair.set(`${m.home}|${m.away}`, { id: m.id, reversed: false });
  matchByPair.set(`${m.away}|${m.home}`, { id: m.id, reversed: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformFdMatches(fdMatches: any[]): FdLive {
  const results: Record<string, [number, number]> = {};
  const liveScores: Record<string, FdScore> = {};
  const liveKo: FdKo[] = [];
  const koResults: FdKo[] = [];
  const attendance: Record<string, number> = {};

  for (const f of fdMatches) {
    const homeId = mapTeam(f.homeTeam);
    const awayId = mapTeam(f.awayTeam);
    if (!homeId || !awayId) continue;
    const pair = matchByPair.get(`${homeId}|${awayId}`);

    if (pair && typeof f.attendance === "number" && f.attendance > 0) {
      attendance[pair.id] = f.attendance;
    }

    if (f.status === "IN_PLAY" || f.status === "PAUSED") {
      const sc = f.score?.fullTime ?? {};
      const h = sc.home ?? 0;
      const a = sc.away ?? 0;
      const minute = f.minute ?? null;
      // Period marker from the feed. Regulation splits into 1st/2nd half via
      // whether the half-time score has been recorded yet. Extra time can't be
      // split into halves (the free feed has no live minute), so it's one label.
      const dur = f.score?.duration;
      const htPlayed = f.score?.halfTime?.home != null;
      const phase =
        dur === "PENALTY_SHOOTOUT"
          ? "PENS"
          : dur === "EXTRA_TIME"
          ? "ET"
          : f.status === "PAUSED"
          ? "HT"
          : htPlayed
          ? "2H"
          : "1H";
      if (pair) {
        liveScores[pair.id] = pair.reversed
          ? { home: a, away: h, minute }
          : { home: h, away: a, minute };
      } else if (f.stage && f.stage !== "GROUP_STAGE") {
        liveKo.push({ stage: f.stage, homeId, awayId, homeScore: h, awayScore: a, minute, phase });
      }
      continue;
    }

    if (f.status !== "FINISHED") continue;
    const ft = f.score?.fullTime;
    if (ft?.home == null || ft?.away == null) continue;

    if (pair) {
      results[pair.id] = pair.reversed ? [ft.away, ft.home] : [ft.home, ft.away];
    } else if (f.stage && f.stage !== "GROUP_STAGE") {
      const w = f.score?.winner;
      const winnerId =
        w === "HOME_TEAM" ? homeId : w === "AWAY_TEAM" ? awayId : null;
      koResults.push({
        stage: f.stage,
        homeId,
        awayId,
        homeScore: ft.home,
        awayScore: ft.away,
        winnerId,
      });
    }
  }

  return { results, liveScores, liveKo, koResults, attendance };
}
