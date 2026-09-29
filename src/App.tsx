import React, { useCallback, useState } from 'react';
import { useSave } from './hooks/useSave';
import type { AreaId, BattleKind, Difficulty } from './core/types';
import type { BattleConfig, BattleResult } from './core/battle';
import type { RecordSummary } from './core/progression';
import { recordBattle, recordVersus, markAreaCleared } from './core/progression';
import { storyBattleConfig, timeAttackConfig, survivalConfig, bossRushConfig, dailyBattleConfig } from './core/modes';
import { MainMenu, type MenuTarget } from './screens/MainMenu';
import { StorySelect } from './screens/StorySelect';
import { ModeSetup, type QuickMode } from './screens/ModeSetup';
import { BattleScreen } from './screens/BattleScreen';
import { VersusScreen } from './screens/VersusScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ResultScreen } from './components/ResultScreen';
import { PixelButton } from './components/PixelButton';

interface Recipe {
  mode: BattleKind;
  area?: AreaId;
  difficulty: Difficulty;
  seconds?: number;
}

type Screen =
  | { n: 'menu' }
  | { n: 'storySelect' }
  | { n: 'setup'; mode: QuickMode }
  | { n: 'battle'; recipe: Recipe; config: BattleConfig; runId: number }
  | { n: 'result'; result: BattleResult; summary: RecordSummary; recipe: Recipe }
  | { n: 'versusSetup' }
  | { n: 'versus'; difficulty: Difficulty; runId: number }
  | { n: 'profile' }
  | { n: 'settings' };

function buildConfig(recipe: Recipe, seed: number): BattleConfig {
  switch (recipe.mode) {
    case 'story':
      return storyBattleConfig(recipe.area!, recipe.difficulty, seed);
    case 'timeattack':
      return timeAttackConfig(recipe.difficulty, recipe.seconds ?? 30, seed);
    case 'survival':
      return survivalConfig(recipe.difficulty, seed);
    case 'bossrush':
      return bossRushConfig(recipe.difficulty, seed);
    case 'daily':
      return dailyBattleConfig(recipe.difficulty).config;
  }
}

