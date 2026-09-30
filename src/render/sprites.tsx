import React from 'react';
import type { CharacterId, EnemyKind, BossId } from '../core/types';

/**
 * Sprites are small string grids ('.' = transparent, any other char is a
 * palette key) rendered as a single element with a computed box-shadow: one
 * shadow per opaque cell. That keeps every edge pixel-hard with zero raster
 * assets and zero network dependency, and scales losslessly.
 */
export type SpriteGrid = string[];
export type Palette = Record<string, string>;

function shadowFor(grid: SpriteGrid, palette: Palette, size: number): { shadow: string; w: number; h: number } {
  const rows = grid.length;
  const cols = Math.max(...grid.map((r) => r.length));
  const parts: string[] = [];
  for (let y = 0; y < rows; y++) {
    const row = grid[y];
    for (let x = 0; x < cols; x++) {
      const key = row[x];
      if (!key || key === '.') continue;
      const color = palette[key] ?? key;
      parts.push(`${x * size}px ${y * size}px 0 0 ${color}`);
    }
  }
  return { shadow: parts.join(','), w: cols * size, h: rows * size };
}

export function PixelGrid({
  grid,
  palette,
  size = 4,
  className,
  style,
}: {
  grid: SpriteGrid;
  palette: Palette;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { shadow, w, h } = shadowFor(grid, palette, size);
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        boxShadow: shadow,
        ...style,
      }}
    />
  );
}

// --------------------------------------------------------------- palettes
const SKIN = '#e8b98c';
const OUTLINE = '#05060a';

export const CHARACTER_PALETTES: Record<CharacterId, Palette> = {
  knight: { o: OUTLINE, s: SKIN, a: '#c8ced9', b: '#7d8699', c: '#34d3ff', h: '#486eff' },
  mage: { o: OUTLINE, s: SKIN, a: '#a855f7', b: '#5b2f86', c: '#34d3ff', h: '#f5f7ff' },
  rogue: { o: OUTLINE, s: SKIN, a: '#4ade80', b: '#1f6b3f', c: '#f5f7ff', h: '#626a80' },
  ranger: { o: OUTLINE, s: SKIN, a: '#facc15', b: '#8a6a12', c: '#4ade80', h: '#7d8699' },
};

export const ENEMY_PALETTES: Record<string, Palette> = {
  slime: { o: OUTLINE, a: '#4ade80', b: '#1f6b3f', c: '#eafff2' },
  goblin: { o: OUTLINE, a: '#8bd15a', b: '#3d5c1f', c: '#f5f7ff', d: '#8a6a12' },
  skeleton: { o: OUTLINE, a: '#e9e6db', b: '#8f8b7a', c: '#f85252' },
  mage: { o: OUTLINE, a: '#a855f7', b: '#4b2166', c: '#34d3ff', d: '#f5f7ff' },
  assassin: { o: OUTLINE, a: '#2a3042', b: '#121520', c: '#f85252', d: '#f5f7ff' },
  tank: { o: OUTLINE, a: '#7d8699', b: '#3a4152', c: '#facc15', d: '#c8ced9' },
  boss: { o: OUTLINE, a: '#f85252', b: '#7a1f1f', c: '#facc15', d: '#f5f7ff' },
};

// ------------------------------------------------------------ player grid
// 10x14 blocky adventurer; recolored per class via the palette above.
const PLAYER_GRID: SpriteGrid = [
  '..occcoo..',
  '.occaacco.',
  '.osaaaaso.',
  '.osaaaaso.',
  '..ossso...',
  '.ohhhhho..',
  'ohhcccchho',
  'ohhcccchho',
  '.oh....ho.',
  '.oa....ao.',
  '.oa....ao.',
  '..o....o..',
  '..o....o..',
  '.oo....oo.',
];

export function PlayerSprite({
  character,
  size = 5,
  hit,
  cast,
  className,
}: {
  character: CharacterId;
  size?: number;
  hit?: boolean;
  cast?: boolean;
  className?: string;
}) {
  return (
    <PixelGrid
      grid={PLAYER_GRID}
      palette={CHARACTER_PALETTES[character]}
      size={size}
      className={[className, hit ? 'tq-flash' : '', cast ? 'tq-pop' : ''].filter(Boolean).join(' ')}
    />
  );
}

