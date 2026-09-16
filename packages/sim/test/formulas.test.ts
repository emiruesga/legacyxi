import { describe, expect, it } from "vitest";
import { createRng } from "../src/rng.js";
import {
  ageGrowth,
  careerScore,
  computeMarketValue,
  computeNationalRank,
  computeWorldRank,
  internationalWinChance,
  milestoneLabel,
  nextMilestoneTier,
  ratingToTier,
  rollDraft,
  rollIndividualAwards,
  verdictFor,
} from "../src/formulas.js";
import { CLUBS, COUNTRIES, POSITIONS } from "../src/data.js";
import { newPlayer } from "../src/engine.js";
import type { PlayerState } from "../src/types.js";

function basePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  const club = CLUBS.find((c) => c.tier === 3) ?? CLUBS[0];
  const p = newPlayer(
    { name: "Test", nationality: COUNTRIES[0], foot: "Right", number: 10, position: "ST", club },
    { base: 60, potential: 80, potentialLabel: "Star Potential" },
    2024,
  );
  return { ...p, ...overrides };
}

describe("ageGrowth", () => {
  it("pulls rating toward potential for young players", () => {
    const rng = createRng(42);
    const p = basePlayer({ age: 20, rating: 60, potential: 90 });
    const deltas = Array.from({ length: 50 }, () => ageGrowth(p, rng));
    const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length;
    // (90-60)*0.22 = 6.6, plus a small positive random term on average
    expect(avg).toBeGreaterThan(5);
    expect(avg).toBeLessThan(9);
  });

  it("trends negative for players well past their prime", () => {
    const rng = createRng(7);
    const p = basePlayer({ age: 37, rating: 80, potential: 80 });
    const deltas = Array.from({ length: 50 }, () => ageGrowth(p, rng));
    const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length;
    expect(avg).toBeLessThan(0);
  });

  it("is mild in the 27-30 prime window when already at potential", () => {
    const rng = createRng(3);
    const p = basePlayer({ age: 28, rating: 85, potential: 85 });
    const deltas = Array.from({ length: 200 }, () => ageGrowth(p, rng));
    for (const d of deltas) {
      expect(d).toBeGreaterThanOrEqual(-1);
      expect(d).toBeLessThanOrEqual(1.6);
    }
  });

  it("still pulls toward potential during the prime window when a gap remains", () => {
    const rng = createRng(9);
    const p = basePlayer({ age: 28, rating: 70, potential: 99 });
    const deltas = Array.from({ length: 200 }, () => ageGrowth(p, rng));
    const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length;
    // A real gap should produce meaningfully positive average growth, not
    // just noise — this is what makes a high potential reachable at all.
    expect(avg).toBeGreaterThan(1.5);
  });
});

describe("computeNationalRank", () => {
  it("puts a big footballing nation's compatriot rank behind a small one at the same world rank", () => {
    const bigNation = computeNationalRank(50, 1); // e.g. Brazil
    const smallNation = computeNationalRank(50, 5); // e.g. Jamaica
    expect(bigNation).toBeGreaterThan(smallNation);
  });

  it("always returns at least #1", () => {
    expect(computeNationalRank(1, 1)).toBeGreaterThanOrEqual(1);
  });

  it("gets better (lower) as world rank improves, for a fixed nation", () => {
    expect(computeNationalRank(10, 2)).toBeLessThan(computeNationalRank(200, 2));
  });
});

describe("ratingToTier", () => {
  it("maps rating bands to club tiers", () => {
    expect(ratingToTier(90)).toBe(1);
    expect(ratingToTier(80)).toBe(2);
    expect(ratingToTier(70)).toBe(3);
    expect(ratingToTier(60)).toBe(4);
    expect(ratingToTier(45)).toBe(5);
  });
});

