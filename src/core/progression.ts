import type { SaveData } from '../data/save';
import type { BattleResult } from './battle';
import { dayDiff, dayKey } from './rng';
import { AREA_IDS } from './types';
import type { AreaId, CharacterId, EffectId, OutfitId, ThemeId, WeaponId } from './types';

// ------------------------------------------------------------------ levels

export function xpToNext(level: number): number {
  return Math.round(60 + 40 * level + 8 * level * level);
}

export interface LevelInfo {
  level: number;
  into: number;
  need: number;
  frac: number;
}

export function levelFromXp(total: number): LevelInfo {
  let level = 1;
  let left = Math.max(0, Math.floor(total));
  while (left >= xpToNext(level) && level < 99) {
    left -= xpToNext(level);
    level++;
  }
  const need = xpToNext(level);
  return { level, into: left, need, frac: left / need };
}

// ---------------------------------------------------------------- unlocks
// Everything here is cosmetic: level never changes typing difficulty or combat numbers.

export interface UnlockDef<T extends string = string> {
  id: T;
  name: string;
  level: number;
}

export const CHARACTERS: UnlockDef<CharacterId>[] = [
  { id: 'knight', name: 'Knight', level: 1 },
  { id: 'mage', name: 'Mage', level: 3 },
  { id: 'rogue', name: 'Rogue', level: 6 },
  { id: 'ranger', name: 'Ranger', level: 10 },
];
export const OUTFITS: UnlockDef<OutfitId>[] = [
  { id: 'default', name: 'Classic', level: 1 },
  { id: 'crimson', name: 'Crimson', level: 4 },
  { id: 'emerald', name: 'Emerald', level: 8 },
  { id: 'royal', name: 'Royal', level: 12 },
  { id: 'shadow', name: 'Shadow', level: 18 },
];
export const WEAPONS: UnlockDef<WeaponId>[] = [
  { id: 'sword', name: 'Iron Sword', level: 1 },
  { id: 'axe', name: 'Battle Axe', level: 5 },
  { id: 'staff', name: 'Arc Staff', level: 9 },
  { id: 'spear', name: 'Long Spear', level: 14 },
  { id: 'lightblade', name: 'Light Blade', level: 20 },
];
export const MAPS: UnlockDef<AreaId>[] = [
  { id: 'village', name: 'Village', level: 1 },
  { id: 'forest', name: 'Forest', level: 2 },
  { id: 'cave', name: 'Crystal Cave', level: 5 },
  { id: 'volcano', name: 'Volcano', level: 9 },
  { id: 'cyber', name: 'Cyber City', level: 13 },
  { id: 'castle', name: 'Shadow Castle', level: 17 },
];
export const TITLES: UnlockDef[] = [
  { id: 'Novice Typist', name: 'Novice Typist', level: 1 },
  { id: 'Key Knight', name: 'Key Knight', level: 3 },
  { id: 'Word Wielder', name: 'Word Wielder', level: 5 },
  { id: 'Combo Cadet', name: 'Combo Cadet', level: 8 },
  { id: 'Rune Scribe', name: 'Rune Scribe', level: 11 },
  { id: 'Pixel Paladin', name: 'Pixel Paladin', level: 14 },
  { id: 'Speed Sage', name: 'Speed Sage', level: 18 },
  { id: 'Legend of the Keys', name: 'Legend of the Keys', level: 24 },
];
export const EFFECTS: UnlockDef<EffectId>[] = [
  { id: 'spark', name: 'Spark', level: 1 },
  { id: 'ember', name: 'Ember', level: 7 },
  { id: 'frost', name: 'Frost', level: 11 },
  { id: 'candy', name: 'Candy', level: 15 },
  { id: 'gold', name: 'Gold', level: 22 },
];
export const THEMES: UnlockDef<ThemeId>[] = [
  { id: 'classic', name: 'Classic Cyan', level: 1 },
  { id: 'amber', name: 'Amber Terminal', level: 6 },
  { id: 'jungle', name: 'Jungle Green', level: 10 },
  { id: 'violet', name: 'Violet Ruins', level: 14 },
  { id: 'mono', name: 'Mono Steel', level: 20 },
];

