import { REGION_PARTS, TIER_LABEL, makeClub } from "./data.js";
import { clamp, ratingToTier } from "./formulas.js";
import type { RNG } from "./rng.js";
import type { AutoEventDef, DecisionEventDef, PlayerState } from "./types.js";

/** Decision events resolve BEFORE that season's stats are simulated.
 * Add a new one here — nothing else in the engine needs to change. */
export const DECISION_EVENTS: DecisionEventDef[] = [
  {
    id: "transfer",
    weight: 3,
    isEligible: (p) => p.age >= 17 && p.seasonsAtClub >= 1 && p.age < 34 && !p.retired,
    build: (p, rng) => {
      const targetTier = clamp(ratingToTier(p.rating) + rng.choice([-1, 0, 0, 1]), 1, 5) as 1 | 2 | 3 | 4 | 5;
      const region = rng.choice(Object.keys(REGION_PARTS)) as keyof typeof REGION_PARTS;
      const offerA = makeClub(region, targetTier, rng);
      const region2 = rng.choice(Object.keys(REGION_PARTS)) as keyof typeof REGION_PARTS;
      const offerBTier = clamp(targetTier + rng.choice([-1, 0, 1]), 1, 5) as 1 | 2 | 3 | 4 | 5;
      const offerB = makeClub(region2, offerBTier, rng);
      return {
        title: "Transfer window",
        text: `Interest is building. Do you stay loyal to ${p.club.name}, or explore a move?`,
        choices: [
          {
            label: `Stay at ${p.club.name}`,
            hint: "Build on what you have",
            apply: (pl) => ({ ...pl, seasonsAtClub: pl.seasonsAtClub + 1, loyaltyStreak: pl.loyaltyStreak + 1, note: `Committed to ${pl.club.name} for another season.` }),
          },
          {
            label: `Join ${offerA.name} (${TIER_LABEL[offerA.tier]})`,
            hint: "A fresh challenge",
            apply: (pl) => ({ ...pl, club: offerA, seasonsAtClub: 0, loyaltyStreak: 0, transfers: pl.transfers + 1, fitness: clamp(pl.fitness - 5, 0, 100), note: `Signed for ${offerA.name}.` }),
          },
          {
            label: `Join ${offerB.name} (${TIER_LABEL[offerB.tier]})`,
            hint: "A different project",
            apply: (pl) => ({ ...pl, club: offerB, seasonsAtClub: 0, loyaltyStreak: 0, transfers: pl.transfers + 1, fitness: clamp(pl.fitness - 5, 0, 100), note: `Signed for ${offerB.name}.` }),
          },
        ],
      };
    },
  },
  {
    id: "contract",
    weight: 2,
    isEligible: (p) => p.seasonsAtClub >= 2 && p.age < 32 && !p.retired,
    build: (p) => ({
      title: "Contract talks",
      text: `${p.club.name} want to know where your head is at.`,
      choices: [
        { label: "Sign a new deal", hint: "Loyalty over leverage", apply: (pl) => ({ ...pl, loyaltyStreak: pl.loyaltyStreak + 1, note: "Signed a contract extension." }) },
        { label: "Let it run down", hint: "Angle for a bigger move later", apply: (pl) => ({ ...pl, flags: { ...pl.flags, ambitious: true }, note: "Let contract talks stall, eyes on a bigger move." }) },
      ],
    }),
  },
  {
    id: "training",
    weight: 2,
    isEligible: (p) => p.age <= 25 && !p.retired,
    build: () => ({
      title: "Pre-season focus",
      text: "The coaching staff want your input on this pre-season's emphasis.",
      choices: [
        { label: "Physical conditioning", hint: "Fewer injuries, more minutes", apply: (pl) => ({ ...pl, flags: { ...pl.flags, physicalFocus: true }, note: "Focused on physical conditioning." }) },
        { label: "Technical development", hint: "Faster growth toward potential", apply: (pl) => ({ ...pl, flags: { ...pl.flags, technicalFocus: true }, note: "Focused on technical development." }) },
        { label: "Mental resilience", hint: "Better in the big moments", apply: (pl) => ({ ...pl, flags: { ...pl.flags, mentalFocus: true }, note: "Focused on mental resilience." }) },
      ],
    }),
  },
  {
    id: "injury",
    weight: 2,
    isEligible: (p) => p.rating >= 55 && !p.flags.restedRecently && !p.retired,
    build: () => ({
      title: "A knock before a big match",
      text: "You're carrying a knock. The medical staff say you could play through it.",
      choices: [
        { label: "Play through it", hint: "Risk vs. reward", apply: (pl) => ({ ...pl, flags: { ...pl.flags, playedHurt: true, restedRecently: false }, note: "Played through the pain." }) },
        { label: "Sit this one out", hint: "Protect your body", apply: (pl) => ({ ...pl, fitness: clamp(pl.fitness + 10, 0, 100), flags: { ...pl.flags, restedRecently: true }, note: "Rested and protected your body." }) },
      ],
    }),
  },
  {
    id: "captaincy",
    weight: 1,
    isEligible: (p) => p.age >= 24 && p.rating >= 74 && !p.isCaptain && !p.retired,
    build: (p) => ({
      title: "The armband",
      text: `The manager at ${p.club.name} is offering you the captaincy.`,
      choices: [
        { label: "Accept the armband", hint: "Lead the team, boost trophy chances", apply: (pl) => ({ ...pl, isCaptain: true, note: "Named club captain." }) },
        { label: "Stay out of the spotlight", hint: "Focus purely on your own game", apply: (pl) => ({ ...pl, flags: { ...pl.flags, soloFocus: true }, note: "Turned down the armband to focus on your own game." }) },
      ],
    }),
  },
  {
    id: "callup",
    weight: 2,
    isEligible: (p) => p.caps >= 3 && p.fitness < 70 && !p.retired,
    build: (p) => ({
      title: "International call-up",
      text: `${p.nationality.name} have called you up again, but your body is asking for a break.`,
      choices: [
        { label: "Answer the call", hint: "More caps, more fatigue", apply: (pl) => ({ ...pl, caps: pl.caps + 1, fitness: clamp(pl.fitness - 15, 0, 100), note: "Answered the international call-up." }) },
        { label: "Request rest", hint: "Recover, but reputation dips slightly", apply: (pl) => ({ ...pl, fitness: clamp(pl.fitness + 15, 0, 100), note: "Requested rest instead of international duty." }) },
      ],
    }),
  },
  {
    id: "retirement",
    weight: 6,
    isEligible: (p) => p.age >= 33 && !p.retired,
    build: (p, rng) => ({
      title: "The final chapters",
      text: `At ${p.age}, it's time to decide how the story ends.`,
      choices: [
        { label: "Retire now, on your terms", hint: "End the career here", apply: (pl) => ({ ...pl, retired: true, retiredReason: "chosen", note: "Retired from professional football." }) },
        {
          label: "Play one more season",
          hint: "Chase one last moment of glory",
          apply: (pl) => ({ ...pl, flags: { ...pl.flags, storybook: rng.next() < 0.35 }, note: "Decided to play one more season." }),
        },
      ],
    }),
  },
];

