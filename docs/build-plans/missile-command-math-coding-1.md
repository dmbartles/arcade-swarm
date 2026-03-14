# Build Plan — Missile Command Math — Coding Agent 1 (Game Engine)

## Role Summary
You are responsible for the game engine layer: all Phaser scenes, the global config files every other agent imports, asset loading/registration, the HUD rendering layer, visual effects systems, and the top-level game bootstrap. You do **not** implement game entities, the math engine, or scoring logic — those belong to Coding Agents 2 and 3. You wire everything together through Phaser's event bus.

---

## 1. Files to Create

All paths are relative to the repo root. Your worktree is checked out at `games/missile-command-math/`.

```
games/missile-command-math/src/config/gameConfig.ts
games/missile-command-math/src/config/levelConfig.ts
games/missile-command-math/src/config/styleConfig.ts
games/missile-command-math/src/config/scoreConfig.ts
games/missile-command-math/src/scenes/BootScene.ts
games/missile-command-math/src/scenes/MenuScene.ts
games/missile-command-math/src/scenes/InterstitialScene.ts
games/missile-command-math/src/scenes/TrainingScene.ts
games/missile-command-math/src/scenes/GameScene.ts
games/missile-command-math/src/scenes/LevelCompleteScene.ts
games/missile-command-math/src/scenes/GameOverScene.ts
games/missile-command-math/src/scenes/VictoryScene.ts
games/missile-command-math/src/systems/EffectsSystem.ts
games/missile-command-math/src/systems/HUDSystem.ts
games/missile-command-math/src/main.ts
```

---

## 2. Class and Interface Definitions

### 2.1 `src/config/gameConfig.ts`

This is a **plain constant export file** — no class. Every other agent imports from here.

```typescript
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 854;
export const SAFE_MARGIN = 12;

// HUD dimensions
export const HUD_HEIGHT = 48;
export const PLAY_FIELD_TOP = 48;      // Y where the play field starts
export const PLAY_FIELD_BOTTOM = 708;  // Y where city row bottom ends
export const QUEUE_STRIP_Y = 782;      // Y origin of the answer queue strip
export const QUEUE_STRIP_HEIGHT = 72;

// Launcher position
export const LAUNCHER_X = 240;         // center-bottom anchor X
export const LAUNCHER_Y = 730;

// City layout — two rows of 3
export const CITY_ROW_TOP_Y = 60;
export const CITY_ROW_BOTTOM_Y = 580;
export const CITY_X_POSITIONS = [12, 192, 372] as const;  // shared by both rows

// Queue slot layout
export const QUEUE_SLOT_0_X = 30;      // loaded slot X center
export const QUEUE_SLOT_SPACING = 76;  // px between slot centers
export const QUEUE_SLOT_Y = 787;       // Y center of all slots
export const QUEUE_SLOT_SIZE = 60;     // width & height (WCAG 2.5.8 touch target)

// Touch target sizes
export const MIN_TOUCH_TARGET = 60;

// Explosion radii (px)
export const EXPLOSION_RADIUS_PLAYER = 80;
export const EXPLOSION_RADIUS_CHAIN = 60;
export const EXPLOSION_RADIUS_CITY = 64;

// Chain reaction
export const CHAIN_REACTION_RADIUS = 60;

// MIRV
export const MIRV_SPLIT_ALTITUDE_PERCENT = 40; // % of play field height

// City hit points
export const CITY_HIT_POINTS = 3;

// Wave timing
export const WAVE_SPAWN_INTERVAL_BASE_MS = 3000; // ms between spawns at Level 1 Normal

// Score pop
export const SCORE_POP_RISE_PX = 60;
export const SCORE_POP_DURATION_MS = 800;

// Queue animation
export const QUEUE_ADVANCE_DURATION_MS = 120;

// Training
export const TRAINING_MISSILE_SPEED_MULTIPLIER = 0.3;

// Badge display
export const BADGE_HOLD_MS = 400;
export const BADGE_INTRO_MS = 300;

// City one-liner display duration
export const CITY_ONELINER_DURATION_MS = 2000;

// Teletype reveal speed
export const TELETYPE_CHAR_DELAY_MS = 40;
export const TELETYPE_CURSOR_BLINK_MS = 500;

// Interstitial button
export const TAP_TO_LAUNCH_BUTTON_X = 90;
export const TAP_TO_LAUNCH_BUTTON_Y = 720;
export const TAP_TO_LAUNCH_BUTTON_W = 300;
export const TAP_TO_LAUNCH_BUTTON_H = 60;

// Phaser game config target FPS
export const TARGET_FPS = 60;
```

---

### 2.2 `src/config/levelConfig.ts`

Plain constant export. Implements data from the GDD Level Progression table. Coding Agent 3's `DifficultyManager` imports this.

