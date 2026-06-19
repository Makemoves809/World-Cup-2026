import { useSyncExternalStore } from "react";

/**
 * Tiny global store for the team-roster overlay. Any team shown anywhere can
 * call `openRoster(teamId)` to pop the squad map in place — without changing
 * the route, so the user stays on whatever tab they were on.
 */
let current: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function openRoster(teamId: string) {
  current = teamId;
  emit();
}

export function closeRoster() {
  if (current === null) return;
  current = null;
  emit();
}

export function useRoster(): string | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => null
  );
}
