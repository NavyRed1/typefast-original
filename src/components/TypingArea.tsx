import React from 'react';
import type { Segment } from '../core/typing';

export function TypingArea({
  typed,
  current,
  rest,
  mistake,
  fontSize = 22,
}: {
  typed: Segment[];
  current: string;
  rest: string;
  mistake: string | null;
  fontSize?: number;
}) {
  return (
    <div
      className="pixel-scroll"
      style={{
        fontFamily: "'VT323', monospace",
        fontSize,
        lineHeight: 1.5,
        letterSpacing: 0.5,
        background: '#0a0c14',
        border: '2px solid #2a3042',
        boxShadow: '4px 4px 0 #05060a',
        padding: '14px 16px',
        minHeight: fontSize * 3,
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      }}
    >
      {typed.map((seg, i) => (
        <span key={i} style={{ color: seg.flagged ? '#f85252' : '#4ade80', opacity: seg.flagged ? 0.75 : 1 }}>
          {seg.text}
        </span>
      ))}
      <span
        className={mistake ? 'tq-shake' : undefined}
        style={{
          background: mistake ? '#f85252' : '#34d3ff',
          color: mistake ? '#05060a' : '#05060a',
          padding: '0 1px',
        }}
      >
        {current || ' '}
      </span>
      <span className="tq-caret" style={{ color: '#34d3ff' }}>
        |
      </span>
      <span style={{ color: '#626a80' }}>{rest}</span>
    </div>
  );
}
