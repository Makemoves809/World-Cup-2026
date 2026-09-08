/**
 * One-off capability probe: asks football-data.org what this key actually
 * returns for the Champions League, and prints which fields are populated
 * vs withheld. Read-only — writes nothing. Run via the probe-api workflow.
 */
const API = "https://api.football-data.org/v4";
const C = process.env.COMPETITION ?? "CL";
const KEY = process.env.FOOTBALL_API_KEY;
if (!KEY) { console.error("FOOTBALL_API_KEY is not set"); process.exit(1); }

const get = async (p: string) => {
  const r = await fetch(`${API}${p}`, { headers: { "X-Auth-Token": KEY } });
  return { ok: r.ok, status: r.status, body: r.ok ? await r.json() : await r.text() };
};
const has = (v: unknown) =>
  v === null || v === undefined ? "—" : Array.isArray(v) ? `${v.length} items` : typeof v === "object" ? "obj" : String(v);

console.log("=== /standings ===");
const st = await get(`/competitions/${C}/standings`);
if (!st.ok) console.log(`  HTTP ${st.status}: ${String(st.body).slice(0, 160)}`);
else {
  const tables = st.body.standings ?? [];
  console.log(`  OK — ${tables.length} table(s), type=${tables[0]?.type}`);
  const row = tables[0]?.table?.[0];
  if (row) console.log("  row keys:", Object.keys(row).join(", ")), console.log("  sample:", JSON.stringify(row).slice(0, 260));
}

console.log("=== /scorers ===");
const sc = await get(`/competitions/${C}/scorers?limit=5`);
if (!sc.ok) console.log(`  HTTP ${sc.status}: ${String(sc.body).slice(0, 160)}`);
else {
  const list = sc.body.scorers ?? [];
  console.log(`  OK — ${list.length} scorers`);
  if (list[0]) console.log("  sample:", JSON.stringify(list[0]).slice(0, 300));
}

console.log("=== /teams (field availability) ===");
const tm = await get(`/competitions/${C}/teams`);
if (!tm.ok) console.log(`  HTTP ${tm.status}: ${String(tm.body).slice(0, 160)}`);
else {
  const t = (tm.body.teams ?? [])[0];
  if (t) {
    console.log("  team keys:", Object.keys(t).join(", "));
    for (const k of ["name","shortName","tla","crest","founded","clubColors","venue","website","coach","squad"])
      console.log(`   ${k}: ${has(t[k])}`);
    const withCrest = (tm.body.teams ?? []).filter((x: any) => x.crest).length;
    const withVenue = (tm.body.teams ?? []).filter((x: any) => x.venue).length;
    const withCoach = (tm.body.teams ?? []).filter((x: any) => x.coach?.name).length;
    console.log(`  populated across all: crest ${withCrest}, venue ${withVenue}, coach ${withCoach}`);
  }
}

console.log("=== /matches (field availability) ===");
const mt = await get(`/competitions/${C}/matches`);
if (!mt.ok) console.log(`  HTTP ${mt.status}: ${String(mt.body).slice(0, 160)}`);
else {
  const ms = mt.body.matches ?? [];
  const m = ms[0];
  console.log(`  OK — ${ms.length} matches`);
  if (m) {
    console.log("  match keys:", Object.keys(m).join(", "));
    console.log("  score keys:", Object.keys(m.score ?? {}).join(", "));
    for (const k of ["utcDate","matchday","stage","status","venue","attendance","referees","lastUpdated"])
      console.log(`   ${k}: ${has(m[k])}`);
    console.log(`  halfTime present on: ${ms.filter((x: any) => x.score?.halfTime?.home != null).length}`);
    console.log(`  venue present on: ${ms.filter((x: any) => x.venue).length}`);
    console.log(`  referees present on: ${ms.filter((x: any) => (x.referees ?? []).length).length}`);
  }
}
