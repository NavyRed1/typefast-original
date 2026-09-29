export type KeyResult =
  | { kind: 'ignored' }
  | { kind: 'wrong'; expected: string; typed: string; repeat: boolean }
  | {
      kind: 'correct';
      char: string;
      wordComplete: boolean;
      wordLength: number;
      perfectWord: boolean;
      passageComplete: boolean;
    };

export interface Segment {
  text: string;
  flagged: boolean;
}

/**
 * Pure typing state machine. A wrong key never advances the cursor; it marks
 * the current character as a mistake (shown immediately by the UI) and the
 * player simply types the right key to continue. Backspace clears the marker.
 */
export class TypingEngine {
  text = '';
  index = 0;
  mistake: { expected: string; typed: string } | null = null;
  readonly flagged = new Set<number>();

  correct = 0;
  errors = 0;
  keystrokes = 0;
  activeSec = 0;
  started = false;

  private wordStart = 0;
  private wordErrors = 0;
  private stamps: number[] = [];

  setText(t: string): void {
    this.text = t;
    this.index = 0;
    this.mistake = null;
    this.flagged.clear();
    this.wordStart = 0;
    this.wordErrors = 0;
  }

  /** Reset cumulative stats (used between attempts). */
  resetStats(): void {
    this.correct = 0;
    this.errors = 0;
    this.keystrokes = 0;
    this.activeSec = 0;
    this.started = false;
    this.stamps = [];
  }

  tick(dt: number): void {
    if (this.started) this.activeSec += dt;
  }

  input(ch: string): KeyResult {
    if (ch.length !== 1 || !this.text || this.index >= this.text.length) return { kind: 'ignored' };
    this.started = true;
    this.keystrokes++;
    const expected = this.text[this.index];
    if (ch !== expected) {
      this.errors++;
      this.wordErrors++;
      this.flagged.add(this.index);
      const repeat = this.mistake !== null;
      this.mistake = { expected, typed: ch };
      return { kind: 'wrong', expected, typed: ch, repeat };
    }
    this.correct++;
    this.mistake = null;
    this.stamps.push(this.activeSec);
    if (this.stamps.length > 40) this.stamps.shift();
    this.index++;
    const passageComplete = this.index >= this.text.length;
    const wordComplete = ch === ' ' || passageComplete;
    let wordLength = 0;
    let perfectWord = false;
    if (wordComplete) {
      wordLength = this.index - this.wordStart - (ch === ' ' ? 1 : 0);
      perfectWord = this.wordErrors === 0;
      this.wordStart = this.index;
      this.wordErrors = 0;
    }
    return { kind: 'correct', char: ch, wordComplete, wordLength, perfectWord, passageComplete };
  }

  clearMistake(): void {
    this.mistake = null;
  }

  /** Characters per second over roughly the last two seconds. */
  cps(): number {
    const now = this.activeSec;
    let n = 0;
    for (let i = this.stamps.length - 1; i >= 0; i--) {
      if (now - this.stamps[i] <= 2) n++;
      else break;
    }
    return n / Math.min(2, Math.max(now, 1));
  }

  wpm(): number {
    if (!this.started || this.correct === 0) return 0;
    return this.correct / 5 / (Math.max(this.activeSec, 2) / 60);
  }

  rawWpm(): number {
    if (!this.started || this.keystrokes === 0) return 0;
    return this.keystrokes / 5 / (Math.max(this.activeSec, 2) / 60);
  }

  accuracy(): number {
    return this.keystrokes === 0 ? 1 : this.correct / this.keystrokes;
  }

  progress(): number {
    return this.text.length === 0 ? 0 : this.index / this.text.length;
  }

  /** Typed portion split into runs so corrected mistakes stay subtly marked. */
  segments(): Segment[] {
    const out: Segment[] = [];
    for (let i = 0; i < this.index; i++) {
      const f = this.flagged.has(i);
      const last = out[out.length - 1];
      if (last && last.flagged === f) last.text += this.text[i];
      else out.push({ text: this.text[i], flagged: f });
    }
    return out;
  }
}
