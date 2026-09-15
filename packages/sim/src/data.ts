import type { Club, Country, PositionDef, PositionId, PositionProfile, Region } from "./types.js";
import type { RNG } from "./rng.js";

export const REGION_PARTS: Record<Region, { starts: string[]; ends: string[] }> = {
  europe: { starts: ["Nord", "Bel", "Vor", "Lyon", "Aren", "Castel", "Hoch", "Bruns"], ends: ["burg", "feld", "mont", "heim", "ford", "vale", "holm", "dahl"] },
  latam: { starts: ["Rio", "Nueva", "Punta", "Alto", "Costa", "Sierra", "Vale", "Santa"], ends: ["verde", "dorado", "vista", "mar", "luz", "sol", "cruz", "plata"] },
  africa: { starts: ["Nia", "Kofi", "Amara", "Zuri", "Bara", "Osei", "Kene", "Tama"], ends: ["mba", "sara", "koro", "beni", "funa", "desa", "wale", "tola"] },
  asia: { starts: ["Shen", "Hana", "Min", "Takara", "Rin", "Chon", "Yara", "Seo"], ends: ["dao", "shu", "bara", "ken", "ling", "mora", "waka", "jin"] },
  northam: { starts: ["Cedar", "Iron", "North", "Maple", "Grand", "Silver", "Stone", "Harbor"], ends: ["wood", "ridge", "field", "bay", "port", "haven", "creek", "falls"] },
};

export const CLUB_SUFFIXES = ["Athletic", "United", "City", "FC", "SC", "Rovers", "Wanderers", "Town", "Olympic", "Rangers", "Sporting", "Dynamo", "Union"];

export const COUNTRIES: Country[] = [
  { name: "Brazil", flag: "🇧🇷", tier: 1, region: "latam" },
  { name: "Argentina", flag: "🇦🇷", tier: 1, region: "latam" },
  { name: "France", flag: "🇫🇷", tier: 1, region: "europe" },
  { name: "Spain", flag: "🇪🇸", tier: 1, region: "europe" },
  { name: "Germany", flag: "🇩🇪", tier: 1, region: "europe" },
  { name: "England", flag: "🏴", tier: 1, region: "europe" },
  { name: "Portugal", flag: "🇵🇹", tier: 1, region: "europe" },
  { name: "Italy", flag: "🇮🇹", tier: 1, region: "europe" },
  { name: "Netherlands", flag: "🇳🇱", tier: 1, region: "europe" },
  { name: "Belgium", flag: "🇧🇪", tier: 1, region: "europe" },
  { name: "Croatia", flag: "🇭🇷", tier: 2, region: "europe" },
  { name: "Uruguay", flag: "🇺🇾", tier: 2, region: "latam" },
  { name: "Colombia", flag: "🇨🇴", tier: 2, region: "latam" },
  { name: "Morocco", flag: "🇲🇦", tier: 2, region: "africa" },
  { name: "Japan", flag: "🇯🇵", tier: 2, region: "asia" },
  { name: "United States", flag: "🇺🇸", tier: 2, region: "northam" },
  { name: "Mexico", flag: "🇲🇽", tier: 2, region: "latam" },
  { name: "Senegal", flag: "🇸🇳", tier: 2, region: "africa" },
  { name: "Denmark", flag: "🇩🇰", tier: 2, region: "europe" },
  { name: "Switzerland", flag: "🇨🇭", tier: 2, region: "europe" },
  { name: "South Korea", flag: "🇰🇷", tier: 3, region: "asia" },
  { name: "Nigeria", flag: "🇳🇬", tier: 3, region: "africa" },
  { name: "Australia", flag: "🇦🇺", tier: 3, region: "asia" },
  { name: "Poland", flag: "🇵🇱", tier: 3, region: "europe" },
  { name: "Ecuador", flag: "🇪🇨", tier: 3, region: "latam" },
  { name: "Ghana", flag: "🇬🇭", tier: 3, region: "africa" },
  { name: "Sweden", flag: "🇸🇪", tier: 3, region: "europe" },
  { name: "Serbia", flag: "🇷🇸", tier: 3, region: "europe" },
  { name: "Canada", flag: "🇨🇦", tier: 4, region: "northam" },
  { name: "Iceland", flag: "🇮🇸", tier: 4, region: "europe" },
  { name: "Qatar", flag: "🇶🇦", tier: 4, region: "asia" },
  { name: "Jamaica", flag: "🇯🇲", tier: 4, region: "latam" },
];

