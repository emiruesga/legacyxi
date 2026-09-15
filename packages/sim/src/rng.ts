/** Deterministic RNG so simulation runs (and tests) are reproducible from a seed. */
export interface RNG {
  next(): number; // [0, 1)
  range(min: number, max: number): number;
  int(min: number, max: number): number; // inclusive both ends
  choice<T>(arr: readonly T[]): T;
  weighted<T extends { weight: number }>(items: readonly T[]): T;
}

// Mulberry32 — small, fast, good enough statistical quality for a game sim.
export function createRng(seed: number): RNG {
  let a = seed >>> 0;
  const next = (): number => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const range = (min: number, max: number) => min + next() * (max - min);
  const int = (min: number, max: number) => Math.floor(range(min, max + 1));
  const choice = <T>(arr: readonly T[]): T => arr[int(0, arr.length - 1)];
  const weighted = <T extends { weight: number }>(items: readonly T[]): T => {
    const total = items.reduce((s, i) => s + i.weight, 0);
    let r = next() * total;
    for (const it of items) {
      r -= it.weight;
      if (r <= 0) return it;
    }
    return items[items.length - 1];
  };
  return { next, range, int, choice, weighted };
}

export function randomSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0;
}
