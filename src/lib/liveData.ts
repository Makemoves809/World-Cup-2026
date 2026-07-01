import { useSyncExternalStore } from "react";
import bundled from "../data/live.json";

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

/** Begin polling the served live.json. Safe to call more than once. */
export function startLivePolling(intervalMs = 30_000): void {
  if (started || typeof window === "undefined") return;
  started = true;

  const url = `${import.meta.env.BASE_URL}live.json`;
  let lastText = JSON.stringify(current);

  const tick = async () => {
    try {
      const res = await fetch(`${url}?_=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) return;
      const text = await res.text();
      if (!text || text === lastText) return;
      const data = JSON.parse(text) as LiveData;
      lastText = text;
      current = data;
      for (const l of listeners) l();
    } catch {
      /* offline or a transient error — keep the last good snapshot */
    }
  };

  void tick();
  window.setInterval(() => void tick(), intervalMs);
}
