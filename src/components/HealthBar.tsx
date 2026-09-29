import React from 'react';

export function HealthBar({
  hp,
  maxHp,
  owner = 'player',
  label,
}: {
  hp: number;
  maxHp: number;
  owner?: 'player' | 'enemy' | 'boss';
  label?: string;
}) {
  const pct = maxHp <= 0 ? 0 : Math.max(0, Math.min(1, hp / maxHp));
  const color = owner === 'player' ? '#4ade80' : owner === 'boss' ? '#f85252' : '#facc15';
  const low = pct <= 0.25;
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: 15,
            color: '#a7aec4',
            marginBottom: 2,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{label}</span>
          <span>
            {Math.max(0, Math.round(hp))}/{maxHp}
          </span>
        </div>
      )}
      <div
        style={{
          height: 14,
          background: '#0a0c14',
          border: '3px solid #05060a',
          padding: 2,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct * 100}%`,
            background: low ? '#f85252' : color,
            transition: 'width 160ms steps(12)',
          }}
        />
      </div>
    </div>
  );
}
