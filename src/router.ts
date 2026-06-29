import { useSyncExternalStore } from "react";

/**
 * Minimal History-API router — no dependencies. Pages are plain pathnames
 * ("/", "/groups", "/knockout", "/schedule"); `vercel.json` rewrites every
 * path to index.html so deep links and refreshes work.
 */
const NAV_EVENT = "wc26:navigate";

function subscribe(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener(NAV_EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(NAV_EVENT, cb);
  };
}

export function useRoute(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => "/"
  );
}

export function navigate(to: string) {
  if (to === window.location.pathname) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  window.history.pushState(null, "", to);
  window.dispatchEvent(new Event(NAV_EVENT));
  window.scrollTo(0, 0);
}
