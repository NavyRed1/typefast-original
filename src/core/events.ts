/**
 * Typed event bus. Gameplay code only emits events; sound, particles and UI
 * feedback subscribe. That keeps game logic free of presentation concerns and
 * makes adding audio (or analytics / netcode) a matter of adding a subscriber.
 */
export interface GameEvents {
  keyCorrect: { combo: number };
  keyIncorrect: { combo: number };
  comboMilestone: { combo: number; tier: number };
  criticalHit: { damage: number };
  playerDamage: { amount: number };
  playerHeal: { amount: number };
  enemyDamage: { amount: number; crit: boolean; special: boolean };
  enemyDefeated: { boss: boolean };
  enemyAttack: { strong: boolean };
  wordComplete: { perfect: boolean; length: number };
  phaseChange: { phase: number; name: string };
  specialCast: { name: string };
  specialResolved: { success: boolean };
  battleStart: { boss: boolean };
  levelUp: { level: number };
  victory: { versus?: boolean };
  defeat: Record<string, never>;
  buttonClick: Record<string, never>;
  countdown: { n: number };
}

type Handler<T> = (payload: T) => void;

export class EventBus {
  private map = new Map<keyof GameEvents, Set<Handler<any>>>();

  on<K extends keyof GameEvents>(name: K, fn: Handler<GameEvents[K]>): () => void {
    let set = this.map.get(name);
    if (!set) {
      set = new Set();
      this.map.set(name, set);
    }
    set.add(fn);
    return () => {
      set!.delete(fn);
    };
  }

  emit<K extends keyof GameEvents>(name: K, payload: GameEvents[K]): void {
    const set = this.map.get(name);
    if (!set) return;
    for (const fn of Array.from(set)) fn(payload);
  }

  listenerCount(): number {
    let n = 0;
    this.map.forEach((s) => (n += s.size));
    return n;
  }
}

export const bus = new EventBus();