export default function App() {
  const { save, setSave, resetSave } = useSave();
  const [screen, setScreen] = useState<Screen>({ n: 'menu' });
  const [runId, setRunId] = useState(0);

  const goMenu = useCallback(() => setScreen({ n: 'menu' }), []);

  const onMenuSelect = useCallback((target: MenuTarget) => {
    if (target === 'story') return setScreen({ n: 'storySelect' });
    if (target === 'versus') return setScreen({ n: 'versusSetup' });
    if (target === 'profile') return setScreen({ n: 'profile' });
    if (target === 'settings') return setScreen({ n: 'settings' });
    setScreen({ n: 'setup', mode: target });
  }, []);

  const startRecipe = useCallback(
    (recipe: Recipe) => {
      const id = runId + 1;
      setRunId(id);
      setScreen({ n: 'battle', recipe, config: buildConfig(recipe, Date.now() ^ id), runId: id });
    },
    [runId],
  );

  const onBattleFinish = useCallback(
    (result: BattleResult, recipe: Recipe) => {
      let { save: next, summary } = recordBattle(save, result, Date.now());
      if (recipe.mode === 'story' && recipe.area && result.outcome === 'victory' && result.bossesDefeated >= 1) {
        const areaRes = markAreaCleared(next, recipe.area, Date.now());
        next = areaRes.save;
        summary = {
          xpGained: summary.xpGained + areaRes.summary.xpGained,
          xpBefore: summary.xpBefore,
          xpAfter: areaRes.summary.xpAfter,
          levelBefore: summary.levelBefore,
          levelAfter: areaRes.summary.levelAfter,
          newAchievements: [...summary.newAchievements, ...areaRes.summary.newAchievements],
          unlocks: [...summary.unlocks, ...areaRes.summary.unlocks],
          bests: summary.bests,
        };
      }
      setSave(next);
      setScreen({ n: 'result', result, summary, recipe });
    },
    [save, setSave],
  );

  const onVersusFinish = useCallback(
    (won: boolean, wpm: number, accuracy: number) => {
      const { save: next } = recordVersus(
        save,
        { won, wpm, accuracy, maxCombo: 0, correctChars: Math.round(wpm), keystrokes: Math.round(wpm), mode: 'versus' },
        Date.now(),
      );
      setSave(next);
    },
    [save, setSave],
  );

  let body: React.ReactNode;
  switch (screen.n) {
    case 'menu':
      body = <MainMenu save={save} onSelect={onMenuSelect} />;
      break;

    case 'storySelect':
      body = <StorySelect save={save} onBack={goMenu} onStart={(area, difficulty) => startRecipe({ mode: 'story', area, difficulty })} />;
      break;

    case 'setup':
      body = (
        <ModeSetup
          mode={screen.mode}
          save={save}
          onBack={goMenu}
          onStart={(difficulty, seconds) => startRecipe({ mode: screen.mode, difficulty, seconds })}
        />
      );
      break;

    case 'battle':
      body = (
        <BattleScreen
          key={screen.runId}
          config={screen.config}
          character={save.loadout.character}
          onFinish={(result) => onBattleFinish(result, screen.recipe)}
          onQuit={goMenu}
        />
      );
      break;

    case 'result':
      body = (
        <ResultScreen
          result={screen.result}
          summary={screen.summary}
          onMenu={goMenu}
          onRetry={screen.recipe.mode === 'daily' ? undefined : () => startRecipe(screen.recipe)}
          onContinue={screen.recipe.mode === 'story' ? () => setScreen({ n: 'storySelect' }) : undefined}
          continueLabel="MAP"
        />
      );
      break;

    case 'versusSetup':
      body = (
        <VersusSetup
          defaultDifficulty={save.settings.difficulty}
          onBack={goMenu}
          onStart={(difficulty) => {
            const id = runId + 1;
            setRunId(id);
            setScreen({ n: 'versus', difficulty, runId: id });
          }}
        />
      );
      break;

    case 'versus':
      body = (
        <VersusScreen
          key={screen.runId}
          difficulty={screen.difficulty}
          character={save.loadout.character}
          runId={screen.runId}
          onFinish={onVersusFinish}
          onRematch={() => setScreen({ n: 'versus', difficulty: screen.difficulty, runId: runId + 1 })}
          onExit={goMenu}
        />
      );
      break;

    case 'profile':
      body = <ProfileScreen save={save} onBack={goMenu} />;
      break;

    case 'settings':
      body = <SettingsScreen save={save} onChange={setSave} onBack={goMenu} onResetSave={resetSave} />;
      break;
  }

  return (
    <div
      className={save.settings.reducedMotion ? 'reduced-motion' : undefined}
      style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'radial-gradient(circle at 50% 0%, #121520 0%, #05060a 70%)',
      }}
    >
      {body}
    </div>
  );
}

// Small inline setup screen for Versus — difficulty only (AI skill level is
// chosen inside VersusScreen itself, right before the countdown).
function VersusSetup({
  defaultDifficulty,
  onBack,
  onStart,
}: {
  defaultDifficulty: Difficulty;
  onBack: () => void;
  onStart: (d: Difficulty) => void;
}) {
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDifficulty);
  const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', maxWidth: 480 }}>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: '#f5f7ff' }}>VERSUS</div>
      <p style={{ fontFamily: "'VT323', monospace", fontSize: 18, color: '#a7aec4', margin: 0 }}>
        Race an AI opponent on identical text. Local pass-and-play with a second racer is a natural next step once the
        game ships with configurable input lanes.
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: "'VT323', monospace", fontSize: 16 }}>
        <span style={{ color: '#a7aec4' }}>Difficulty:</span>
        {DIFFICULTIES.map((d) => (
          <PixelButton key={d} small variant={d === difficulty ? 'primary' : 'default'} onClick={() => setDifficulty(d)}>
            {d.toUpperCase()}
          </PixelButton>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <PixelButton variant="primary" onClick={() => onStart(difficulty)}>
          START
        </PixelButton>
        <PixelButton onClick={onBack}>BACK</PixelButton>
      </div>
    </div>
  );
}
