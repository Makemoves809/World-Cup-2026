# WC26 — World Cup 2026 Hub ⚽

A fan site **and** live group-stage standings tracker for the **2026 FIFA World Cup**
(Canada · Mexico · USA, June 11 – July 19, 2026). Built with **React + TypeScript + Vite**.

The tracker computes group tables automatically from match results — enter scores in
one place and every standing, qualification zone, and tiebreak re-sorts itself.

## Features

- **Live countdown** to the next kickoff, with the tournament's current status.
- **All 12 groups (A–L), 48 teams** from the official 5 Dec 2025 draw, with flags and host-nation markers.
- **Auto-computed standings** — points → goal difference → goals scored — with qualification zones
  (top 2 qualify, 3rd enters the best-third-placed race).
- **Full 72-match group-stage fixture list**, filterable by group and grouped by day, across all 16 host venues.
- **Match detail view** — click any fixture for red cards and player availability, with a
  1–5 impact meter showing how big a loss each absent player is (fringe player → star).
- **Clickable team rosters** everywhere — open any team for its pitch line-up (most-recent
  XI + formation, card/availability indicators) and its results so far.
- **Match "Script"** — an auto-written read and lean scoreline for every game, that
  **grades itself** against the result (✓ called it / ✗ missed) and tracks a running
  accuracy record. Shown on each fixture card, inside the match detail, and as a badge
  on the Fixtures header.
- Responsive down to mobile, keyboard-focusable, and respects reduced-motion.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
npm run lint     # type-check only
```

## Project structure

```
src/
├── data/
│   ├── types.ts       # Team, Match, Venue, StandingRow types
│   ├── teams.ts       # all 48 teams, grouped A–L
│   └── fixtures.ts    # venues + official group-stage schedule + results
├── lib/
│   ├── standings.ts   # computes & sorts group tables from finished matches
│   ├── form.ts        # Elo-style form-adjusted ratings (current + pre-match)
│   ├── matchup.ts     # team-comparison strength (form rating − absences)
│   ├── script.ts      # the auto-written match "Script" + shared predict()
│   └── accuracy.ts    # grades each Script call vs the result (pre-match)
├── components/
│   ├── Header.tsx     Hero.tsx       GroupTable.tsx
│   ├── MatchCard.tsx  Fixtures.tsx   Flag.tsx
│   ├── MatchDetail.tsx  RosterModal.tsx  SquadView.tsx  TeamResults.tsx
│   └── ResultsTicker.tsx
├── App.tsx
├── main.tsx
└── index.css          # floodlit-pitch theme (Oswald / Inter / IBM Plex Mono)
```

## Updating results

Scores live in `RESULTS` inside `src/data/fixtures.ts`, keyed by match id
(e.g. `"m-A-1": [2, 0]`). Add or edit an entry and the match flips to `finished`;
standings recompute on the next render. No other changes needed.

Red cards, suspensions, and injuries live in `src/data/discipline.ts`. Each entry
names the player, the match where it happened (`sourceMatchId`), the matches they
miss (`missesMatchIds`), and an `impact` rating from 1 (fringe) to 5 (star) — the
match detail modal and fixture-card chips pick them up automatically.

### Automatic updates

`.github/workflows/update-data.yml` runs hourly: `scripts/update-data.ts` pulls
finished results and red cards from
[football-data.org](https://www.football-data.org/) into `src/data/live.json`
and commits when something changed. Deployment is handled by Vercel's Git
integration, which rebuilds the site on every push (including these automated
commits). Setup: register a free football-data.org key (the free tier includes
the World Cup) and save it as a repository secret named `FOOTBALL_API_KEY`.

Live data merges with the curated files — manual `RESULTS` entries and
`discipline.ts` absences take precedence, and auto-detected red cards get their
impact rating from the `STAR_RATINGS` list (default: regular starter).

## The match "Script" & its accuracy

Every match carries a **Script** — a short, auto-written read generated entirely
from data, so it stays in sync as results come in (no runtime model calls):

- **Form ratings** (`src/lib/form.ts`) start each team from a FIFA-based rating and
  nudge it Elo-style after every result (an upset drops the favourite, lifts the
  underdog), scaled by the goal margin.
- **`predict()`** (`src/lib/script.ts`) turns the two ratings + their form trend into
  a favoured side and a lean scoreline. The **live Script and the grader call the same
  `predict()`**, so the lean shown is always the lean judged.
- **Before kickoff** the Script is a preview (who holds the edge, form trends, who's
  out, a model-lean scoreline); **once final** it becomes a one-line recap.
- **Accuracy** (`src/lib/accuracy.ts`) grades each played match's call against the
  result and reports a running record. Crucially, grading uses the ratings **as they
  stood _before_ that kickoff** (`formRatingsBefore`), so a match never informs its own
  prediction — no hindsight. A ✓/✗ shows on the fixture card and in the match detail,
  and the overall hit-rate shows as a badge on the Fixtures header.

It's all derived from results + form + squad captains and recomputed every build, so
there's nothing to hand-maintain — it updates itself as the tournament plays out.

## Data accuracy notes

- Groups reflect the official 5 December 2025 draw (with the March 2026 playoff
  winners), and the fixture list follows the official group-stage schedule —
  kickoffs are stored in UTC and shown in the viewer's local time.
- Match results are entered manually after full time, so the standings lag live
  play — wire a live feed (above) for real-time scores.
- Flags are served from [flagcdn.com](https://flagcdn.com).

## License

MIT — unofficial fan project, not affiliated with FIFA.
