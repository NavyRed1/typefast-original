import type { AreaId, BossId, Difficulty, EnemyKind, TextStyle } from './types';

export interface BossPhase {
  /** Phase begins once enemy HP fraction is at or below this value. */
  at: number;
  name: string;
  style: TextStyle;
  chargeMult: number;
  dmgMult: number;
}

export interface EnemySpec {
  id: string;
  kind: EnemyKind | 'boss';
  name: string;
  title: string;
  sprite: string;
  variant: string | null;
  scale: number;
  maxHp: number;
  damage: number;
  chargeRate: number; // attack meter fill per second
  chargeDrain: number; // meter pushed back per correct character
  mistakeCharge: number; // meter added per mistake
  style: TextStyle;
  passageLimit: boolean;
  comboResetOnMiss: boolean;
  boss: boolean;
  mini: boolean;
  xp: number;
  phases: BossPhase[];
  special: { name: string; every: number } | null;
}

export const DIFF_DAMAGE: Record<Difficulty, number> = { easy: 0.7, medium: 1, hard: 1.25, expert: 1.5 };
export const DIFF_CHARGE: Record<Difficulty, number> = { easy: 0.8, medium: 1, hard: 1.2, expert: 1.4 };
/** Characters per second a fair player is expected to sustain; drives timed passages and spells. */
export const DIFF_CPS: Record<Difficulty, number> = { easy: 2.0, medium: 2.8, hard: 3.6, expert: 4.4 };

interface Base {
  name: string;
  hp: number;
  dmg: number;
  charge: number;
  drain: number;
  mistake: number;
  style: TextStyle;
  limit?: boolean;
  reset?: boolean;
  xp: number;
  blurb: string;
}

const BASE: Record<EnemyKind, Base> = {
  slime: { name: 'Slime', hp: 80, dmg: 8, charge: 0.1, drain: 0.02, mistake: 0.1, style: 'base', xp: 40, blurb: 'Wobbly and basic.' },
  goblin: { name: 'Goblin', hp: 100, dmg: 7, charge: 0.17, drain: 0.02, mistake: 0.1, style: 'short', xp: 55, blurb: 'Fast. Type quickly.' },
  skeleton: { name: 'Skeleton', hp: 130, dmg: 11, charge: 0.1, drain: 0.02, mistake: 0.25, style: 'accuracy', reset: true, xp: 70, blurb: 'Punishes every mistake.' },
  mage: { name: 'Mage', hp: 130, dmg: 12, charge: 0.11, drain: 0.02, mistake: 0.12, style: 'punct', xp: 75, blurb: 'Casts with punctuation.' },
  assassin: { name: 'Assassin', hp: 110, dmg: 17, charge: 0.05, drain: 0.02, mistake: 0.12, style: 'short', limit: true, xp: 80, blurb: 'Strikes if you are too slow.' },
  tank: { name: 'Tank', hp: 380, dmg: 20, charge: 0.07, drain: 0.02, mistake: 0.12, style: 'long', xp: 110, blurb: 'Huge HP, long text.' },
};

export const ENEMY_BLURB: Record<EnemyKind, string> = {
  slime: BASE.slime.blurb,
  goblin: BASE.goblin.blurb,
  skeleton: BASE.skeleton.blurb,
  mage: BASE.mage.blurb,
  assassin: BASE.assassin.blurb,
  tank: BASE.tank.blurb,
};

export interface SpawnCtx {
  difficulty: Difficulty;
  areaIndex: number;
}

export function createEnemy(kind: EnemyKind, ctx: SpawnCtx, opts: { mini?: boolean; name?: string; variant?: string | null; hpMult?: number } = {}): EnemySpec {
  const b = BASE[kind];
  const mini = !!opts.mini;
  const hpScale = (1 + ctx.areaIndex * 0.18) * (mini ? 2.2 : 1) * (opts.hpMult ?? 1);
  const dmgScale = (1 + ctx.areaIndex * 0.08) * (mini ? 1.3 : 1);
  return {
    id: `${kind}${mini ? '-mini' : ''}`,
    kind,
    name: opts.name ?? b.name,
    title: mini ? 'Mini-boss' : b.blurb,
    sprite: kind,
    variant: opts.variant ?? null,
    scale: mini ? 3 : 2,
    maxHp: Math.round(b.hp * hpScale),
    damage: Math.round(b.dmg * dmgScale),
    chargeRate: b.charge,
    chargeDrain: b.drain,
    mistakeCharge: b.mistake,
    style: b.style,
    passageLimit: !!b.limit,
    comboResetOnMiss: !!b.reset,
    boss: false,
    mini,
    xp: Math.round(b.xp * (mini ? 3 : 1) * (1 + ctx.areaIndex * 0.15)),
    phases: [],
    special: null,
  };
}

