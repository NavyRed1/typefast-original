/**
 * Headless sanity simulation for TypeQuest core logic.
 * Runs without a browser/build — validates BattleManager, ComboSystem,
 * TypingEngine and progression against synthetic "perfect typist" and
 * "sloppy typist" inputs. Run with: npm run sim
 */
import { BattleManager } from '../src/core/battle';
import { createEnemy } from '../src/core/enemies';
import { recordBattle } from '../src/core/progression';
import { createDefaultSave } from '../src/data/save';
import { Rng } from '../src/core/rng';
import { ComboSystem } from '../src/core/combo';
import { TypingEngine } from '../src/core/typing';

function typeCurrentPassage(battle: BattleManager, mistakeRate: number, rng: Rng) {
  // Types the engine's current remaining text, occasionally fumbling a
  // wrong key first (then correcting it) to exercise the mistake path.
  const snap = battle.snapshot();
  const text = snap.text.current + snap.text.rest;
  for (const ch of text) {
    if (battle.state !== 'fighting') return;
    if (mistakeRate > 0 && rng.chance(mistakeRate)) {
      const wrong = ch === 'z' ? 'x' : 'z';
      battle.handleChar(wrong);
      battle.backspace();
    }
    battle.handleChar(ch);
  }
}

function runBattle(label: string, mistakeRate: number, seed: number) {
  const rng = new Rng(seed);
  const battle = new BattleManager({
    kind: 'story',
    label,
    difficulty: 'medium',
    areaId: 'village',
    seed,
    maxHp: 100,
    enemyAttacks: true,
    healOnKill: 0,
    totalEnemies: 2,
    nextEnemy: (index) => {
      if (index === 0) return createEnemy('slime', { difficulty: 'medium', areaIndex: 0 });
      if (index === 1) return createEnemy('goblin', { difficulty: 'medium', areaIndex: 0 });
      return null;
    },
  });

  let ticks = 0;
  while (battle.state === 'fighting' && ticks < 5000) {
    typeCurrentPassage(battle, mistakeRate, rng);
    battle.update(0.25);
    ticks++;
  }

  console.log(`\n=== ${label} (ticks: ${ticks}) ===`);
  if (battle.state === 'fighting') {
    console.log('FAILED: battle did not conclude within tick budget');
    return false;
  }

  const result = battle.result();
  console.log(JSON.stringify(result, null, 2));

  const save = createDefaultSave(false);
  const { save: next, summary } = recordBattle(save, result, Date.now());
  console.log('Progression summary:', JSON.stringify(summary, null, 2));
  console.log('Save XP after:', next.totalXp);
  return true;
}

let ok = true;
ok = runBattle('Perfect typist vs Village enemies', 0, 1) && ok;
ok = runBattle('Sloppy typist (15% mistakes) vs Village enemies', 0.15, 2) && ok;

// --- ComboSystem micro-checks -------------------------------------------
{
  const combo = new ComboSystem();
  for (let i = 0; i < 30; i++) combo.hit();
  console.assert(combo.value === 30, 'combo should reach 30, got ' + combo.value);
  console.assert(combo.tier() === 2, 'tier should be 2 (10 & 25 milestones), got ' + combo.tier());
  const beforeMedium = combo.value;
  combo.miss('medium');
  console.assert(combo.value === Math.floor(beforeMedium * 0.5), 'medium miss should keep 50%, got ' + combo.value);
  combo.miss('hard', true);
  console.assert(combo.value === 0, 'forceReset miss should fully reset combo, got ' + combo.value);
  console.log('\nComboSystem checks passed.');
}

// --- TypingEngine micro-checks ------------------------------------------
{
  const engine = new TypingEngine();
  engine.setText('hello world');
  for (const ch of 'hello world') engine.input(ch);
  console.assert(engine.progress() === 1, 'typing engine should report full progress');
  console.assert(engine.errors === 0, 'no errors expected on clean input');
  const seg = engine.segments();
  console.log('TypingEngine checks passed. segments:', seg.length, 'accuracy:', engine.accuracy());

  // mistake + correction path
  const e2 = new TypingEngine();
  e2.setText('cat');
  const wrong = e2.input('x');
  console.assert(wrong.kind === 'wrong', 'wrong char should be flagged as wrong');
  console.assert(e2.index === 0, 'index should not advance on wrong key');
  e2.input('c');
  e2.input('a');
  e2.input('t');
  console.assert(e2.progress() === 1, 'should complete after correcting mistake');
  console.log('Mistake/correction path checks passed. errors:', e2.errors);
}

console.log(ok ? '\nAll simulations completed successfully.' : '\nSome simulations FAILED.');
if (!ok) throw new Error('sim.ts: one or more simulations failed (see log above)');

// --- Mode config builders + Daily streak recording -----------------------
import { dailyBattleConfig, timeAttackConfig, survivalConfig, bossRushConfig, storyBattleConfig } from '../src/core/modes';

{
  const { key, config } = dailyBattleConfig('medium', new Date('2026-09-22T12:00:00Z'));
  const battle = new BattleManager(config);
  const drng = new Rng(99);
  let ticks = 0;
  while (battle.state === 'fighting' && ticks < 3000) {
    typeCurrentPassage(battle, 0, drng);
    battle.update(0.25);
    ticks++;
  }
  console.log(`\n=== Daily Challenge (${key}, outcome: ${battle.state}) ===`);
  const result = battle.result();
  let save = createDefaultSave(false);
  const rec = recordBattle(save, result, Date.parse('2026-09-22T12:00:00Z'));
  console.assert(!!rec.save.daily[key], 'daily record should be saved for outcome ' + result.outcome);
  console.assert(rec.save.streak.current === 1, 'streak should be 1 after first daily attempt, got ' + rec.save.streak.current);
  console.log('Daily streak after first play:', rec.save.streak.current, '- recorded:', !!rec.save.daily[key]);
}

// Smoke-test the other mode builders compile and produce a fightable config.
for (const [label, cfg] of [
  ['timeAttack', timeAttackConfig('easy', 15, 5)],
  ['survival', survivalConfig('medium', 6)],
  ['bossRush', bossRushConfig('hard', 7)],
  ['story:forest', storyBattleConfig('forest', 'medium', 8)],
] as const) {
  const b = new BattleManager(cfg);
  const snap = b.snapshot();
  console.assert(snap.text.length > 0, `${label}: should generate a non-empty first passage`);
  console.log(`${label} config OK — first enemy: ${snap.enemy.name}, passage length: ${snap.text.length}`);
}

console.log('\nMode-builder smoke tests complete.');