export interface UnlockNotice {
  category: string;
  name: string;
  level: number;
}

const CATEGORIES: Array<[string, UnlockDef[]]> = [
  ['Character', CHARACTERS],
  ['Outfit', OUTFITS],
  ['Weapon', WEAPONS],
  ['Arena', MAPS],
  ['Title', TITLES],
  ['Effect', EFFECTS],
  ['UI Theme', THEMES],
];

export function unlocksBetween(fromLevel: number, toLevel: number): UnlockNotice[] {
  const out: UnlockNotice[] = [];
  for (const [category, defs] of CATEGORIES) {
    for (const d of defs) if (d.level > fromLevel && d.level <= toLevel) out.push({ category, name: d.name, level: d.level });
  }
  return out.sort((a, b) => a.level - b.level);
}

export function isUnlocked(def: UnlockDef, level: number): boolean {
  return level >= def.level;
}

// ----------------------------------------------------------- achievements

export interface AchievementContext {
  result?: BattleResult;
}

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  check: (s: SaveData, c: AchievementContext) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'firstBlood', name: 'First Blood', desc: 'Win your first battle.', check: (s) => s.stats.battlesWon >= 1 },
  { id: 'combo100', name: '100 Combo', desc: 'Reach a 100 combo.', check: (s) => s.stats.bestCombo >= 100 },
  { id: 'combo500', name: '500 Combo', desc: 'Reach a 500 combo.', check: (s) => s.stats.bestCombo >= 500 },
  {
    id: 'perfectRun',
    name: 'Perfect Run',
    desc: 'Finish a battle with 100% accuracy (30+ characters).',
    check: (_s, c) => !!c.result && c.result.outcome !== 'defeat' && c.result.accuracy >= 1 && c.result.correctChars >= 30,
  },
  {
    id: 'speedDemon',
    name: 'Speed Demon',
    desc: 'Hit 80 WPM in a single battle.',
    check: (_s, c) => !!c.result && c.result.wpm >= 80 && c.result.correctChars >= 40,
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    desc: 'Win a fight without taking any damage.',
    check: (_s, c) =>
      !!c.result &&
      c.result.outcome === 'victory' &&
      c.result.damageTaken === 0 &&
      c.result.enemiesDefeated >= 1 &&
      (c.result.kind === 'story' || c.result.kind === 'survival' || c.result.kind === 'bossrush'),
  },
  { id: 'bossSlayer', name: 'Boss Slayer', desc: 'Defeat a boss.', check: (s) => s.stats.bossesDefeated >= 1 },
  { id: 'streak7', name: '7-Day Streak', desc: 'Complete the Daily Challenge 7 days in a row.', check: (s) => s.streak.current >= 7 },
  { id: 'wordsmith', name: 'Wordsmith', desc: 'Type 10,000 characters.', check: (s) => s.stats.totalChars >= 10000 },
  { id: 'marathon', name: '100,000 Characters', desc: 'Type 100,000 characters in total.', check: (s) => s.stats.totalChars >= 100000 },
  { id: 'level10', name: 'Rising Star', desc: 'Reach level 10.', check: (s) => levelFromXp(s.totalXp).level >= 10 },
  { id: 'storyDone', name: 'Chosen One', desc: 'Clear every Story area.', check: (s) => s.story.cleared.length >= AREA_IDS.length },
  { id: 'survivor', name: 'Survivor', desc: 'Reach wave 10 in Survival.', check: (_s, c) => !!c.result && c.result.kind === 'survival' && c.result.wave >= 10 },
  { id: 'rushChamp', name: 'Rush Champion', desc: 'Beat every boss in Boss Rush.', check: (_s, c) => !!c.result && c.result.kind === 'bossrush' && c.result.outcome === 'victory' },
  { id: 'duelist', name: 'Duelist', desc: 'Win 3 Versus races.', check: (s) => s.stats.versusWins >= 3 },
  { id: 'dailyDone', name: 'Daily Devotion', desc: 'Complete a Daily Challenge.', check: (s) => Object.keys(s.daily).length >= 1 },
];

