import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TypingEngine } from '../core/typing';
import { generateRace } from '../core/texts';
import { Rng } from '../core/rng';
import type { Difficulty, CharacterId } from '../core/types';
import { DIFF_CPS } from '../core/enemies';
import { TypingArea } from '../components/TypingArea';
import { PixelButton } from '../components/PixelButton';
import { PlayerSprite, EnemySprite } from '../render/sprites';
import { Countdown } from '../components/DialogueBox';

type AiLevel = 'easy' | 'medium' | 'hard';
const AI_CPS_MULT: Record<AiLevel, number> = { easy: 0.75, medium: 1.0, hard: 1.25 };

export function VersusScreen({
  difficulty,
  character,
  runId,
  onFinish,
  onRematch,
  onExit,
}: {
  difficulty: Difficulty;
  character: CharacterId;
  runId: number;
  onFinish: (won: boolean, wpm: number, accuracy: number) => void;
  onRematch: () => void;
  onExit: () => void;
}) {
  const [aiLevel, setAiLevel] = useState<AiLevel>('medium');
  const text = useMemo(() => generateRace(difficulty, new Rng(Date.now() ^ runId)), [difficulty, runId]);
  const engineRef = useRef<TypingEngine>();
  if (!engineRef.current) engineRef.current = new TypingEngine();
  const engine = engineRef.current;

  const [, force] = useState(0);
  const [count, setCount] = useState(3);
  const [botProgress, setBotProgress] = useState(0);
  const [winner, setWinner] = useState<'player' | 'bot' | null>(null);
  const racing = count === 0 && !winner;

  useEffect(() => {
    engine.setText(text);
    engine.resetStats();
    setBotProgress(0);
    setWinner(null);
    setCount(3);
    force((n) => n + 1);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = setInterval(() => setCount((c) => Math.max(0, c - 1)), 700);
    return () => clearInterval(id);
  }, [text]);

  useEffect(() => {
    if (!racing) return;
    let raf = 0;
    let last = performance.now();
    const baseCps = DIFF_CPS[difficulty] * AI_CPS_MULT[aiLevel];
    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.2);
      last = t;
      engine.tick(dt);
      setBotProgress((p) => {
        const jitter = 0.6 + Math.random() * 0.8;
        const next = Math.min(text.length, p + baseCps * jitter * dt);
        if (next >= text.length && !winner) setWinner('bot');
        return next;
      });
      force((n) => n + 1);
      if (!winner) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [racing, difficulty, aiLevel, text]);

  useEffect(() => {
    if (!racing) return;
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Backspace') {
        engine.clearMistake();
        force((n) => n + 1);
        e.preventDefault();
        return;
      }
      if (e.key.length === 1) {
        const res = engine.input(e.key);
        force((n) => n + 1);
        if (res.kind === 'correct' && res.passageComplete && !winner) setWinner('player');
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [racing, winner]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishedRef = useRef(false);
  useEffect(() => {
    if (winner && !finishedRef.current) {
      finishedRef.current = true;
      onFinish(winner === 'player', engine.wpm(), engine.accuracy());
    }
  }, [winner]); // eslint-disable-line react-hooks/exhaustive-deps

  const playerFrac = engine.progress();
  const botFrac = text.length ? botProgress / text.length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', maxWidth: 700 }}>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: '#f5f7ff' }}>VERSUS</div>

      {count > 0 && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: "'VT323', monospace", fontSize: 16 }}>
          <span style={{ color: '#a7aec4' }}>Opponent:</span>
          {(['easy', 'medium', 'hard'] as AiLevel[]).map((l) => (
            <PixelButton key={l} small variant={l === aiLevel ? 'primary' : 'default'} onClick={() => setAiLevel(l)}>
              {l.toUpperCase()}
            </PixelButton>
          ))}
        </div>
      )}

      <Lane label="You" frac={playerFrac} sprite={<PlayerSprite character={character} size={4} />} color="#34d3ff" />
      <Lane label={`AI (${aiLevel})`} frac={botFrac} sprite={<EnemySprite kind="goblin" size={4} />} color="#f85252" />

      <div style={{ position: 'relative' }}>
        <TypingArea typed={engine.segments()} current={text[engine.index] ?? ''} rest={text.slice(engine.index + 1)} mistake={engine.mistake ? engine.mistake.typed : null} />
        {count > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,6,10,0.8)' }}>
            <Countdown n={count} />
          </div>
        )}
      </div>

      {winner && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 20, color: winner === 'player' ? '#4ade80' : '#f85252' }}>
            {winner === 'player' ? 'YOU WIN!' : 'YOU LOSE'}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <PixelButton variant="primary" onClick={onRematch}>
              REMATCH
            </PixelButton>
            <PixelButton onClick={onExit}>MENU</PixelButton>
          </div>
        </div>
      )}
    </div>
  );
}

function Lane({ label, frac, sprite, color }: { label: string; frac: number; sprite: React.ReactNode; color: string }) {
  return (
    <div>
      <div style={{ fontFamily: "'VT323', monospace", fontSize: 15, color: '#a7aec4', marginBottom: 4 }}>{label}</div>
      <div style={{ position: 'relative', height: 40, background: '#0a0c14', border: '2px solid #2a3042' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${Math.min(100, frac * 100)}%`, background: `${color}22` }} />
        <div style={{ position: 'absolute', top: '50%', left: `${Math.min(96, frac * 96)}%`, transform: 'translateY(-50%)' }}>{sprite}</div>
      </div>
    </div>
  );
}
