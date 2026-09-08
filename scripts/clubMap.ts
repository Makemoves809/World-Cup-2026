/**
 * Maps football-data.org club names onto our club ids (src/data/clubs.ts).
 *
 * Shared by scripts/update-data.ts (results) and scripts/fetch-squads.ts
 * (rosters) so the two can never disagree about which club is which — a
 * mismatch there silently drops fixtures or squads.
 */
import { CLUBS } from "../src/data/clubs";

/** Normalize a team/player name for matching: lowercase, no accents/symbols. */
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

/**
 * football-data.org club names whose normalized form doesn't simply contain
 * our club name/short (e.g. "FC Internazionale Milano" for Inter). Keys are
 * norm()-ed. Everything else resolves by containment below.
 */
const ALIASES: Record<string, string> = {
  fcinternazionalemilano: "int", internazionale: "int", intermilan: "int", inter: "int",
  clubatleticodemadrid: "atm", atleticodemadrid: "atm", atleticomadrid: "atm",
  sportingclubedeportugal: "spo", sportinglisbon: "spo", sportingcp: "spo",
  skslaviapraha: "sla", slaviapraha: "sla", slaviaprague: "sla",
  fcbayernmunchen: "bay", bayernmunchen: "bay", bayernmunich: "bay", bayern: "bay",
  parissaintgermainfc: "psg", parissaintgermain: "psg", psg: "psg",
  fcshakhtardonetsk: "sha", shakhtardonetsk: "sha", shakhtar: "sha",
  skslovanbratislava: "slb", slovanbratislava: "slb",
  fkbodoglimt: "bod", bodoglimt: "bod",
  psveindhoven: "psv", psv: "psv",
  feyenoordrotterdam: "fey", feyenoord: "fey",
  fcporto: "por", porto: "por",
  clubbruggekv: "clb", clubbrugge: "clb",
  galatasaraysk: "gal", galatasaray: "gal",
  fenerbahcesk: "fen", fenerbahce: "fen",
  paeaek: "aek", aek: "aek", aekfc: "aek", aekathensfc: "aek", aekathens: "aek",
  realbetisbalompie: "bet", realbetis: "bet",
  sscnapoli: "nap", napoli: "nap",
  como1907: "com",
  asroma: "rom",
  rclens: "len",
  lilleosc: "lil",
  lasklinz: "las",
  vfbstuttgart: "stu",
  rbleipzig: "rbl",
  borussiadortmund: "dor",
  villarrealcf: "vil",
  realmadridcf: "rma",
  fcbarcelona: "bar",
  manchestercityfc: "mci",
  manchesterunitedfc: "mun",
  astonvillafc: "avl",
  liverpoolfc: "liv",
  arsenalfc: "ars",
  vikingfk: "vik",
  sabahfk: "sab",
};

const clubIdByName = new Map<string, string>();
for (const c of CLUBS) {
  clubIdByName.set(norm(c.name), c.id);
  clubIdByName.set(norm(c.short), c.id);
}
for (const [k, v] of Object.entries(ALIASES)) clubIdByName.set(k, v);
/** Longest candidate first, so a short token can't pre-empt a longer, more specific one. */
const clubNamesByLength = [...clubIdByName.keys()].sort((a, b) => b.length - a.length);

/**
 * Map a football-data team object ({ name, shortName, tla }) to our club id.
 * Exact normalized match first (name / shortName / aliases), then containment
 * either way, longest candidate first — e.g. "Real Madrid CF" ⊃ "realmadrid".
 */
function mapTeam(
  t: { name?: string; shortName?: string; tla?: string } | null
): string | undefined {
  if (!t) return undefined;
  const forms = [t.name, t.shortName].filter((x): x is string => !!x).map(norm);
  for (const n of forms) {
    const exact = clubIdByName.get(n);
    if (exact) return exact;
  }
  for (const n of forms) {
    if (n.length < 4) continue;
    for (const cand of clubNamesByLength) {
      if (cand.length < 4) continue;
      if (n.includes(cand) || cand.includes(n)) return clubIdByName.get(cand);
    }
  }
  return undefined;
}

export { norm, mapTeam, clubIdByName };