```typescript
import type { ILevelConfig } from '../types/IDifficultyConfig';

/** Complete per-level configuration for all 10 levels. Index 0 = Level 1. */
export const LEVEL_CONFIGS: ILevelConfig[] = [
  {
    level: 1, year: 1981,
    mathTypes: ['addition', 'subtraction'],
    maxSimultaneousThreats: 2, bomberEnabled: false, paratrooperEnabled: false, mirvEnabled: false,
    baseSpeedMultiplier: 0.5, problemsInWave: 10, timeLimitSeconds: 120,
  },
  {
    level: 2, year: 1982,
    mathTypes: ['addition', 'subtraction'],
    maxSimultaneousThreats: 3, bomberEnabled: false, paratrooperEnabled: false, mirvEnabled: false,
    baseSpeedMultiplier: 0.6, problemsInWave: 12, timeLimitSeconds: 120,
  },
  {
    level: 3, year: 1982,
    mathTypes: ['addition', 'subtraction', 'multiplication'],
    maxSimultaneousThreats: 3, bomberEnabled: false, paratrooperEnabled: false, mirvEnabled: false,
    baseSpeedMultiplier: 0.7, problemsInWave: 14, timeLimitSeconds: 130,
  },
  {
    level: 4, year: 1983,
    mathTypes: ['addition', 'subtraction', 'multiplication'],
    maxSimultaneousThreats: 4, bomberEnabled: false, paratrooperEnabled: false, mirvEnabled: false,
    baseSpeedMultiplier: 0.8, problemsInWave: 16, timeLimitSeconds: 140,
  },
  {
    level: 5, year: 1983,
    mathTypes: ['addition', 'subtraction', 'multiplication', 'division'],
    maxSimultaneousThreats: 4, bomberEnabled: false, paratrooperEnabled: false, mirvEnabled: false,
    baseSpeedMultiplier: 0.9, problemsInWave: 18, timeLimitSeconds: 150,
  },
  {
    level: 6, year: 1984,
    mathTypes: ['addition', 'subtraction', 'multiplication', 'division', 'unit-fractions'],
    maxSimultaneousThreats: 4, bomberEnabled: true, paratrooperEnabled: false, mirvEnabled: false,
    baseSpeedMultiplier: 1.0, problemsInWave: 20, timeLimitSeconds: 160,
  },
  {
    level: 7, year: 1985,
    mathTypes: ['addition', 'subtraction', 'multiplication', 'division', 'unit-fractions', 'multi-step'],
    maxSimultaneousThreats: 5, bomberEnabled: true, paratrooperEnabled: true, mirvEnabled: false,
    baseSpeedMultiplier: 1.1, problemsInWave: 22, timeLimitSeconds: 170,
  },
  {
    level: 8, year: 1986,
    mathTypes: ['addition', 'subtraction', 'multiplication', 'division', 'unit-fractions', 'multi-step', 'square-roots'],
    maxSimultaneousThreats: 5, bomberEnabled: true, paratrooperEnabled: true, mirvEnabled: true,
    baseSpeedMultiplier: 1.2, problemsInWave: 24, timeLimitSeconds: 180,
  },
  {
    level: 9, year: 1987,
    mathTypes: ['addition', 'subtraction', 'multiplication', 'division', 'unit-fractions', 'equivalent-fractions', 'multi-step', 'square-roots'],
    maxSimultaneousThreats: 6, bomberEnabled: true, paratrooperEnabled: true, mirvEnabled: true,
    baseSpeedMultiplier: 1.3, problemsInWave: 26, timeLimitSeconds: 190,
  },
  {
    level: 10, year: 1987,
    mathTypes: ['addition', 'subtraction', 'multiplication', 'division', 'unit-fractions', 'equivalent-fractions', 'multi-step', 'square-roots', 'mixed-operations'],
    maxSimultaneousThreats: 6, bomberEnabled: true, paratrooperEnabled: true, mirvEnabled: true,
    baseSpeedMultiplier: 1.5, problemsInWave: 28, timeLimitSeconds: 210,
  },
];

/** Speed multiplier for each global difficulty setting. */
export const DIFFICULTY_SPEED_MAP = {
  easy: 0.7,
  normal: 1.0,
  hard: 1.3,
} as const;

/** Spawn interval scaling factor per difficulty (divisor applied to base interval). */
export const DIFFICULTY_SPAWN_SCALE = {
  easy: 0.8,   // slower spawn pressure
  normal: 1.0,
  hard: 1.25,  // faster spawn pressure
} as const;
```

---

### 2.3 `src/config/styleConfig.ts`

Plain constant export of every colour token, typography spec, and layout constant from the style guide. Coding Agents 2 and 3 import colour tokens from here.

