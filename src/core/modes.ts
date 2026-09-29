import type { BattleConfig } from './battle';
import { createEnemy, createBoss, AREA_MINI, AREA_BOSS, type SpawnCtx } from './enemies';
import type { AreaId, Difficulty, EnemyKind } from './types';
import { AREA_IDS } from './types';
import { Rng, dayKey, hashString } from './rng';
import { generatePassage } from './texts';

const AREA_POOL: Record<AreaId, EnemyKind[]> = {
  village: ['slime', 'goblin'],
  forest: ['goblin', 'skeleton'],
  cave: ['skeleton', 'tank'],
  volcano: ['tank', 'mage'],
  cyber: ['mage', 'assassin'],
  castle: ['assassin', 'skeleton'],
};

const ALL_KINDS: EnemyKind[] = ['slime', 'goblin', 'skeleton', 'mage', 'assassin', 'tank'];

export function storyBattleConfig(area: AreaId, difficulty: Difficulty, seed: number): BattleConfig {
  const areaIndex = AREA_IDS.indexOf(area);
  const pool = AREA_POOL[area];
  const mini = AREA_MINI[area];
  const boss = AREA_BOSS[area];
  return {
    kind: 'story',
    label: `Story — ${area}`,
    difficulty,
    areaId: area,
    seed,
    maxHp: 100,
    enemyAttacks: true,
    healOnKill: 6,
    totalEnemies: 4,
    nextEnemy: (index, rng) => {
      const ctx: SpawnCtx = { difficulty, areaIndex };
      if (index === 0 || index === 1) return createEnemy(rng.pick(pool), ctx);
      if (index === 2) return createEnemy(mini.kind, ctx, { mini: true, name: mini.name, variant: mini.variant });
      if (index === 3) return createBoss(boss, ctx);
      return null;
    },
  };
}

export function timeAttackConfig(difficulty: Difficulty, seconds: number, seed: number): BattleConfig {
  return {
    kind: 'timeattack',
    label: `Time Attack ${seconds}s`,
    difficulty,
    areaId: 'village',
    seed,
    maxHp: 999999,
    enemyAttacks: false,
    timeLimit: seconds,
    timeAttackSeconds: seconds,
    healOnKill: 0,
    nextEnemy: (index, rng) => createEnemy(rng.pick(ALL_KINDS), { difficulty, areaIndex: Math.min(5, Math.floor(index / 3)) }),
  };
}

export function survivalConfig(difficulty: Difficulty, seed: number): BattleConfig {
  return {
    kind: 'survival',
    label: 'Survival',
    difficulty,
    areaId: 'village',
    seed,
    maxHp: 100,
    enemyAttacks: true,
    healOnKill: 4,
    nextEnemy: (index, rng) => {
      const areaIndex = Math.min(5, Math.floor(index / 3));
      if (index > 0 && index % 5 === 4) {
        const bossId = AREA_BOSS[AREA_IDS[Math.min(5, Math.floor(index / 5))]];
        return createBoss(bossId, { difficulty, areaIndex }, 0.6 + index * 0.05);
      }
      return createEnemy(rng.pick(ALL_KINDS), { difficulty, areaIndex }, { hpMult: 1 + index * 0.08 });
    },
  };
}

export function bossRushConfig(difficulty: Difficulty, seed: number): BattleConfig {
  return {
    kind: 'bossrush',
    label: 'Boss Rush',
    difficulty,
    areaId: 'village',
    seed,
    maxHp: 120,
    enemyAttacks: true,
    healOnKill: 20,
    totalEnemies: AREA_IDS.length,
    nextEnemy: (index) => {
      const area = AREA_IDS[index];
      if (!area) return null;
      return createBoss(AREA_BOSS[area], { difficulty, areaIndex: index }, 0.75);
    },
  };
}

/** Deterministic per-day passages so every player sees the same Daily Challenge. */
export function dailyBattleConfig(difficulty: Difficulty, date: Date = new Date()): { key: string; config: BattleConfig } {
  const key = dayKey(date);
  const seed = hashString(key);
  const passageRng = new Rng(seed);
  const passages = [
    generatePassage('base', difficulty, passageRng),
    generatePassage('short', difficulty, passageRng),
    generatePassage('punct', difficulty, passageRng),
  ];
  return {
    key,
    config: {
      kind: 'daily',
      label: `Daily Challenge — ${key}`,
      difficulty,
      areaId: 'village',
      seed,
      maxHp: 100,
      enemyAttacks: true,
      healOnKill: 0,
      flatDamage: true,
      dailyKey: key,
      fixedPassages: passages,
      totalEnemies: passages.length,
      nextEnemy: (index) => (index < passages.length ? createEnemy(ALL_KINDS[(seed + index) % ALL_KINDS.length], { difficulty, areaIndex: 1 }) : null),
    },
  };
}
