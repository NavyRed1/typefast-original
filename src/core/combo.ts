import type { Difficulty } from './types';

export const MILESTONES = [10, 25, 50, 100, 250, 500] as const;

/** Combo state plus every multiplier derived from it. */
export class ComboSystem {
  value = 0;
  max = 0;

  /** Returns the milestone reached by this hit, if any. */
  hit(): number | null {
    this.value++;
    if (this.value > this.max) this.max = this.value;
    return (MILESTONES as readonly number[]).includes(this.value) ? this.value : null;
  }

  /**
   * Easy loses a quarter of the combo, medium half, hard/expert (and enemies
   * that demand accuracy) reset it entirely.
   */
  miss(difficulty: Difficulty, forceReset = false): { before: number; after: number } {
    const before = this.value;
    let keep = 0;
    if (!forceReset) {
      if (difficulty === 'easy') keep = 0.75;
      else if (difficulty === 'medium') keep = 0.5;
    }
    this.value = Math.floor(before * keep);
    return { before, after: this.value };
  }

  reset(): void {
    this.value = 0;
  }

  /** 0..6: how many milestones are currently reached. */
  tier(): number {
    let t = 0;
    for (const m of MILESTONES) if (this.value >= m) t++;
    return t;
  }

  powered(): boolean {
    return this.value >= 100;
  }

  damageMult(): number {
    return 1 + Math.min(this.value, 500) / 250;
  }

  /** Walking speed bonus used in exploration. */
  speedMult(): number {
    return 1 + Math.min(this.value, 200) / 100;
  }

  scoreMult(): number {
    return 1 + Math.min(this.value, 200) / 50;
  }
}