```typescript
// ── Color Tokens ────────────────────────────────────────────────────────
export const COLOR_BG                 = 0x0A0A0F;
export const COLOR_BG_HUD             = 0x0D0D1A;
export const COLOR_BG_QUEUE           = 0x0D1A0D;
export const COLOR_BG_INTERSTITIAL    = 0x000814;
export const COLOR_PRIMARY            = 0xE8F4E8;
export const COLOR_MATH_TEXT          = 0xFFFFFF;
export const COLOR_QUEUE_LOADED       = 0xFFD700;
export const COLOR_QUEUE_MATCH        = 0x7FFFB2;
export const COLOR_QUEUE_SPENT        = 0x3A3A3A;
export const COLOR_QUEUE_PENDING      = 0xB0C4B0;
export const COLOR_MISSILE_BODY       = 0xCC2200;
export const COLOR_MISSILE_TRAIL      = 0xFF6633;
export const COLOR_DEFENDER           = 0x00AAFF;
export const COLOR_TRAJECTORY         = 0xFF4422;
export const COLOR_EXPLOSION_CORE     = 0xFFFFFF;
export const COLOR_EXPLOSION_MID      = 0xFFD700;
export const COLOR_EXPLOSION_OUTER    = 0xC89BFF;
export const COLOR_EXPLOSION_ALT      = 0x98FFD0;
export const COLOR_CITY_ACTIVE        = 0xFFD700;
export const COLOR_CITY_DESTROYED     = 0x2A2A2A;
export const COLOR_CITY_CELEBRATE     = 0xFFF0A0;
export const COLOR_LAUNCHER           = 0x00FF88;
export const COLOR_LAUNCHER_LOCK      = 0xFF3300;
export const COLOR_LAUNCHER_STREAK    = 0xFF7700;
export const COLOR_BOMBER             = 0xAABBCC;
export const COLOR_PARATROOPER        = 0xFFCC44;
export const COLOR_MIRV_CHILD         = 0xFF88AA;
export const COLOR_SCORE_POP          = 0xFFD700;
export const COLOR_BADGE_TEXT         = 0x0A0A0F;
export const COLOR_BADGE_BG           = 0xFFD700;
export const COLOR_STAR_FULL          = 0xFFD700;
export const COLOR_STAR_EMPTY         = 0x3A3A3A;
export const COLOR_WARNING_RED        = 0xFF2200;
export const COLOR_SCANLINE           = 0x000000;
export const COLOR_TELETYPE           = 0x00FF88;
export const COLOR_BUTTON_BG          = 0x1A3A1A;
export const COLOR_BUTTON_TEXT        = 0x00FF88;
export const COLOR_BUTTON_BORDER      = 0x00FF88;

/** Trajectory line alpha (40% per style guide). */
export const TRAJECTORY_ALPHA = 0.4;
/** Trajectory line stroke width in px. */
export const TRAJECTORY_STROKE = 1;
/** Trajectory dashes: [on px, off px]. */
export const TRAJECTORY_DASH: [number, number] = [6, 4];

/** CRT scanline alpha (8% per style guide). Off by default. */
export const SCANLINE_ALPHA = 0.08;
/** Scanline row spacing in px. */
export const SCANLINE_SPACING = 4;

// ── Font ─────────────────────────────────────────────────────────────────
export const FONT_FAMILY = '"Press Start 2P", monospace';

// ── Text Style Presets ───────────────────────────────────────────────────
// Each is a Phaser-compatible TextStyle partial.
export const TEXT_HUD_SCORE      = { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#E8F4E8' };
export const TEXT_HUD_STARS      = { fontFamily: FONT_FAMILY, fontSize: '12px', color: '#FFD700' };
export const TEXT_MISSILE_PROBLEM = { fontFamily: FONT_FAMILY, fontSize: '18px', color: '#FFFFFF' };
export const TEXT_QUEUE_NUMBER   = { fontFamily: FONT_FAMILY, fontSize: '16px', color: '#B0C4B0' };
export const TEXT_QUEUE_LOADED   = { fontFamily: FONT_FAMILY, fontSize: '18px', color: '#FFD700' };
export const TEXT_SCORE_POP      = { fontFamily: FONT_FAMILY, fontSize: '16px', color: '#FFD700' };
export const TEXT_BADGE          = { fontFamily: FONT_FAMILY, fontSize: '13px', color: '#0A0A0F' };
export const TEXT_CITY_ONELINER  = { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#FFF0A0' };
export const TEXT_INTERSTITIAL_DATE = { fontFamily: FONT_FAMILY, fontSize: '11px', color: '#00FF88' };
export const TEXT_INTERSTITIAL_BODY = { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#E8F4E8' };
export const TEXT_MECHANIC_LABEL = { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#FFD700' };
export const TEXT_BUTTON         = { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#00FF88' };
export const TEXT_TITLE          = { fontFamily: FONT_FAMILY, fontSize: '22px', color: '#00FF88' };
export const TEXT_MENU_ITEM      = { fontFamily: FONT_FAMILY, fontSize: '13px', color: '#E8F4E8' };
export const TEXT_LEVEL_COMPLETE = { fontFamily: FONT_FAMILY, fontSize: '18px', color: '#FFD700' };
export const TEXT_GAME_OVER      = { fontFamily: FONT_FAMILY, fontSize: '20px', color: '#FF2200' };
export const TEXT_TRAINING_GUIDE = { fontFamily: FONT_FAMILY, fontSize: '12px', color: '#7FFFB2' };
export const TEXT_STREAK_LABEL   = { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#0A0A0F' };
```

---

### 2.4 `src/config/scoreConfig.ts`

Plain constant export. Coding Agent 2's `ScoreManager` imports `SCORE_VALUES`.

```typescript
import type { IScoreValues } from '../types/IScoreManager';

/** Base point values per GDD §6 Scoring Model. */
export const SCORE_VALUES: IScoreValues = {
  standardMissile:   10,
  citySaveBonus:     25,
  bomberBeforeDrop:  100,
  bomberAfterDrop:   40,
  mirvBeforeSplit:   60,
  mirvChild:         15,
  paratrooper:       15,
  chainReactionLink: 20,
} as const;

/** Streak multiplier thresholds (GDD §6 Combo Rules). */
export const STREAK_MULTIPLIERS = [
  { minStreak: 10, multiplier: 3.0, label: 'MATH GENIUS!' },
  { minStreak: 5,  multiplier: 2.0, label: 'ON FIRE!' },
  { minStreak: 3,  multiplier: 1.5, label: 'SHARP SHOOTER!' },
  { minStreak: 0,  multiplier: 1.0, label: '' },
] as const;

/** Milestones at which STREAK_MILESTONE event fires. */
export const STREAK_MILESTONE_THRESHOLDS = [3, 5, 10] as const;
```

---

