export type PositionId = "GK" | "CB" | "FB" | "DM" | "CM" | "AM" | "W" | "ST";
export type PositionRow = "GK" | "DEF" | "MID" | "ATT";
export type Region = "europe" | "latam" | "africa" | "asia" | "northam";
export type Foot = "Left" | "Right";
export type TrophyLevel = "league" | "cup" | "continental" | "international";

export interface PositionDef {
  id: PositionId;
  label: string;
  row: PositionRow;
}

export interface PositionProfile {
  goal: number;
  assist: number;
  clean: number; // clean-sheet weight, only meaningful for defenders/GK
  goalWeight: number; // career-score weight per goal
  assistWeight: number; // career-score weight per assist
}

export interface Country {
  name: string;
  flag: string;
  tier: 1 | 2 | 3 | 4 | 5;
  region: Region;
}

export interface Club {
  name: string;
  tier: 1 | 2 | 3 | 4 | 5;
  ambition: number; // 12-99
  region: Region;
}

export interface Trophy {
  name: string;
  year: number;
  tier: number;
  level: TrophyLevel;
}

export interface Award {
  name: string;
  year: number;
}

export interface PlayerFlags {
  [key: string]: boolean | undefined;
}

export interface PlayerState {
  name: string;
  nationality: Country;
  foot: Foot;
  number: number;
  position: PositionId;

  age: number;
  year: number;
  careerStartYear: number;
  rating: number;
  potential: number;
  fitness: number;

  apps: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  caps: number;

  trophies: Trophy[];
  awards: Award[];

  marketValue: number;
  club: Club;
  seasonsAtClub: number;
  loyaltyStreak: number;
  loyaltyStreakMax: number;
  transfers: number;
  isCaptain: boolean;

  retired: boolean;
  retiredReason: "chosen" | "age" | null;

  peakRating: number;
  peakYear: number;
  peakWorldRank: number | null;
  bestMilestone: number;

  seasons: SeasonRecord[];
  flags: PlayerFlags;
}

export interface SeasonRecord {
  year: number;
  age: number;
  club: string;
  tier: number;
  apps: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  rating: number;
  prevRating: number;
  trophies: Trophy[];
  capGained: boolean;
  worldRank: number | null;
  milestoneText: string | null;
  lines: string[];
}

export interface DecisionOnlyRecord {
  decisionOnly: true;
  note: string;
  year: number;
  age: number;
}

export type CareerRecord = SeasonRecord | DecisionOnlyRecord;

export interface DecisionChoice {
  label: string;
  hint: string;
  apply: (p: PlayerState) => PlayerState & { note: string };
}

export interface DecisionEventInstance {
  id: string;
  title: string;
  text: string;
  choices: DecisionChoice[];
}

export interface DecisionEventDef {
  id: string;
  weight: number;
  isEligible: (p: PlayerState) => boolean;
  build: (p: PlayerState, rng: import("./rng").RNG) => Omit<DecisionEventInstance, "id">;
}

export interface AutoEventDef {
  id: string;
  weight: number;
  isEligible: (p: PlayerState, seasonGA: number) => boolean;
  apply: (p: PlayerState, rng: import("./rng").RNG) => PlayerState & { note: string };
}

export type BatchResult =
  | { status: "awaiting"; player: PlayerState; records: CareerRecord[]; pendingDecision: DecisionEventInstance; seasonsLeft: number }
  | { status: "done"; player: PlayerState; records: CareerRecord[] };

export interface DraftResult {
  base: number;
  potential: number;
  potentialLabel: string;
}

export interface CreateForm {
  name: string;
  nationality: Country;
  foot: Foot;
  number: number;
  position: PositionId;
  club: Club;
}
