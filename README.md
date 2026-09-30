# TypeQuest

A pixel-art typing RPG. Your keyboard is your sword — every battle is fought
by typing the passage on screen, and your speed, accuracy and combo decide
how hard you hit.

Built with React + TypeScript + Vite + Tailwind. No backend required; all
progress is saved locally in the browser.

## Quick start

```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # production build -> dist/
npm run preview   # preview the production build locally
npm run typecheck # tsc --noEmit
npm run sim       # headless simulation of the battle/combo/typing logic
```

> **A note on this build environment.** This project was assembled in a
> sandboxed container with no network access, so `npm install` could not be
> run here to produce a verified `dist/` build. Every `.ts`/`.tsx` file was
> instead type-checked locally with `tsc --noEmit` against a small hand-written
> React type shim (since `@types/react` also couldn't be fetched), and the
> core game logic (`BattleManager`, `ComboSystem`, `TypingEngine`, the mode
> builders, and the daily-streak recorder) was exercised end-to-end with
> `npm run sim`, a headless simulation that plays out full battles with
> synthetic "perfect" and "sloppy" typists. The shim is not part of this
> deliverable — once you run `npm install`, the real `@types/react` takes
> over and the project builds and runs normally with `npm run dev` / `build`.

## Controls

- **Type** the highlighted passage — correct characters advance you and
  charge your combo; a wrong key is flagged immediately but never blocks
  progress, so you always correct and keep going.
- **Backspace** — fix a mistake.
- **Escape** — pause / resume during a battle.
- **Enter** — confirm on menus (native browser button focus/click handles this).

## Modes

- **Story** — six areas (Village → Forest → Crystal Cave → Volcano → Cyber
  City → Shadow Castle), each ending in a named mini-boss and a unique area
  boss with multi-phase attacks and spell-casting interrupts.
- **Versus** — race an AI opponent on identical text, split-lane progress,
  instant rematch. (Local pass-and-play with a second human racer is a
  natural next step — see "What's next" below.)
- **Time Attack** — 15/30/60/120s score-attack, no counter-damage.
- **Survival** — escalating waves, a boss every fifth wave.
- **Boss Rush** — all six area bosses back to back.
- **Daily Challenge** — the same three passages for every player each day
  (seeded deterministically from the date), with streak tracking.

Leveling up (from any mode) unlocks **cosmetics only** — characters,
outfits, weapons, titles, visual effects, UI themes. It never changes
difficulty or combat numbers; skill is always what wins a fight.

## Architecture

```
src/
  core/          Pure game logic — no React, no DOM. Fully unit-testable
                  via `npm run sim`.
    types.ts       Shared IDs and enums (Difficulty, AreaId, EnemyKind, ...)
    rng.ts         Seeded PRNG (mulberry32) + date helpers for daily determinism
    events.ts      Typed event bus (keyCorrect, comboMilestone, playerDamage, ...)
                    — the seam an audio layer would subscribe to
    typing.ts      TypingEngine: input state machine, WPM/accuracy/combo stats
    combo.ts       ComboSystem: milestones, damage/speed/score multipliers
    texts.ts       Passage generation (words/sentences/paragraphs/punctuation/
                    symbols/numbers/spells) per difficulty and style
    enemies.ts     Enemy/boss factories, per-area mini-boss and boss tables,
                    multi-phase boss definitions
    battle.ts      BattleManager — the core battle loop: spawning, damage,
                    combo milestones, boss phases, spell-cast interrupts,
                    win/lose conditions
    progression.ts XP curve, cosmetic unlock tables, achievements,
                    recordBattle/recordVersus (the only place SaveData is
                    mutated as a result of playing)
    modes.ts       Builds a BattleConfig for each mode (Story/Time Attack/
                    Survival/Boss Rush/Daily) — keeps spawn rules out of the UI

  data/
    save.ts        SaveData shape + createDefaultSave/migrateSave. This is
                    the seam a future Supabase/Firebase backend would replace
                    — nothing above this file talks to localStorage directly.

  hooks/
    useSave.ts          Loads/persists SaveData to localStorage
    useBattleManager.ts Wraps a BattleManager in a requestAnimationFrame loop,
                        turns its event-bus emissions into floating damage
                        numbers / screen shake / hit-flash React state
    useKeyboardInput.ts Routes keydown events to the active typing engine

  render/
    sprites.tsx    Hand-authored pixel sprites (player classes, enemy kinds,
                    all 6 bosses) rendered via a single-element CSS
                    box-shadow "pixel grid" — no raster image assets, so
                    there's nothing to fetch or bundle and every edge is
                    pixel-hard at any scale.

  components/      Reusable UI: PixelButton, HealthBar, ComboMeter,
                    ProgressBar, TypingArea, Player, Enemy, GameHUD,
                    DialogueBox, ResultScreen, Leaderboard, ProfileView

  screens/          MainMenu, StorySelect, ModeSetup (shared setup for the
                    four non-story combat modes), BattleScreen (the live
                    fight), VersusScreen, ProfileScreen, SettingsScreen

  App.tsx           Screen-state machine tying it all together
  main.tsx          Entry point
```

**Why the game logic lives entirely outside React:** `BattleManager`,
`ComboSystem`, `TypingEngine` and the mode builders have zero dependency on
React or the DOM. `useBattleManager` is the only place a `BattleManager`
instance touches React state, via a `requestAnimationFrame` loop plus an
event bus. That's what makes `npm run sim` possible — the entire combat
system can be played out and asserted against in plain Node, without a
browser, a build step, or a single React render.

**Why sprites are CSS, not images:** each sprite is a small grid of palette
characters (see `src/render/sprites.tsx`) rendered as one `<div>` with a
computed `box-shadow` — one shadow per opaque pixel. This keeps the whole
game self-contained (no asset pipeline, nothing to fetch), scales losslessly,
and keeps every edge exactly as crisp as the design spec calls for.

## Deployment

The project is a static Vite app and is Vercel/GitHub-ready out of the box:

```bash
npm run build   # outputs to dist/
```

- `vercel.json` is already configured (framework: vite, build command,
  output directory, and cache headers for `/assets/`) — connect the repo to
  Vercel and it will build and deploy with no extra configuration.
- For GitHub Pages or any other static host, `vite.config.ts` uses a
  relative `base: './'` so `dist/` works from any subpath.

## What's next

- Real local 2-player Versus (a second configurable input lane) rather than
  AI-only.
- An audio layer subscribing to `core/events.ts` (the event names — 
  `keyCorrect`, `comboMilestone`, `criticalHit`, `playerDamage`, `levelUp`,
  `victory`, `defeat`, etc. — are already emitted; nothing currently plays
  a sound).
- Swap `src/hooks/useSave.ts`'s localStorage read/write for a Supabase or
  Firebase-backed implementation — `SaveData` (see `src/data/save.ts`) was
  designed as the full seam, so nothing else in the app needs to change to
  add accounts, cloud saves, or online leaderboards.