### 2.5 `src/scenes/BootScene.ts`

```typescript
class BootScene extends Phaser.Scene {
  constructor()
  preload(): void   // Load all sprites, spritesheets, fonts, audio
  create(): void    // On load complete, transition to MenuScene
}
```

**`preload()` responsibilities:**
- Load `"Press Start 2P"` via `this.load.css()` or inject `@import` via `this.game.domContainer`
- Load all sprites listed in style guide §Sprite Specifications using `this.load.spritesheet(assetId, path, { frameWidth, frameHeight })`. Use the `SPRITE_*` asset ID strings from the style guide as Phaser texture keys.
- Show a simple progress bar (filled rect in `COLOR_LAUNCHER` on `COLOR_BG`) during load.

**`create()` responsibilities:**
- Register all sprite animations using `this.anims.create()`. For every spritesheet with `Frames > 1`, create a named animation whose key matches the sprite asset ID (e.g. `'SPRITE_EXPLOSION_PLAYER'`).
- Emit nothing; call `this.scene.start('MenuScene')`.

---

### 2.6 `src/scenes/MenuScene.ts`

```typescript
class MenuScene extends Phaser.Scene {
  constructor()
  create(): void
  private renderTitle(): void
  private renderDifficultySelector(): void
  private renderLevelSelect(): void
  private onDifficultySelected(setting: 'easy' | 'normal' | 'hard'): void
  private onLevelSelected(level: number): void
  private startGame(level: number, difficulty: 'easy' | 'normal' | 'hard'): void
}
```

**State stored on instance:**
- `selectedDifficulty: 'easy' | 'normal' | 'hard'` — defaults to `'normal'`
- `selectedLevel: number` — defaults to `1`

**`create()`:** Render `COLOR_BG` background, game title using `TEXT_TITLE` style, difficulty buttons (Easy / Normal / Hard) using `TEXT_MENU_ITEM` style, level select grid (1–10) using `TEXT_MENU_ITEM`. Read `localStorage` key `mcm_difficulty` and `mcm_level` to restore last selection (allowed per localStorage policy).

**`startGame(level, difficulty)`:** Calls `this.scene.start('InterstitialScene', { level, difficulty, isRetry: false })`.

---

### 2.7 `src/scenes/InterstitialScene.ts`

```typescript
class InterstitialScene extends Phaser.Scene {
  constructor()
  init(data: InterstitialSceneData): void
  create(): void
  private renderCard(): void
  private startTeletypeReveal(text: string, targetObj: Phaser.GameObjects.Text): void
  private renderLaunchButton(): void
  private onLaunchTapped(): void
}

interface InterstitialSceneData {
  level: number;
  difficulty: 'easy' | 'normal' | 'hard';
  isRetry: boolean;
}
```

**`create()`:**
- Full-screen `COLOR_BG_INTERSTITIAL` overlay.
- Card rect (`COLOR_BG_HUD` fill, `COLOR_BUTTON_BORDER` stroke, 2px) at position from style guide (x=24, y=120, w=432, h=560).
- Teletype headline text using `TEXT_INTERSTITIAL_DATE` style; reveal at `TELETYPE_CHAR_DELAY_MS` per character.
- Narrative body using `TEXT_INTERSTITIAL_BODY` style (content driven by `LEVEL_CONFIGS[level-1].year` and static historical strings defined here).
- If level > 1: render NEW THREAT or NEW MATH label using `TEXT_MECHANIC_LABEL` style.
- "TAP TO LAUNCH →" button using `TEXT_BUTTON` style at layout position from style guide. Must have `60×60` minimum touch zone.

**`onLaunchTapped()`:**
- Emit `GameEvents.INTERSTITIAL_DISMISSED` on `this.events`.
- If `level === 1` and not retry: `this.scene.start('TrainingScene', { level, difficulty })`.
- Else: `this.scene.start('GameScene', { level, difficulty })`.

**Static historical narrative strings:** Define a `const LEVEL_NARRATIVES: Record<number, { headline: string; body: string; newThreat?: string; newMath?: string }>` inside this file covering levels 1–10. Content derived from the GDD's Cold War 1981–1987 theme.

---

### 2.8 `src/scenes/TrainingScene.ts`

```typescript
class TrainingScene extends Phaser.Scene {
  constructor()
  init(data: { level: number; difficulty: 'easy' | 'normal' | 'hard' }): void
  create(): void
  update(time: number, delta: number): void
  private spawnTrainingMissile(): void
  private showGuidanceArrow(): void
  private onTrainingSuccess(): void
}
```

**Responsibilities:**
- Launches a single slow missile (`TRAINING_MISSILE_SPEED_MULTIPLIER = 0.3×`) with a simple addition problem.
- Renders `TEXT_TRAINING_GUIDE` style instruction: `"TAP THE MISSILE THAT MATCHES YOUR LOADED ANSWER"`.
- Shows `SPRITE_TRAINING_ARROW` blinking animation pointing at the missile.
- Listens for `GameEvents.THREAT_DESTROYED` — when received for the training missile, calls `onTrainingSuccess()`.
- Loops (re-spawns missile) until the player taps correctly.
- `onTrainingSuccess()` emits `GameEvents.TRAINING_COMPLETE` then calls `this.scene.start('GameScene', { level, difficulty })`.

**Note:** TrainingScene creates Coding Agent 2's entities directly (importing `StandardMissile`, `Launcher`, `AnswerQueue`). These are assumed to exist per cross-agent assumptions.

