// ==========================================
// Seeded PRNG Engine (Mulberry32 Implementation)
// Strictly deterministic across Node.js & Browser ESM
// ==========================================

export class PRNG {
  private state: number;
  private readonly initialSeed: string | number;

  constructor(seed: string | number = 'pitch-sim-default-seed') {
    this.initialSeed = seed;
    this.state = typeof seed === 'number' ? (seed >>> 0) : PRNG.hashString(seed);
    if (this.state === 0) {
      this.state = 0x6d2b79f5;
    }
  }

  /**
   * Deterministic 32-bit FNV-1a hash for string seeds
   */
  public static hashString(str: string): number {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  /**
   * Returns a pseudo-random float in [0, 1) using Mulberry32
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns integer in inclusive range [min, max]
   */
  public nextInt(min: number, max: number): number {
    if (min >= max) return min;
    const range = max - min + 1;
    return min + Math.floor(this.next() * range);
  }

  /**
   * Returns float in range [min, max)
   */
  public nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Returns true with given probability [0, 1]
   */
  public nextBool(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Picks a random item from an array
   */
  public pick<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    const idx = Math.floor(this.next() * array.length);
    return array[idx];
  }

  /**
   * Picks a weighted item from an array
   */
  public pickWeighted<T>(items: readonly T[], weights: readonly number[]): T {
    if (items.length === 0 || items.length !== weights.length) {
      throw new Error('Items and weights must be non-empty and equal length');
    }
    const totalWeight = weights.reduce((acc, w) => acc + Math.max(0, w), 0);
    if (totalWeight <= 0) return items[0];

    const r = this.next() * totalWeight;
    let accumulated = 0;
    for (let i = 0; i < items.length; i++) {
      accumulated += Math.max(0, weights[i]);
      if (r <= accumulated) {
        return items[i];
      }
    }
    return items[items.length - 1];
  }

  /**
   * Returns a deterministically shuffled copy of an array (Fisher-Yates)
   */
  public shuffle<T>(array: readonly T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  public getSeed(): string | number {
    return this.initialSeed;
  }

  /**
   * Creates a sub-PRNG deterministically derived from this one
   */
  public fork(suffix: string | number = ''): PRNG {
    const nextVal = this.nextInt(1, 0x7fffffff);
    return new PRNG(`${this.initialSeed}_${suffix}_${nextVal}`);
  }
}
