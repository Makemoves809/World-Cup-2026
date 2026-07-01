import { useSyncExternalStore } from "react";
import bundled from "../data/live.json";
import { transformFdMatches, upsertKo, type FdKo } from "./fdMap";

/**
 * Live results/scores store.
 *
 * The app ships with `live.json` bundled in (so the first paint always has
 * data), but that snapshot is frozen at build time. To let an already-open page
 * pick up new scores without a manual reload, we also poll a served copy of the
 * same file (`/live.json`, emitted into the build) on an interval and swap it in
 * when it changes. Reads go through `getLiveData()`; components that should
 * re-render on an update subscribe via `useLiveData()`.
 *
 * The served file only changes when the update-data job commits and the site
 * redeploys, so this reflects the feed at that cadence — but the open tab now
 * updates itself instead of showing stale numbers until refreshed.
 */
export type LiveData = typeof bundled;

let current: LiveData = bundled as LiveData;
const listeners = new Set<() => void>();

/**
 * The `/api/live` proxy returns the raw football-data match list (`{matches}`);
 * `/live.json` returns the app's live shape. Detect which we got: map the raw
 * feed into the live shape (overlaying fresh scores/results onto the bundled
 * snapshot's curated fields), or pass the live shape through unchanged.
 */
function normalize(parsed: unknown): LiveData {
  const p = parsed as { matches?: unknown[] };
  if (!p || !Array.isArray(p.matches)) return parsed as LiveData;
  const fd = transformFdMatches(p.matches);
  const base = bundled as unknown as {
    results: Record<string, [number, number]>;
    koResults: FdKo[];
    attendance: Record<string, number>;
  };
  return {
    ...(bundled as object),
    results: { ...base.results, ...fd.results },
    koResults: upsertKo(base.koResults ?? [], fd.koResults),
    liveKo: fd.liveKo,
    liveScores: fd.liveScores,
    attendance: { ...base.attendance, ...fd.attendance },
  } as unknown as LiveData;
}

export function getLiveData(): LiveData {
  return current;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Re-render on every committed live-data change. */
export function useLiveData(): LiveData {
  return useSyncExternalStore(subscribe, getLiveData, getLiveData);
}

let started = false;

/**
 * Begin polling for fresh live data. Prefers the cached `/api/live` proxy (which
 * reads the feed directly, so scores refresh within its cache window) and falls
 * back to the statically served `/live.json` when the proxy isn't available
 * (e.g. no API key configured). Safe to call more than once.
 */
export function startLivePolling(intervalMs = 15_000): void {
  if (started || typeof window === "undefined") return;
  started = true;

  const base = import.meta.env.BASE_URL;
  const primary = `${base}api/live`;
  const fallback = `${base}live.json`;
  let lastText = JSON.stringify(current);
  let useFallback = false;

  const fetchFrom = async (url: string) => {
    const res = await fetch(`${url}?_=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  };

  const tick = async () => {
    try {
      let text: string;
      try {
        text = await fetchFrom(useFallback ? fallback : primary);
      } catch {
        // Proxy missing/erroring — drop to the static file for the rest of the
        // session so we don't spend every tick on a 404.
        useFallback = true;
        text = await fetchFrom(fallback);
      }
      if (!text || text === lastText) return;
      lastText = text;
      current = normalize(JSON.parse(text));
      for (const l of listeners) l();
    } catch {
      /* offline or a transient error — keep the last good snapshot */
    }
  };

  void tick();
  window.setInterval(() => void tick(), intervalMs);
}