describe("computeWorldRank", () => {
  it("returns null below the ranking threshold", () => {
    expect(computeWorldRank(50, "ST")).toBeNull();
    expect(computeWorldRank(64, "ST")).toBeNull();
  });

  it("gives a near-#1 rank for a 99-rated player, deterministically without jitter", () => {
    const rank = computeWorldRank(99, "ST");
    expect(rank).not.toBeNull();
    expect(rank as number).toBeLessThanOrEqual(4); // no rng passed -> no jitter, should land at 1
  });

  it("treats a 97+ rating as legitimately world-class — top 5, not merely top 100", () => {
    // A near-perfect rating should read as "the best in the world", the
    // way it does for the handful of real players who've ever carried one.
    expect(computeWorldRank(98, "ST") as number).toBeLessThanOrEqual(5);
    expect(computeWorldRank(97, "ST") as number).toBeLessThanOrEqual(8);
  });

  it("still gives a merely-elite 90 rating a believable mid-pack elite rank, not #1", () => {
    const rank = computeWorldRank(90, "ST") as number;
    expect(rank).toBeGreaterThan(10);
    expect(rank).toBeLessThan(150);
  });

  it("gives different pool sizes for different positions at the same rating", () => {
    const gk = computeWorldRank(80, "GK");
    const cm = computeWorldRank(80, "CM");
    // CM has a much bigger world pool (1500 vs 600) so the same rating ranks
    // numerically higher (worse) in CM's deeper pool.
    expect(cm as number).toBeGreaterThan(gk as number);
  });

  it("rank improves monotonically as rating rises, for every position", () => {
    for (const pos of POSITIONS) {
      let prev = Infinity;
      for (let rating = 65; rating <= 99; rating += 1) {
        const r = computeWorldRank(rating, pos.id);
        if (r != null) {
          expect(r).toBeLessThanOrEqual(prev);
          prev = r;
        }
      }
    }
  });
});

