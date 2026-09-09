/**
 * Read-only probe: can we get per-match goal scorers for the Champions League?
 * Checks (a) football-data's match-detail endpoint on our tier, and (b) ESPN's
 * unofficial UCL API, which needs no key. Writes nothing.
 */
const KEY = process.env.FOOTBALL_API_KEY;
const FD = "https://api.football-data.org/v4";

console.log("=== (a) football-data match detail ===");
if (!KEY) console.log("  no FOOTBALL_API_KEY");
else {
  const r = await fetch(`${FD}/competitions/CL/matches?status=FINISHED`, {
    headers: { "X-Auth-Token": KEY },
  });
  const j: any = await r.json();
  const fin = (j.matches ?? [])[0];
  if (!fin) console.log("  no finished matches yet");
  else {
    console.log(`  sample: ${fin.homeTeam?.name} v ${fin.awayTeam?.name} (id ${fin.id})`);
    const d = await fetch(`${FD}/matches/${fin.id}`, { headers: { "X-Auth-Token": KEY } });
    if (!d.ok) console.log(`  detail HTTP ${d.status}: ${(await d.text()).slice(0, 140)}`);
    else {
      const m: any = await d.json();
      console.log("  detail keys:", Object.keys(m).join(", "));
      for (const k of ["goals", "bookings", "substitutions", "referees", "attendance"]) {
        const v = m[k];
        console.log(`   ${k}: ${Array.isArray(v) ? v.length + " items" : v ?? "—"}`);
      }
      if ((m.goals ?? []).length) console.log("  first goal:", JSON.stringify(m.goals[0]).slice(0, 220));
    }
  }
}

console.log("=== (b) ESPN unofficial UCL API (no key) ===");
// ESPN scoreboard for the UCL; dates=YYYYMMDD. Matchday 1 was 8-10 Sep 2026.
for (const date of ["20260908", "20260909"]) {
  try {
    const r = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard?dates=${date}`
    );
    if (!r.ok) { console.log(`  ${date}: HTTP ${r.status}`); continue; }
    const j: any = await r.json();
    const events: any[] = j.events ?? [];
    console.log(`  ${date}: ${events.length} events`);
    const done = events.find((e) => e.status?.type?.completed);
    if (done) {
      const comp = done.competitions?.[0];
      console.log(`   sample: ${done.name}`);
      const details: any[] = comp?.details ?? [];
      const goals = details.filter((d) => d.scoringPlay);
      console.log(`   details: ${details.length}, scoring plays: ${goals.length}`);
      if (goals[0]) {
        const g = goals[0];
        console.log("   first goal:", JSON.stringify({
          clock: g.clock?.displayValue,
          type: g.type?.text,
          team: g.team?.id,
          who: (g.athletesInvolved ?? []).map((a: any) => a.displayName),
        }));
      }
      // competitors also carry per-team scorer summaries
      const c0 = comp?.competitors?.[0];
      if (c0?.statistics || c0?.leaders) {
        console.log("   competitor keys:", Object.keys(c0).join(", "));
      }
    }
  } catch (e) {
    console.log(`  ${date}: ${e}`);
  }
}
