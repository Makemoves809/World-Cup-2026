import committed from "../src/data/live.json";
import { transformFdMatches, type FdKo } from "../src/lib/fdMap";

/**
 * /api/live — a thin, cached proxy over football-data.org so an open page can
 * refresh scores without waiting for the update-data commit + redeploy cycle.
 *
 * The key stays server-side (FOOTBALL_API_KEY as a Vercel env var). Edge caching
 * (s-maxage) means upstream is hit at most a couple of times a minute no matter
 * how many visitors poll, staying inside the free tier's 10 req/min. Without the
 * key — or on any upstream error — it returns the committed snapshot so the
 * client always gets valid JSON (same data as /live.json, just no speed-up).
 *
 * Freshness is bounded by the free feed itself (~30–60s behind), not by this.
 */

const API = "https://api.football-data.org/v4";
const COMPETITION = process.env.COMPETITION ?? "WC";

type AnyRes = {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => AnyRes;
  send: (b: string) => void;
};

function upsertKo(base: FdKo[], fresh: FdKo[]): FdKo[] {
  const out = base.map((k) => ({ ...k }));
  for (const k of fresh) {
    const i = out.findIndex(
      (e) => e.stage === k.stage && e.homeId === k.homeId && e.awayId === k.awayId
    );
    if (i >= 0) out[i] = { ...out[i], ...k };
    else out.push(k);
  }
  return out;
}

export default async function handler(_req: unknown, res: AnyRes): Promise<void> {
  res.setHeader("Content-Type", "application/json");
  const key = process.env.FOOTBALL_API_KEY;

  // No key configured — behave exactly like the static /live.json.
  if (!key) {
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    res.status(200).send(JSON.stringify(committed));
    return;
  }

  try {
    const r = await fetch(`${API}/competitions/${COMPETITION}/matches`, {
      headers: { "X-Auth-Token": key },
    });
    if (!r.ok) throw new Error(`upstream HTTP ${r.status}`);
    const data = (await r.json()) as { matches?: unknown[] };
    const fd = transformFdMatches(data.matches ?? []);

    const merged = {
      ...committed,
      results: { ...committed.results, ...fd.results },
      koResults: upsertKo(committed.koResults as FdKo[], fd.koResults),
      liveKo: fd.liveKo,
      liveScores: fd.liveScores,
      attendance: { ...committed.attendance, ...fd.attendance },
    };

    res.setHeader("Cache-Control", "public, s-maxage=20, stale-while-revalidate=40");
    res.status(200).send(JSON.stringify(merged));
  } catch {
    // Upstream hiccup / rate limit — serve the last committed snapshot.
    res.setHeader("Cache-Control", "public, s-maxage=15, stale-while-revalidate=30");
    res.status(200).send(JSON.stringify(committed));
  }
}
