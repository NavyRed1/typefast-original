import React from 'react';

export function ProgressBar({
  value,
  color = '#34d3ff',
  height = 10,
  bg = '#121520',
}: {
  value: number; // 0..1
  color?: string;
  height?: number;
  bg?: string;
}) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div style={{ height, background: bg, border: '2px solid #05060a' }}>
      <div style={{ height: '100%', width: `${pct * 100}%`, background: color, transition: 'width 120ms linear' }} />
    </div>
  );
}
