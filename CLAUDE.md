# WC26 — World Cup 2026 Hub

Fan site + live group-stage standings tracker for the 2026 FIFA World Cup
(Canada · México · USA). React + TypeScript + Vite. See `README.md` for the
full project tour.

It also has clickable team rosters everywhere (pitch line-ups + each team's
results so far) and a per-match **"Script"** — an auto-written read, lean
scoreline, and self-graded accuracy record (see the upkeep notes below).

## Deployment workflow (IMPORTANT)

The owner wants changes to appear on the live site **immediately, with no pull
request and no manual merge step.**

- **Production branch:** `claude/repository-edits-completion-rs4u72` — Vercel
  deploys this branch to the live site
  (`world-cup-2026-iota-nine.vercel.app`).
- **Commit changes directly to the production branch and push.** Vercel's Git
  integration rebuilds and redeploys automatically on every push (~1–2 min).
  Do **not** open a PR or use a separate feature branch unless explicitly asked.
- The `update-data` GitHub Action also commits to this same branch, so if a
  push is rejected as non-fast-forward, `git pull --rebase` and push again. It
  runs every ~5 min, driven by an **external cron (cron-job.org)** that calls
  the `workflow_dispatch` API (GitHub's own scheduler is too unreliable for
  frequent runs). To force an update, trigger `update-data.yml` manually.

### Before every push to production

This branch IS the live site, so don't push something broken:

1. `npm run build` must pass (type-check + production build).
2. Then commit and `git push origin claude/repository-edits-completion-rs4u72`.

## Always do: refresh manually-curated data (IMPORTANT)

The owner does NOT want to have to ask for this. **On every request — whenever
you're already making a change — proactively check whether the hand-curated
match data is current, and update it yourself (with web sources) before
finishing.** Don't wait to be told.

The free football-data feed auto-updates **scores, live in-play scores, and
standings**. Cards/lineups/substitutions are NOT on the free tier (confirmed
by actually running the fetch against real finished matches — 0 back every
time; that's gated behind football-data.org's paid "Deep Data" add-on), so
those stay hand-curated. Goal scorers are a partial exception — see below.
Several things are **manual / curated** and must be kept current by hand:

- **Attendance** (`src/data/attendance.ts`) — the free feed does NOT provide
  it. Add each newly-finished match's official attendance figure (researched
  and cross-checked). This is the main one to keep on top of. Note: web search
  results for this have repeatedly come back as exact duplicates of a
  *different* match's already-curated figure at the same venue — a
  search-tool artifact, not a real repeat sellout. Don't trust a number that
  matches another match's figure exactly; leave it pending instead.
- **Injuries & suspensions** (`src/data/discipline.ts`) — add red cards / new
  injuries for recent matches, and move/retire entries whose match has passed.
  Confirm **suspension length** (violent-conduct reds can be more than one
  game), and remember **yellow-card totals are wiped after the quarter-finals**
  — don't let the two-yellow auto-suspension carry yellows into the semis.
  Each entry's `reason` should name the specific date/match the injury or
  squad cut happened (not just "ruled out of the tournament") — that's what
  lets a fan tell whether a missing key player has been out the whole
  tournament or just picked up something last game. **If research shows a
  player was injured or cut before the tournament's first match and so never
  played a single game this World Cup, remove their entry entirely** rather
  than curate it — a squad-strength read only matters relative to games
  actually played here, so a pre-tournament absence is just clutter, not
  signal. Keep entries for anyone who played at least one match first.
- **Team ratings** (`src/data/ratings.ts`) — adjust if form shifts materially.
- **Standings & qualification (tiebreakers)** (`src/lib/standings.ts`) — the
  auto-sort only does points → goal difference → goals scored. FIFA's real
  tiebreakers then go to **head-to-head**, **fair play (fewest cards)**, and
  **drawing of lots**. So when a group finishes level, our computed 2nd/3rd —
  i.e. **who qualifies** — can be wrong. When each group wraps, verify the
  official finishing order (and the **8 best third-placed teams**) and correct
  it if the simplified sort got it wrong; this feeds the bracket.
