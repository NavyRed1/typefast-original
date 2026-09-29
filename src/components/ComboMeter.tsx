import React from 'react';

function comboColor(combo: number): string {
  if (combo >= 250) return '#a855f7';
  if (combo >= 100) return '#f85252';
  if (combo >= 50) return '#facc15';
  if (combo >= 25) return '#34d3ff';
  if (combo >= 10) return '#4ade80';
  return '#a7aec4';
}

export function ComboMeter({ combo, tier }: { combo: number; tier: number }) {
  const color = comboColor(combo);
  const scale = 1 + Math.min(tier, 4) * 0.06;
  return (
    <div
      style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 13,
        color,
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        transform: `scale(${scale})`,
        transformOrigin: 'left center',
        textShadow: combo >= 100 ? `0 0 8px ${color}` : 'none',
      }}
    >
      <span>{combo}</span>
      <span style={{ fontSize: 9, color: '#626a80' }}>COMBO</span>
    </div>
  );
}
