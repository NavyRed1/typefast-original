import React from 'react';
import type { BattleResult } from '../core/battle';
import type { RecordSummary } from '../core/progression';
import { PixelButton } from './PixelButton';

const OUTCOME_LABEL: Record<BattleResult['outcome'], { text: string; color: string }> = {
  victory: { text: 'VICTORY', color: '#4ade80' },
  defeat: { text: 'DEFEAT', color: '#f85252' },
  complete: { text: 'TIME UP', color: '#facc15' },
};

export function ResultScreen({
  result,
  summary,
  onRetry,
  onContinue,
  onMenu,
  continueLabel = 'CONTINUE',
}: {
  result: BattleResult;
  summary: RecordSummary;
  onRetry?: () => void;
  onContinue?: () => void;
  onMenu: () => void;
  continueLabel?: string;
}) {
  const outcome = OUTCOME_LABEL[result.outcome];
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: '#121520',
        border: '2px solid #2a3042',
        boxShadow: '4px 4px 0 #05060a',
        padding: 24,
        width: 480,
        maxWidth: '90vw',
      }}
    >
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 22, color: outcome.color, textAlign: 'center' }}>
        {outcome.text}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          fontFamily: "'VT323', monospace",
          fontSize: 18,
          color: '#a7aec4',
        }}
      >
        <Stat label="Grade" value={result.grade} accent="#facc15" />
        <Stat label="Score" value={String(result.score)} />
        <Stat label="WPM" value={String(Math.round(result.wpm))} />
        <Stat label="Accuracy" value={`${Math.round(result.accuracy * 100)}%`} />
        <Stat label="Max Combo" value={String(result.maxCombo)} />
        <Stat label="Enemies Defeated" value={String(result.enemiesDefeated)} />
      </div>

      <div
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: 18,
          color: '#f5f7ff',
          borderTop: '2px solid #2a3042',
          paddingTop: 12,
        }}
      >
        <div>
          +{summary.xpGained} XP{' '}
          {summary.levelAfter > summary.levelBefore && (
            <span style={{ color: '#facc15' }}>— Level {summary.levelBefore} → {summary.levelAfter}!</span>
          )}
        </div>
        {summary.bests.map((b, i) => (
          <div key={i} style={{ color: '#34d3ff' }}>
            {b}
          </div>
        ))}
        {summary.unlocks.map((u, i) => (
          <div key={i} style={{ color: '#a855f7' }}>
            Unlocked {u.category}: {u.name}
          </div>
        ))}
        {summary.newAchievements.map((a) => (
          <div key={a.id} style={{ color: '#4ade80' }}>
            Achievement: {a.name} — {a.desc}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {onRetry && (
          <PixelButton onClick={onRetry} small>
            RETRY
          </PixelButton>
        )}
        {onContinue && (
          <PixelButton variant="primary" onClick={onContinue} small>
            {continueLabel}
          </PixelButton>
        )}
        <PixelButton onClick={onMenu} small>
          MENU
        </PixelButton>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{label}</span>
      <b style={{ color: accent ?? '#f5f7ff' }}>{value}</b>
    </div>
  );
}
