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
