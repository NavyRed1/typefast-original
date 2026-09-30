import React from 'react';
import type { SaveData } from '../data/save';
import { ProfileView } from '../components/ProfileView';
import { Leaderboard } from '../components/Leaderboard';
import { PixelButton } from '../components/PixelButton';

export function ProfileScreen({ save, onBack }: { save: SaveData; onBack: () => void }) {
  return (
    <div className="pixel-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 560, maxHeight: '80vh', overflowY: 'auto' }}>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 18, color: '#f5f7ff' }}>PROFILE</div>
      <ProfileView save={save} />
      <div>
        <div style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: '#a7aec4', marginBottom: 8 }}>Records</div>
        <Leaderboard save={save} />
      </div>
      <PixelButton onClick={onBack}>BACK</PixelButton>
    </div>
  );
}
