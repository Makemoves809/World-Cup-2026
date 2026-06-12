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
│   └── standings.ts   # computes & sorts group tables from finished matches
├── components/
│   ├── Header.tsx     Hero.tsx       GroupTable.tsx
│   ├── MatchCard.tsx  Fixtures.tsx   Flag.tsx
│   └── ResultsTicker.tsx
├── App.tsx
├── main.tsx
└── index.css          # floodlit-pitch theme (Oswald / Inter / IBM Plex Mono)
```

## Updating results

Scores live in `RESULTS` inside `src/data/fixtures.ts`, keyed by match id
(e.g. `"m-A-1": [2, 0]`). Add or edit an entry and the match flips to `finished`;
standings recompute on the next render. No other changes needed.

### Wiring a live feed

`src/lib/standings.ts` is pure — it derives tables from any `Match[]`. To go live,
replace the static import in `fixtures.ts` with a fetch from a results API
(e.g. [football-data.org](https://www.football-data.org/) or
[API-Football](https://www.api-football.com/)), map the response into the `Match`
shape, and the rest of the app works unchanged.

## Data accuracy notes

- Groups reflect the official 5 December 2025 draw (with the March 2026 playoff
  winners), and the fixture list follows the official group-stage schedule —
  kickoffs are stored in UTC and shown in the viewer's local time.
- Match results are entered manually after full time, so the standings lag live
  play — wire a live feed (above) for real-time scores.
- Flags are served from [flagcdn.com](https://flagcdn.com).

## License

MIT — unofficial fan project, not affiliated with FIFA.
