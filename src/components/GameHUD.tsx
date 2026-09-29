import React from 'react';
import { ComboMeter } from './ComboMeter';
import { PixelButton } from './PixelButton';

export function GameHUD({
  wpm,
  accuracy,
  combo,
  tier,
  score,
  timeLeft,
  wave,
  totalEnemies,
  kills,
  paused,
  onPause,
}: {
  wpm: number;
  accuracy: number;
  combo: number;
  tier: number;
  score: number;
  timeLeft: number | null;
  wave?: number;
  totalEnemies: number | null;
  kills: number;
  paused: boolean;
  onPause: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        fontFamily: "'VT323', monospace",
        fontSize: 18,
        color: '#a7aec4',
        background: '#121520',
        border: '2px solid #2a3042',
        boxShadow: '4px 4px 0 #05060a',
        padding: '8px 14px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <span>
          WPM <b style={{ color: '#f5f7ff' }}>{Math.round(wpm)}</b>
        </span>
        <span>
          ACC <b style={{ color: '#f5f7ff' }}>{Math.round(accuracy * 100)}%</b>
        </span>
        <span>
          SCORE <b style={{ color: '#f5f7ff' }}>{score}</b>
        </span>
        {totalEnemies != null && (
          <span>
            FOES <b style={{ color: '#f5f7ff' }}>{kills}/{totalEnemies}</b>
          </span>
        )}
        {wave != null && (
          <span>
            WAVE <b style={{ color: '#f5f7ff' }}>{wave}</b>
          </span>
        )}
        {timeLeft != null && (
          <span>
            TIME <b style={{ color: timeLeft < 10 ? '#f85252' : '#f5f7ff' }}>{Math.ceil(timeLeft)}s</b>
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ComboMeter combo={combo} tier={tier} />
        <PixelButton small onClick={onPause}>
          {paused ? 'RESUME' : 'PAUSE'}
        </PixelButton>
      </div>
    </div>
  );
}
