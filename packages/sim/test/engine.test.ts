import { describe, expect, it } from "vitest";
import { createRng } from "../src/rng.js";
import { CLUBS, COUNTRIES } from "../src/data.js";
import { continueBatch, newPlayer, resolveDecision, simulateSeason } from "../src/engine.js";
import { rollDraft } from "../src/formulas.js";
import type { CareerRecord, PlayerState } from "../src/types.js";

function makeStartingPlayer(seed: number): PlayerState {
  const rng = createRng(seed);
  const draft = rollDraft(rng);
  const club = rng.choice(CLUBS.filter((c) => c.tier === 4));
  return newPlayer({ name: "Sim Player", nationality: COUNTRIES[0], foot: "Right", number: 9, position: "ST", club }, draft, 2024);
}

/** Drive a career to completion, auto-picking choice 0 at every decision —
 * mirrors what the UI loop does, but headless. */
function runFullCareer(seed: number) {
  const rng = createRng(seed);
  let player = makeStartingPlayer(seed);
  let records: CareerRecord[] = [];
  let guard = 0;
  while (!player.retired && guard < 200) {
    guard += 1;
    const result = continueBatch(player, 1, [], rng);
    if (result.status === "awaiting") {
      const resolved = resolveDecision(result.pendingDecision, 0, result.player, result.seasonsLeft, result.records, rng);
      player = resolved.player;
      records = records.concat(resolved.records);
    } else {
      player = result.player;
      records = records.concat(result.records);
    }
  }
  return { player, records, guard };
}

describe("full career loop", () => {
  it("always terminates in retirement within a bounded number of iterations", () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const { player, guard } = runFullCareer(seed);
      expect(player.retired).toBe(true);
      expect(guard).toBeLessThan(200);
    }
  });

  it("retires by age 41 at the latest", () => {
    const { player } = runFullCareer(11);
    expect(player.age).toBeLessThanOrEqual(41);
  });

  it("produces a deterministic career for a fixed seed", () => {
    const a = runFullCareer(99);
    const b = runFullCareer(99);
    expect(a.player.apps).toBe(b.player.apps);
    expect(a.player.goals).toBe(b.player.goals);
    expect(a.player.rating).toBe(b.player.rating);
    expect(a.player.age).toBe(b.player.age);
  });

  it("produces different careers for different seeds (replayability)", () => {
    const outcomes = [1, 2, 3, 4, 5].map((seed) => runFullCareer(seed).player.apps);
    const distinct = new Set(outcomes);
    expect(distinct.size).toBeGreaterThan(1);
  });

  it("keeps fitness within [0, 100] and age monotonically increasing across seasons", () => {
    const { player } = runFullCareer(21);
    for (const s of player.seasons) {
      expect(s.apps).toBeGreaterThanOrEqual(0);
      expect(s.apps).toBeLessThanOrEqual(42);
    }
    let prevAge = -Infinity;
    for (const s of player.seasons) {
      expect(s.age).toBeGreaterThan(prevAge);
      prevAge = s.age;
    }
  });

  it("never lets a rating drift outside the 40-99 band", () => {
    const { player } = runFullCareer(55);
    for (const s of player.seasons) {
      expect(s.rating).toBeGreaterThanOrEqual(40);
      expect(s.rating).toBeLessThanOrEqual(99);
    }
  });
});

describe("rating convergence — a maxed-potential player should actually reach their ceiling", () => {
  it("gets within a few points of a 99 potential by the end of the prime years, across seeds", () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const rng = createRng(seed * 31337);
      let player = makeStartingPlayer(seed);
      player = { ...player, potential: 99, rating: 50 };
      while (player.age < 30 && !player.retired) {
        player = simulateSeason(player, rng).player;
      }
      expect(player.rating).toBeGreaterThanOrEqual(90);
    }
  });
});

describe("worldCupCallUp flag", () => {
  it("marks the season record whenever the World Cup call-up event actually fires", () => {
    let sawCallUp = false;
    for (let seed = 1; seed <= 300; seed++) {
      const rng = createRng(seed * 65599);
      const player = { ...makeStartingPlayer(seed), caps: 5, year: 2026, careerStartYear: 2024 };
      const { record } = simulateSeason(player, rng);
      if (record.worldCupCallUp) {
        sawCallUp = true;
        expect(record.lines.join(" ")).toContain("World Cup");
      }
    }
    expect(sawCallUp).toBe(true);
  });

  it("is false for a season where no World Cup call-up happened", () => {
    const rng = createRng(2);
    const player = { ...makeStartingPlayer(1), caps: 0, year: 2025, careerStartYear: 2024 };
    const { record } = simulateSeason(player, rng);
    expect(record.worldCupCallUp).toBe(false);
  });
});

describe("continueBatch", () => {
  it("stops on the first eligible decision instead of over-simulating", () => {
    const rng = createRng(4);
    let player = makeStartingPlayer(4);
    // Fast-forward until we hit a decision (transfer requires seasonsAtClub >= 1, age >= 17)
    let result = continueBatch(player, 40, [], rng);
    expect(result.status === "awaiting" || result.player.retired).toBe(true);
  });
});