export const AREA_MINI: Record<AreaId, { kind: EnemyKind; name: string; variant: string }> = {
  village: { kind: 'slime', name: 'Giant Slime', variant: 'gold' },
  forest: { kind: 'goblin', name: 'Goblin Chief', variant: 'chief' },
  cave: { kind: 'tank', name: 'Gem Brute', variant: 'crystal' },
  volcano: { kind: 'skeleton', name: 'Cinder Bones', variant: 'fire' },
  cyber: { kind: 'assassin', name: 'Glitch Ninja', variant: 'neon' },
  castle: { kind: 'mage', name: 'Grave Warlock', variant: 'shadow' },
};

export const BOSS_ORDER: BossId[] = ['slimeKing', 'treant', 'golem', 'drake', 'mech', 'lich'];

export const AREA_BOSS: Record<AreaId, BossId> = {
  village: 'slimeKing',
  forest: 'treant',
  cave: 'golem',
  volcano: 'drake',
  cyber: 'mech',
  castle: 'lich',
};

interface BossBase {
  name: string;
  title: string;
  hp: number;
  dmg: number;
  charge: number;
  mistake: number;
  xp: number;
  phases: BossPhase[];
  special: { name: string; every: number };
}

const ph = (at: number, name: string, style: TextStyle, chargeMult: number, dmgMult: number): BossPhase => ({ at, name, style, chargeMult, dmgMult });

const BOSSES: Record<BossId, BossBase> = {
  slimeKing: {
    name: 'Slime King',
    title: 'The Gooey Tyrant',
    hp: 700,
    dmg: 14,
    charge: 0.1,
    mistake: 0.12,
    xp: 400,
    phases: [ph(1, 'Royal Wobble', 'base', 1, 1), ph(0.6, 'Goo Rage', 'accuracy', 1.25, 1.1), ph(0.25, 'Meltdown', 'mixed', 1.6, 1.25)],
    special: { name: 'Goo Burst', every: 24 },
  },
  treant: {
    name: 'Elder Treant',
    title: 'Warden of the Deep Wood',
    hp: 850,
    dmg: 15,
    charge: 0.1,
    mistake: 0.12,
    xp: 520,
    phases: [ph(1, 'Awakening', 'base', 1, 1), ph(0.6, 'Overgrowth', 'long', 0.9, 1.1), ph(0.25, 'Thornstorm', 'punct', 1.6, 1.25)],
    special: { name: 'Root Snare', every: 24 },
  },
  golem: {
    name: 'Crystal Golem',
    title: 'Heart of the Gem Caves',
    hp: 1000,
    dmg: 18,
    charge: 0.09,
    mistake: 0.14,
    xp: 650,
    phases: [ph(1, 'Stone Guard', 'base', 1, 1), ph(0.6, 'Resonance', 'numbers', 1.2, 1.1), ph(0.25, 'Shatter', 'accuracy', 1.6, 1.25)],
    special: { name: 'Shard Storm', every: 22 },
  },
  drake: {
    name: 'Ember Drake',
    title: 'Wyrm of the Molten Peak',
    hp: 1150,
    dmg: 18,
    charge: 0.11,
    mistake: 0.14,
    xp: 800,
    phases: [ph(1, 'Smolder', 'accuracy', 1, 1), ph(0.6, 'Blaze', 'punct', 1.25, 1.1), ph(0.25, 'Inferno', 'long', 1.5, 1.3)],
    special: { name: 'Inferno Breath', every: 20 },
  },
  mech: {
    name: 'Overclock Mech',
    title: 'Sentinel of Cyber City',
    hp: 1300,
    dmg: 19,
    charge: 0.11,
    mistake: 0.14,
    xp: 950,
    phases: [ph(1, 'Boot Sequence', 'numbers', 1, 1), ph(0.6, 'Overclock', 'symbols', 1.25, 1.15), ph(0.25, 'Meltdown', 'mixed', 1.6, 1.3)],
    special: { name: 'Firewall', every: 20 },
  },
  lich: {
    name: 'Lich King',
    title: 'Sovereign of the Shadow Castle',
    hp: 1600,
    dmg: 22,
    charge: 0.12,
    mistake: 0.16,
    xp: 1200,
    phases: [ph(1, 'Undying Court', 'accuracy', 1, 1), ph(0.6, 'Soul Harvest', 'mixed', 1.3, 1.15), ph(0.25, 'Final Curse', 'long', 1.6, 1.3)],
    special: { name: 'Soul Drain', every: 16 },
  },
};

export function createBoss(id: BossId, ctx: SpawnCtx, hpMult = 1): EnemySpec {
  const b = BOSSES[id];
  return {
    id,
    kind: 'boss',
    name: b.name,
    title: b.title,
    sprite: id,
    variant: null,
    scale: 3,
    maxHp: Math.round(b.hp * hpMult),
    damage: b.dmg,
    chargeRate: b.charge,
    chargeDrain: 0.02,
    mistakeCharge: b.mistake,
    style: 'base',
    passageLimit: false,
    comboResetOnMiss: false,
    boss: true,
    mini: false,
    xp: b.xp,
    phases: b.phases,
    special: b.special,
  };
}

export function bossName(id: BossId): string {
  return BOSSES[id].name;
}
