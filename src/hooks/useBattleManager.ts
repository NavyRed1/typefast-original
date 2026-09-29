import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { BattleManager, type BattleConfig } from '../core/battle';
import { bus } from '../core/events';

export interface Floater {
  id: number;
  text: string;
  kind: 'damage' | 'crit' | 'heal';
  x: number;
}

let floaterId = 0;

export function useBattleManager(config: BattleConfig) {
  // Config identity is expected to be stable for the lifetime of one battle
  // (callers key their component with a runId so a fresh instance is made
  // per attempt rather than mutated mid-fight).
  const battle = useMemo(() => new BattleManager(config), [config]);
  const [, bump] = useReducer((x: number) => x + 1, 0);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [playerShake, setPlayerShake] = useState(0);
  const [enemyHit, setEnemyHit] = useState(0);
  const [playerHit, setPlayerHit] = useState(0);

  const addFloater = useCallback((text: string, kind: Floater['kind']) => {
    const id = ++floaterId;
    setFloaters((f) => [...f, { id, text, kind, x: 30 + Math.random() * 40 }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 700);
  }, []);

  useEffect(() => {
    const offs = [
      bus.on('enemyDamage', (p) => {
        addFloater(`-${Math.round(p.amount)}`, p.crit || p.special ? 'crit' : 'damage');
        setEnemyHit((n) => n + 1);
      }),
      bus.on('playerDamage', (p) => {
        addFloater(`-${Math.round(p.amount)}`, 'damage');
        setPlayerShake((n) => n + 1);
        setPlayerHit((n) => n + 1);
      }),
      bus.on('playerHeal', (p) => {
        addFloater(`+${Math.round(p.amount)}`, 'heal');
      }),
    ];
    return () => offs.forEach((f) => f());
  }, [addFloater]);

  useEffect(() => {
    if (playerHit === 0) return;
    const t = setTimeout(() => setPlayerHit(0), 200);
    return () => clearTimeout(t);
  }, [playerHit]);
  useEffect(() => {
    if (enemyHit === 0) return;
    const t = setTimeout(() => setEnemyHit(0), 200);
    return () => clearTimeout(t);
  }, [enemyHit]);
  useEffect(() => {
    if (playerShake === 0) return;
    const t = setTimeout(() => setPlayerShake(0), 280);
    return () => clearTimeout(t);
  }, [playerShake]);

  useEffect(() => {
    battle.start();
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.25);
      last = t;
      battle.update(dt);
      bump(0);
      if (battle.state === 'fighting') raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle]);

  const handleChar = useCallback(
    (ch: string) => {
      battle.handleChar(ch);
      bump(0);
    },
    [battle],
  );
  const backspace = useCallback(() => {
    battle.backspace();
    bump(0);
  }, [battle]);
  const setPaused = useCallback(
    (p: boolean) => {
      battle.paused = p;
      bump(0);
    },
    [battle],
  );

  const lastVersion = useRef(-1);
  const snapshot = battle.snapshot();
  lastVersion.current = snapshot.version;

  return { battle, snapshot, handleChar, backspace, setPaused, floaters, playerShake: playerShake > 0, enemyHit: enemyHit > 0, playerHit: playerHit > 0 };
}
