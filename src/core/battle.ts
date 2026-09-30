import { bus } from './events';
import { ComboSystem } from './combo';
import { DIFF_CHARGE, DIFF_CPS, DIFF_DAMAGE, type EnemySpec } from './enemies';
import { Rng } from './rng';
import { generatePassage } from './texts';
import { TypingEngine, type Segment } from './typing';
import type { AreaId, BattleKind, Difficulty } from './types';

export type BattleState = 'fighting' | 'victory' | 'defeat' | 'complete';

export interface BattleConfig {
  kind: BattleKind;
  label: string;
  difficulty: Difficulty;
  areaId: AreaId;
  seed: number;
  maxHp: number;
  startHp?: number;
  enemyAttacks: boolean;
  /** Every correct character deals exactly 1 damage (used by the daily challenge). */
  flatDamage?: boolean;
  timeLimit?: number;
  fixedPassages?: string[];
  healOnKill?: number;
  totalEnemies?: number;
  timeAttackSeconds?: number;
  dailyKey?: string;
  /** Return the enemy for a slot, or null when the run is over. */
  nextEnemy: (index: number, rng: Rng) => EnemySpec | null;
}

export interface EnemyState {
  spec: EnemySpec;
  hp: number;
  maxHp: number;
  charge: number;
  phase: number;
  stunned: number;
  casting: { name: string; timeLeft: number; total: number } | null;
  index: number;
}

export interface BattleResult {
  kind: BattleKind;
  label: string;
  outcome: 'victory' | 'defeat' | 'complete';
  difficulty: Difficulty;
  areaId: AreaId;
  score: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  keystrokes: number;
  maxCombo: number;
  duration: number;
  enemiesDefeated: number;
  bossesDefeated: number;
  damageTaken: number;
  xpEarned: number;
  killsByKind: Record<string, number>;
  wave: number;
  grade: string;
  hpLeft: number;
  maxHp: number;
  timeAttackSeconds?: number;
  dailyKey?: string;
  endedAt: number;
}

export interface BattleSnapshot {
  state: BattleState;
  paused: boolean;
  time: number;
  timeLeft: number | null;
  player: { hp: number; maxHp: number };
  enemy: {
    id: string;
    kind: string;
    sprite: string;
    variant: string | null;
    name: string;
    title: string;
    hp: number;
    maxHp: number;
    charge: number;
    boss: boolean;
    mini: boolean;
    phase: number;
    phaseName: string;
    phaseMarks: number[];
    stunned: boolean;
    casting: { name: string; timeLeft: number; total: number } | null;
    index: number;
  };
  text: {
    typed: Segment[];
    current: string;
    rest: string;
    mistake: string | null;
    progress: number;
    length: number;
    casting: boolean;
  };
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  combo: number;
  maxCombo: number;
  tier: number;
  powered: boolean;
  score: number;
  kills: number;
  totalEnemies: number | null;
  passageTime: { left: number; total: number } | null;
  version: number;
}

export function gradeFor(wpm: number, accuracy: number, outcome: string): string {
  if (outcome === 'defeat') return 'D';
  if (accuracy >= 0.98 && wpm >= 70) return 'S';
  if (accuracy >= 0.95 && wpm >= 50) return 'A';
  if (accuracy >= 0.9 && wpm >= 35) return 'B';
  return 'C';
}

/**
 * All combat rules live here, independent of React and Canvas. The renderer and
 * UI read state from this object and react to events emitted on the bus.
 */
export class BattleManager {
  state: BattleState = 'fighting';
  paused = false;
  readonly typing = new TypingEngine();
  readonly combo = new ComboSystem();
  readonly rng: Rng;
  player: { hp: number; maxHp: number };
  enemy!: EnemyState;
  enemyIndex = 0;
  time = 0;
  timeLeft: number | null;
  score = 0;
  kills = 0;
  bossesDefeated = 0;
  damageTaken = 0;
  damageDealt = 0;
  xpEarned = 0;
  killsByKind: Record<string, number> = {};
  passageIndex = 0;
  passageTime: { left: number; total: number } | null = null;
  passageEpoch = 0;
  version = 0;
  /** Set when a spawn happened this frame so the renderer can play an entrance. */
  private mistakeTimes: number[] = [];
  private specialTimer = Infinity;
  private started = false;

  constructor(readonly config: BattleConfig) {
    this.rng = new Rng(config.seed);
    this.player = { maxHp: config.maxHp, hp: Math.min(config.maxHp, config.startHp ?? config.maxHp) };
    this.timeLeft = config.timeLimit ?? null;
    this.spawn(0);
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    bus.emit('battleStart', { boss: this.enemy.spec.boss });
  }