---

### 2.9 `src/scenes/GameScene.ts`

This is the primary scene. It **owns the game loop orchestration** but delegates entity logic to Coding Agent 2 systems and math to Coding Agent 3 systems.

```typescript
class GameScene extends Phaser.Scene {
  constructor()
  init(data: GameSceneData): void
  create(): void
  update(time: number, delta: number): void

  // Private setup
  private setupEventListeners(): void
  private setupSystems(): void
  private setupEntities(): void
  private startWave(): void

  // Event handlers (all private)
  private onWaveStarted(payload: WaveStartedPayload): void
  private onProblemGenerated(payload: ProblemGeneratedPayload): void
  private onThreatDestroyed(payload: ThreatDestroyedPayload): void
  private onCityHit(payload: CityHitPayload): void
  private onCityDestroyed(payload: CityDestroyedPayload): void
  private onScoreUpdated(payload: ScoreUpdatedPayload): void
  private onStreakMilestone(payload: StreakMilestonePayload): void
  private onChainReaction(payload: ChainReactionPayload): void
  private onLevelComplete(payload: LevelCompletePayload): void
  private onGameOver(payload: GameOverPayload): void
  private onGamePaused(): void
  private onGameResumed(): void
  private onSoundToggled(): void

  // Pause / resume
  private pauseGame(): void
  private resumeGame(): void
}

interface GameSceneData {
  level: number;
  difficulty: 'easy' | 'normal' | 'hard';
}
```

**`create()` sequence (in order):**
1. Set canvas background colour to `COLOR_BG`.
2. Instantiate systems from Coding Agent 3: `new DifficultyManager(this, level, difficulty)`, `new MathEngine(this)`.
3. Instantiate systems from Coding Agent 2: `new WaveManager(this, difficultyConfig)`, `new ScoreManager(this)`.
4. Instantiate entities from Coding Agent 2: 6× `new City(...)`, `new Launcher(this, ...)`, `new AnswerQueue(this, ...)`.
5. Instantiate own systems: `new HUDSystem(this)`, `new EffectsSystem(this)`.
6. Call `setupEventListeners()`.
7. Call `startWave()`.

**`startWave()`:**
- Emits `GameEvents.WAVE_STARTED` with `{ level, totalThreats: levelConfig.problemsInWave }` on `this.events`.
- This triggers Coding Agent 3's `MathEngine` to emit `PROBLEM_GENERATED` (which `WaveManager` listens to and begins spawning).

**`update(time, delta)`:** Only calls `waveManager.update(time, delta)` and `hudSystem.update()`. Entity updates are handled within each entity's own `preUpdate` or via Coding Agent 2's `WaveManager`.

**Event handler responsibilities:**
- `onScoreUpdated`: calls `this.hudSystem.updateScore(payload.score)`.
- `onStreakMilestone`: calls `this.hudSystem.showStreakBadge(payload.label, payload.multiplier)`.
- `onChainReaction`: calls `this.hudSystem.showChainBadge(payload.chainLength)`.
- `onCityDestroyed`: calls `this.hudSystem.flashCityLost(payload.cityName)`; checks remaining cities — if 0, emits `GameEvents.GAME_OVER`.
- `onLevelComplete`: saves `localStorage` key `mcm_level` = next level; calls `this.scene.start('LevelCompleteScene', payload)`.
- `onGameOver`: calls `this.scene.start('GameOverScene', payload)`.
- `onGamePaused` / `onGameResumed`: calls `this.physics.pause()` / `this.physics.resume()` and freezes timers.

**Pause button:** Rendered by `HUDSystem`. On tap: emits `GameEvents.GAME_PAUSED`.

---

### 2.10 `src/scenes/LevelCompleteScene.ts`

```typescript
class LevelCompleteScene extends Phaser.Scene {
  constructor()
  init(data: LevelCompletePayload): void
  create(): void
  private revealStars(stars: number): void
  private playCelebration(citiesSurviving: number): void
  private renderCityRebuildAnimation(): void
  private onContinue(): void
}
```

**`create()`:**
- Background `COLOR_BG`.
- "LEVEL COMPLETE" header using `TEXT_LEVEL_COMPLETE`.
- Star rating reveal: animate each star icon using `SPRITE_STAR_FULL` / `SPRITE_STAR_EMPTY`, staggered 300 ms apart.
- City status row: show each city's surviving/destroyed state.
- If `data.perfectWave`: full city firework display (`SPRITE_FIREWORK_SMALL` per city, staggered 200 ms).
- City rebuild animation on each destroyed city slot: `SPRITE_CITY_REBUILD` (8 frames × 250 ms). Emits `GameEvents.CITY_REBUILT` per city after animation completes.
- Continue button: tapping calls `onContinue()`.

**`onContinue()`:**
- If `data.level === 10`: `this.scene.start('VictoryScene', { finalScore: data.score })`.
- Else: `this.scene.start('InterstitialScene', { level: data.level + 1, difficulty, isRetry: false })`.

---

### 2.11 `src/scenes/GameOverScene.ts`

```typescript
class GameOverScene extends Phaser.Scene {
  constructor()
  init(data: GameOverPayload): void
  create(): void
  private onRetry(): void
  private onLevelSelect(): void
}
```

