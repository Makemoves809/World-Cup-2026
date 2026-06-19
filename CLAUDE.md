# WC26 — World Cup 2026 Hub

Fan site + live group-stage standings tracker for the 2026 FIFA World Cup
(Canada · México · USA). React + TypeScript + Vite. See `README.md` for the
full project tour.

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

The free football-data feed auto-updates **scores, live in-play scores, cards,
and standings** — but several things are **manual / curated** and must be kept
current by hand:

- **Attendance** (`src/data/attendance.ts`) — the free feed does NOT provide
  it. Add each newly-finished match's official attendance figure (researched
  and cross-checked). This is the main one to keep on top of.
- **Injuries & suspensions** (`src/data/discipline.ts`) — add red cards / new
  injuries for recent matches, and move/retire entries whose match has passed.
  Confirm **suspension length** (violent-conduct reds can be more than one
  game), and remember **yellow-card totals are wiped after the quarter-finals**
  — don't let the two-yellow auto-suspension carry yellows into the semis.
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
- **Revisit flagged / pending figures** — circle back on anything left
  uncertain. Currently pending: official attendances for England 4–2 Croatia
  (m-L-1), Czechia 1–1 South Africa (m-A-3) and Mexico 1–0 Korea Rep (m-A-4) —
  only "expected" estimates have surfaced so far. Also fill in remaining squad
  photos (initials-token starters) as Commons files are confirmed. Fill or
  correct them when better sources appear.

Workflow each time: check which matches have finished since the data was last
touched, fill in their attendance (and any new cards/injuries), verify final
group order/qualification once a group ends, verify the knockout bracket once
the knockouts have started, revisit any pending figures, then build and push
along with whatever the owner actually asked for.