- **Knockout bracket** (`src/lib/bracket.ts`) — verify it against the official
  FIFA bracket. Before the group stage ends it's a projection; once the Round
  of 32 is drawn (after June 27), confirm the real matchups — especially the
  best-third-placed allocations and the previously-flagged slots (Match 83 =
  2K v 2L, and the R16 89/90 city pairings) — and correct the structure if it
  differs. As knockout games are played, confirm teams and scores fill in
  correctly (knockout results auto-capture via `koResults`, but slotting may
  need a manual check).
- **Squad line-ups & formations** (`src/data/squads.ts`) — for every team with
  a pitch map, the `formation` and the eleven flagged with a `start` must mirror
  **the XI and shape that team used in its most recent completed match** — not a
  generic projection. **After every new match a mapped team plays, re-check it
  and update if they changed shape or personnel** (e.g. a team that opened 4-3-3
  but switched to 4-4-2): set `formation` to the new shape and move each
  starter's `start` coordinates (and bench membership) to match. Also fill any
  missing player **photos** (Wikimedia Commons file names) and verify the eleven
  flagged with a `start` are the real most-recent XI, not the whole squad.
- **Goal scorers** (`scripts/liveEvents.ts`, feeds `src/data/goals.ts`) —
  best-effort, NOT football-data.org (confirmed dead on the free tier, see
  above). Tries API-Football (needs an `API_FOOTBALL_KEY` repo secret; free
  tier, 100 requests/day) first, falls back to ESPN's unofficial API (no key,
  no documented limit, but can change shape or block without notice at any
  time). Both are only ever called while a match is actually live or right as
  it finishes (throttled ~8 min while live) — never a backfill sweep — so the
  100/day budget is never at risk. Neither source's response shape was
  verified against a real live match before shipping (this sandbox's network
  is proxied/blocked from reaching either), so if scorers stop appearing after
  a match, the parsing in `liveEvents.ts` almost certainly needs adjusting to
  match what the API actually returns — check the Action logs for `Goal
  events:` / `lookup failed` lines first. Missing/wrong scorers fail silently
  by design (never breaks the results/score pipeline); nothing to hand-edit.
- **Match "Script" & model accuracy** (`src/lib/script.ts`,
  `src/lib/accuracy.ts`) — the per-match written read, lean scoreline, the
  ✓/✗ "called it / missed" grade on played games, the per-card chips, and the
  Fixtures-header accuracy badge are **all auto-generated** from results + form
  ratings (`src/lib/form.ts`) + squad captains, and recompute on every build.
  There is **nothing to hand-edit** — but it's part of the update: after new
  results land, sanity-check that each newly-finished game shows a ✓/✗ and the
  **Script record** ticked over. Two invariants to preserve if you touch the
  model: grading uses **pre-match** ratings (`formRatingsBefore`, so a game
  never informs its own call), and the live Script and the grader share one
  `predict()` so the lean shown always equals the lean judged. The favoured
  side's named leader is read from the squad `captain` flag, so a wrong or
  missing captain surfaces here too.
- **Revisit flagged / pending figures** — circle back on anything left
  uncertain. Pending: official attendances for England 4–2 Croatia (m-L-1),
  Czechia 1–1 South Africa (m-A-3), and the June 21–22 matches (Belgium–Iran
  m-G-3, NZ–Egypt m-G-4, Spain–Saudi m-H-3, Uruguay–Cabo Verde m-H-4,
  France–Iraq m-I-3, Jordan–Algeria m-J-4) — only estimates/capacities have
  surfaced so far. Also fill in remaining squad photos (initials-token
  starters) as Commons files are confirmed. Fill or correct them when better
  sources appear.

Workflow each time: check which matches have finished since the data was last
touched, fill in their attendance (and any new cards/injuries), verify final
group order/qualification once a group ends, verify the knockout bracket once
the knockouts have started, confirm the Script auto-graded the new results
(✓/✗ + the record ticked), revisit any pending figures, then build and push
along with whatever the owner actually asked for.