**`create()`:**
- Background `COLOR_BG`.
- "GAME OVER" header using `TEXT_GAME_OVER` (COLOR_WARNING_RED).
- Historical flavour text (static string per level defined in a `const GAME_OVER_FLAVOUR` map).
- Final score display using `TEXT_HUD_SCORE`.
- Retry button → `onRetry()` → `this.scene.start('InterstitialScene', { level, difficulty, isRetry: true })`.
- Level Select button → `onLevelSelect()` → `this.scene.start('MenuScene')`.

---

### 2.12 `src/scenes/VictoryScene.ts`

```typescript
class VictoryScene extends Phaser.Scene {
  constructor()
  init(data: { finalScore: number }): void
  create(): void
  private playVictoryCelebration(): void
  private onMainMenu(): void
}
```

**`create()`:**
- INF Treaty victory narrative text (static string, teletype reveal style).
- Full-screen firework particle display using `SPRITE_FIREWORK_SMALL`.
- Final score summary.
- Main Menu button → `this.scene.start('MenuScene')`.
- Saves high score to `localStorage` key `mcm_highscore` if `finalScore > stored`.

---

### 2.13 `src/systems/EffectsSystem.ts`

Handles all visual-only effects. Owns no game state. Receives calls from `GameScene` and listens to events.

```typescript
class EffectsSystem {
  constructor(scene: Phaser.Scene)

  /** Play the player explosion burst at world position (x, y). */
  playPlayerExplosion(x: number, y: number): void

  /** Play a chain explosion burst at world position (x, y). */
  playChainExplosion(x: number, y: number): void

  /** Play a city-hit explosion at (x, y). */
  playCityExplosion(x: number, y: number): void

  /** Float a score pop-up text at (x, y) with the given label (e.g. "+10"). */
  showScorePop(x: number, y: number, label: string): void

  /** Flash the full canvas with a colour at given alpha for durationMs. */
  flashCanvas(color: number, alpha: number, durationMs: number): void

  /** Flash the launcher red on wrong tap. */
  flashLauncherWrongTap(): void

  /** Show the CHAIN badge at center-screen. */
  showChainBadge(chainLength: number): void

  /** Show a streak badge at center-screen. */
  showStreakBadge(label: string): void

  /** Flash a city gold on city-save event. */
  flashCitySaved(cityIndex: number): void

  /** Toggle the CRT scanline overlay. */
  setCRTEnabled(enabled: boolean): void

  /** Must be called each frame from GameScene.update(). */
  update(): void
}
```

**Implementation notes:**
- Uses `Phaser.GameObjects.Particles.ParticleEmitter` for explosions.
- Score pop uses `this.scene.add.text(...)` with a tween (rise 60 px, alpha 0→1→0 over 800 ms, `Linear` easing).
- Badge animations use `Phaser.Tweens` with `Back.Out` scale-in.
- CRT scanline is a full-screen `Phaser.GameObjects.Graphics` drawn as horizontal lines every 4 px at `SCANLINE_ALPHA`.
- Listens to `GameEvents.THREAT_DESTROYED` to auto-play explosion at the destroyed threat's position (payload must include `x, y` — this is sourced from Coding Agent 2's entity, which emits position in the event; see cross-agent assumptions).
- Listens to `GameEvents.CITY_SAVED` to auto-play city gold flash.
- Listens to `GameEvents.WRONG_TAP` to auto-play launcher flash.
- Listens to `GameEvents.CRT_EFFECT_TOGGLED` to toggle scanline overlay.

---

### 2.14 `src/systems/HUDSystem.ts`

Manages the HUD bar and in-game overlays. Created by `GameScene`.

```typescript
class HUDSystem {
  constructor(scene: Phaser.Scene)

  /** Update the score label text. */
  updateScore(newScore: number): void

  /** Update the live star rating display (1–3 stars). */
  updateStars(stars: number): void

  /** Show a floating streak badge label at center-screen. */
  showStreakBadge(label: string, multiplier: number): void

  /** Show a chain reaction badge at center-screen. */
  showChainBadge(chainLength: number): void

  /** Show a city-lost one-liner in the HUD corner. */
  flashCityLost(cityName: string): void

  /** Show a city-saved one-liner in the HUD corner. */
  flashCitySaved(cityName: string): void

  /** Show the pause overlay. */
  showPauseOverlay(): void

  /** Hide the pause overlay. */
  hidePauseOverlay(): void

  /** Must be called each frame. */
  update(): void
}
```

**Layout per style guide:**
- HUD bar: rect at (0, 0, 480, 48) filled `COLOR_BG_HUD`.
- Score label: `TEXT_HUD_SCORE` at (12, 8).
- Star rating: `TEXT_HUD_STARS` at (176, 10).
- Pause button: sprite `SPRITE_PAUSE_ICON` at (388, 4), 60×60 touch zone. On tap: emits `GameEvents.GAME_PAUSED`.
- Sound toggle: sprite `SPRITE_SOUND_ICON` at (436, 4), 60×60 touch zone. On tap: emits `GameEvents.SOUND_TOGGLED`.
- City one-liner: `TEXT_CITY_ONELINER` at (12, 52), auto-fades after `CITY_ONELINER_DURATION_MS`.
- Badge overlay: `TEXT_BADGE` on `COLOR_BADGE_BG` rect at (140, 380, 200, 48).