  // ------------------------------------------------------------------ setup

  private spawn(index: number): boolean {
    const spec = this.config.nextEnemy(index, this.rng);
    if (!spec) return false;
    this.enemyIndex = index;
    this.enemy = { spec, hp: spec.maxHp, maxHp: spec.maxHp, charge: 0, phase: 0, stunned: 0, casting: null, index };
    this.specialTimer = spec.special ? spec.special.every : Infinity;
    this.newPassage();
    return true;
  }

  private currentStyle() {
    const e = this.enemy;
    if (e.casting) return 'spell' as const;
    if (e.spec.boss && e.spec.phases.length) return e.spec.phases[e.phase].style;
    return e.spec.style;
  }

  private newPassage(): void {
    this.passageEpoch++;
    const cfg = this.config;
    let text: string;
    if (cfg.fixedPassages) text = cfg.fixedPassages[this.passageIndex] ?? '';
    else text = generatePassage(this.currentStyle(), cfg.difficulty, this.rng, this.typing.text);
    this.typing.setText(text);
    const e = this.enemy;
    if (!e.casting && e.spec.passageLimit && !cfg.fixedPassages && cfg.enemyAttacks) {
      const total = Math.max(4, text.length / DIFF_CPS[cfg.difficulty] + 1.5);
      this.passageTime = { left: total, total };
    } else {
      this.passageTime = null;
    }
  }

  // ----------------------------------------------------------------- update

