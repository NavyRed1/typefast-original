export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

export type AreaId = 'village' | 'forest' | 'cave' | 'volcano' | 'cyber' | 'castle';
export const AREA_IDS: AreaId[] = ['village', 'forest', 'cave', 'volcano', 'cyber', 'castle'];

export type EnemyKind = 'slime' | 'goblin' | 'skeleton' | 'mage' | 'assassin' | 'tank';
export type BossId = 'slimeKing' | 'treant' | 'golem' | 'drake' | 'mech' | 'lich';

export type CharacterId = 'knight' | 'mage' | 'rogue' | 'ranger';
export type OutfitId = 'default' | 'crimson' | 'emerald' | 'royal' | 'shadow';
export type WeaponId = 'sword' | 'axe' | 'staff' | 'spear' | 'lightblade';
export type EffectId = 'spark' | 'ember' | 'frost' | 'candy' | 'gold';
export type ThemeId = 'classic' | 'amber' | 'jungle' | 'violet' | 'mono';

export type TextStyle =
  | 'base' // follows the chosen difficulty
  | 'accuracy' // one step harder than the chosen difficulty
  | 'short' // a few short words
  | 'long' // expert paragraphs
  | 'punct'
  | 'numbers'
  | 'symbols'
  | 'mixed'
  | 'spell';

export interface Loadout {
  character: CharacterId;
  outfit: OutfitId;
  weapon: WeaponId;
  title: string;
  effect: EffectId;
}

export type BattleKind = 'story' | 'survival' | 'bossrush' | 'timeattack' | 'daily';
