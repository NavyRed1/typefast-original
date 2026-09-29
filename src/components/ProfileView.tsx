import React from 'react';
import type { SaveData } from '../data/save';
import { levelFromXp, ACHIEVEMENTS } from '../core/progression';
import { PlayerSprite } from '../render/sprites';
import { ProgressBar } from './ProgressBar';

export function ProfileView({ save }: { save: SaveData }) {
  const info = levelFromXp(save.totalXp);
  const recentWpm = save.stats.wpmHistory.slice(-10);
  const maxWpm = Math.max(1, ...recentWpm.map((w) => w.wpm));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: "'VT323', monospace" }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div
          style={{
            background: '#0a0c14',
            border: '2px solid #2a3042',
            boxShadow: '4px 4px 0 #05060a',
            padding: 14,
          }}
        >
          <PlayerSprite character={save.loadout.character} size={6} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 16, color: '#f5f7ff' }}>{save.name}</div>
          <div style={{ color: '#a7aec4', fontSize: 18, margin: '4px 0 8px' }}>
            Level {info.level} · {save.loadout.title}
          </div>
          <ProgressBar value={info.frac} color="#34d3ff" height={10} />
          <div style={{ fontSize: 14, color: '#626a80', marginTop: 4 }}>
            {info.into} / {info.need} XP to level {info.level + 1}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: 16, color: '#a7aec4' }}>
        <Stat label="Best WPM" value={String(Math.round(save.stats.bestWpm))} />
        <Stat label="Best Combo" value={String(save.stats.bestCombo)} />
        <Stat label="Games Played" value={String(save.stats.gamesPlayed)} />
        <Stat label="Battles Won" value={String(save.stats.battlesWon)} />
        <Stat label="Battles Lost" value={String(save.stats.battlesLost)} />
        <Stat label="Bosses Defeated" value={String(save.stats.bossesDefeated)} />
        <Stat label="Chars Typed" value={String(save.stats.totalChars)} />
        <Stat label="Daily Streak" value={`${save.streak.current} (best ${save.streak.best})`} />
        <Stat label="Areas Cleared" value={`${save.story.cleared.length}/6`} />
      </div>

      {recentWpm.length > 0 && (
        <div>
          <div style={{ color: '#a7aec4', fontSize: 15, marginBottom: 6 }}>Recent WPM</div>
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 48 }}>
            {recentWpm.map((w, i) => (
              <div
                key={i}
                title={`${Math.round(w.wpm)} WPM`}
                style={{
                  width: 12,
                  height: Math.max(4, (w.wpm / maxWpm) * 48),
                  background: '#34d3ff',
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ color: '#a7aec4', fontSize: 15, marginBottom: 6 }}>
          Achievements ({Object.keys(save.achievements).length}/{ACHIEVEMENTS.length})
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {ACHIEVEMENTS.map((a) => {
            const done = !!save.achievements[a.id];
            return (
              <div
                key={a.id}
                style={{
                  border: `2px solid ${done ? '#4ade80' : '#2a3042'}`,
                  background: done ? '#12241b' : '#0a0c14',
                  padding: '6px 10px',
                  fontSize: 14,
                  color: done ? '#4ade80' : '#626a80',
                }}
                title={a.desc}
              >
                {done ? '✓ ' : '· '}
                {a.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: '#0a0c14',
        border: '2px solid #2a3042',
        padding: '8px 10px',
      }}
    >
      <div style={{ fontSize: 12, color: '#626a80' }}>{label}</div>
      <div style={{ fontSize: 20, color: '#f5f7ff' }}>{value}</div>
    </div>
  );
}
