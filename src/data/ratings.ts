/**
 * Team strength ratings on a 0–100 scale (strongest in the field ≈ 95,
 * weakest ≈ 50), anchored to the FIFA World Ranking. Used by the match-detail
 * team comparison. Refreshed by hand — adjust as form changes.
 */
export const TEAM_RATING: Record<string, number> = {
  // Group A
  mex: 79, rsa: 66, kor: 76, cze: 74,
  // Group B
  can: 74, sui: 80, qat: 66, bih: 70,
  // Group C
  bra: 90, mar: 84, sco: 72, hai: 54,
  // Group D
  usa: 76, par: 71, aus: 70, tur: 78,
  // Group E
  ger: 87, cuw: 52, civ: 74, ecu: 77,
  // Group F
  ned: 86, jpn: 79, tun: 70, swe: 74,
  // Group G
  bel: 85, egy: 74, irn: 74, nzl: 58,
  // Group H
  esp: 92, cpv: 57, uru: 84, ksa: 66,
  // Group I
  fra: 93, sen: 82, nor: 80, irq: 64,
  // Group J
  arg: 94, alg: 73, aut: 77, jor: 63,
  // Group K
  por: 88, col: 83, uzb: 66, cod: 70,
  // Group L
  eng: 90, cro: 82, gha: 71, pan: 65,
};

/** Fallback for any unmapped team. */
export const teamRating = (id: string): number => TEAM_RATING[id] ?? 65;
