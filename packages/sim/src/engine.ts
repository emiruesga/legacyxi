import { AUTO_EVENTS, DECISION_EVENTS } from "./events.js";
import {
  ageGrowth,
  clamp,
  computeApps,
  computeGoalsAssists,
  computeMarketValue,
  computeWorldRank,
  milestoneLabel,
  nextMilestoneTier,
  rollCaps,
  rollIndividualAwards,
  rollTrophies,
} from "./formulas.js";
import type { RNG } from "./rng.js";
import type {
  BatchResult,
  CareerRecord,
  CreateForm,
  DecisionEventInstance,
  DraftResult,
  PlayerState,
  SeasonRecord,
} from "./types.js";

export function newPlayer(form: CreateForm, draft: DraftResult, startYear: number): PlayerState {
  return {
    name: form.name || "Player",
    nationality: form.nationality,
    foot: form.foot,
    number: form.number,
    position: form.position,
    age: 16,
    year: startYear,
    careerStartYear: startYear,
    rating: draft.base,
    potential: draft.potential,
    fitness: 100,
    apps: 0,
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    caps: 0,
    trophies: [],
    awards: [],
    marketValue: 0,
    club: form.club,
    seasonsAtClub: 0,
    loyaltyStreak: 0,
    loyaltyStreakMax: 0,
    transfers: 0,
    isCaptain: false,
    retired: false,
    retiredReason: null,
    peakRating: draft.base,
    peakYear: startYear,
    peakWorldRank: null,
    bestMilestone: Infinity,
    seasons: [],
    flags: {},
  };
}

/** Simulate one season: aging, appearances, goals/assists, trophies, caps, one
 * auto-flavor event, then age the player up by a year. Pure function of (player, rng). */
export function simulateSeason(playerIn: PlayerState, rng: RNG): { player: PlayerState; record: SeasonRecord } {
  let p: PlayerState = { ...playerIn, flags: { ...playerIn.flags } };
  const lines: string[] = [];

  // aging + rating
  let delta = ageGrowth(p, rng);
  if (p.flags.technicalFocus) delta += 1.4;
  if (p.flags.playedHurt) delta += 1;
  const prevRating = p.rating;
  p.rating = clamp(Math.round(p.rating + delta), 40, 99);

  // fitness regen / injury consequence
  if (p.flags.physicalFocus) p.fitness = clamp(p.fitness + 14, 0, 100);
  else p.fitness = clamp(p.fitness + 8, 0, 100);
  if (p.flags.playedHurt && rng.next() < 0.3) {
    p.fitness = clamp(p.fitness - 25, 0, 100);
    lines.push("The gamble on your fitness catches up with you — a spell on the sidelines follows.");
  }

  // apps / goals / assists / clean sheets
  const apps = computeApps(p, rng);
  const { goals, assists, cleanSheets } = computeGoalsAssists(p, apps, rng);

  // trophies
  const trophiesWon = rollTrophies(p, rng);

  // individual season awards (Golden Boot, Player of the Season, Ballon d'Or)
  const awardsWon = rollIndividualAwards(p, apps, goals, assists, rng);
  for (const a of awardsWon) lines.push(`Won the ${a.name}.`);

  // caps
  const capResult = rollCaps(p, rng);
  if (capResult.gained) {
    p.caps += 1;
    if (capResult.first) lines.push(`Full international debut for ${p.nationality.name}!`);
  }

  // auto flavor event (at most one, weighted, eligible)
  let worldCupCallUp = false;
  const eligibleAuto = AUTO_EVENTS.filter((e) => e.isEligible(p, goals + assists));
  if (eligibleAuto.length && rng.next() < 0.42) {
    const evt = rng.weighted(eligibleAuto);
    worldCupCallUp = evt.id === "worldCup";
    const result = evt.apply(p, rng);
    const { note, ...rest } = result;
    p = { ...rest, flags: { ...rest.flags } };
    lines.push(note);
  }
  // clear one-shot flags
  p.flags = { ...p.flags, rivalPenalty: false, slump: false, playedHurt: false, physicalFocus: false, technicalFocus: false, mentalFocus: false };

  // loyalty tracking
  p.loyaltyStreakMax = Math.max(p.loyaltyStreakMax, p.loyaltyStreak);
  p.seasonsAtClub += 1;

  // finalize totals
  p.apps += apps;
  p.goals += goals;
  p.assists += assists;
  p.cleanSheets += cleanSheets;
  p.trophies = [...p.trophies, ...trophiesWon];
  p.awards = [...p.awards, ...awardsWon];
  p.marketValue = computeMarketValue(p);

  // peak + world rank + milestone
  let milestoneText: string | null = null;
  const worldRank = computeWorldRank(p.rating, p.position, rng);
  if (p.rating >= p.peakRating) {
    p.peakRating = p.rating;
    p.peakYear = p.year;
  }
  if (worldRank != null && (p.peakWorldRank == null || worldRank < p.peakWorldRank)) {
    p.peakWorldRank = worldRank;
  }
  if (worldRank != null) {
    const tier = nextMilestoneTier(worldRank, p.bestMilestone);
    if (tier != null) {
      p.bestMilestone = tier;
      milestoneText = milestoneLabel(worldRank);
    }
  }

  // age up
  p.age += 1;
  p.year += 1;
  if (p.age >= 41) {
    p.retired = true;
    p.retiredReason = p.retiredReason ?? "age";
  }

  const record: SeasonRecord = {
    year: p.year - 1,
    age: p.age - 1,
    club: p.club.name,
    tier: p.club.tier,
    apps,
    goals,
    assists,
    cleanSheets,
    rating: p.rating,
    prevRating,
    trophies: trophiesWon,
    awardsWon,
    capGained: capResult.gained,
    capDebut: capResult.first,
    worldCupCallUp,
    worldRank,
    milestoneText,
    lines,
  };
  p.seasons = [...p.seasons, record];
  return { player: p, record };
}

