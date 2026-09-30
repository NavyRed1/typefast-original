import { useEffect } from 'react';

export function useKeyboardInput(opts: {
  enabled: boolean;
  onChar: (ch: string) => void;
  onBackspace: () => void;
  onEscape?: () => void;
}) {
  const { enabled, onChar, onBackspace, onEscape } = opts;
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') {
        onEscape?.();
        e.preventDefault();
        return;
      }
      if (e.key === 'Backspace') {
        onBackspace();
        e.preventDefault();
        return;
      }
      if (e.key.length === 1) {
        onChar(e.key);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, onChar, onBackspace, onEscape]);
}
