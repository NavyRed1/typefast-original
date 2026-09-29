import React from 'react';
import { EnemySprite } from '../render/sprites';
import { HealthBar } from './HealthBar';
import { ProgressBar } from './ProgressBar';
import type { EnemyKind, BossId } from '../core/types';

export function Enemy({
  kind,
  bossId,
  name,
  title,
  hp,
  maxHp,
  charge,
  hit,
  boss,
  mini,
  phaseName,
  casting,
}: {
  kind: EnemyKind | 'boss';
  bossId?: BossId;
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  charge: number;
  hit: boolean;
  boss: boolean;
  mini: boolean;
  phaseName: string;
  casting: { name: string; timeLeft: number; total: number } | null;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: 160 }}>
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 10,
          color: boss ? '#f85252' : mini ? '#facc15' : '#a7aec4',
          textAlign: 'center',
        }}
      >
        {boss ? phaseName || name : title}
      </div>
      <div style={{ height: boss ? 108 : 84, display: 'flex', alignItems: 'flex-end' }}>
        <EnemySprite kind={kind} bossId={bossId} size={boss ? 8 : mini ? 7 : 6} hit={hit} cast={!!casting} />
      </div>
      <HealthBar hp={hp} maxHp={maxHp} owner={boss ? 'boss' : 'enemy'} label={name} />
      <div style={{ width: '100%' }}>
        <ProgressBar value={charge} color="#f85252" height={6} />
      </div>
      {casting && (
        <div style={{ width: '100%', fontFamily: "'VT323', monospace", fontSize: 13, color: '#a855f7' }}>
          Casting {casting.name}…
          <ProgressBar value={1 - casting.timeLeft / casting.total} color="#a855f7" height={6} />
        </div>
      )}
    </div>
  );
}
