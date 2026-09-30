import { useCallback, useEffect, useRef, useState } from 'react';
import { createDefaultSave, migrateSave, type SaveData } from '../data/save';

const STORAGE_KEY = 'typequest.save.v1';

/**
 * Local persistence today; the read/write surface below (load/save) is the
 * seam a future Supabase/Firebase-backed implementation would replace —
 * everything above this hook only ever talks to `SaveData` objects.
 */
function loadFromDisk(reducedMotion: boolean): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSave(reducedMotion);
    return migrateSave(JSON.parse(raw), reducedMotion);
  } catch {
    return createDefaultSave(reducedMotion);
  }
}

function writeToDisk(save: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch {
    // Storage may be unavailable (private browsing, quota) — game still runs,
    // it just won't persist between sessions.
  }
}

export interface UseSave {
  save: SaveData;
  /** Replace the whole save (used after recordBattle/recordVersus/awardXp). */
  setSave: (next: SaveData | ((prev: SaveData) => SaveData)) => void;
  resetSave: () => void;
}

export function useSave(): UseSave {
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const [save, setSaveState] = useState<SaveData>(() => loadFromDisk(prefersReducedMotion));
  const pending = useRef<SaveData | null>(null);

  const setSave = useCallback((next: SaveData | ((prev: SaveData) => SaveData)) => {
    setSaveState((prev) => {
      const resolved = typeof next === 'function' ? (next as (p: SaveData) => SaveData)(prev) : next;
      pending.current = resolved;
      return resolved;
    });
  }, []);

  useEffect(() => {
    if (pending.current) {
      writeToDisk(pending.current);
      pending.current = null;
    } else {
      writeToDisk(save);
    }
  }, [save]);

  const resetSave = useCallback(() => {
    const fresh = createDefaultSave(prefersReducedMotion);
    setSaveState(fresh);
    writeToDisk(fresh);
  }, [prefersReducedMotion]);

  return { save, setSave, resetSave };
}
