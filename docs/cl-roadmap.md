# Champions League site — automation roadmap

The live site (production branch `claude/repository-edits-completion-rs4u72`,
served by Vercel) is currently the **preseason beginner hub** for the UEFA
Champions League 2026/27. It advances through the season via **durable cloud
triggers** (Claude Code Remote `create_trigger`, one-shot `run_once_at`, which
auto-retire after firing) plus the re-enabled `update-data` GitHub Action for
in-season results.

> **Status (2 Sep 2026):** The **draw milestone is DONE** — done attended on
> 2 Sep (the draw was already past): the final 36 (incl. the 7 qualifiers) are
> locked in `clubs.ts` and the site copy reflects the completed draw and the
> 8 Sep season start. Live standings + per-match fixtures still land via the
> kickoff routine. The **kickoff milestone is DONE** (7 Sep, attended — the routine fired
> but, sandboxed away from the API, correctly pushed nothing): the feed is
> repointed to CL, the results bot is re-enabled on GitHub's native schedule,
> all 144 fixtures flow in with kickoff times, and /table + /fixtures are
> live. The **knockouts** routine (fires 2027-02-10) is CREATED as a
> fresh-session-per-fire trigger with push+email notifications. Each is self-contained: read this file + CLAUDE.md,
> `git pull` production, do the task, **build must pass before pushing; if it
> can't be done cleanly, commit nothing and report** (a routine must never
> break the live site), then push and report.

## Milestone triggers to create

1. **League-phase draw — fire `2026-08-27T19:00:00Z`**
   The draw (27 Aug 2026, ~16:00 UTC) is done. Research the completed draw:
   the final 36 clubs (incl. the 7 qualifiers now known) and each club's 8
   fixtures (4 home / 4 away). Update `src/data/clubs.ts` to the confirmed 36;
   build the fixtures data model, the **real 36-team league table** (sorted by
   points, with the three qualification bands already on `/table`), and a
   schedule page. Replace the preseason `/table` placeholder with the live
   standings shell. **Also feed the real fixtures into the subscribable
   calendar** — extend `scripts/gen-ics.ts` (runs on `prebuild`, writes
   `public/champions-league.ics`) to emit a timed VEVENT per match; subscribers
   then get every fixture automatically.

2. **Season kickoff — fire `2026-09-15T12:00:00Z`** (adjust to the confirmed
   matchday-1 date)
   Wire live results: repoint `scripts/update-data.ts` + the football-data.org
   competition to the Champions League (competition code `CL` / 2001);
   **re-enable the `update-data` GitHub Action** (in
   `.github/workflows/update-data.yml`, remove the `if: ${{ false }}` job guard
   and restore the `schedule:` cron) so results + the table update
   automatically all season; make `/table` a live standings table.
   **Trigger credential:** the old external cron (cron-job.org) used a
   fine-grained PAT ("WC26 cron trigger") that was let expire during the pivot
   (it drove the paused WC bot; nothing used it in between). To restore frequent
   matchday polling, either mint a fresh fine-grained PAT (this repo, Actions
   read/write, expiry past June 2027) and repoint the external cron at the CL
   workflow, or rely on GitHub's native `schedule:` cron (no token, but less
   reliable for tight polling — fine for CL's ~twice-weekly matchdays).

3. **Knockouts — fire `2027-02-10T12:00:00Z`** (play-off round is ~17 Feb 2027)
   Build the **two-legged knockout bracket**: play-off round (9th–24th) → R16 →
   QF → SF → single final, with **aggregate** scoring (no away-goals rule),
   wired to the final league-phase standings and results.

## Notes
- Once trigger 2 re-enables the GitHub Action, week-to-week result/table
  updates run on GitHub's infrastructure — no per-match trigger needed.
- The World Cup site is preserved on branch `archive/world-cup-2026` + tag
  `world-cup-2026`, to be restored for the 2030 World Cup.
- Later, optional: club squads / pitch maps (`Phase 4`) — add marquee clubs
  first; and real club crests (currently monogram tokens with a national-flag
  accent).