**Listens to:**
- `GameEvents.SCORE_UPDATED` → calls `updateScore(payload.score)`.
- `GameEvents.STAR_RATING_UPDATED` → calls `updateStars(payload.stars)`.
- `GameEvents.CITY_SAVED` → calls `flashCitySaved(payload.cityName)`.
- `GameEvents.CITY_DESTROYED` → calls `flashCityLost(payload.cityName)`.
- `GameEvents.GAME_PAUSED` → calls `showPauseOverlay()`.
- `GameEvents.GAME_RESUMED` → calls `hidePauseOverlay()`.

---

### 2.15 `src/main.ts`

```typescript
// Top-level Phaser.Game bootstrap — no class required.
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: '#0A0A0F',
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
  scene: [BootScene, MenuScene, InterstitialScene, TrainingScene, GameScene,
          LevelCompleteScene, GameOverScene, VictoryScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  fps: { target: TARGET_FPS, forceSetTimeOut: false },
};

const game = new Phaser.Game(config);
export default game;
```

---

## 3. Event Contract

Events used or originated in this agent's code. All event names reference `GameEvents` constants from `src/types/GameEvents.ts`.

| Event Constant | Direction | Payload Type | When |
|---|---|---|---|
| `WAVE_STARTED` | **emits** | `WaveStartedPayload` | `GameScene.startWave()` — triggers math generation and spawn |
| `GAME_PAUSED` | **emits** | *(none)* | User taps pause button in HUDSystem |
| `GAME_RESUMED` | **emits** | *(none)* | User taps resume in pause overlay |
| `SOUND_TOGGLED` | **emits** | *(none)* | User taps sound toggle in HUDSystem |
| `INTERSTITIAL_DISMISSED` | **emits** | *(none)* | User taps "TAP TO LAUNCH →" |
| `TRAINING_COMPLETE` | **emits** | *(none)* | TrainingScene — player succeeds |
| `CRT_EFFECT_TOGGLED` | **emits** | *(none)* | Settings toggle (in MenuScene or pause overlay) |
| `CITY_REBUILT` | **emits** | `CityRebuiltPayload` | LevelCompleteScene — after rebuild animation per city |
| `PROBLEM_GENERATED` | **listens** | `ProblemGeneratedPayload` | GameScene.onProblemGenerated — routes to WaveManager |
| `THREAT_DESTROYED` | **listens** | `ThreatDestroyedPayload` + `{ x: number, y: number }` | EffectsSystem triggers explosion |
| `CITY_HIT` | **listens** | `CityHitPayload` | GameScene tracks remaining HP |
| `CITY_DESTROYED` | **listens** | `CityDestroyedPayload` | GameScene checks for game-over; HUDSystem shows one-liner |
| `CITY_SAVED` | **listens** | `CitySavedPayload` | EffectsSystem city flash; HUDSystem one-liner |
| `SCORE_UPDATED` | **listens** | `ScoreUpdatedPayload` | HUDSystem updates score label |
| `STREAK_MILESTONE` | **listens** | `StreakMilestonePayload` | HUDSystem/EffectsSystem shows badge |
| `CHAIN_REACTION` | **listens** | `ChainReactionPayload` | HUDSystem shows chain badge; EffectsSystem chain explosion |
| `STAR_RATING_UPDATED` | **listens** | `StarRatingUpdatedPayload` | HUDSystem updates star display |
| `LEVEL_COMPLETE` | **listens** | `LevelCompletePayload` | GameScene transitions to LevelCompleteScene |
| `GAME_OVER` | **listens** | `GameOverPayload` | GameScene transitions to GameOverScene |
| `WRONG_TAP` | **listens** | *(none)* | EffectsSystem plays launcher flash |
| `QUEUE_ADVANCED` | **listens** | `{ loadedAnswer: number \| string }` | (no direct action in Coding-1; WaveManager uses it) |

> **Important:** `THREAT_DESTROYED` payload as emitted by Coding Agent 2 entities **must include `x: number` and `y: number`** (world position of explosion origin) in addition to the fields in `ThreatDestroyedPayload`. The `EffectsSystem` reads these to position the explosion animation. This is specified here so Coding Agent 2 knows to include position in the payload.

---

## 4. Config Dependencies

This agent **creates** all config files. The constants below are exported by this agent and imported by others:

| Constant / Export | File | Consumed By |
|---|---|---|
| `CANVAS_WIDTH`, `CANVAS_HEIGHT` | `gameConfig.ts` | Agents 2, 3 |
| `LAUNCHER_X`, `LAUNCHER_Y` | `gameConfig.ts` | Agent 2 (Launcher entity) |
| `CITY_X_POSITIONS`, `CITY_ROW_TOP_Y`, `CITY_ROW_BOTTOM_Y` | `gameConfig.ts` | Agent 2 (City entity, WaveManager) |
| `QUEUE_SLOT_0_X`, `QUEUE_SLOT_SPACING`, `QUEUE_SLOT_Y`, `QUEUE_SLOT_SIZE` | `gameConfig.ts` | Agent 2 (AnswerQueue entity) |
| `EXPLOSION_RADIUS_PLAYER`, `CHAIN_REACTION_RADIUS` | `gameConfig.ts` | Agent 2 (Explosion, WaveManager) |
| `MIRV_SPLIT_ALTITUDE_PERCENT` | `gameConfig.ts` | Agent 2 (MIRVMissile), Agent 3 (DifficultyManager) |
| `CITY_HIT_POINTS` | `gameConfig.ts` | Agent 2 (City entity) |
| `WAVE_SPAWN_INTERVAL_BASE_MS` | `gameConfig.ts` | Agent 3 (DifficultyManager) |
| `QUEUE_ADVANCE_DURATION_MS` | `gameConfig.ts` | Agent 2 (AnswerQueue) |
| `SCORE_POP_RISE_PX`, `SCORE_POP_DURATION_MS` | `gameConfig.ts` | Agent 1 (EffectsSystem) |
| `LEVEL_CONFIGS` | `levelConfig.ts` | Agent 3 (DifficultyManager) |
| `DIFFICULTY_SPEED_MAP`, `DIFFICULTY_SPAWN_SCALE` | `levelConfig.ts` | Agent 3 (DifficultyManager) |
| `COLOR_*` tokens | `styleConfig.ts` | Agents 2, 3 (entity rendering) |
| `TEXT_*` style presets | `styleConfig.ts` | Agents 2 (entity text) |
| `SCORE_VALUES` | `scoreConfig.ts` | Agent 2 (ScoreManager) |
| `STREAK_MULTIPLIERS`, `STREAK_MILESTONE_THRESHOLDS` | `scoreConfig.ts` | Agent 2 (ScoreManager) |