// --------------------------------------------------------------- recording

export interface RecordSummary {
  xpGained: number;
  xpBefore: number;
  xpAfter: number;
  levelBefore: number;
  levelAfter: number;
  newAchievements: AchievementDef[];
  unlocks: UnlockNotice[];
  bests: string[];
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const XP_DIFF = { easy: 0.8, medium: 1, hard: 1.3, expert: 1.6 } as const;

export function xpForResult(r: BattleResult): number {
  let xp = r.xpEarned * XP_DIFF[r.difficulty] + r.correctChars * 0.4;
  if (r.outcome !== 'defeat') xp += 30;
  if (r.accuracy >= 0.95 && r.correctChars >= 20) xp += 20;
  if (r.outcome === 'defeat') xp *= 0.5;
  if (r.kind === 'daily' && r.outcome === 'complete') xp += 100;
  return Math.max(1, Math.round(xp));
}

function sweepAchievements(s: SaveData, ctx: AchievementContext, now: number): AchievementDef[] {
  const out: AchievementDef[] = [];
  for (const a of ACHIEVEMENTS) {
    if (s.achievements[a.id]) continue;
    if (a.check(s, ctx)) {
      s.achievements[a.id] = now;
      out.push(a);
    }
  }
  return out;
}

function pushHistory(s: SaveData, wpm: number, acc: number, mode: string, now: number): void {
  s.stats.wpmHistory.push({ t: now, wpm: Math.round(wpm * 10) / 10, acc: Math.round(acc * 1000) / 1000, mode });
  if (s.stats.wpmHistory.length > 40) s.stats.wpmHistory.splice(0, s.stats.wpmHistory.length - 40);
}

/** Current daily streak, or 0 if it lapsed. */
export function effectiveStreak(s: SaveData, today: string = dayKey()): number {
  if (!s.streak.lastDay) return 0;
  return dayDiff(s.streak.lastDay, today) <= 1 ? s.streak.current : 0;
}

export function recordBattle(save: SaveData, r: BattleResult, now = Date.now()): { save: SaveData; summary: RecordSummary } {
  const s = clone(save);
  const before = levelFromXp(s.totalXp);
  const bests: string[] = [];
  const st = s.stats;

  st.gamesPlayed++;
  st.totalChars += r.correctChars;
  st.keystrokes += r.keystrokes;
  st.battlesWon += r.enemiesDefeated;
  if (r.outcome === 'defeat') st.battlesLost++;
  st.bossesDefeated += r.bossesDefeated;
  if (r.correctChars >= 20 && r.wpm > st.bestWpm) {
    st.bestWpm = r.wpm;
    bests.push('New best WPM!');
  }
  if (r.maxCombo > st.bestCombo) {
    st.bestCombo = r.maxCombo;
    if (r.maxCombo >= 25) bests.push('New best combo!');
  }
  if (r.keystrokes >= 15) pushHistory(s, r.wpm, r.accuracy, r.kind, now);

  const rec = { score: r.score, wpm: r.wpm, accuracy: r.accuracy };
  if (r.kind === 'timeattack' && r.timeAttackSeconds) {
    const k = String(r.timeAttackSeconds);
    if (!s.records.timeAttack[k] || r.score > s.records.timeAttack[k].score) {
      s.records.timeAttack[k] = rec;
      bests.push('New Time Attack record!');
    }
  } else if (r.kind === 'survival') {
    if (!s.records.survival || r.score > s.records.survival.score) {
      s.records.survival = { ...rec, wave: r.wave };
      bests.push('New Survival record!');
    }
  } else if (r.kind === 'bossrush') {
    const cur = s.records.bossRush;
    if (!cur || r.bossesDefeated > cur.bosses || (r.bossesDefeated === cur.bosses && r.score > cur.score)) {
      s.records.bossRush = { ...rec, bosses: r.bossesDefeated, time: r.duration };
      bests.push('New Boss Rush record!');
    }
  } else if (r.kind === 'daily' && r.dailyKey) {
    // Any concluded daily attempt — win, defeat, or running out of text —
    // counts as "played today" so the streak reflects consistency, not just
    // victories.
    const prev = s.daily[r.dailyKey];
    if (!prev || r.score > prev.score) {
      s.daily[r.dailyKey] = rec;
      if (prev) bests.push("New personal best for today's challenge!");
    }
    if (!s.dailyBest || r.score > s.dailyBest.score) s.dailyBest = { ...rec, day: r.dailyKey };
    const last = s.streak.lastDay;
    if (last !== r.dailyKey) {
      s.streak.current = last && dayDiff(last, r.dailyKey) === 1 ? s.streak.current + 1 : 1;
      s.streak.lastDay = r.dailyKey;
      if (s.streak.current > s.streak.best) s.streak.best = s.streak.current;
    }
  }

  const xpGained = xpForResult(r);
  s.totalXp += xpGained;
  const after = levelFromXp(s.totalXp);
  const newAchievements = sweepAchievements(s, { result: r }, now);
  return {
    save: s,
    summary: {
      xpGained,
      xpBefore: save.totalXp,
      xpAfter: s.totalXp,
      levelBefore: before.level,
      levelAfter: after.level,
      newAchievements,
      unlocks: unlocksBetween(before.level, after.level),
      bests,
    },
  };
}

export interface VersusRecord {
  won: boolean;
  wpm: number;
  accuracy: number;
  maxCombo: number;
  correctChars: number;
  keystrokes: number;
  mode: string;
}

export function recordVersus(save: SaveData, v: VersusRecord, now = Date.now()): { save: SaveData; summary: RecordSummary } {
  const s = clone(save);
  const before = levelFromXp(s.totalXp);
  const bests: string[] = [];
  const st = s.stats;
  st.gamesPlayed++;
  st.totalChars += v.correctChars;
  st.keystrokes += v.keystrokes;
  if (v.won) st.versusWins++;
  else st.versusLosses++;
  if (v.correctChars >= 20 && v.wpm > st.bestWpm) {
    st.bestWpm = v.wpm;
    bests.push('New best WPM!');
  }
  if (v.maxCombo > st.bestCombo) st.bestCombo = v.maxCombo;
  pushHistory(s, v.wpm, v.accuracy, 'versus', now);
  const xpGained = Math.round((v.won ? 120 : 50) + v.correctChars * 0.3);
  s.totalXp += xpGained;
  const after = levelFromXp(s.totalXp);
  const newAchievements = sweepAchievements(s, {}, now);
  return {
    save: s,
    summary: {
      xpGained,
      xpBefore: save.totalXp,
      xpAfter: s.totalXp,
      levelBefore: before.level,
      levelAfter: after.level,
      newAchievements,
      unlocks: unlocksBetween(before.level, after.level),
      bests,
    },
  };
}

export function awardXp(save: SaveData, amount: number, now = Date.now()): { save: SaveData; summary: RecordSummary } {
  const s = clone(save);
  const before = levelFromXp(s.totalXp);
  s.totalXp += Math.max(0, Math.round(amount));
  const after = levelFromXp(s.totalXp);
  const newAchievements = sweepAchievements(s, {}, now);
  return {
    save: s,
    summary: {
      xpGained: Math.round(amount),
      xpBefore: save.totalXp,
      xpAfter: s.totalXp,
      levelBefore: before.level,
      levelAfter: after.level,
      newAchievements,
      unlocks: unlocksBetween(before.level, after.level),
      bests: [],
    },
  };
}

export function markAreaCleared(save: SaveData, area: AreaId, now = Date.now()): { save: SaveData; summary: RecordSummary } {
  const s = clone(save);
  if (!s.story.cleared.includes(area)) s.story.cleared.push(area);
  const idx = AREA_IDS.indexOf(area);
  s.story.unlocked = Math.max(s.story.unlocked, Math.min(AREA_IDS.length - 1, idx + 1));
  const res = awardXp(s, 300 + idx * 100, now);
  return res;
}
