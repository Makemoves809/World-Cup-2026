import type { Team } from "../data/types";

interface FlagProps {
  team: Team;
  size?: number;
}

/**
 * Country flag rendered from flagcdn.com. Falls back gracefully to the
 * three-letter code if the image fails to load (e.g. offline).
 */
export function Flag({ team, size = 20 }: FlagProps) {
  const w = Math.round(size * 1.5);
  return (
    <img
      className="flag"
      src={`https://flagcdn.com/w40/${team.flag}.png`}
      srcSet={`https://flagcdn.com/w80/${team.flag}.png 2x`}
      width={w}
      height={size}
      loading="lazy"
      alt=""
      aria-hidden="true"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
