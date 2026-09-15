import { CLUB_LEVEL, LEVEL_BASE, MILESTONE_TIERS, POS_PROFILE, TIER_MULT, WORLD_POOL_SIZE } from "./data.js";
import type { RNG } from "./rng.js";
import type { PlayerState, PositionId } from "./types.js";

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function ratingToTier(rating: number): 1 | 2 | 3 | 4 | 5 {
  if (rating >= 85) return 1;
  if (rating >= 75) return 2;
  if (rating >= 65) return 3;
  if (rating >= 55) return 4;
  return 5;
}

export function ratingLabel(r: number): string {
  if (r >= 90) return "World Class";
  if (r >= 80) return "Elite";
  if (r >= 70) return "Quality Starter";
  if (r >= 60) return "Squad Player";
  if (r >= 50) return "Prospect";
  return "Raw Talent";
}

export function formatMoney(v: number): string {
  if (v >= 1_000_000) return "€" + (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return "€" + Math.round(v / 1_000) + "K";
  return "€" + Math.round(v);
}

/** Rating delta for a single season, before event modifiers. Growth toward potential
 * while young, mild variance in prime years, accelerating decline after 30. */
export function ageGrowth(p: PlayerState, rng: RNG): number {
  if (p.age < 27) return (p.potential - p.rating) * 0.22 + rng.range(-1, 2.6);
  if (p.age <= 30) return rng.range(-1, 1.5);
  const yearsPast = p.age - 30;
  let d = -(rng.range(0.5, 2.4) + yearsPast * 0.4);
  if (p.age >= 35) d -= rng.range(0.5, 2);
  return d;
}

export function computeApps(p: PlayerState, rng: RNG): number {
  const clubLevel = CLUB_LEVEL[p.club.tier];
  const fit = clamp(1 - Math.abs(p.rating - clubLevel) / 130, 0.35, 1);
  let apps = 38 * fit * (p.fitness / 100) * rng.range(0.75, 1.05);
  if (p.flags.rivalPenalty) apps *= 0.88;
  if (p.flags.slump) apps *= 0.9;
  return clamp(Math.round(apps), 2, 42);
}

export interface GoalsAssists {
  goals: number;
  assists: number;
  cleanSheets: number;
}

export function computeGoalsAssists(p: PlayerState, apps: number, rng: RNG): GoalsAssists {
  const profile = POS_PROFILE[p.position];
  const scale = 0.7 + (p.rating - 50) / 50;
  const goals = p.position === "GK" ? 0 : Math.max(0, Math.round(apps * profile.goal * scale * rng.range(0.7, 1.3)));
  const assists = Math.max(0, Math.round(apps * profile.assist * scale * rng.range(0.7, 1.3)));
  const clubLevel = CLUB_LEVEL[p.club.tier];
  const cleanSheets =
    profile.clean > 0
      ? Math.round(apps * clamp((clubLevel - 30) / 110, 0.05, 0.55) * profile.clean * rng.range(0.8, 1.2))
      : 0;
  return { goals, assists, cleanSheets };
}

export function rollTrophies(p: PlayerState, rng: RNG) {
  const base = { 1: 0.32, 2: 0.16, 3: 0.06, 4: 0.02, 5: 0.005 }[p.club.tier];
  const composure = p.flags.mentalFocus ? 1.2 : 1;
  const captainMult = p.isCaptain ? 1.15 : 1;
  const storybook = p.flags.storybook ? 1.6 : 1;
  const prob = base * (p.club.ambition / 70) * composure * captainMult * storybook;
  const won: PlayerState["trophies"] = [];
  if (rng.next() < prob) won.push({ name: "Domestic League Title", year: p.year, tier: p.club.tier, level: "league" });
  if (rng.next() < prob * 0.7) won.push({ name: "Domestic Cup", year: p.year, tier: p.club.tier, level: "cup" });
  if (p.club.tier <= 2 && rng.next() < prob * 0.5) won.push({ name: "Continental Cup", year: p.year, tier: p.club.tier, level: "continental" });
  return won;
}

export function nationalThreshold(tier: number): number {
  return ({ 1: 72, 2: 68, 3: 64, 4: 60, 5: 56 } as Record<number, number>)[tier];
}

export function rollCaps(p: PlayerState, rng: RNG): { gained: boolean; first: boolean } {
  const threshold = nationalThreshold(p.nationality.tier);
  if (p.rating < threshold) return { gained: false, first: false };
  const chance = clamp((p.rating - threshold) / 40, 0.05, 0.6);
  if (rng.next() < chance) return { gained: true, first: p.caps === 0 };
  return { gained: false, first: false };
}

export function computeMarketValue(p: PlayerState): number {
  const base = Math.pow(Math.max(p.rating - 40, 1), 2) * 38;
  const ageMult = p.age <= 23 ? 1.1 : p.age <= 29 ? 1.25 : p.age <= 32 ? 0.9 : p.age <= 35 ? 0.55 : 0.25;
  const repMult = 1 + Math.min(p.trophies.length * 0.03 + p.caps * 0.01, 0.6);
  return Math.round(base * ageMult * repMult * 1000);
}

/** Position-specific pool sizes mean equal ratings map to different ranks —
 * a 90-rated CM competes with 1500 peers, a 90-rated GK with 600. */
export function computeWorldRank(rating: number, position: PositionId, rng?: RNG): number | null {
  if (rating < 65) return null;
  const poolSize = WORLD_POOL_SIZE[position];
  let pct = clamp((rating - 65) / (99 - 65), 0, 1);
  pct = Math.pow(pct, 1.6);
  let r = Math.round(poolSize - pct * (poolSize - 1));
  const jitter = rng ? rng.int(-3, 3) : 0;
  r = clamp(r + jitter, 1, poolSize);
  return r;
}

export function milestoneLabel(rank: number): string {
  if (rank <= 1) return "Ranked #1 in the world";
  if (rank <= 5) return "Top 5 in the world";
  if (rank <= 10) return "Top 10 in the world";
  if (rank <= 25) return "Top 25 in the world";
  if (rank <= 50) return "Top 50 in the world";
  if (rank <= 100) return "Top 100 in the world";
  if (rank <= 250) return "Top 250 in the world";
  return "Top 500 in the world";
}

export function nextMilestoneTier(rank: number, bestMilestoneSoFar: number): number | null {
  for (const tier of MILESTONE_TIERS) {
    if (rank <= tier && tier < bestMilestoneSoFar) return tier;
  }
  return null;
}

export function careerScore(p: PlayerState): number {
  const profile = POS_PROFILE[p.position];
  let score = p.apps * 1.5 + p.goals * profile.goalWeight + p.assists * profile.assistWeight + p.cleanSheets * 1.2;
  score += p.trophies.reduce((s, t) => s + LEVEL_BASE[t.level] * TIER_MULT[t.tier], 0);
  score += p.caps * 4;
  score += p.peakRating * 14;
  score += p.awards.length * 150;
  score += p.loyaltyStreakMax >= 10 ? 300 : p.loyaltyStreakMax * 25;
  score -= p.transfers * 5;
  return Math.max(0, Math.round(score));
}

export function verdictFor(p: PlayerState, score: number): string {
  if (p.loyaltyStreakMax >= 12) return "One-Club Legend";
  if (p.peakRating >= 90 && p.awards.length > 0) return "Global Icon";
  if (p.trophies.length === 0 && score < 900) return "The Journeyman";
  if (p.caps >= 40) return "International Great";
  if (score >= 3200) return "Hall of Famer";
  if (score >= 2100) return "Club Legend";
  if (score >= 1300) return "Dependable Pro";
  if (score >= 650) return "Squad Player";
  return "Gave It Everything";
}

export function rollDraft(rng: RNG) {
  const base = rng.int(46, 58);
  const potential = clamp(base + rng.int(18, 38), base + 10, 99);
  const potentialLabel =
    potential >= 90 ? "Generational Talent" : potential >= 82 ? "Star Potential" : potential >= 72 ? "Bright Prospect" : "Late Bloomer Chance";
  return { base, potential, potentialLabel };
}