export const AUTO_EVENTS: AutoEventDef[] = [
  {
    id: "breakout",
    weight: 2,
    isEligible: (p) => p.age <= 21 && p.rating >= 60,
    apply: (p) => ({ ...p, rating: clamp(p.rating + 2, 40, 99), note: "A breakout run through the youth ranks turns heads across the league." }),
  },
  {
    id: "rival",
    weight: 2,
    isEligible: (p) => p.club.tier <= 3,
    apply: (p) => ({ ...p, flags: { ...p.flags, rivalPenalty: true }, note: "A talented academy graduate starts pushing hard for your place." }),
  },
  {
    id: "hotstreak",
    weight: 2,
    isEligible: () => true,
    apply: (p) => ({ ...p, rating: clamp(p.rating + 1, 40, 99), note: "A red-hot run of form has pundits talking." }),
  },
  {
    id: "slump",
    weight: 1,
    isEligible: () => true,
    apply: (p) => ({ ...p, flags: { ...p.flags, slump: true }, note: "A rough patch of form draws some criticism." }),
  },
  {
    id: "worldcup",
    weight: 2,
    isEligible: (p) => p.caps >= 1 && (p.year - p.careerStartYear) % 4 === 2,
    apply: (p, rng) => {
      const won = rng.next() < 0.1;
      const trophies = won ? [...p.trophies, { name: "Global Cup", year: p.year, tier: p.club.tier, level: "international" as const }] : p.trophies;
      return { ...p, trophies, note: won ? "Called up for the Global Cup — and lifted the trophy with the national team!" : "Called up to represent your country at the Global Cup." };
    },
  },
  {
    id: "goldenball",
    weight: 1,
    isEligible: (p, seasonGA) => p.rating >= 88 && seasonGA >= 22,
    apply: (p) => ({ ...p, awards: [...p.awards, { name: "Golden Ball nomination", year: p.year }], note: "Nominated for the Golden Ball as one of the world's best players." }),
  },
];
