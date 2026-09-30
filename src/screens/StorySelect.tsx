import React, { useState } from 'react';
import type { SaveData } from '../data/save';
import type { AreaId, Difficulty } from '../core/types';
import { AREA_IDS, DIFFICULTIES } from '../core/types';
import { AREA_BOSS, bossName } from '../core/enemies';
import { PixelButton } from '../components/PixelButton';

const AREA_LABEL: Record<AreaId, string> = {
  village: 'Village',
  forest: 'Forest',
  cave: 'Crystal Cave',
  volcano: 'Volcano',
  cyber: 'Cyber City',
  castle: 'Shadow Castle',
};

export function StorySelect({
  save,
  onStart,
  onBack,
}: {
  save: SaveData;
  onStart: (area: AreaId, difficulty: Difficulty) => void;
  onBack: () => void;
}) {
  const [difficulty, setDifficulty] = useState<Difficulty>(save.settings.difficulty);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 640 }}>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 20, color: '#f5f7ff' }}>STORY</div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: "'VT323', monospace", fontSize: 16 }}>
        <span style={{ color: '#a7aec4' }}>Difficulty:</span>
        {DIFFICULTIES.map((d) => (
          <PixelButton key={d} small variant={d === difficulty ? 'primary' : 'default'} onClick={() => setDifficulty(d)}>
            {d.toUpperCase()}
          </PixelButton>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {AREA_IDS.map((area, i) => {
          const unlocked = i <= save.story.unlocked;
          const cleared = save.story.cleared.includes(area);
          return (
            <button
              key={area}
              disabled={!unlocked}
              onClick={() => unlocked && onStart(area, difficulty)}
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: 18,
                textAlign: 'left',
                background: cleared ? '#12241b' : '#121520',
                border: `2px solid ${cleared ? '#4ade80' : unlocked ? '#2a3042' : '#1b1f2e'}`,
                boxShadow: unlocked ? '4px 4px 0 #05060a' : 'none',
                color: unlocked ? '#f5f7ff' : '#626a80',
                padding: 14,
                cursor: unlocked ? 'pointer' : 'not-allowed',
              }}
            >
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, marginBottom: 6 }}>
                {AREA_LABEL[area]} {cleared ? '✓' : unlocked ? '' : '🔒'}
              </div>
              <div style={{ color: '#a7aec4', fontSize: 15 }}>Boss: {bossName(AREA_BOSS[area])}</div>
            </button>
          );
        })}
      </div>

      <PixelButton onClick={onBack} small>
        BACK
      </PixelButton>
    </div>
  );
}
