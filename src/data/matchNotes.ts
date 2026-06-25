/**
 * Curated editorial notes for specific matches — the human context the
 * auto-Script model can't infer from scores and form: heavy rotation, dead
 * rubbers, motivation, weather, returning stars. Keyed by match id and shown
 * as an "Editor's note" inside the match Script. Keep them short and factual.
 */
export const MATCH_NOTES: Record<string, string> = {
  "m-D-5":
    "Heavily rotated USA. With top spot in hand and Türkiye already eliminated, " +
    "Pochettino rests four regulars carrying a yellow — Tyler Adams, Folarin " +
    "Balogun, Chris Richards and Antonee Robinson — to keep them clear of a " +
    "Round-of-32 suspension. Christian Pulisic returns from a calf strain to " +
    "captain a much-changed XI (he may only play a half). The model's " +
    "“strong favourites” read is built on full-strength form, so weigh it " +
    "against that second-string lineup.",
};

/** Editorial note for a match, if one has been curated. */
export const matchNote = (matchId: string): string | undefined =>
  MATCH_NOTES[matchId];
