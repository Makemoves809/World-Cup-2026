import type { Team } from "../data/types";
import { flagUrl } from "../lib/flags";

interface FlagProps {
  team: Team;
  size?: number;
}

/** Country flag — bundled locally (see src/lib/flags.ts), not fetched at runtime. */
export function Flag({ team, size = 20 }: FlagProps) {
  const w = Math.round(size * 1.5);
  const src = flagUrl(team.flag);
  if (!src) return null;
  return (
    <img
      className="flag"
      src={src}
      width={w}
      height={size}
      alt=""
      aria-hidden="true"
    />
  );
}
