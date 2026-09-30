import React from 'react';
import { PixelButton } from './PixelButton';

export function DialogueBox({
  speaker,
  text,
  onContinue,
  continueLabel = 'CONTINUE',
}: {
  speaker?: string;
  text: string;
  onContinue?: () => void;
  continueLabel?: string;
}) {
  return (
    <div
      style={{
        background: '#121520',
        border: '2px solid #34d3ff',
        boxShadow: '4px 4px 0 #05060a',
        padding: 18,
        maxWidth: 560,
        fontFamily: "'VT323', monospace",
      }}
    >
      {speaker && (
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: '#34d3ff', marginBottom: 10 }}>
          {speaker}
        </div>
      )}
      <p style={{ fontSize: 20, lineHeight: 1.5, color: '#f5f7ff', margin: '0 0 16px' }}>{text}</p>
      {onContinue && (
        <PixelButton variant="primary" small onClick={onContinue}>
          {continueLabel}
        </PixelButton>
      )}
    </div>
  );
}

export function Countdown({ n }: { n: number }) {
  return (
    <div
      style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 48,
        color: '#34d3ff',
        textShadow: '4px 4px 0 #05060a',
      }}
      className="tq-pop"
      key={n}
    >
      {n > 0 ? n : 'GO!'}
    </div>
  );
}
