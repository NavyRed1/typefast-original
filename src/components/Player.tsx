import React from 'react';
import { PlayerSprite } from '../render/sprites';
import { HealthBar } from './HealthBar';
import type { CharacterId } from '../core/types';

export function Player({
  character,
  hp,
  maxHp,
  hit,
  name = 'You',
}: {
  character: CharacterId;
  hp: number;
  maxHp: number;
  hit: boolean;
  name?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: 140 }}>
      <div style={{ height: 84, display: 'flex', alignItems: 'flex-end' }}>
        <PlayerSprite character={character} size={6} hit={hit} />
      </div>
      <HealthBar hp={hp} maxHp={maxHp} owner="player" label={name} />
    </div>
  );
}
