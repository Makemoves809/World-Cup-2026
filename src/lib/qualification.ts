import { matches } from "../data/fixtures";
import { teamsInGroup } from "../data/teams";
import { standingsForGroup } from "./standings";
import { bestThirds } from "./bracket";

/** True once every group-stage match has been played. */
const groupStageComplete = (): boolean =>
  matches.every((m) => m.stage !== "group" || m.status === "finished");

/**
 * Mathematical group status for each team:
 *  - "through"    — clinched a top-2 place (cannot drop below 2nd)
 *  - "out"        — eliminated (can only finish 4th, so out of the best-third race too)
 *  - "contention" — still alive (could finish 2nd, or 3rd and chase a best-third spot)
 *
 * Determined by brute-forcing every outcome of the group's remaining matches
 * (≤ 6 games → ≤ 729 combinations). Points-only and deliberately conservative:
 * a team is only "through" when at most one rival can match its points in every
 * scenario, and only "out" when three rivals beat it on points in every scenario —
 * so goal-difference tiebreaks never produce a false clinch or elimination.
 */
export type GroupStatus = "through" | "out" | "contention";

export function groupQualification(group: string): Record<string, GroupStatus> {
  const teamIds = teamsInGroup(group).map((t) => t.id);
  const gMatches = matches.filter((m) => m.group === group);

  const basePts: Record<string, number> = {};
  teamIds.forEach((t) => (basePts[t] = 0));
  const remaining: { home: string; away: string }[] = [];

  for (const m of gMatches) {
    if (m.status === "finished" && m.homeScore != null && m.awayScore != null) {
      if (m.homeScore > m.awayScore) basePts[m.home] += 3;
      else if (m.homeScore < m.awayScore) basePts[m.away] += 3;
      else {
        basePts[m.home] += 1;
        basePts[m.away] += 1;
      }
    } else {
      remaining.push({ home: m.home, away: m.away });
    }
  }

  const maxAtOrAbove: Record<string, number> = {}; // worst case: rivals with ≥ pts
  const minStrictlyAbove: Record<string, number> = {}; // best case: rivals strictly above
  teamIds.forEach((t) => {
    maxAtOrAbove[t] = 0;
    minStrictlyAbove[t] = teamIds.length;
  });

  const n = remaining.length;
  const total = 3 ** n;
  for (let combo = 0; combo < total; combo++) {
    const pts = { ...basePts };
    let c = combo;
    for (let i = 0; i < n; i++) {
      const o = c % 3;
      c = Math.floor(c / 3);
      const g = remaining[i];
      if (o === 0) pts[g.home] += 3;
      else if (o === 1) pts[g.away] += 3;
      else {
        pts[g.home] += 1;
        pts[g.away] += 1;
      }
    }
    for (const t of teamIds) {
      let strictlyAbove = 0;
      let atOrAbove = 0;
      for (const y of teamIds) {
        if (y === t) continue;
        if (pts[y] > pts[t]) strictlyAbove++, atOrAbove++;
        else if (pts[y] === pts[t]) atOrAbove++;
      }
      if (atOrAbove > maxAtOrAbove[t]) maxAtOrAbove[t] = atOrAbove;
      if (strictlyAbove < minStrictlyAbove[t]) minStrictlyAbove[t] = strictlyAbove;
    }
  }

  const status: Record<string, GroupStatus> = {};
  for (const t of teamIds) {
    if (maxAtOrAbove[t] <= 1) status[t] = "through";
    else if (minStrictlyAbove[t] >= 3) status[t] = "out";
    else status[t] = "contention";
  }

  // Once the whole group stage is done, the cross-group best-third race is
  // settled — so resolve 3rd place definitively (1st/2nd through, 4th out, and
  // 3rd through only if it's one of the 8 best thirds). The conservative
  // per-group solver above can't see across groups, so it leaves these in
  // "contention"; this lifts that once everything's known.
  if (groupStageComplete()) {
    const rows = standingsForGroup(group);
    const thirdsThrough = new Set(
      bestThirds()
        .filter((t) => t.qualifies)
        .map((t) => t.row.team.id)
    );
    rows.forEach((r, i) => {
      if (i < 2) status[r.team.id] = "through";
      else if (i === 2)
        status[r.team.id] = thirdsThrough.has(r.team.id) ? "through" : "out";
      else status[r.team.id] = "out";
    });
  }

  return status;
}