export const POSITIONS: PositionDef[] = [
  { id: "GK", label: "Goalkeeper", row: "GK" },
  { id: "CB", label: "Centre-Back", row: "DEF" },
  { id: "FB", label: "Full-Back", row: "DEF" },
  { id: "DM", label: "Defensive Mid", row: "MID" },
  { id: "CM", label: "Central Mid", row: "MID" },
  { id: "AM", label: "Attacking Mid", row: "MID" },
  { id: "W", label: "Winger", row: "ATT" },
  { id: "ST", label: "Striker", row: "ATT" },
];

export const POS_PROFILE: Record<PositionId, PositionProfile> = {
  GK: { goal: 0.0, assist: 0.01, clean: 1.0, goalWeight: 0, assistWeight: 0 },
  CB: { goal: 0.03, assist: 0.05, clean: 0.8, goalWeight: 55, assistWeight: 30 },
  FB: { goal: 0.05, assist: 0.14, clean: 0.5, goalWeight: 45, assistWeight: 22 },
  DM: { goal: 0.08, assist: 0.12, clean: 0.4, goalWeight: 32, assistWeight: 20 },
  CM: { goal: 0.14, assist: 0.2, clean: 0.15, goalWeight: 22, assistWeight: 16 },
  AM: { goal: 0.28, assist: 0.28, clean: 0, goalWeight: 14, assistWeight: 12 },
  W: { goal: 0.32, assist: 0.24, clean: 0, goalWeight: 12, assistWeight: 13 },
  ST: { goal: 0.48, assist: 0.14, clean: 0, goalWeight: 9, assistWeight: 16 },
};

/** Estimated size of the global talent pool at each position — used for world-rank math. */
export const WORLD_POOL_SIZE: Record<PositionId, number> = {
  GK: 600, CB: 1300, FB: 1200, DM: 1000, CM: 1500, AM: 1200, W: 1400, ST: 1600,
};

export const CLUB_LEVEL: Record<number, number> = { 1: 90, 2: 80, 3: 70, 4: 60, 5: 50 };
export const TIER_LABEL: Record<number, string> = { 1: "Elite Giant", 2: "Continental Power", 3: "Established Club", 4: "Rising Club", 5: "Lower Division" };
export const TIER_MULT: Record<number, number> = { 1: 1.3, 2: 1.1, 3: 0.9, 4: 0.7, 5: 0.5 };
export const LEVEL_BASE = { league: 60, cup: 35, continental: 100, international: 210 };
export const MILESTONE_TIERS = [1, 5, 10, 25, 50, 100, 250, 500];

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function makeCityName(region: Region, rng: RNG): string {
  const parts = REGION_PARTS[region] ?? REGION_PARTS.europe;
  const start = rng.choice(parts.starts);
  if (rng.next() < 0.45) return start;
  const end = rng.choice(parts.ends);
  return cap(start + end.toLowerCase());
}

export function makeClub(region: Region, tier: 1 | 2 | 3 | 4 | 5, rng: RNG): Club {
  const base = CLUB_LEVEL[tier];
  return {
    name: `${makeCityName(region, rng)} ${rng.choice(CLUB_SUFFIXES)}`,
    tier,
    ambition: clamp(rng.int(base - 20, base + 14), 12, 99),
    region,
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
