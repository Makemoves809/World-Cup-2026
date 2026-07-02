/**
 * Order-free lookup key for a knockout tie, shared between scripts/update-data.ts
 * (which writes goals/substitutions under this key) and the data modules that
 * read them. Knockout ties have no fixed match id until the bracket resolves,
 * but any two teams meet at most once across the whole knockout stage, so the
 * team-id pair alone is a safe, stage-free key.
 */
export const koKey = (a: string, b: string): string => `ko:${[a, b].sort().join("-")}`;