describe("nextMilestoneTier / milestoneLabel", () => {
  it("finds the best newly-crossed tier and only fires once per tier", () => {
    expect(nextMilestoneTier(3, Infinity)).toBe(5);
    expect(nextMilestoneTier(3, 5)).toBeNull(); // rank 3 doesn't clear tier 1, the only tier below 5
    expect(nextMilestoneTier(1, 5)).toBe(1); // rank 1 clears tier 1
    expect(nextMilestoneTier(3, 1)).toBeNull(); // already crossed #1, nothing left to cross
    expect(nextMilestoneTier(400, Infinity)).toBe(500);
    expect(nextMilestoneTier(600, Infinity)).toBeNull(); // outside all milestone tiers
  });

  it("labels every milestone tier distinctly", () => {
    expect(milestoneLabel(1)).toMatch(/#1/);
    expect(milestoneLabel(5)).toMatch(/Top 5/);
    expect(milestoneLabel(500)).toMatch(/Top 500/);
  });
});

describe("computeMarketValue", () => {
  it("increases with rating", () => {
    const low = computeMarketValue(basePlayer({ rating: 60, age: 24 }));
    const high = computeMarketValue(basePlayer({ rating: 85, age: 24 }));
    expect(high).toBeGreaterThan(low);
  });

  it("discounts value heavily for players past 35", () => {
    const prime = computeMarketValue(basePlayer({ rating: 80, age: 27 }));
    const veteran = computeMarketValue(basePlayer({ rating: 80, age: 37 }));
    expect(veteran).toBeLessThan(prime * 0.5);
  });
});

describe("careerScore / verdictFor", () => {
  it("rewards trophies, caps, peak rating, and loyalty; penalizes transfers", () => {
    const modest = basePlayer({ apps: 300, goals: 50, assists: 20, peakRating: 75, caps: 5, transfers: 2, loyaltyStreakMax: 2 });
    const decorated = basePlayer({
      apps: 300,
      goals: 50,
      assists: 20,
      peakRating: 90,
      caps: 60,
      transfers: 0,
      loyaltyStreakMax: 12,
      trophies: [{ name: "Domestic League Title", year: 2030, tier: 1, level: "league" }],
    });
    expect(careerScore(decorated)).toBeGreaterThan(careerScore(modest));
  });

  it("never returns a negative score even for a bare-bones career", () => {
    const bare = basePlayer({ apps: 0, goals: 0, assists: 0, transfers: 50 });
    expect(careerScore(bare)).toBeGreaterThanOrEqual(0);
  });

  it("labels a heavily decorated, one-club career as a legend tier", () => {
    const legend = basePlayer({ loyaltyStreakMax: 15, peakRating: 92, awards: [{ name: "Ballon d'Or", year: 2030 }] });
    expect(["One-Club Legend", "Global Icon"]).toContain(verdictFor(legend, careerScore(legend)));
  });
});

describe("rollDraft rarity — 99 should read as a GOAT-tier outlier, not an impossibility", () => {
  it("gives a true 99 potential ceiling to a rare but real slice of prospects", () => {
    let hit99 = 0;
    let hit97plus = 0;
    const trials = 5000;
    for (let seed = 1; seed <= trials; seed++) {
      const rng = createRng(seed * 7919);
      const draft = rollDraft(rng);
      if (draft.potential >= 99) hit99++;
      if (draft.potential >= 97) hit97plus++;
    }
    // Rare — this is still a GOAT-tier ceiling — but should actually
    // happen across a modest number of playthroughs, not next to never.
    expect(hit99 / trials).toBeGreaterThan(0.005);
    expect(hit99 / trials).toBeLessThan(0.05);
    expect(hit97plus / trials).toBeLessThan(0.1);
  });

  it("gives the median prospect a modest ceiling, not a superstar one", () => {
    const ceilings: number[] = [];
    for (let seed = 1; seed <= 2000; seed++) {
      ceilings.push(rollDraft(createRng(seed * 104729)).potential);
    }
    ceilings.sort((a, b) => a - b);
    const median = ceilings[Math.floor(ceilings.length / 2)];
    expect(median).toBeLessThan(85);
  });
});

describe("internationalWinChance", () => {
  it("gives a world-giant nation a real, meaningfully higher shot than a minnow at the same rating", () => {
    const giant = internationalWinChance(1, 85, 0.12);
    const minnow = internationalWinChance(5, 85, 0.12);
    expect(giant).toBeGreaterThan(minnow * 2);
  });

  it("gives a genuine world-class season a noticeably better shot than an average one, same nation", () => {
    const superstar = internationalWinChance(1, 97, 0.12);
    const squadPlayer = internationalWinChance(1, 75, 0.12);
    expect(superstar).toBeGreaterThan(squadPlayer);
  });

  it("makes a world giant's peak-form win chance a real, not token, possibility", () => {
    // The whole point of the fix: a top nation with a great player should
    // win noticeably more than 1 time in 5 attempts, not 1 in 10+.
    expect(internationalWinChance(1, 95, 0.13)).toBeGreaterThan(0.2);
  });

  it("never exceeds a sane ceiling even for the best possible case", () => {
    expect(internationalWinChance(1, 99, 0.13)).toBeLessThanOrEqual(0.65);
  });

  it("never goes below a small floor even for the worst possible case", () => {
    expect(internationalWinChance(5, 65, 0.11)).toBeGreaterThanOrEqual(0.03);
  });
});

describe("rollIndividualAwards", () => {
  it("never awards a low-rated, low-scoring squad player anything", () => {
    const scrub = basePlayer({ rating: 62 });
    for (let seed = 1; seed <= 100; seed++) {
      const won = rollIndividualAwards(scrub, 20, 2, 1, createRng(seed));
      expect(won).toHaveLength(0);
    }
  });

  it("can award the Golden Boot to a prolific scorer, named after their league", () => {
    const sharpshooter = basePlayer({ rating: 85 });
    let sawGoldenBoot = false;
    for (let seed = 1; seed <= 300; seed++) {
      const won = rollIndividualAwards(sharpshooter, 30, 28, 4, createRng(seed));
      if (won.some((a) => a.name.endsWith("Golden Boot"))) {
        sawGoldenBoot = true;
        break;
      }
    }
    expect(sawGoldenBoot).toBe(true);
  });

  it("can award a Ballon d'Or to a GOAT-tier season but never to a merely good one", () => {
    const goat = basePlayer({ rating: 98 });
    const good = basePlayer({ rating: 84 });
    let sawGoatWin = false;
    let sawGoodWin = false;
    for (let seed = 1; seed <= 400; seed++) {
      if (rollIndividualAwards(goat, 32, 26, 12, createRng(seed)).some((a) => a.name === "Ballon d'Or")) sawGoatWin = true;
      if (rollIndividualAwards(good, 32, 26, 12, createRng(seed)).some((a) => a.name === "Ballon d'Or")) sawGoodWin = true;
    }
    expect(sawGoatWin).toBe(true);
    expect(sawGoodWin).toBe(false);
  });
});
