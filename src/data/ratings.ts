/**
 * Team strength ratings on a 0–100 scale (strongest in the field ≈ 95,
 * weakest ≈ 50), anchored to the FIFA World Ranking. Used by the match-detail
 * team comparison. Refreshed by hand — adjust as form changes.
 */
export const TEAM_RATING: Record<string, number> = {
  // Group A
  mex: 81, rsa: 61, kor: 74, cze: 67,
  // Group B
  can: 71, sui: 78, qat: 63, bih: 58,
  // Group C
  bra: 86, mar: 86, sco: 67, hai: 51,
  // Group D
  usa: 80, par: 67, aus: 69, tur: 73,
  // Group E
  ger: 84, cuw: 51, civ: 70, ecu: 74,
  // Group F
  ned: 86, jpn: 79, tun: 65, swe: 67,
  // Group G
  bel: 84, egy: 71, irn: 76, nzl: 50,
  // Group H
  esp: 95, cpv: 57, uru: 80, ksa: 61,
  // Group I
  fra: 95, sen: 81, nor: 71, irq: 63,
  // Group J
  arg: 95, alg: 72, aut: 74, jor: 58,
  // Group K
  por: 87, col: 82, uzb: 64, cod: 65,
  // Group L
  eng: 92, cro: 83, gha: 55, pan: 70,
};

/** Fallback for any unmapped team. */
export const teamRating = (id: string): number => TEAM_RATING[id] ?? 65;
