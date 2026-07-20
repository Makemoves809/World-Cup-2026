> ## ⚑ PIVOTED — this repo now serves the Champions League primer (Jul 2026)
>
> The live deployment has been **repointed from the World Cup to a
> beginner-first UEFA Champions League 2026/27 hub** (`UCL Primer`). The
> current app entry is `src/App.tsx` → `Home`/`HowItWorks`/`Clubs`/`Glossary`,
> built on `src/data/clubs.ts` and `src/data/learn.ts`.
>
> - **The World Cup 2026 site is preserved**, not deleted: the finished-
>   tournament state is on branch **`archive/world-cup-2026`** and tag
>   **`world-cup-2026`**. It is to be **restored for the 2030 World Cup**
>   (bring that branch back, re-enable the data bot).
> - The **`update-data` GitHub Action is paused** (see the note in
>   `.github/workflows/update-data.yml`) so the World Cup fetcher no longer
>   commits to the production branch.
> - The **World-Cup-specific curation rules below (attendance, discipline,
>   squads, goals, form, etc.) describe the archived WC site** — they do NOT
>   apply to the current Champions League site. The CL tracker (league table,
>   two-legged bracket, club squads, live CL feed) is being built in phases;
>   the current live version is the preseason "learn the competition" hub.
> - **Automation roadmap → `docs/cl-roadmap.md`**: the milestone cloud triggers
>   (draw day, season kickoff, knockouts) that advance the site through the
>   season. If they're not yet created (the trigger connector was down at pivot
>   time), create them when it reconnects.
> - Deployment mechanics are unchanged: the production branch
>   `claude/repository-edits-completion-rs4u72` is what Vercel serves; build
>   must pass (`npm run build`) before pushing.

# WC26 — World Cup 2026 Hub (archived — see the pivot notice above)

Fan site + live group-stage standings tracker for the 2026 FIFA World Cup
(Canada · México · USA). React + TypeScript + Vite. See `README.md` for the
full project tour.

It also has clickable team rosters everywhere (pitch line-ups + each team's
results so far) and a form-adjusted team-strength model (`src/lib/form.ts`)
that powers the Form Table and the "team comparison" panel on every match.

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
  **This has one override: if research for the team's *next* match (see below)
  turns up confirmed news — not speculation — that a listed starter is out and
  names their replacement, swap it in `squads.ts` right away**, the same pass,
  rather than leaving the last-match XI showing on the pitch map through kickoff.
  `discipline.ts` and `squads.ts` are describing the same reality and must never
  disagree — don't record a player as ruled out in one place while the other
  still draws them in the starting eleven.
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
- **Form-adjusted ratings** (`src/lib/form.ts`) — powers the Form Table page,
  its home-page preview, and the "team comparison" panel on every match
  (group and knockout). Elo-style: every finished result nudges a team's
  rating from its pre-tournament FIFA base, scaled by how surprising the
  result was and by goal margin. **Recomputes automatically from group +
  knockout results combined** — the two live in separate data sources
  (`src/data/fixtures.ts` vs `src/lib/bracket.ts`/`live.json`), so this has to
  merge both explicitly rather than only reading the group schedule (that was
  a real bug: ratings silently froze at group-stage state once the knockouts
  started). A knockout tie decided on penalties counts as a win/loss for
  whoever advanced (via the bracket's `winner` field), not a draw, even
  though the scoreline itself may be level. Nothing to hand-edit here.
- **Revisit flagged / pending figures** — circle back on anything left
  uncertain. Pending: official attendances for England 4–2 Croatia (m-L-1),
  Czechia 1–1 South Africa (m-A-3), and the June 21–22 matches (Belgium–Iran
  m-G-3, NZ–Egypt m-G-4, Spain–Saudi m-H-3, Uruguay–Cabo Verde m-H-4,
  France–Iraq m-I-3, Jordan–Algeria m-J-4) — only estimates/capacities have
  surfaced so far. Also fill in remaining squad photos (initials-token
  starters) as Commons files are confirmed. Fill or correct them when better
  sources appear.

Workflow each time: check which matches have finished since the data was last
touched, fill in their attendance (and any new cards/injuries), **re-check the
starting lineup/formation in `squads.ts` for every team that played since the
last update** (not just the ones a request happens to mention), verify final
group order/qualification once a group ends, verify the knockout bracket once
the knockouts have started, revisit any pending figures, then build and push
along with whatever the owner actually asked for.

Also **check for and research the next match(es) coming up** (today's date and
the days just ahead) — search for current team news, not just what's already
finished: fresh injuries/suspensions, a game-time-decision player's latest
fitness update, expected lineup changes. This is what lets the site say
something useful about a match *before* it's played, not just react to it
afterward — don't wait for the match to happen and then explain it in
hindsight. **A confirmed starter change found here isn't done until it's
reflected in `squads.ts` too** (see the override above) — a curated
`discipline.ts` entry saying a key player is out is not enough on its own if
the pitch map still shows them starting. This was a live bug (Morocco's
Saibari showing as the starter on match day after we'd already confirmed
Rahimi was replacing him) — the fix is to treat both files as one update.

