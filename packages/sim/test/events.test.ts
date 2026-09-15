import { describe, expect, it } from "vitest";
import { createRng } from "../src/rng.js";
import { AUTO_EVENTS } from "../src/events.js";
import { CLUBS, COUNTRIES } from "../src/data.js";
import { newPlayer } from "../src/engine.js";
import { rollDraft } from "../src/formulas.js";
import type { PlayerState } from "../src/types.js";

function capsPlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  const club = CLUBS.find((c) => c.tier === 2) ?? CLUBS[0];
  const p = newPlayer(
    { name: "Test", nationality: COUNTRIES[0], foot: "Right", number: 9, position: "ST", club },
    rollDraft(createRng(1)),
    2024,
  );
  return { ...p, caps: 5, ...overrides };
}

describe("international tournament events", () => {
  it("names the World Cup for any nation on the world-cup cadence", () => {
    const worldCup = AUTO_EVENTS.find((e) => e.id === "worldCup")!;
    const p = capsPlayer({ year: 2026, careerStartYear: 2024 }); // year - start = 2
    expect(worldCup.isEligible(p, 0)).toBe(true);
  });

  it("gives a European nation the European Championship, not another confederation's cup", () => {
    const continental = AUTO_EVENTS.find((e) => e.id === "continentalIntl")!;
    const france = COUNTRIES.find((c) => c.name === "France")!;
    const p = capsPlayer({ nationality: france, year: 2028, careerStartYear: 2024 }); // year - start = 4
    expect(continental.isEligible(p, 0)).toBe(true);
    // run many seeds until we observe a win, then check the trophy name
    for (let seed = 1; seed <= 200; seed++) {
      const result = continental.apply(p, createRng(seed));
      if (result.trophies.length > p.trophies.length) {
        expect(result.trophies[result.trophies.length - 1].name).toBe("European Championship");
        return;
      }
    }
    throw new Error("Never observed a continental win across 200 seeds — check the win probability.");
  });

  it("gives a South American nation the Copa América", () => {
    const continental = AUTO_EVENTS.find((e) => e.id === "continentalIntl")!;
    const argentina = COUNTRIES.find((c) => c.name === "Argentina")!;
    const p = capsPlayer({ nationality: argentina, year: 2028, careerStartYear: 2024 });
    for (let seed = 1; seed <= 200; seed++) {
      const result = continental.apply(p, createRng(seed));
      if (result.trophies.length > p.trophies.length) {
        expect(result.trophies[result.trophies.length - 1].name).toBe("Copa América");
        return;
      }
    }
    throw new Error("Never observed a continental win across 200 seeds — check the win probability.");
  });

  it("does not fire the continental cup in the same year as the World Cup", () => {
    const worldCup = AUTO_EVENTS.find((e) => e.id === "worldCup")!;
    const continental = AUTO_EVENTS.find((e) => e.id === "continentalIntl")!;
    for (let offset = 0; offset < 8; offset++) {
      const p = capsPlayer({ year: 2024 + offset, careerStartYear: 2024 });
      const wcEligible = worldCup.isEligible(p, 0);
      const contEligible = continental.isEligible(p, 0);
      expect(wcEligible && contEligible).toBe(false);
    }
  });

  it("can occasionally raise both rating and potential on a great tournament run", () => {
    const worldCup = AUTO_EVENTS.find((e) => e.id === "worldCup")!;
    const p = capsPlayer({ year: 2026, careerStartYear: 2024, rating: 70, potential: 80 });
    let sawRatingBump = false;
    let sawPotentialBump = false;
    for (let seed = 1; seed <= 500; seed++) {
      const result = worldCup.apply(p, createRng(seed));
      if (result.rating > p.rating) sawRatingBump = true;
      if (result.potential > p.potential) sawPotentialBump = true;
    }
    expect(sawRatingBump).toBe(true);
    expect(sawPotentialBump).toBe(true);
  });
});
