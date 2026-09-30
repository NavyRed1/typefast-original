import React, { useState } from 'react';
import type { SaveData } from '../data/save';
import type { Difficulty } from '../core/types';
import { DIFFICULTIES } from '../core/types';
import { PixelButton } from '../components/PixelButton';
import { dayKey } from '../core/rng';

export type QuickMode = 'timeattack' | 'survival' | 'bossrush' | 'daily';

const TITLE: Record<QuickMode, string> = {
  timeattack: 'TIME ATTACK',
  survival: 'SURVIVAL',
  bossrush: 'BOSS RUSH',
  daily: 'DAILY CHALLENGE',
};

const BLURB: Record<QuickMode, string> = {
  timeattack: 'Rack up score against a clock — enemies never counter-attack.',
  survival: 'Enemies get tougher every wave. Every fifth wave is a boss. Survive as long as you can.',
  bossrush: 'Face all six area bosses back to back at a fixed difficulty discount.',
  daily: 'The same three passages as every other player today. One attempt, same text for everyone.',
};

const DURATIONS = [15, 30, 60, 120];

export function ModeSetup({
  mode,
  save,
  onStart,
  onBack,
}: {
  mode: QuickMode;
  save: SaveData;
  onStart: (difficulty: Difficulty, seconds?: number) => void;
  onBack: () => void;
}) {
  const [difficulty, setDifficulty] = useState<Difficulty>(save.settings.difficulty);
  const [seconds, setSeconds] = useState(30);

  const today = dayKey();
  const alreadyPlayedToday = mode === 'daily' && !!save.daily[today];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', maxWidth: 480 }}>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: '#f5f7ff' }}>{TITLE[mode]}</div>
      <p style={{ fontFamily: "'VT323', monospace", fontSize: 18, color: '#a7aec4', margin: 0 }}>{BLURB[mode]}</p>

      {mode === 'daily' && (
        <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: '#facc15' }}>
          Streak: {save.streak.current} days (best {save.streak.best}) {alreadyPlayedToday && '— already completed today'}
        </div>
      )}

      {mode !== 'daily' && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: "'VT323', monospace", fontSize: 16 }}>
          <span style={{ color: '#a7aec4' }}>Difficulty:</span>
          {DIFFICULTIES.map((d) => (
            <PixelButton key={d} small variant={d === difficulty ? 'primary' : 'default'} onClick={() => setDifficulty(d)}>
              {d.toUpperCase()}
            </PixelButton>
          ))}
        </div>
      )}

      {mode === 'timeattack' && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: "'VT323', monospace", fontSize: 16 }}>
          <span style={{ color: '#a7aec4' }}>Duration:</span>
          {DURATIONS.map((s) => (
            <PixelButton key={s} small variant={s === seconds ? 'primary' : 'default'} onClick={() => setSeconds(s)}>
              {s}s
            </PixelButton>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <PixelButton
          variant="primary"
          disabled={mode === 'daily' && alreadyPlayedToday}
          onClick={() => onStart(mode === 'daily' ? save.settings.difficulty : difficulty, seconds)}
        >
          START
        </PixelButton>
        <PixelButton onClick={onBack}>BACK</PixelButton>
      </div>
    </div>
  );
}