export function getDecisionEvent(p: PlayerState, rng: RNG): DecisionEventInstance | null {
  const eligible = DECISION_EVENTS.filter((e) => e.isEligible(p));
  if (!eligible.length) return null;
  const fireChance = 0.5;
  if (rng.next() > fireChance) {
    // retirement is important enough to always surface once eligible & nothing else fired
    const retireOnly = eligible.find((e) => e.id === "retirement");
    if (retireOnly && p.age >= 36) {
      return { id: retireOnly.id, ...retireOnly.build(p, rng) };
    }
    return null;
  }
  const def = rng.weighted(eligible);
  return { id: def.id, ...def.build(p, rng) };
}

export function continueBatch(player: PlayerState, seasonsLeft: number, recordsSoFar: CareerRecord[], rng: RNG): BatchResult {
  let p = player;
  const records = [...recordsSoFar];
  let left = seasonsLeft;
  while (left > 0) {
    if (p.retired) break;
    const evt = getDecisionEvent(p, rng);
    if (evt) {
      return { status: "awaiting", player: p, records, pendingDecision: evt, seasonsLeft: left };
    }
    const { player: np, record } = simulateSeason(p, rng);
    p = np;
    records.push(record);
    left -= 1;
    if (p.retired) break;
  }
  return { status: "done", player: p, records };
}

export function resolveDecision(
  evt: DecisionEventInstance,
  choiceIdx: number,
  player: PlayerState,
  seasonsLeft: number,
  records: CareerRecord[],
  rng: RNG,
): BatchResult {
  const choiceObj = evt.choices[choiceIdx];
  const applied = choiceObj.apply(player);
  const { note: decisionNote, ...clean } = applied;
  if (clean.retired) {
    return {
      status: "done",
      player: clean,
      records: [...records, { decisionOnly: true, note: decisionNote, year: clean.year, age: clean.age }],
    };
  }
  const { player: np, record } = simulateSeason(clean, rng);
  record.lines = [decisionNote, ...record.lines];
  const newRecords = [...records, record];
  const left = seasonsLeft - 1;
  if (left <= 0 || np.retired) return { status: "done", player: np, records: newRecords };
  return continueBatch(np, left, newRecords, rng);
}
