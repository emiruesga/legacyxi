const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8787";
const CAREERS_PATH = "careers";
const LEADERBOARD_SCAN_LIMIT = 500;

export interface LeaderboardRow {
  id: string;
  name: string;
  flag: string;
  position: string;
  score: number;
  peakRating: number;
  trophies: number;
  seasons: number;
  caps: number;
}

export interface CareerSubmission {
  name: string;
  flag: string;
  position: string;
  score: number;
  peakRating: number;
  trophies: number;
  seasons: number;
  caps: number;
}

export interface SubmitResult {
  rank: number;
  total: number;
  top: LeaderboardRow[];
}

/** Minimal shape of the `db` capability namespace this file uses.
 * See the artifact-capabilities runtime contract for the full surface. */
interface ClaudeDb {
  collection(path: string): {
    add(data: Record<string, unknown>): Promise<{ id: string }>;
    orderBy(field: string, dir?: "asc" | "desc"): any;
  };
}

declare global {
  interface Window {
    claude?: { use(name: string): Promise<unknown> };
  }
}

let dbPromise: Promise<ClaudeDb | null> | null = null;

/** When this page is running as a published Claude Artifact, `window.claude`
 * is present and the shared `db` capability backs the leaderboard. Outside
 * that host (local dev against `apps/server`), it's undefined and every
 * call below falls through to the Express API instead. */
function getDb(): Promise<ClaudeDb | null> {
  if (!dbPromise) {
    dbPromise =
      typeof window !== "undefined" && window.claude
        ? (window.claude.use("db").catch(() => null) as Promise<ClaudeDb | null>)
        : Promise.resolve(null);
  }
  return dbPromise;
}

export async function submitCareer(entry: CareerSubmission): Promise<SubmitResult | null> {
  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection(CAREERS_PATH);
      const ref = await collection.add({ ...entry, createdAt: Date.now() });
      const snap = await collection.orderBy("score", "desc").limit(LEADERBOARD_SCAN_LIMIT).get();
      const docs: LeaderboardRow[] = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as object) }) as LeaderboardRow);
      const rankIdx = docs.findIndex((d) => d.id === ref.id);
      return { rank: rankIdx >= 0 ? rankIdx + 1 : docs.length, total: docs.length, top: docs.slice(0, 50) };
    } catch {
      return null;
    }
  }

  try {
    const res = await fetch(`${API_BASE}/api/careers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!res.ok) return null;
    return (await res.json()) as SubmitResult;
  } catch {
    return null;
  }
}

export async function fetchLeaderboard(limit = 50): Promise<{ total: number; top: LeaderboardRow[] } | null> {
  const db = await getDb();
  if (db) {
    try {
      const snap = await db.collection(CAREERS_PATH).orderBy("score", "desc").limit(LEADERBOARD_SCAN_LIMIT).get();
      const docs: LeaderboardRow[] = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as object) }) as LeaderboardRow);
      return { total: docs.length, top: docs.slice(0, limit) };
    } catch {
      return null;
    }
  }

  try {
    const res = await fetch(`${API_BASE}/api/leaderboard?limit=${limit}`);
    if (!res.ok) return null;
    return (await res.json()) as { total: number; top: LeaderboardRow[] };
  } catch {
    return null;
  }
}
