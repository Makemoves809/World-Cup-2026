/**
 * Curated editorial notes for specific matches — the human context the
 * auto-Script model can't infer from scores and form: heavy rotation, dead
 * rubbers, motivation, weather, returning stars. Keyed by match id and shown
 * as an "Editor's note" inside the match Script. Keep them short and factual.
 */
export const MATCH_NOTES: Record<string, string> = {
  "m-D-5":
    "A much-changed USA came up short. Already through as group winners and with " +
    "Türkiye eliminated, Pochettino made a record nine changes — resting Adams, " +
    "Balogun, Richards and Robinson (all on a yellow) to keep them clear of a " +
    "Round-of-32 ban. McKennie captained the second-string side and Pulisic came " +
    "off the bench, but Türkiye took it 3–2. A dead-rubber result that doesn't " +
    "dent the US: they still topped Group D from their opening two wins.",
};

/** Editorial note for a match, if one has been curated. */
export const matchNote = (matchId: string): string | undefined =>
  MATCH_NOTES[matchId];
