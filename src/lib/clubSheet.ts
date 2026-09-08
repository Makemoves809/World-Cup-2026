import { useSyncExternalStore } from "react";

/**
 * Tiny global store for the club overlay. Any club shown anywhere (scoreboard,
 * schedule, table, clubs page) can call `openClub(id)` to pop its panel in
 * place — no route change, so you stay on whatever you were reading.
 */
let current: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function openClub(clubId: string) {
  current = clubId;
  emit();
}
export function closeClub() {
  if (current === null) return;
  current = null;
  emit();
}
export function useClubSheet(): string | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => null
  );
}
