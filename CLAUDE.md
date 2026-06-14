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
- The hourly `update-data` GitHub Action also commits to this same branch, so
  if a push is rejected as non-fast-forward, `git pull --rebase` and push again.

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
- **Team ratings** (`src/data/ratings.ts`) — adjust if form shifts materially.

Workflow each time: check which matches have finished since the data was last
touched, fill in their attendance (and any new cards/injuries), then build and
push along with whatever the owner actually asked for.

