/**
 * Squad continuity vs the 2022 World Cup: how many of a team's 2026 26-man
 * squad also played at Qatar 2022. Teams that weren't at 2022 are marked
 * { at2022: false }. Researched / cross-checked against the official squad
 * lists; `returning` is filled in as each team is confirmed.
 */

export interface Continuity {
  at2022: boolean;
  /** Players in the 2026 squad who were also in the 2022 squad (of 26). */
  returning?: number;
}

export const CONTINUITY: Record<string, Continuity> = {
  // Group A
  mex: { at2022: true },
  rsa: { at2022: false },
  kor: { at2022: true },
  cze: { at2022: false },
  // Group B
  can: { at2022: true },
  sui: { at2022: true },
  qat: { at2022: true },
  bih: { at2022: false },
  // Group C
  bra: { at2022: true },
  mar: { at2022: true },
  sco: { at2022: false },
  hai: { at2022: false },
  // Group D
  usa: { at2022: true },
  par: { at2022: false },
  aus: { at2022: true },
  tur: { at2022: false },
  // Group E
  ger: { at2022: true },
  cuw: { at2022: false },
  civ: { at2022: false },
  ecu: { at2022: true },
  // Group F
  ned: { at2022: true },
  jpn: { at2022: true },
  tun: { at2022: true },
  swe: { at2022: false },
  // Group G
  bel: { at2022: true },
  egy: { at2022: false },
  irn: { at2022: true },
  nzl: { at2022: false },
  // Group H
  esp: { at2022: true },
  cpv: { at2022: false },
  uru: { at2022: true },
  ksa: { at2022: true },
  // Group I
  fra: { at2022: true, returning: 11 }, // 11/26 retained from Qatar 2022

  sen: { at2022: true },
  nor: { at2022: false },
  irq: { at2022: false },
  // Group J
  arg: { at2022: true, returning: 17 }, // kept 17 from the 2022 winning side
  alg: { at2022: false },
  aut: { at2022: false },
  jor: { at2022: false },
  // Group K
  por: { at2022: true, returning: 14 }, // 14/26 carried over from Qatar 2022
  col: { at2022: false },
  uzb: { at2022: false },
  cod: { at2022: false },
  // Group L
  eng: { at2022: true, returning: 8 }, // 8/26 carried over from Qatar 2022
  cro: { at2022: true },
  gha: { at2022: true },
  pan: { at2022: false },
};

export type ContinuityResult =
  | { status: "new" }
  | { status: "pending" }
  | { status: "known"; returning: number; pct: number };

/** Squad-continuity vs 2022 for a team. */
export function continuity(id: string): ContinuityResult {
  const c = CONTINUITY[id];
  if (!c || !c.at2022) return { status: "new" };
  if (c.returning == null) return { status: "pending" };
  return {
    status: "known",
    returning: c.returning,
    pct: Math.round((c.returning / 26) * 100),
  };
}
