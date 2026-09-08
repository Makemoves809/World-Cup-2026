import { useState } from "react";
import type { Club } from "../data/clubs";
import { initials } from "../data/squads";
import squadData from "../data/clSquads.json";

const meta = (squadData as { squads?: Record<string, { crest?: string | null }> }).squads ?? {};

/**
 * A club badge: the real crest from the feed, falling back to a monogram
 * token if the image is missing or fails to load (so a broken URL never
 * leaves a hole in the layout).
 */
export function Crest({ club, className = "", size }: { club: Club; className?: string; size?: number }) {
  const src = meta[club.id]?.crest ?? null;
  const [failed, setFailed] = useState(false);
  const style = size ? { width: size, height: size } : undefined;

  if (!src || failed) {
    return (
      <span className={`club-crest ${className}`} style={style} aria-hidden="true">
        {initials(club.short)}
      </span>
    );
  }
  return (
    <img
      className={`club-badge ${className}`}
      style={style}
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