// ------------------------------------------------------------ enemy grids
const ENEMY_GRIDS: Record<EnemyKind, SpriteGrid> = {
  slime: ['..occco...', '.oaaaaco..', 'oaacaaaao.', 'oaaaaaaao.', 'oaacaaaao.', '.obbbbbo..', '..ooooo...'],
  goblin: [
    '..occo....',
    '.oaacao...',
    '.oaaaao...',
    '..occo....',
    '.oddcddo..',
    'oddccdddo.',
    '.od....do.',
    '.oa....ao.',
    '..o....o..',
    '..o....o..',
  ],
  skeleton: [
    '..occo....',
    '.oa..ao...',
    '.oaccao...',
    '..occo....',
    '.obbbbo...',
    'obbcbbbo..',
    '.ob..bo...',
    '.oc..co...',
    '..o..o....',
    '..o..o....',
  ],
  mage: [
    '...occo...',
    '..oaacao..',
    '..oaaaao..',
    '...occo...',
    '..obbbbo..',
    '.obbcbbbo.',
    'obbbcbbbbo',
    '.obbdbbbo.',
    '..obbbbo..',
    '..obb.bo..',
    '..oo..oo..',
  ],
  assassin: [
    '..occo....',
    '.oaacao...',
    '.oaacao...',
    '..occo....',
    '.oaddddo..',
    'oaddccdao.',
    '.oa....ao.',
    '.oc....co.',
    '..o....o..',
    '..o....o..',
  ],
  tank: [
    '..oaccao..',
    '.oaacaaao.',
    '.oaaaaaao.',
    '.obbbbbbo.',
    'obbdccddbo',
    'obbdccddbo',
    'obbdccddbo',
    '.ob....bo.',
    '.oc....co.',
    '..o....o..',
  ],
};

export function EnemySprite({
  kind,
  bossId,
  size = 6,
  hit,
  cast,
  className,
}: {
  kind: EnemyKind | 'boss';
  bossId?: BossId;
  size?: number;
  hit?: boolean;
  cast?: boolean;
  className?: string;
}) {
  const shape = kind === 'boss' ? bossShape(bossId) : ENEMY_GRIDS[kind];
  const palette = kind === 'boss' ? ENEMY_PALETTES.boss : ENEMY_PALETTES[kind];
  return (
    <PixelGrid
      grid={shape}
      palette={palette}
      size={size}
      className={[className, hit ? 'tq-flash' : '', cast ? 'tq-pop' : ''].filter(Boolean).join(' ')}
    />
  );
}

function bossShape(bossId?: BossId): SpriteGrid {
  // Bosses reuse a related base silhouette scaled larger with a crown/aura
  // row so each still reads as "the big version" of its area's enemies.
  switch (bossId) {
    case 'slimeKing':
      return ['..oddo....', '..occco...', '.oaaaaco..', 'oaacaaaao.', 'oaaaaaaao.', 'oaacaaaao.', '.obbbbbo..', '..ooooo...'];
    case 'treant':
      return [
        '.oc.oc.oc.',
        'occoccocco',
        '.oaaaaaao.',
        'oaaccaaao.',
        'oaaaaaaao.',
        '.obbbbbo..',
        '.ob.bb.o..',
        '.o.o..o.o.',
      ];
    case 'golem':
      return [
        '.occccco..',
        'oaacaaco..',
        'oaaaaaao..',
        '.obbbbbo..',
        'obbdccddo.',
        'obbdccddo.',
        'ob.....bo.',
        'oc.....co.',
      ];
    case 'drake':
      return [
        '.o..occ..o',
        '.occcaacco',
        'oaacaaaao.',
        '.oaaaaaao.',
        'ccobbbboc',
        '.obbdbbo..',
        '..o...o...',
      ];
    case 'mech':
      return [
        '.oaaaaao..',
        'oaaddaaao.',
        '.occccco..',
        '.obbccbo..',
        'obbdccddo.',
        'ob.....bo.',
        'oc.....co.',
      ];
    case 'lich':
      return [
        '..oc.co..',
        '.occacco.',
        '.oaaaaao.',
        '..obbbo..',
        '.obbdbbo.',
        'obb...bbo',
        '.o.....o.',
      ];
    default:
      return ENEMY_GRIDS.slime;
  }
}
