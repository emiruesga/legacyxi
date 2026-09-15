const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8787";

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

export async function submitCareer(entry: CareerSubmission): Promise<SubmitResult | null> {
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
  try {
    const res = await fetch(`${API_BASE}/api/leaderboard?limit=${limit}`);
    if (!res.ok) return null;
    return (await res.json()) as { total: number; top: LeaderboardRow[] };
  } catch {
    return null;
  }
}
