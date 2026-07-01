/**
 * /api/live — a thin, cached proxy over football-data.org.
 *
 * Deliberately self-contained: it imports NOTHING (no project modules, no JSON),
 * so it can't fail to bundle/load on Vercel. It just forwards the competition's
 * matches with the key kept server-side, trimmed to the fields the client needs.
 * The client maps these into the app's live shape (it already bundles that code).
 *
 * Edge caching (s-maxage) keeps upstream calls within the free tier's 10 req/min
 * regardless of traffic. Without a key, or on any error, it returns an empty
 * match list so the client simply falls back to its bundled/static data.
 */

const API = "https://api.football-data.org/v4";
const COMPETITION = process.env.COMPETITION ?? "WC";

type Res = {
  statusCode: number;
  setHeader: (k: string, v: string) => void;
  end: (body: string) => void;
};

function json(res: Res, body: string, cache: string): void {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", cache);
  res.end(body);
}

export default async function handler(_req: unknown, res: Res): Promise<void> {
  const empty = '{"matches":[]}';
  const key = process.env.FOOTBALL_API_KEY;
  if (!key) {
    json(res, empty, "public, s-maxage=30, stale-while-revalidate=60");
    return;
  }

  try {
    const r = await fetch(`${API}/competitions/${COMPETITION}/matches`, {
      headers: { "X-Auth-Token": key },
    });
    if (!r.ok) {
      json(res, empty, "public, s-maxage=15, stale-while-revalidate=30");
      return;
    }
    const data = (await r.json()) as { matches?: unknown[] };
    // Trim to the fields the client mapper uses, to keep the payload small.
    const matches = (data.matches ?? []).map((raw) => {
      const m = raw as {
        status?: string;
        minute?: number | null;
        stage?: string;
        attendance?: number;
        homeTeam?: { name?: string; tla?: string };
        awayTeam?: { name?: string; tla?: string };
        score?: {
          winner?: string | null;
          duration?: string | null;
          fullTime?: { home?: number | null; away?: number | null };
        };
      };
      return {
        status: m.status ?? null,
        minute: m.minute ?? null,
        stage: m.stage ?? null,
        attendance: typeof m.attendance === "number" ? m.attendance : null,
        homeTeam: { name: m.homeTeam?.name ?? null, tla: m.homeTeam?.tla ?? null },
        awayTeam: { name: m.awayTeam?.name ?? null, tla: m.awayTeam?.tla ?? null },
        score: {
          winner: m.score?.winner ?? null,
          duration: m.score?.duration ?? null,
          fullTime: {
            home: m.score?.fullTime?.home ?? null,
            away: m.score?.fullTime?.away ?? null,
          },
        },
      };
    });
    json(
      res,
      JSON.stringify({ matches }),
      "public, s-maxage=20, stale-while-revalidate=40"
    );
  } catch {
    json(res, empty, "public, s-maxage=15, stale-while-revalidate=30");
  }
}