---

## 5. Cross-Agent Assumptions

This agent assumes the following from Coding Agents 2 and 3. If these do not exist when GameScene runs, it will fail.

### From Coding Agent 2
- `src/entities/StandardMissile.ts` exports class `StandardMissile extends Phaser.GameObjects.Container`.
- `src/entities/Launcher.ts` exports class `Launcher extends Phaser.GameObjects.Container`.
- `src/entities/AnswerQueue.ts` exports class `AnswerQueue extends Phaser.GameObjects.Container`.
- `src/entities/City.ts` exports class `City extends Phaser.GameObjects.Container` with constructor `(scene, cityIndex, name, x, y)`.
- `src/systems/WaveManager.ts` exports class `WaveManager` with constructor `(scene: Phaser.Scene, difficultyConfig: IDifficultyConfig)` and `update(time, delta)` method.
- `src/systems/ScoreManager.ts` exports class `ScoreManager` implementing `IScoreManager`.
- `THREAT_DESTROYED` payload includes `x: number, y: number` fields (explosion world position).
- All entities register with Phaser's update loop via `scene.sys.updateList.add(this)` or `preUpdate`.

### From Coding Agent 3
- `src/systems/MathEngine.ts` exports class `MathEngine` with constructor `(scene: Phaser.Scene)`.
- `MathEngine` listens for `WAVE_STARTED` and responds by emitting `PROBLEM_GENERATED`.
- `src/systems/DifficultyManager.ts` exports class `DifficultyManager` with constructor `(scene: Phaser.Scene, level: number, difficulty: DifficultySetting)` and `getConfig(): IDifficultyConfig` method.
- `DifficultyManager.getConfig()` returns a valid `IDifficultyConfig` synchronously by the time `GameScene.startWave()` is called.
- `src/systems/DifficultyManager.ts` emits `DIFFICULTY_CHANGED` with `IDifficultyConfig` payload when config changes.

---

## 6. Implementation Order

Build files in this order to satisfy local dependencies:

1. `src/config/gameConfig.ts` — No dependencies; needed by everything.
2. `src/config/styleConfig.ts` — No dependencies.
3. `src/config/scoreConfig.ts` — Imports `IScoreValues` from types (already exists).
4. `src/config/levelConfig.ts` — Imports `ILevelConfig` from types (already exists).
5. `src/main.ts` — Needs scene class names (can use forward references; build last or stub scenes first).
6. `src/scenes/BootScene.ts` — First scene; only depends on config.
7. `src/scenes/MenuScene.ts` — Depends on config.
8. `src/scenes/InterstitialScene.ts` — Depends on `levelConfig.ts`, `GameEvents`.
9. `src/systems/HUDSystem.ts` — Depends on `styleConfig.ts`, `gameConfig.ts`, `GameEvents`.
10. `src/systems/EffectsSystem.ts` — Depends on `styleConfig.ts`, `gameConfig.ts`, `GameEvents`.
11. `src/scenes/GameScene.ts` — Depends on HUDSystem, EffectsSystem, and cross-agent systems (import but do not implement).
12. `src/scenes/TrainingScene.ts` — Depends on GameScene patterns and cross-agent entities.
13. `src/scenes/LevelCompleteScene.ts` — Depends on `GameEvents`, `styleConfig.ts`.
14. `src/scenes/GameOverScene.ts` — Depends on `GameEvents`, `styleConfig.ts`.
15. `src/scenes/VictoryScene.ts` — Depends on `GameEvents`, `styleConfig.ts`.

---

## 7. Definition of Done

- [ ] All 15 files listed in §1 exist at the correct paths.
- [ ] `npm run typecheck` from `games/missile-command-math/` passes with zero errors.
- [ ] `npm run lint` from `games/missile-command-math/` passes with zero warnings.
- [ ] `npm run build` produces a bundle under 2 MB.
- [ ] `BootScene` → `MenuScene` transition runs in browser without console errors.
- [ ] All `GameEvents` constants referenced in this plan are imported from `src/types/GameEvents.ts` — no inline string literals for event names.
- [ ] All colour values reference constants from `styleConfig.ts` — no inline hex strings.
- [ ] No `localStorage` writes during active gameplay (only in `MenuScene`, `VictoryScene`, and preference toggles).
- [ ] No `alert()`, `confirm()`, or `prompt()` calls anywhere.
- [ ] No hardcoded math problems or answer strings anywhere in this agent's files.
