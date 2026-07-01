import committed from "../src/data/live.json";

/**
 * /api/live — a thin, cached proxy over football-data.org so an open page can
 * refresh scores without waiting for the update-data commit + redeploy cycle.
 *
 * The key stays server-side (FOOTBALL_API_KEY as a Vercel env var). Edge caching
 * (s-maxage) means upstream is hit at most a couple of times a minute no matter
 * how many visitors poll, staying inside the free tier's 10 req/min. Without the
 * key — or on ANY error (upstream, or loading the feed mapper) — it returns the
 * committed snapshot so the client always gets valid JSON and the function never
 * hard-fails. The mapper is imported lazily so a bundling hiccup degrades to the
 * snapshot rather than crashing the function.
 *
 * Freshness is bounded by the free feed itself (~30–60s behind), not by this.
 */

const API = "https://api.football-data.org/v4";
const COMPETITION = process.env.COMPETITION ?? "WC";

type Res = {
  statusCode: number;
  setHeader: (k: string, v: string) => void;
  end: (body: string) => void;
};

function send(res: Res, body: unknown, cache: string): void {
  try {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", cache);
    res.end(typeof body === "string" ? body : JSON.stringify(body));
  } catch {
    try {
      res.end(JSON.stringify(committed ?? {}));
    } catch {
      /* nothing more we can do */
    }
  }
}

const FALLBACK_CACHE = "public, s-maxage=30, stale-while-revalidate=60";

export default async function handler(_req: unknown, res: Res): Promise<void> {
  const key = process.env.FOOTBALL_API_KEY;
  if (!key) {
    send(res, committed, FALLBACK_CACHE);
    return;
  }

  try {
    const { transformFdMatches, upsertKo } = await import("../src/lib/fdMap");
    const r = await fetch(`${API}/competitions/${COMPETITION}/matches`, {
      headers: { "X-Auth-Token": key },
    });
    if (!r.ok) throw new Error(`upstream HTTP ${r.status}`);
    const data = (await r.json()) as { matches?: unknown[] };
    const fd = transformFdMatches(data.matches ?? []);

    const merged = {
      ...committed,
      results: { ...committed.results, ...fd.results },
      koResults: upsertKo(committed.koResults ?? [], fd.koResults),
      liveKo: fd.liveKo,
      liveScores: fd.liveScores,
      attendance: { ...committed.attendance, ...fd.attendance },
    };

    send(res, merged, "public, s-maxage=20, stale-while-revalidate=40");
  } catch {
    // Upstream hiccup / rate limit / mapper load error — serve the snapshot.
    send(res, committed, "public, s-maxage=15, stale-while-revalidate=30");
  }
}
