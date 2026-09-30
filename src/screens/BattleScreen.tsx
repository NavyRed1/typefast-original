import React, { useEffect, useRef, useState } from 'react';
import type { BattleConfig, BattleResult } from '../core/battle';
import type { CharacterId } from '../core/types';
import { useBattleManager } from '../hooks/useBattleManager';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { Player } from '../components/Player';
import { Enemy } from '../components/Enemy';
import { GameHUD } from '../components/GameHUD';
import { TypingArea } from '../components/TypingArea';
import { Countdown } from '../components/DialogueBox';
import { PixelButton } from '../components/PixelButton';

export function BattleScreen({
  config,
  character,
  onFinish,
  onQuit,
}: {
  config: BattleConfig;
  character: CharacterId;
  onFinish: (result: BattleResult) => void;
  onQuit: () => void;
}) {
  const { battle, snapshot, handleChar, backspace, setPaused, floaters, playerShake, enemyHit, playerHit } =
    useBattleManager(config);

  const [count, setCount] = useState(3);
  const started = useRef(false);

  useEffect(() => {
    setPaused(true);
    const id = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(id);
          setPaused(false);
          started.current = true;
          return 0;
        }
        return c - 1;
      });
    }, 700);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finished = useRef(false);
  useEffect(() => {
    if (snapshot.state !== 'fighting' && !finished.current) {
      finished.current = true;
      onFinish(battle.result());
    }
  }, [snapshot.state, battle, onFinish]);

  const showCountdown = count > 0;
  useKeyboardInput({
    enabled: !showCountdown && !snapshot.paused && snapshot.state === 'fighting',
    onChar: handleChar,
    onBackspace: backspace,
    onEscape: () => setPaused(!snapshot.paused),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 900 }}>
      <GameHUD
        wpm={snapshot.wpm}
        accuracy={snapshot.accuracy}
        combo={snapshot.combo}
        tier={snapshot.tier}
        score={snapshot.score}
        timeLeft={snapshot.timeLeft}
        totalEnemies={snapshot.totalEnemies}
        kills={snapshot.kills}
        paused={snapshot.paused && !showCountdown}
        onPause={() => setPaused(!snapshot.paused)}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          background: '#05060a',
          border: '2px solid #2a3042',
          boxShadow: '4px 4px 0 #05060a',
          padding: '24px 32px',
          minHeight: 160,
        }}
      >
        <div className={playerShake ? 'tq-shake' : undefined}>
          <Player character={character} hp={snapshot.player.hp} maxHp={snapshot.player.maxHp} hit={playerHit} />
        </div>
        <Enemy
          kind={snapshot.enemy.kind as any}
          bossId={snapshot.enemy.boss ? (snapshot.enemy.id as any) : undefined}
          name={snapshot.enemy.name}
          title={snapshot.enemy.title}
          hp={snapshot.enemy.hp}
          maxHp={snapshot.enemy.maxHp}
          charge={snapshot.enemy.charge}
          hit={enemyHit}
          boss={snapshot.enemy.boss}
          mini={snapshot.enemy.mini}
          phaseName={snapshot.enemy.phaseName}
          casting={snapshot.enemy.casting}
        />

        {floaters.map((f) => (
          <div
            key={f.id}
            className="tq-float"
            style={{
              position: 'absolute',
              left: `${f.x}%`,
              top: '30%',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: f.kind === 'crit' ? 20 : 14,
              color: f.kind === 'heal' ? '#4ade80' : f.kind === 'crit' ? '#facc15' : '#f85252',
              pointerEvents: 'none',
            }}
          >
            {f.text}
          </div>
        ))}

        {showCountdown && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(5,6,10,0.75)',
            }}
          >
            <Countdown n={count} />
          </div>
        )}

        {snapshot.paused && !showCountdown && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(5,6,10,0.85)',
            }}
          >
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: '#f5f7ff' }}>PAUSED</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <PixelButton variant="primary" small onClick={() => setPaused(false)}>
                RESUME
              </PixelButton>
              <PixelButton variant="danger" small onClick={onQuit}>
                QUIT
              </PixelButton>
            </div>
          </div>
        )}
      </div>

      <TypingArea typed={snapshot.text.typed} current={snapshot.text.current} rest={snapshot.text.rest} mistake={snapshot.text.mistake} />

      {snapshot.passageTime && (
        <div style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#f85252' }}>
          Hurry! {Math.max(0, snapshot.passageTime.left).toFixed(1)}s before {snapshot.enemy.name} strikes
        </div>
      )}
    </div>
  );
}
