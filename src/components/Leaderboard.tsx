import React from 'react';
import type { SaveData } from '../data/save';

export function Leaderboard({ save }: { save: SaveData }) {
  const rows: { label: string; value: string }[] = [];

  for (const [secs, rec] of Object.entries(save.records.timeAttack)) {
    rows.push({ label: `Time Attack ${secs}s`, value: `${rec.score} pts · ${Math.round(rec.wpm)} WPM · ${Math.round(rec.accuracy * 100)}%` });
  }
  if (save.records.survival) {
    const r = save.records.survival;
    rows.push({ label: 'Survival', value: `Wave ${r.wave} · ${r.score} pts · ${Math.round(r.wpm)} WPM` });
  }
  if (save.records.bossRush) {
    const r = save.records.bossRush;
    rows.push({ label: 'Boss Rush', value: `${r.bosses} bosses · ${r.score} pts` });
  }
  if (save.dailyBest) {
    rows.push({ label: `Daily Best (${save.dailyBest.day})`, value: `${save.dailyBest.score} pts · ${Math.round(save.dailyBest.wpm)} WPM` });
  }
  rows.push({ label: 'Daily Streak', value: `${save.streak.current} days (best ${save.streak.best})` });
  rows.push({ label: 'Versus Record', value: `${save.stats.versusWins}W – ${save.stats.versusLosses}L` });

  return (
    <div
      className="pixel-scroll"
      style={{
        background: '#0a0c14',
        border: '2px solid #2a3042',
        boxShadow: '4px 4px 0 #05060a',
        padding: 16,
        fontFamily: "'VT323', monospace",
        fontSize: 18,
        maxHeight: 260,
        overflowY: 'auto',
      }}
    >
      {rows.length === 0 && <div style={{ color: '#626a80' }}>No records yet — go play!</div>}
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            padding: '4px 0',
            borderBottom: i < rows.length - 1 ? '1px solid #1b1f2e' : 'none',
          }}
        >
          <span style={{ color: '#a7aec4' }}>{r.label}</span>
          <span style={{ color: '#f5f7ff' }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}