  update(dt: number): void {
    if (this.paused || this.state !== 'fighting') return;
    this.time += dt;
    this.typing.tick(dt);
    const e = this.enemy;
    const cfg = this.config;

    if (this.timeLeft !== null) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.finish('complete');
        return;
      }
    }
    if (e.stunned > 0) e.stunned = Math.max(0, e.stunned - dt);

    if (cfg.enemyAttacks) {
      if (!e.casting && e.stunned <= 0) {
        const phase = e.spec.phases[e.phase];
        e.charge += e.spec.chargeRate * DIFF_CHARGE[cfg.difficulty] * (phase ? phase.chargeMult : 1) * dt;
        if (e.charge >= 1) this.enemyAttack(1);
      }
      if (this.state !== 'fighting') return;
      if (this.passageTime) {
        this.passageTime.left -= dt;
        if (this.passageTime.left <= 0) {
          this.enemyAttack(1.2);
          if (this.state !== 'fighting') return;
          this.newPassage();
        }
      }
      if (e.casting) {
        e.casting.timeLeft -= dt;
        if (e.casting.timeLeft <= 0) this.resolveCast(false);
      } else if (e.spec.special && e.stunned <= 0) {
        this.specialTimer -= dt;
        if (this.specialTimer <= 0) this.startCast();
      }
    }
    this.version++;
  }

  // ------------------------------------------------------------------ input

  handleChar(ch: string): void {
    if (this.paused || this.state !== 'fighting') return;
    const res = this.typing.input(ch);
    if (res.kind === 'ignored') return;
    this.version++;
    if (res.kind === 'wrong') {
      this.onWrong(res.repeat);
      return;
    }
    this.onCorrect(res);
  }

  backspace(): void {
    this.typing.clearMistake();
    this.version++;
  }

  private onWrong(_repeat: boolean): void {
    const e = this.enemy;
    const cfg = this.config;
    const { before, after } = this.combo.miss(cfg.difficulty, e.spec.comboResetOnMiss);
    bus.emit('keyIncorrect', { combo: after });
    if (!cfg.enemyAttacks) return;
    e.charge += e.spec.mistakeCharge;
    if (before >= 20) e.charge += 0.1 + 0.1 * ((before - after) / before);
    this.mistakeTimes.push(this.time);
    this.mistakeTimes = this.mistakeTimes.filter((t) => this.time - t <= 4);
    if (this.mistakeTimes.length >= 3) {
      this.mistakeTimes = [];
      this.enemyAttack(1);
    } else if (e.charge >= 1) {
      this.enemyAttack(1);
    }
  }

  private charDamage(): number {
    const cps = this.typing.cps();
    const speed = 0.9 + Math.min(cps, 10) * 0.04;
    const acc = this.typing.accuracy();
    const accM = 0.7 + 0.3 * acc * acc;
    let d = this.combo.damageMult() * speed * accM;
    if (this.enemy.stunned > 0) d *= 1.5;
    return d;
  }

  private onCorrect(res: Extract<ReturnType<TypingEngine['input']>, { kind: 'correct' }>): void {
    const cfg = this.config;
    const epoch = this.passageEpoch;
    const milestone = this.combo.hit();
    this.score += Math.round(10 * this.combo.scoreMult());
    bus.emit('keyCorrect', { combo: this.combo.value });
    if (this.enemy.charge > 0) this.enemy.charge = Math.max(0, this.enemy.charge - this.enemy.spec.chargeDrain);

    this.dealDamage(cfg.flatDamage ? 1 : this.charDamage(), {});
    if (this.state !== 'fighting') return;

    if (milestone) {
      bus.emit('comboMilestone', { combo: milestone, tier: this.combo.tier() });
      if (milestone === 250) this.bonusStrike(Math.max(30, this.enemy.maxHp * 0.06), 250);
      else if (milestone === 500) this.bonusStrike(Math.max(60, this.enemy.maxHp * 0.15), 1000);
      if (this.state !== 'fighting') return;
    }

    if (res.wordComplete) {
      const crit = res.perfectWord && this.combo.value >= 25 && res.wordLength >= 3;
      bus.emit('wordComplete', { perfect: res.perfectWord, length: res.wordLength });
      if (res.wordLength > 0) {
        this.score += res.wordLength * 2;
        if (!cfg.flatDamage) {
          let strike = res.wordLength * 0.8 * this.combo.damageMult();
          if (crit) strike *= 2.5;
          if (crit) {
            this.score += 100;
            bus.emit('criticalHit', { damage: Math.round(strike) });
          }
          this.dealDamage(strike, { crit });
        } else if (crit) {
          bus.emit('criticalHit', { damage: 0 });
        }
      }
      if (this.state !== 'fighting') return;
    }

    if (res.passageComplete && epoch === this.passageEpoch) {
      this.passageIndex++;
      if (this.enemy.casting) this.resolveCast(true);
      else if (cfg.fixedPassages && this.passageIndex >= cfg.fixedPassages.length) this.finish('complete');
      else this.newPassage();
    }
  }

  private bonusStrike(amount: number, score: number): void {
    this.score += score;
    if (this.config.flatDamage) return;
    this.dealDamage(amount, { special: true });
  }

  // ----------------------------------------------------------------- combat

  private dealDamage(amount: number, o: { crit?: boolean; special?: boolean }): void {
    if (this.state !== 'fighting' || amount <= 0) return;
    const e = this.enemy;
    e.hp = Math.max(0, e.hp - amount);
    this.damageDealt += amount;
    bus.emit('enemyDamage', { amount, crit: !!o.crit, special: !!o.special });
    if (e.hp <= 0.0001) {
      e.hp = 0;
      this.onEnemyDefeated();
    } else {
      this.checkPhase();
    }
  }

  private checkPhase(): void {
    const e = this.enemy;
    const phases = e.spec.phases;
    if (!phases.length) return;
    const frac = e.hp / e.maxHp;
    let idx = e.phase;
    while (idx + 1 < phases.length && frac <= phases[idx + 1].at) idx++;
    if (idx !== e.phase) {
      e.phase = idx;
      e.charge = 0;
      e.casting = null;
      this.specialTimer = e.spec.special ? e.spec.special.every : Infinity;
      bus.emit('phaseChange', { phase: idx + 1, name: phases[idx].name });
      this.newPassage();
    }
  }

  private onEnemyDefeated(): void {
    const e = this.enemy;
    const spec = e.spec;
    this.kills++;
    this.killsByKind[spec.kind] = (this.killsByKind[spec.kind] ?? 0) + 1;
    if (spec.boss) this.bossesDefeated++;
    this.score += spec.boss ? 1000 : spec.mini ? 400 : 200;
    this.xpEarned += spec.xp;
    e.casting = null;
    bus.emit('enemyDefeated', { boss: spec.boss });
    if (this.config.healOnKill) this.heal(this.config.healOnKill);
    if (!this.spawn(this.enemyIndex + 1)) this.finish('victory');
  }

  private enemyAttack(mult: number): void {
    if (!this.config.enemyAttacks || this.state !== 'fighting') return;
    const e = this.enemy;
    const phase = e.spec.phases[e.phase];
    const dmg = Math.max(1, Math.round(e.spec.damage * DIFF_DAMAGE[this.config.difficulty] * (phase ? phase.dmgMult : 1) * mult));
    this.player.hp = Math.max(0, this.player.hp - dmg);
    this.damageTaken += dmg;
    e.charge = 0;
    bus.emit('enemyAttack', { strong: mult > 1.2 });
    bus.emit('playerDamage', { amount: dmg });
    if (this.player.hp <= 0) this.finish('defeat');
  }

  heal(n: number): void {
    const before = this.player.hp;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + n);
    const gained = Math.round(this.player.hp - before);
    if (gained > 0) bus.emit('playerHeal', { amount: gained });
  }

  private startCast(): void {
    const e = this.enemy;
    if (!e.spec.special) return;
    const cfg = this.config;
    e.casting = { name: e.spec.special.name, timeLeft: 0, total: 0 };
    this.newPassage(); // spell text
    const total = this.typing.text.length / (DIFF_CPS[cfg.difficulty] * 0.9) + 2.5;
    e.casting.timeLeft = total;
    e.casting.total = total;
    bus.emit('specialCast', { name: e.spec.special.name });
  }

  private resolveCast(success: boolean): void {
    const e = this.enemy;
    if (!e.casting) return;
    e.casting = null;
    if (e.spec.special) this.specialTimer = e.spec.special.every;
    bus.emit('specialResolved', { success });
    if (success) {
      e.stunned = 3;
      this.score += 300;
      if (!this.config.flatDamage) this.dealDamage(e.maxHp * 0.05, { special: true });
    } else {
      this.enemyAttack(1.8);
    }
    if (this.state === 'fighting') this.newPassage();
  }

  // ----------------------------------------------------------------- finish

  pause(v: boolean): void {
    this.paused = v;
    this.version++;
  }

  private finish(outcome: 'victory' | 'defeat' | 'complete'): void {
    if (this.state !== 'fighting') return;
    this.state = outcome;
    if (outcome !== 'defeat') this.score += Math.round(this.typing.accuracy() * 1000);
    this.version++;
    if (outcome === 'defeat') bus.emit('defeat', {});
    else bus.emit('victory', {});
  }

  result(): BattleResult {
    const t = this.typing;
    const outcome = this.state === 'fighting' ? 'defeat' : this.state;
    const wpm = t.wpm();
    const acc = t.accuracy();
    return {
      kind: this.config.kind,
      label: this.config.label,
      outcome,
      difficulty: this.config.difficulty,
      areaId: this.config.areaId,
      score: Math.round(this.score),
      wpm: Math.round(wpm * 10) / 10,
      rawWpm: Math.round(t.rawWpm() * 10) / 10,
      accuracy: acc,
      errors: t.errors,
      correctChars: t.correct,
      keystrokes: t.keystrokes,
      maxCombo: this.combo.max,
      duration: this.time,
      enemiesDefeated: this.kills,
      bossesDefeated: this.bossesDefeated,
      damageTaken: this.damageTaken,
      xpEarned: this.xpEarned,
      killsByKind: { ...this.killsByKind },
      wave: this.enemyIndex + 1,
      grade: gradeFor(wpm, acc, outcome),
      hpLeft: this.player.hp,
      maxHp: this.player.maxHp,
      timeAttackSeconds: this.config.timeAttackSeconds,
      dailyKey: this.config.dailyKey,
      endedAt: Date.now(),
    };
  }

  snapshot(): BattleSnapshot {
    const t = this.typing;
    const e = this.enemy;
    const cur = t.text[t.index] ?? '';
    const phase = e.spec.phases[e.phase];
    return {
      state: this.state,
      paused: this.paused,
      time: this.time,
      timeLeft: this.timeLeft,
      player: { hp: this.player.hp, maxHp: this.player.maxHp },
      enemy: {
        id: e.spec.id,
        kind: e.spec.kind,
        sprite: e.spec.sprite,
        variant: e.spec.variant,
        name: e.spec.name,
        title: e.spec.title,
        hp: e.hp,
        maxHp: e.maxHp,
        charge: this.config.enemyAttacks ? Math.min(1, e.charge) : 0,
        boss: e.spec.boss,
        mini: e.spec.mini,
        phase: e.phase,
        phaseName: phase ? phase.name : '',
        phaseMarks: e.spec.phases.slice(1).map((p) => p.at),
        stunned: e.stunned > 0,
        casting: e.casting ? { ...e.casting } : null,
        index: e.index,
      },
      text: {
        typed: t.segments(),
        current: cur,
        rest: t.text.slice(t.index + 1),
        mistake: t.mistake ? t.mistake.typed : null,
        progress: t.progress(),
        length: t.text.length,
        casting: !!e.casting,
      },
      wpm: t.wpm(),
      rawWpm: t.rawWpm(),
      accuracy: t.accuracy(),
      errors: t.errors,
      combo: this.combo.value,
      maxCombo: this.combo.max,
      tier: this.combo.tier(),
      powered: this.combo.powered(),
      score: Math.round(this.score),
      kills: this.kills,
      totalEnemies: this.config.totalEnemies ?? null,
      passageTime: this.passageTime ? { ...this.passageTime } : null,
      version: this.version,
    };
  }
}
