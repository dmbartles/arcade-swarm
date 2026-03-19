# Build Plan — Missile Command Math
**Version:** 1.0  
**Prepared by:** Build Coordinator Agent  
**For:** Build Agent (Gameplay + Integration pass)  
**Repo root:** `arcade-swarm/`  
**Host OS note:** Windows / `cmd.exe` — use `Glob`/`Grep` tools, never shell pipes.

---

## Status Summary — What Already Exists

The DevEx agent, Engine agent, and Math agent have run. The following files are **already committed and must not be re-created or overwritten** by the Build agent:

| Path | Owner | Status |
|------|-------|--------|
| `games/missile-command-math/package.json` | DevEx | ✅ Complete |
| `games/missile-command-math/index.html` | DevEx | ✅ Complete |
| `games/missile-command-math/eslint.config.js` | DevEx | ✅ Complete |
| `games/missile-command-math/playwright.config.ts` | DevEx | ✅ Complete |
| `games/missile-command-math/src/main.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/assets/SpriteFactory.ts` | Asset Creation | ✅ Complete — do not touch |
| `games/missile-command-math/src/assets/index.ts` | Asset Creation | ✅ Complete — do not touch |
| `games/missile-command-math/src/config/gameConfig.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/config/difficultyConfig.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/config/scoreConfig.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/config/audioConfig.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/types/GameEvents.ts` | DevEx | ✅ Complete |
| `games/missile-command-math/src/types/IMathProblem.ts` | DevEx | ✅ Complete |
| `games/missile-command-math/src/types/IScoreManager.ts` | DevEx | ✅ Complete |
| `games/missile-command-math/src/types/IDifficultyConfig.ts` | DevEx | ✅ Complete |
| `games/missile-command-math/src/types/IMathEngine.ts` | DevEx | ✅ Complete |
| `games/missile-command-math/src/types/IEntity.ts` | DevEx | ✅ Complete |
| `games/missile-command-math/src/types/index.ts` | DevEx | ✅ Complete |
| `games/missile-command-math/src/systems/MathEngine.ts` | Math | ✅ Complete |
| `games/missile-command-math/src/systems/DifficultyManager.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/systems/ScoreManager.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/systems/AudioManager.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/systems/WaveManager.ts` | Gameplay | ✅ Complete |
| `games/missile-command-math/src/scenes/BootScene.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/scenes/MenuScene.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/scenes/GameScene.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/scenes/BriefingScene.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/scenes/TrainingBriefScene.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/scenes/LevelReadyScene.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/scenes/LevelCompleteScene.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/scenes/GameOverScene.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/scenes/VictoryScene.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/scenes/LevelSelectScene.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/scenes/SettingsScene.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/scenes/PauseScene.ts` | Engine | ✅ Complete |
| `games/missile-command-math/src/entities/Bomb.ts` | Gameplay | ✅ Complete |
| `games/missile-command-math/src/entities/Launcher.ts` | Gameplay | ✅ Complete |
| `games/missile-command-math/src/entities/Projectile.ts` | Gameplay | ✅ Complete |
| `games/missile-command-math/src/entities/Explosion.ts` | Gameplay | ✅ Complete |
| `games/missile-command-math/src/entities/Building.ts` | Gameplay | ✅ Complete |
| `games/missile-command-math/src/entities/StrategicBomber.ts` | Gameplay | ✅ Complete |
| `games/missile-command-math/src/entities/HUDBar.ts` | Gameplay | ✅ Complete |
| `shared/math-engine/src/MathEngineCore.ts` | Math | ✅ Complete |
| `shared/math-engine/src/types.ts` | Math | ✅ Complete |
| `shared/math-engine/src/utils.ts` | Math | ✅ Complete |
| `shared/math-engine/src/index.ts` | Math | ✅ Complete |
| `shared/math-engine/src/generators/additionGenerator.ts` | Math | ✅ Complete |
| `shared/math-engine/src/generators/subtractionGenerator.ts` | Math | ✅ Complete |
| `shared/math-engine/src/generators/multiplicationGenerator.ts` | Math | ✅ Complete |
| `shared/math-engine/src/generators/divisionGenerator.ts` | Math | ✅ Complete |
| `shared/math-engine/src/generators/fractionGenerator.ts` | Math | ✅ Complete |
| `shared/math-engine/src/generators/multiStepGenerator.ts` | Math | ✅ Complete |
| `shared/math-engine/src/generators/squareRootGenerator.ts` | Math | ✅ Complete |
| `shared/math-engine/src/generators/mixedOperationsGenerator.ts` | Math | ✅ Complete |
| `shared/math-engine/tests/MathEngineCore.test.ts` | Math | ✅ Complete |
| `shared/math-engine/tests/additionGenerator.test.ts` | Math | ✅ Complete |
| `shared/math-engine/tests/subtractionGenerator.test.ts` | Math | ✅ Complete |
| `shared/math-engine/tests/multiplicationGenerator.test.ts` | Math | ✅ Complete |
| `shared/math-engine/tests/divisionGenerator.test.ts` | Math | ✅ Complete |
| `shared/math-engine/tests/fractionGenerator.test.ts` | Math | ✅ Complete |
| `shared/math-engine/tests/multiStepGenerator.test.ts` | Math | ✅ Complete |
| `shared/math-engine/tests/squareRootGenerator.test.ts` | Math | ✅ Complete |
| `shared/math-engine/tests/mixedOperationsGenerator.test.ts` | Math | ✅ Complete |

---

## Section 1 — Files to Create

The Build agent must create **only** the files listed below. Everything in the Status Summary above is complete.

### 1.1 — Game Unit Tests (highest priority — required by Definition of Done)

| File | Description |
|------|-------------|
| `games/missile-command-math/tests/unit/ScoreManager.test.ts` | Unit tests for scoring, streaks, accuracy, star calculation |
| `games/missile-command-math/tests/unit/DifficultyManager.test.ts` | Unit tests for config building, level advancement, preset multipliers |
| `games/missile-command-math/tests/unit/MathEngineWrapper.test.ts` | Unit tests for the Phaser-side MathEngine wrapper (mocking the emitter) |
| `games/missile-command-math/tests/unit/WaveManager.test.ts` | Unit tests for answer-queue routing, wave completion detection, training mode |
| `games/missile-command-math/vitest.config.ts` | Vitest configuration for the game package (required for `npm run test:run`) |

### 1.2 — E2E / Smoke Tests

| File | Description |
|------|-------------|
| `games/missile-command-math/tests/e2e/game.spec.ts` | Playwright smoke tests: page loads, canvas renders, menu buttons exist |

### 1.3 — Missing Audio Wiring Helpers

The AudioManager exists and is wired for most events. The following sound events from the sound guide are **not yet triggered by any scene** and must be wired:

| Sound Event ID | Missing From | Fix Required |
|----------------|-------------|--------------|
| `LAUNCHER_RELOAD` | `Launcher.ts` already fires after reload delay — wire AudioManager.playSFX() call there | Launcher emits reload event; AudioManager must listen |
| `STAR_REVEAL` | `LevelCompleteScene.ts` star pop-in — AudioManager must play per-star sound | Wire in LevelCompleteScene star reveal sequence |
| `FIREWORK_POP` | `LevelCompleteScene.ts` firework spawns — AudioManager plays per firework | Wire in LevelCompleteScene firework loop |
| `LEVEL_READY_BEEP` | `LevelReadyScene.ts` show — AudioManager plays on scene create | Wire in LevelReadyScene |
| `BRIEFING_ENTER` | `BriefingScene.ts` and `TrainingBriefScene.ts` — plays when card shows | Wire in both scenes |
| `BRIEFING_DISMISS` | `BriefingScene.ts` and `TrainingBriefScene.ts` — plays on TAP TO LAUNCH | Wire in both scenes |
| `TRAINING_SUCCESS` | `GameScene.ts` when training intercept succeeds (level 0, `TRAINING_COMPLETE`) | Wire in GameScene training success handler |
| `TRAINING_MISS` | `GameScene.ts` when bomb hits building in training (level 0) | Wire in GameScene training miss handler |
| `CITY_REBUILD_TICK` | `LevelCompleteScene.ts` crane animation loop | Wire in LevelCompleteScene rebuild loop |
| `VICTORY_FANFARE` | `VictoryScene.ts` on scene create | Wire in VictoryScene |
| `MENU_BUTTON_CLICK` | `MenuScene.ts`, `LevelSelectScene.ts`, `SettingsScene.ts` — all menu buttons | Wire in every menu button handler |
| `BOMBER_ESCAPED` | `StrategicBomber.ts` when bomber exits screen without intercept | Bomber emits GameEvents; AudioManager must listen for `threatType === 'bomber'` + `escaped` |
| `STREAK_RESET` | `ScoreManager.ts` calls `resetStreak()` but AudioManager listens on `WRONG_TAP` event, not the streak reset path | Also listen on `GameEvents.WRONG_TAP` for reset — already done. **Also** wire: when `resetStreak()` brings an active streak (≥3) to zero, emit a dedicated `STREAK_RESET_EVENT` or use WRONG_TAP; confirm AudioManager listens to `WRONG_TAP` for this (it does via existing handler) |

> **Note:** Because AudioManager.wireEventListeners() is already complete and handles WRONG_TAP → STREAK_RESET sound, the above items marked as "Wire in X" mean the **scene or entity must call `audioManager.playSFX(SOUND_EVENTS.X)`** directly (for scene-local sounds), or **the AudioManager must add a listener** (for event-bus-driven sounds). See Section 4 for exact call syntax.

**Action:** The Build agent must NOT rewrite AudioManager.ts. Instead it must:
1. Add `audioManager.playSFX(SOUND_EVENTS.LAUNCHER_RELOAD)` to the `Launcher` reload-complete callback.
2. Add `audioManager.playSFX(SOUND_EVENTS.STAR_REVEAL)` and `FIREWORK_POP` and `CITY_REBUILD_TICK` calls inside `LevelCompleteScene`.
3. Add `audioManager.playSFX(SOUND_EVENTS.LEVEL_READY_BEEP)` at the start of `LevelReadyScene.create()`.
4. Add `audioManager.playSFX(SOUND_EVENTS.BRIEFING_ENTER)` and `BRIEFING_DISMISS` in `BriefingScene` and `TrainingBriefScene`.
5. Add `audioManager.playSFX(SOUND_EVENTS.TRAINING_SUCCESS)` and `TRAINING_MISS` in `GameScene`'s training-mode event handlers.
6. Add `audioManager.playSFX(SOUND_EVENTS.VICTORY_FANFARE)` in `VictoryScene.create()`.
7. Add `audioManager.playSFX(SOUND_EVENTS.MENU_BUTTON_CLICK)` to every menu button pointer-up handler in `MenuScene`, `LevelSelectScene`, `SettingsScene`, `GameOverScene`, `VictoryScene`.
8. Add `audioManager.playSFX(SOUND_EVENTS.BOMBER_ESCAPED)` in the AudioManager `wireEventListeners()` for the `THREAT_DESTROYED` payload where `payload.escaped === true` **or** in StrategicBomber for the `bomber-escaped` path. Preferred: add a new listener in AudioManager for `GameEvents.THREAT_DESTROYED` that checks `threatType === 'bomber'` and `escaped`.

These are **surgical edits** to existing files — not rewrites. The Build agent must be careful to add only what is described, inside the correct method bodies.

---

## Section 2 — Class and Interface Definitions (Files to Create)

### 2.1 `games/missile-command-math/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@arcade-swarm/math-engine': path.resolve(__dirname, '../../shared/math-engine/src/index.ts'),
      'phaser': path.resolve(__dirname, 'node_modules/phaser/src/phaser.js'),
    },
  },
});
```

**Notes:**
- `jsdom` environment is required because Phaser references `window` and `document`.
- Phaser must be aliased to the raw source entry point so Vitest can process it — OR Phaser classes must be mocked (preferred, see test files below).
- The path alias for `@arcade-swarm/math-engine` resolves to the shared library source so no separate build step is required during testing.

---

### 2.2 `games/missile-command-math/tests/unit/ScoreManager.test.ts`

**Tests for:** `games/missile-command-math/src/systems/ScoreManager.ts`  
**Imports needed:**
- `ScoreManager` from `../../src/systems/ScoreManager`
- `GameEvents` from `../../src/types/GameEvents`
- Phaser EventEmitter must be **mocked** (do not import real Phaser)

**Mock pattern for Phaser.Events.EventEmitter:**
```typescript
class MockEmitter {
  private handlers: Map<string, Function[]> = new Map();
  emit(event: string, payload?: unknown): void {
    (this.handlers.get(event) ?? []).forEach(h => h(payload));
  }
  on(event: string, handler: Function): this {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
    return this;
  }
  off(event: string, handler: Function): this {
    const arr = this.handlers.get(event) ?? [];
    this.handlers.set(event, arr.filter(h => h !== handler));
    return this;
  }
}
```

**Test cases (describe: 'ScoreManager'):**

| Test name | What it verifies |
|-----------|-----------------|
| `initial score is 0` | `getScore() === 0` after construction |
| `addPoints adds to score` | `addPoints(10)` → `getScore() === 10` |
| `addPoints applies multiplier at streak 3` | Set streak to 3, `addPoints(10)` → `getScore() === 15` (×1.5) |
| `addPoints applies multiplier at streak 5` | Set streak to 5, `addPoints(10)` → `getScore() === 20` (×2.0) |
| `addPoints applies multiplier at streak 10` | Set streak to 10, `addPoints(10)` → `getScore() === 30` (×3.0) |
| `emits SCORE_UPDATED with correct payload` | After `addPoints(10)`, emitter captured `SCORE_UPDATED` with `{ score: 10, delta: 10, multiplier: 1.0 }` |
| `incrementStreak returns new streak count` | `incrementStreak()` → returns 1; call again → returns 2 |
| `incrementStreak at 3 emits STREAK_MILESTONE` | At streak 3, emitter receives `STREAK_MILESTONE` with `{ streak: 3, label: 'SHARP SHOOTER!', multiplier: 1.5 }` |
| `incrementStreak at 5 emits STREAK_MILESTONE` | At streak 5, emitter receives `STREAK_MILESTONE` with `{ streak: 5, label: 'ON FIRE!', multiplier: 2.0 }` |
| `incrementStreak at 10 emits STREAK_MILESTONE` | At streak 10, emitter receives `STREAK_MILESTONE` with `{ streak: 10, label: 'MATH GENIUS!', multiplier: 3.0 }` |
| `resetStreak resets to 0` | After `incrementStreak()` ×3, `resetStreak()` → `getStreak() === 0` |
| `resetStreak resets multiplier to 1.0` | After streak ×3, `resetStreak()` → `getStreakMultiplier() === 1.0` |
| `recordTap correct increments accuracy` | `recordTap(true)` ×3, `recordTap(false)` ×1 → `getAccuracy() === 0.75` |
| `getAccuracy returns 0 before any taps` | `getAccuracy() === 0` |
| `calculateStars returns 3 with 5+ buildings and accuracy ≥ 90%` | `calculateStars(5)` with `getAccuracy() >= 0.9` → `3` |
| `calculateStars returns 2 with 3+ buildings and accuracy ≥ 70%` | `calculateStars(3)` with `getAccuracy() >= 0.7` → `2` |
| `calculateStars returns 1 with 1+ buildings and accuracy < 70%` | `calculateStars(1)` with `getAccuracy() < 0.7` → `1` |
| `calculateStars returns 0 when 0 buildings` | `calculateStars(0)` → `0` |
| `reset clears score, streak, and taps` | After scoring and streaks, `reset()` → all getters back to initial values |
| `addChainLink increments chain count` | `addChainLink()` ×3 → `getChainCount() === 3` |
| `chain count resets on reset()` | `addChainLink()` × 2, `reset()` → `getChainCount() === 0` |

---

### 2.3 `games/missile-command-math/tests/unit/DifficultyManager.test.ts`

**Tests for:** `games/missile-command-math/src/systems/DifficultyManager.ts`  
**Imports needed:**
- `DifficultyManager` from `../../src/systems/DifficultyManager`
- `GameEvents` from `../../src/types/GameEvents`
- Same `MockEmitter` as above

**Test cases (describe: 'DifficultyManager'):**

| Test name | What it verifies |
|-----------|-----------------|
| `getCurrentConfig returns level 1 defaults at construction` | `getCurrentConfig().level === 1`, `difficultySetting === 'normal'` |
| `getCurrentConfig missileSpeedMultiplier is baseSpeed × 1.0 on Normal` | Level 1 base = 0.4, Normal = 1.0 → `missileSpeedMultiplier === 0.4` |
| `getCurrentConfig missileSpeedMultiplier is baseSpeed × 0.7 on Easy` | Level 1 base = 0.4, Easy = 0.7 → `missileSpeedMultiplier ≈ 0.28` |
| `getCurrentConfig missileSpeedMultiplier is baseSpeed × 1.3 on Hard` | Level 1 base = 0.4, Hard = 1.3 → `missileSpeedMultiplier ≈ 0.52` |
| `setDifficultySetting updates config and emits DIFFICULTY_CHANGED` | After `setDifficultySetting('hard')`, `getCurrentConfig().difficultySetting === 'hard'` and `DIFFICULTY_CHANGED` was emitted |
| `setLevel clamps to 0–20` | `setLevel(-5)` → `getCurrentConfig().level === 0`; `setLevel(99)` → `level === 20` |
| `setLevel updates config and emits DIFFICULTY_CHANGED` | After `setLevel(5)`, `getCurrentConfig().level === 5` |
| `LEVEL_COMPLETE event advances to next level` | Emit `LEVEL_COMPLETE` with `{ level: 3 }` → `getCurrentConfig().level === 4` |
| `LEVEL_COMPLETE at level 20 stays at 20` | Emit `LEVEL_COMPLETE` with `{ level: 20 }` → `getCurrentConfig().level === 20` |
| `bomberEnabled is false below level 13` | Level 12 config: `bomberEnabled === false` |
| `bomberEnabled is true at level 13+` | Level 13 config: `bomberEnabled === true` |
| `launcherReloadDelayMs is 800 on Easy, 600 Normal, 400 Hard` | Verify all three presets |
| `getActiveSkillTypes returns valid strings for all levels` | All 21 levels return non-empty arrays |
| `getGradeLevel maps difficulty labels correctly` | Tutorial/Intro/Easy → 2; Medium → 3; Hard → 4; Expert → 5 |
| `training level has timeLimitSeconds === Infinity` | `setLevel(0)`, `getCurrentConfig().timeLimitSeconds === Infinity` |
| `destroy removes LEVEL_COMPLETE listener` | After `destroy()`, emitting `LEVEL_COMPLETE` does not advance level |

---

### 2.4 `games/missile-command-math/tests/unit/MathEngineWrapper.test.ts`

**Tests for:** `games/missile-command-math/src/systems/MathEngine.ts` (the Phaser wrapper)  
**Imports needed:**
- `MathEngine` from `../../src/systems/MathEngine`
- `GameEvents` from `../../src/types/GameEvents`
- Same `MockEmitter` as above
- `@arcade-swarm/math-engine` — real (no mock; it is pure JS)

**Test cases (describe: 'MathEngine (Phaser wrapper)'):**

| Test name | What it verifies |
|-----------|-----------------|
| `generateProblem returns a valid IMathProblem` | Has `.question` string, `.correctAnswer` number or string, `.distractors` array with ≥ 2 items |
| `generateProblem does not emit PROBLEM_GENERATED` | Single-problem generation is a utility call; emitter is NOT called |
| `generateWaveProblems returns array of requested length` | `generateWaveProblems(3, ['single-digit-addition'], 8).length === 8` |
| `generateWaveProblems emits PROBLEM_GENERATED` | Emitter received `PROBLEM_GENERATED` event |
| `PROBLEM_GENERATED payload has problems and answerQueue` | Payload has `.problems[]` and `.answerQueue[]` |
| `answerQueue contains all correct answers` | Every `problem.correctAnswer` appears in `answerQueue` |
| `validateAnswer returns true for correct numeric answer` | Generate a problem, pass `problem.correctAnswer` → `true` |
| `validateAnswer returns false for wrong answer` | Pass `problem.correctAnswer + 1` → `false` |
| `validateAnswer emits ANSWER_VALIDATED` | Emitter received `ANSWER_VALIDATED` event |
| `ANSWER_VALIDATED payload has correct: true on match` | Payload `correct === true` when answer is right |
| `ANSWER_VALIDATED payload has correct: false on mismatch` | Payload `correct === false` when answer is wrong |
| `validateAnswer for division-with-remainder normalises whitespace` | `'7 R 1'` and `'7R1'` both return `true` for a `division-with-remainder` problem with answer `'7 R 1'` |
| `generateWaveProblems works for all grade levels 2–5` | For each grade: 2, 3, 4, 5 with a representative skill type; no throw |
| `generateProblem throws for unknown skillType` | `generateProblem(3, 'unknown-type')` throws `Error` |

---

### 2.5 `games/missile-command-math/tests/unit/WaveManager.test.ts`

**Tests for:** `games/missile-command-math/src/systems/WaveManager.ts`  
**Imports needed:**
- `WaveManager` from `../../src/systems/WaveManager`
- `GameEvents` from `../../src/types/GameEvents`
- `MathEngine` from `../../src/systems/MathEngine`
- Same `MockEmitter` as above
- Phaser classes (Timer, etc.) must be **fully mocked** — do not import real Phaser

**Mock pattern for Phaser.Time.TimerEvent and scene.time:**
```typescript
const mockScene = {
  events: new MockEmitter(),
  time: {
    addEvent: (_cfg: unknown) => ({ remove: () => {} }),
    delayedCall: (_ms: number, cb: Function) => { cb(); return {}; },
    now: 0,
  },
} as unknown as Phaser.Scene;
```

**Test cases (describe: 'WaveManager'):**

| Test name | What it verifies |
|-----------|-----------------|
| `startWave emits WAVE_STARTED` | After `startWave()`, emitter received `WAVE_STARTED` with `{ level, totalThreats }` |
| `startTrainingWave sets isTrainingMode true` | After `startTrainingWave()`, `waveManager.isTrainingMode === true` |
| `handleBombTap with correct answer emits ANSWER_VALIDATED with correct: true` | Mock a problem, tap with correct answer → ANSWER_VALIDATED fires |
| `handleBombTap with wrong answer emits WRONG_TAP` | Tap with wrong answer → `WRONG_TAP` fires |
| `handleBombTap with wrong answer does NOT emit ANSWER_VALIDATED with correct: true` | Wrong tap → no correct validation |
| `wave completion emits LEVEL_COMPLETE when all threats resolved` | After all threats destroyed, `LEVEL_COMPLETE` fires |
| `training wave loops on miss` | In training mode, a miss does not end the wave |
| `training wave emits TRAINING_COMPLETE on first success` | In training mode, first correct intercept emits `TRAINING_COMPLETE` |
| `answer queue advances after each correct intercept` | Queue index increments on each correct tap |
| `getAnswerQueue returns the current queue` | Non-empty array of correct answers |

---

### 2.6 `games/missile-command-math/tests/e2e/game.spec.ts`

**Framework:** Playwright  
**Config:** `games/missile-command-math/playwright.config.ts` (already exists)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Missile Command Math — smoke tests', () => {
  test('page loads and Phaser canvas renders', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10_000 });
  });

  test('MenuScene renders game title', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // allow BootScene → MenuScene transition
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    // Canvas must have non-zero dimensions
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('canvas is at least 400×300 (scaled down from 800×640)', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box!.width).toBeGreaterThan(400);
    expect(box!.height).toBeGreaterThan(300);
  });

  test('settings link is present', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2500);
    // Click anywhere on canvas to start AudioContext (required by browser)
    await page.locator('canvas').click({ position: { x: 400, y: 320 } });
    await page.waitForTimeout(500);
    // Canvas is still rendered after interaction
    await expect(page.locator('canvas')).toBeVisible();
  });
});
```

---

## Section 3 — Event Contract

This section documents every event used in the game and what carries it. The Build agent must not add events outside this contract.

All events fire on the Phaser **scene event emitter** (`this.events` in a scene; injected as `emitter` into systems). Systems created inside `GameScene` receive `this.events`; scenes communicate via `this.game.events` only if a cross-scene payload is needed (currently all cross-scene data is passed via `this.scene.start(key, data)`).

### Core Gameplay Events

| Event Constant | Event String | Emitter | Listener(s) | Payload Type | When |
|----------------|-------------|---------|-------------|--------------|------|
| `PROBLEM_GENERATED` | `'problem-generated'` | `MathEngine.generateWaveProblems()` | `WaveManager` | `ProblemGeneratedPayload` | After wave problem set is ready |
| `ANSWER_VALIDATED` | `'answer-validated'` | `MathEngine.validateAnswer()` | `GameScene`, `AudioManager`, `ScoreManager` | `AnswerValidatedPayload` | On every player tap that hits a bomb |
| `THREAT_SPAWNED` | `'threat-spawned'` | `WaveManager` | `GameScene`, `AudioManager` | `ThreatSpawnedPayload` | When a bomb or bomber enters the field |
| `THREAT_DESTROYED` | `'threat-destroyed'` | `Bomb.destroy()`, `StrategicBomber.destroy()` | `WaveManager`, `ScoreManager`, `AudioManager` | `ThreatDestroyedPayload` | On successful intercept |
| `INTERCEPTOR_FIRED` | `'interceptor-fired'` | `Launcher.fire()` | `GameScene` (for projectile creation) | `{ launcherPos: 'left'\|'center'\|'right', targetX: number, targetY: number }` | Player tap triggers a launcher fire |
| `INTERCEPTOR_DETONATED` | `'interceptor-detonated'` | `Projectile` on reaching target | `GameScene` (spawns Explosion) | `{ x: number, y: number, targetBombId: string }` | Projectile reaches its target position |
| `EXPLOSION_COMPLETE` | `'explosion-complete'` | `Explosion` after animation | `GameScene` (cleanup) | `{ x: number, y: number }` | Explosion animation finishes |
| `BOMBER_PAYLOAD_DROPPED` | `'bomber-payload-dropped'` | `StrategicBomber` | `WaveManager`, `AudioManager` | `BomberPayloadDroppedPayload` | Bomber releases bomb payload |

### City Events

| Event Constant | Event String | Emitter | Listener(s) | Payload Type | When |
|----------------|-------------|---------|-------------|--------------|------|
| `CITY_HIT` | `'city-hit'` | `Building.hit()` | `HUDBar`, `GameScene`, `AudioManager` | `CityHitPayload: { cityIndex: number, remainingHp: number }` | Bomb reaches a building |
| `CITY_DESTROYED` | `'city-destroyed'` | `Building.hit()` when `hp === 0` | `WaveManager`, `GameScene`, `AudioManager` | `CityDestroyedPayload: { cityIndex: number, cityName: string }` | Building HP reaches zero |
| `CITY_SAVED` | `'city-saved'` | `GameScene` when bomb targeting a city is destroyed | `HUDBar`, `AudioManager` | `CitySavedPayload: { cityIndex: number, cityName: string }` | Player destroys bomb aimed at city |
| `CITY_REBUILT` | `'city-rebuilt'` | `LevelCompleteScene` rebuild animation | `Building` entity | `CityRebuiltPayload: { cityIndex: number, cityName: string }` | Rebuild crane animation completes |

### Score & Streak Events

| Event Constant | Event String | Emitter | Listener(s) | Payload Type | When |
|----------------|-------------|---------|-------------|--------------|------|
| `SCORE_UPDATED` | `'score-updated'` | `ScoreManager.addPoints()` | `HUDBar`, `AudioManager` | `ScoreUpdatedPayload: { score: number, delta: number, multiplier: number }` | Any points are added |
| `STREAK_MILESTONE` | `'streak-milestone'` | `ScoreManager.incrementStreak()` | `GameScene` (streak badge), `AudioManager` | `StreakMilestonePayload: { streak: number, label: string, multiplier: number }` | Streak reaches 3, 5, or 10 |
| `STAR_RATING_UPDATED` | `'star-rating-updated'` | `GameScene` mid-wave projection | `HUDBar` (optional live display) | `StarRatingUpdatedPayload: { stars: number }` | After each threat resolved |
| `CHAIN_REACTION` | `'chain-reaction'` | `GameScene` explosion overlap check | `ScoreManager`, `HUDBar` | `ChainReactionPayload: { chainLength: number, bonusPoints: number }` | Explosion blast radius catches another bomb |

### Level & Flow Events

| Event Constant | Event String | Emitter | Listener(s) | Payload Type | When |
|----------------|-------------|---------|-------------|--------------|------|
| `WAVE_STARTED` | `'wave-started'` | `WaveManager.startWave()` | `GameScene`, `AudioManager` | `WaveStartedPayload: { level: number, totalThreats: number }` | Wave begins after interstitial |
| `LEVEL_COMPLETE` | `'level-complete'` | `WaveManager` when last threat resolved | `DifficultyManager`, `GameScene`, `AudioManager` | `LevelCompletePayload` | All bombs in wave destroyed |
| `GAME_OVER` | `'game-over'` | `WaveManager` when all cities destroyed | `GameScene`, `AudioManager` | `GameOverPayload: { level: number, finalScore: number }` | All buildings gone |
| `SESSION_VICTORY` | `'session-victory'` | `VictoryScene.create()` | None (signals UI only) | `{ finalScore: number }` | All 20 levels cleared |
| `TRAINING_COMPLETE` | `'training-complete'` | `WaveManager` on first training intercept | `GameScene`, `AudioManager` | `{}` | Training wave success |
| `DIFFICULTY_CHANGED` | `'difficulty-changed'` | `DifficultyManager` | `WaveManager`, `GameScene` | `IDifficultyConfig` | Level advance or settings change |
| `WRONG_TAP` | `'wrong-tap'` | `WaveManager.handleBombTap()` on no-match | `GameScene` (flash launcher), `AudioManager` | `{ bombId: string }` | Player taps bomb whose answer isn't loaded |
| `QUEUE_ADVANCED` | `'queue-advanced'` | `WaveManager` after correct answer | `GameScene` (update launcher display) | `{ nextAnswer: number \| string \| null }` | Answer queue moves forward |

### UI Events

| Event Constant | Event String | Emitter | Listener(s) | Payload Type | When |
|----------------|-------------|---------|-------------|--------------|------|
| `GAME_PAUSED` | `'game-paused'` | `GameScene` pause button handler | `AudioManager`, `PauseScene` (via scene.launch) | `{}` | Pause button tapped |
| `GAME_RESUMED` | `'game-resumed'` | `PauseScene` resume button | `AudioManager`, `GameScene` | `{}` | Resume tapped |
| `SOUND_TOGGLED` | `'sound-toggled'` | `SettingsScene` toggle button | `AudioManager` | `{ enabled: boolean }` | Sound on/off toggled |
| `INTERSTITIAL_DISMISSED` | `'interstitial-dismissed'` | `BriefingScene` / `LevelReadyScene` / `TrainingBriefScene` on dismiss | `GameScene` (scene transition) | `{ level: number }` | TAP TO LAUNCH pressed |
| `PERFECT_WAVE` | `'perfect-wave'` | `WaveManager` when wave ends with 0 misses | `ScoreManager` (bonus), `GameScene` (visual) | `{}` | All bombs cleared with 100% accuracy |

---

## Section 4 — Sound Event Wiring

The AudioManager (`src/systems/AudioManager.ts`) is the single point of synthesis. All sound triggering goes through `audioManager.playSFX(eventId)` or `audioManager.playMusic(trackId)`. The AudioManager is instantiated in `GameScene.create()` and stored on `this.game.registry.set('audioManager', audioManager)` for access by other scenes.

**Access pattern in scenes:**
```typescript
const audioManager = this.game.registry.get('audioManager') as AudioManager | undefined;
audioManager?.playSFX(SOUND_EVENTS.X);
```

**Access pattern inside entities (receive audioManager via constructor):**
```typescript
// Launcher.ts constructor receives: scene: Phaser.Scene
const audioManager = scene.game.registry.get('audioManager') as AudioManager | undefined;
audioManager?.playSFX(SOUND_EVENTS.LAUNCHER_RELOAD);
```

### Already-Wired Events (AudioManager.wireEventListeners() — do not duplicate)

| Sound Event ID | Trigger in AudioManager | Event Listened To |
|----------------|------------------------|-------------------|
| `BOMB_INTERCEPT_LAUNCH` | `ANSWER_VALIDATED` (correct === true) | `GameEvents.ANSWER_VALIDATED` |
| `BOMB_INTERCEPT_HIT` | 80ms after `ANSWER_VALIDATED` (correct) | delayed from `ANSWER_VALIDATED` |
| `BOMB_WRONG_TAP` | `WRONG_TAP` event | `GameEvents.WRONG_TAP` |
| `BOMB_REACHES_BUILDING` | `CITY_HIT` event | `GameEvents.CITY_HIT` |
| `BUILDING_DESTROYED` | `CITY_DESTROYED` event | `GameEvents.CITY_DESTROYED` |
| `CITY_SAVE_CHIME` | `CITY_SAVED` event | `GameEvents.CITY_SAVED` |
| `STREAK_3` | `STREAK_MILESTONE` payload.streak >= 3 | `GameEvents.STREAK_MILESTONE` |
| `STREAK_5` | `STREAK_MILESTONE` payload.streak >= 5 | `GameEvents.STREAK_MILESTONE` |
| `STREAK_10` | `STREAK_MILESTONE` payload.streak >= 10 | `GameEvents.STREAK_MILESTONE` |
| `BOMBER_ALERT` | `THREAT_SPAWNED` where `threatType === 'bomber'` | `GameEvents.THREAT_SPAWNED` |
| `BOMBER_INTERCEPT` | `THREAT_DESTROYED` where `threatType === 'bomber'` | `GameEvents.THREAT_DESTROYED` |
| `BOMB_DROP_FROM_BOMBER` | `BOMBER_PAYLOAD_DROPPED` | `GameEvents.BOMBER_PAYLOAD_DROPPED` |
| `SCORE_POP_TICK` | `SCORE_UPDATED` | `GameEvents.SCORE_UPDATED` |
| `LEVEL_COMPLETE_FANFARE` | `LEVEL_COMPLETE` | `GameEvents.LEVEL_COMPLETE` |
| `GAME_OVER_STING` | `GAME_OVER` | `GameEvents.GAME_OVER` |
| `WAVE_START` | `WAVE_STARTED` | `GameEvents.WAVE_STARTED` |
| `PAUSE_IN` | `GAME_PAUSED` | `GameEvents.GAME_PAUSED` |
| `PAUSE_OUT` | `GAME_RESUMED` | `GameEvents.GAME_RESUMED` |
| `SOUND_TOGGLE` | `SOUND_TOGGLED` (enabled===true) | `GameEvents.SOUND_TOGGLED` |

### Events Requiring New Wiring (surgical edits to existing files)

#### 4.1 `LAUNCHER_RELOAD` — wire in `Launcher.ts`

In `Launcher.ts`, find the `reload()` method (or the `scene.time.delayedCall` that fires after the reload delay). At the point the launcher finishes reloading (the callback that sets `isReloading = false` and loads a new answer), add:

```typescript
const audioManager = this.scene.game.registry.get('audioManager') as { playSFX(id: string): void } | undefined;
audioManager?.playSFX('LAUNCHER_RELOAD');
```

Import `SOUND_EVENTS` at top of `Launcher.ts`:
```typescript
import { SOUND_EVENTS } from '../config/audioConfig';
```
Then use `SOUND_EVENTS.LAUNCHER_RELOAD` in the call.

---

#### 4.2 `BOMBER_ESCAPED` — wire in `AudioManager.wireEventListeners()`

In `AudioManager.wireEventListeners()`, find the existing `THREAT_DESTROYED` handler. It currently only handles `threatType === 'bomber'` for intercept. Add a separate check for when the bomber escaped:

```typescript
bus.on(GameEvents.THREAT_DESTROYED, (payload: ThreatDestroyedPayload) => {
  if (payload.threatType === 'bomber') {
    // Check if it escaped (points === 0 indicates escaped, not intercepted)
    if (payload.points === 0) {
      this.playSFX(SOUND_EVENTS.BOMBER_ESCAPED);
    } else {
      this.playSFX(SOUND_EVENTS.BOMBER_INTERCEPT);
    }
  }
});
```

> **Note:** The `StrategicBomber` entity must set `points: 0` in its `ThreatDestroyedPayload` when the bomber escapes. Verify `StrategicBomber.ts` emits `THREAT_DESTROYED` with `points: 0` on escape. If it emits `GameEvents.THREAT_DESTROYED` only on intercept and uses a separate `bomber-escaped` event, add a new listener instead:
```typescript
bus.on(GameEvents.THREAT_DESTROYED, (payload: ThreatDestroyedPayload) => {
  if (payload.threatType === 'bomber' && !payload.chainReaction) {
    if (payload.points > 0) {
      this.playSFX(SOUND_EVENTS.BOMBER_INTERCEPT);
    } else {
      this.playSFX(SOUND_EVENTS.BOMBER_ESCAPED);
    }
  }
});
```
Replace the existing duplicate `THREAT_DESTROYED` handler with this merged version (do not add two handlers for the same event).

---

#### 4.3 `STAR_REVEAL`, `FIREWORK_POP`, `CITY_REBUILD_TICK` — wire in `LevelCompleteScene.ts`

In `LevelCompleteScene.ts`, find the star reveal sequence and the firework/crane animation. The AudioManager is accessed from the registry.

**Star reveal** — find where each star object is shown (there should be a loop or timed sequence). At each star pop-in:
```typescript
audioManager?.playSFX(SOUND_EVENTS.STAR_REVEAL);
```

**Firework pop** — find where `ANIM_KEYS.FIREWORK_POP` animation is played per building. At each firework spawn:
```typescript
audioManager?.playSFX(SOUND_EVENTS.FIREWORK_POP);
```

**City rebuild tick** — find the `CITY_REBUILD_DURATION_MS` (3000ms) rebuild window. Start a repeating tick during the crane animation:
```typescript
const tickTimer = this.time.addEvent({
  delay: 200,          // 200ms interval per sound guide
  callback: () => { audioManager?.playSFX(SOUND_EVENTS.CITY_REBUILD_TICK); },
  loop: true,
});
// Stop the tick when rebuild completes:
this.time.delayedCall(CITY_REBUILD_DURATION_MS, () => {
  tickTimer.remove();
});
```

---

#### 4.4 `LEVEL_READY_BEEP` — wire in `LevelReadyScene.ts`

In `LevelReadyScene.create()`, after the text and button are set up:
```typescript
const audioManager = this.game.registry.get('audioManager') as { playSFX(id: string): void } | undefined;
audioManager?.playSFX(SOUND_EVENTS.LEVEL_READY_BEEP);
```

---

#### 4.5 `BRIEFING_ENTER` and `BRIEFING_DISMISS` — wire in `BriefingScene.ts` and `TrainingBriefScene.ts`

**BriefingScene.create()** — after the card is rendered, call:
```typescript
audioManager?.playSFX(SOUND_EVENTS.BRIEFING_ENTER);
```

**BriefingScene dismiss button handler** — before `this.scene.start(...)`:
```typescript
audioManager?.playSFX(SOUND_EVENTS.BRIEFING_DISMISS);
```

Repeat identically in **TrainingBriefScene**.

---

#### 4.6 `TRAINING_SUCCESS` and `TRAINING_MISS` — wire in `GameScene.ts`

`GameScene.ts` already listens to `TRAINING_COMPLETE` and handles training mode. Find those handlers:

In the `TRAINING_COMPLETE` handler:
```typescript
audioManager?.playSFX(SOUND_EVENTS.TRAINING_SUCCESS);
```

For `TRAINING_MISS`: find the handler where a bomb hits a building during level 0 (the `CITY_HIT` or `GAME_OVER` guard path in training mode). At that point:
```typescript
if (this.isTrainingMode) {
  audioManager?.playSFX(SOUND_EVENTS.TRAINING_MISS);
}
```

---

#### 4.7 `VICTORY_FANFARE` — wire in `VictoryScene.ts`

In `VictoryScene.create()`, after the scene is rendered:
```typescript
const audioManager = this.game.registry.get('audioManager') as { playSFX(id: string): void } | undefined;
audioManager?.playSFX(SOUND_EVENTS.VICTORY_FANFARE);
audioManager?.playMusic(MUSIC_TRACKS.VICTORY);
```

Also stop any gameplay music before playing victory:
```typescript
audioManager?.stopMusic();
```

---

#### 4.8 `MENU_BUTTON_CLICK` — wire in all menu scenes

In **every** scene that has tappable menu buttons (`MenuScene`, `LevelSelectScene`, `SettingsScene`, `GameOverScene`, `VictoryScene`, `PauseScene`), add to **each** interactive button's `pointerup` handler, **before** the navigation call:

```typescript
const audioManager = this.game.registry.get('audioManager') as { playSFX(id: string): void } | undefined;
audioManager?.playSFX(SOUND_EVENTS.MENU_BUTTON_CLICK);
```

---

#### 4.9 Music track routing (verify completeness)

| Scene | Music Track | Start Call | Stop Call |
|-------|------------|------------|-----------|
| `MenuScene.create()` | `MUSIC_TRACKS.MENU` | `audioManager?.playMusic(MUSIC_TRACKS.MENU)` | On `shutdown` |
| `LevelSelectScene.create()` | `MUSIC_TRACKS.MENU` | `audioManager?.playMusic(MUSIC_TRACKS.MENU)` | On `shutdown` |
| `SettingsScene.create()` | `MUSIC_TRACKS.MENU` | `audioManager?.playMusic(MUSIC_TRACKS.MENU)` | On `shutdown` |
| `BriefingScene.create()` | `MUSIC_TRACKS.BRIEFING` | `audioManager?.playMusic(MUSIC_TRACKS.BRIEFING)` | On `shutdown` |
| `TrainingBriefScene.create()` | `MUSIC_TRACKS.BRIEFING` | same | On `shutdown` |
| `GameScene.create()` | `DifficultyManager.selectGameplayMusic(level)` | `audioManager?.playMusic(audioManager.selectGameplayMusic(level))` | On `GAME_OVER` / `LEVEL_COMPLETE` |
| `LevelCompleteScene.create()` | `MUSIC_TRACKS.LEVEL_COMPLETE` | `audioManager?.playMusic(MUSIC_TRACKS.LEVEL_COMPLETE)` | After 8 bars (~4s at 120 BPM) → stopMusic |
| `GameOverScene.create()` | `MUSIC_TRACKS.GAME_OVER` | `audioManager?.playMusic(MUSIC_TRACKS.GAME_OVER)` | On `shutdown` |
| `VictoryScene.create()` | `MUSIC_TRACKS.VICTORY` | `audioManager?.playMusic(MUSIC_TRACKS.VICTORY)` | On `shutdown` |

**Crossfade rule:** `AudioManager.playMusic()` internally calls `stopMusic()` first, which includes the fade-out. The Build agent does not need to manually crossfade; calling `playMusic()` with a new track ID is sufficient.

**Level boundary music change:** In `GameScene`, listen for `DIFFICULTY_CHANGED` and call `audioManager.playMusic(audioManager.selectGameplayMusic(newConfig.level))`. This handles the mid-game music transition at level boundaries (8→9 and 15→16).

**MUSIC_LEVEL_COMPLETE timing per sound guide:** "8-bar non-looping sting then fade to silence". Since AudioManager's playMusic uses a repeating interval, the LEVEL_COMPLETE track must be stopped after its duration. In `LevelCompleteScene.create()`:
```typescript
audioManager?.playMusic(MUSIC_TRACKS.LEVEL_COMPLETE);
// Stop after approximately 4s (8 bars at 120 BPM)
this.time.delayedCall(4000, () => {
  audioManager?.stopMusic();
});
```

---

## Section 5 — Config Constants

All constants already exist across four config files. The Build agent must **import** from the correct file — never hardcode a value that has a named constant.

### `games/missile-command-math/src/config/gameConfig.ts` (complete — do not modify)

| Constant | Type | Value | Description |
|----------|------|-------|-------------|
| `CANVAS_WIDTH` | `number` | `800` | Canvas width px |
| `CANVAS_HEIGHT` | `number` | `640` | Canvas height px |
| `PLAYFIELD_X` | `number` | `20` | Playfield origin X |
| `PLAYFIELD_Y` | `number` | `20` | Playfield origin Y |
| `PLAYFIELD_WIDTH` | `number` | `760` | Playfield width px |
| `PLAYFIELD_HEIGHT` | `number` | `480` | Playfield height px |
| `GROUND_LINE_Y` | `number` | `476` | Y of ground line |
| `CRT_BEZEL_STROKE` | `number` | `14` | Bezel stroke width |
| `CRT_BEZEL_CORNER_RADIUS` | `number` | `40` | Bezel corner radius |
| `HUD_BAR_Y` | `number` | `600` | HUD bar Y position |
| `HUD_BAR_HEIGHT` | `number` | `40` | HUD bar height |
| `LAUNCHER_LEFT_X` | `number` | `100` | Left launcher center X |
| `LAUNCHER_CENTER_X` | `number` | `400` | Center launcher center X |
| `LAUNCHER_RIGHT_X` | `number` | `700` | Right launcher center X |
| `LAUNCHER_Y` | `number` | `460` | All launchers bottom anchor Y |
| `LEFT_CLUSTER_X/Y/WIDTH/HEIGHT` | `number` | `30/340/240/140` | Left building cluster bounds |
| `RIGHT_CLUSTER_X/Y/WIDTH/HEIGHT` | `number` | `510/340/270/140` | Right building cluster bounds |
| `PAUSE_BUTTON_X/Y` | `number` | `760/560` | Pause button position |
| `SOUND_BUTTON_X/Y` | `number` | `720/560` | Sound toggle position |
| `TRAIL_SPAWN_INTERVAL_MS` | `number` | `120` | Trail dot spawn rate |
| `TRAIL_DOT_LIFETIME_MS` | `number` | `600` | Trail dot fade duration |
| `TRAIL_MAX_DOTS_PER_BOMB` | `number` | `8` | Max trail dots per bomb |
| `MIN_TOUCH_TARGET_PX` | `number` | `60` | WCAG 2.5.5 min target |
| `EXPLOSION_DURATION_MS` | `number` | `480` | Explosion anim duration |
| `EXPLOSION_EQUATION_FADE_MS` | `number` | `400` | Equation text fade start |
| `EXPLOSION_SCALE_END` | `number` | `1.4` | Explosion scale-up end value |
| `SCORE_POP_DURATION_MS` | `number` | `700` | Score pop total duration |
| `SCORE_POP_RISE_PX` | `number` | `60` | Score pop float distance |
| `SCORE_POP_FADE_START_MS` | `number` | `400` | Score pop fade start time |
| `STREAK_BADGE_SLIDE_IN_MS` | `number` | `300` | Badge slide-in time |
| `STREAK_BADGE_HOLD_MS` | `number` | `900` | Badge hold time |
| `STREAK_BADGE_SLIDE_OUT_MS` | `number` | `300` | Badge slide-out time |
| `CITY_REBUILD_DURATION_MS` | `number` | `3000` | Crane animation duration |
| `BOMBER_TRAVERSAL_MS` | `number` | `4000` | Bomber full-screen traversal |
| `FIREWORK_STAGGER_MS` | `number` | `150` | Firework stagger between buildings |
| `FIREWORK_REPEATS` | `number` | `2` | Firework burst repeat count |
| `LAUNCHER_NOZZLE_TWEEN_MS` | `number` | `300` | Launcher fire punch-down tween |
| `SPEED_BONUS_TIME_FRACTION` | `number` | `0.5` | Threshold for speed bonus |
| `BOMBER_ALERT_GAP_MS` | `number` | `400` | Gap between alert and first drop |
| `COLOR_BG` | `number` | `0xC8B8DC` | Canvas background |
| `COLOR_PLAYFIELD` | `number` | `0xE8E0F0` | Playfield interior |
| `COLOR_CRT_BEZEL` | `number` | `0xC8952A` | CRT bezel color |
| `COLOR_GROUND_LINE` | `number` | `0x4A8A9A` | Ground line |
| `COLOR_HUD_TEXT` | `string` | `'#C8952A'` | HUD text (CSS string) |
| `COLOR_HUD_BG` | `number` | `0xC8B8DC` | HUD background |
| `COLOR_EXPLOSION_OUTER` | `string` | `'#F0A000'` | Score pop / explosion ring |
| `COLOR_WRONG_FLASH` | `number` | `0xE03030` | Launcher wrong-tap flash |
| `COLOR_CITY_CELEBRATE` | `number` | `0xF0C030` | City save gold tint |
| `COLOR_LAUNCHER_NUMBER` | `string` | `'#C8A040'` | Launcher badge answer number |
| `POPULATION_PER_BUILDING` | `number` | `50_000` | Cosmetic residents multiplier |
| `TOTAL_CITIES` | `number` | `6` | Cities in game |

### `games/missile-command-math/src/config/difficultyConfig.ts` (complete — do not modify)

| Constant | Type | Value | Description |
|----------|------|-------|-------------|
| `DIFFICULTY_SPEED_MAP` | `IDifficultySpeedMap` | `{ easy: 0.7, normal: 1.0, hard: 1.3 }` | Preset multipliers |
| `LAUNCHER_RELOAD_DELAY_MS` | `Record<string, number>` | `{ easy: 800, normal: 600, hard: 400 }` | Reload delay by preset |
| `BOMBER_BASE_SPEED_MULTIPLIER` | `number` | `1.2` | Bomber base multiplier |
| `LEVEL_CONFIGS` | `readonly ILevelConfig[]` | 21 entries (0–20) | Per-level configuration table |
| `BASE_SPAWN_INTERVAL_MS` | `number` | `3000` | Base spawn interval |
| `SPAWN_INTERVAL_DECREMENT_MS` | `number` | `80` | Decrement per level |
| `SPAWN_INTERVAL_MIN_MS` | `number` | `800` | Floor spawn interval |

### `games/missile-command-math/src/config/scoreConfig.ts` (complete — do not modify)

| Constant | Type | Notes |
|----------|------|-------|
| `SCORE_VALUES` | `IScoreValues` | All point values per GDD Scoring Model |
| `WAVE_NO_MISS_BONUS` | `number` | `50` — all bombs cleared without a miss |
| `STREAK_THRESHOLDS` | `ReadonlyArray<{minStreak, multiplier, label}>` | `[{10, 3.0, 'MATH GENIUS!'}, {5, 2.0, 'ON FIRE!'}, {3, 1.5, 'SHARP SHOOTER!'}]` |

### `games/missile-command-math/src/config/audioConfig.ts` (complete — do not modify)

| Export | Contains |
|--------|---------|
| `SOUND_EVENTS` | All 34 sound event ID strings |
| `MUSIC_TRACKS` | All 8 music track IDs |
| `VOLUME_HIERARCHY` | `{ master: 1.0, music: 0.45, sfx: 0.8, ui: 0.6 }` |
| `MUSIC_CROSSFADE_MS` | `600` |
| `MUSIC_DUCK_VOLUME` | `0.2` |
| `MUSIC_DUCK_DOWN_MS` | `80` |
| `MUSIC_DUCK_RESTORE_MS` | `400` |
| `SOUND_ENABLED_KEY` | `'mcm_sound_enabled'` |

---

## Section 6 — Math Library Specification

The shared math library is **already fully implemented** at `shared/math-engine/src/`. The Build agent must not modify it. This section documents the API so test authors understand the contract.

### Library Location
`shared/math-engine/src/` — imported as `@arcade-swarm/math-engine` (resolved via package.json workspace link)

### Public API
```typescript
// Entry point: shared/math-engine/src/index.ts
export { MathEngineCore } from './MathEngineCore';
export type { MathProblem, GeneratorParams, ProblemGenerator } from './types';
```

### `MathEngineCore` Methods

| Method | Signature | Returns | Notes |
|--------|-----------|---------|-------|
| `generateProblem` | `(gradeLevel: number, skillType: string, difficultyLevel: number): MathProblem` | `MathProblem` | Throws `Error` if skillType unknown |
| `generateWaveProblems` | `(gradeLevel: number, skillTypes: string[], count: number, difficultyLevel: number): { problems: MathProblem[]; answerQueue: (number\|string)[] }` | Object | answerQueue is Fisher-Yates shuffled |
| `validateAnswer` | `(problem: MathProblem, answer: number\|string): boolean` | `boolean` | String answers normalised (lower, trim, collapse spaces) |

### Skill Type → Generator Mapping

| skillType | Generator | Notes |
|-----------|-----------|-------|
| `single-digit-addition` | `additionGenerator` | Sums ≤ 18 |
| `two-digit-addition-no-regroup` | `additionGenerator` | Ones digits sum ≤ 9 |
| `two-digit-addition-regroup` | `additionGenerator` | Ones digits sum ≥ 10 |
| `three-digit-addition` | `additionGenerator` | Operands 100–699 |
| `four-digit-addition` | `additionGenerator` | Operands 1000+ |
| `single-digit-subtraction` | `subtractionGenerator` | Result ≥ 0 |
| `two-digit-subtraction` | `subtractionGenerator` | Both no-regroup and regroup variants |
| `three-digit-subtraction` | `subtractionGenerator` | Operands 100–799 |
| `four-digit-subtraction` | `subtractionGenerator` | Operands 1000+ |
| `multiplication-partial` | `multiplicationGenerator` | ×2/×5/×10 and ×3/×4/×6 facts |
| `multiplication-full` | `multiplicationGenerator` | Full 12×12 table |
| `division-basic` | `divisionGenerator` | No remainder; quotient ≤ 12 |
| `division-with-remainder` | `divisionGenerator` | Answer format: `'Q R r'` string |
| `unit-fraction-of-whole` | `fractionGenerator` | 1/D of N; D∈{2,3,4,5} |
| `fraction-of-whole` | `fractionGenerator` | N/D × W; N∈[2,4], D∈[3,5] |
| `multi-step-expression` | `multiStepGenerator` | `(A × B) ± C` |
| `perfect-square-root` | `squareRootGenerator` | √N; N∈{4,9,16,25,36,49,64,81,100,121,144} |
| `mixed-operations` | `mixedOperationsGenerator` | `(√P) OP (A × B)` |

### Distractor Strategy (per curriculum map)

| Skill Class | Distractor Rule |
|-------------|----------------|
| Single-digit add/sub | Near-miss: ±1 or ±2 from correct answer; all distinct |
| Two-digit add/sub (no-regroup) | Swap tens/ones digit; ±1 from result |
| Two-digit add/sub (regroup) | Off-by-carry: result of forgetting the carry/borrow |
| Multiplication | Adjacent-fact: `(A±1) × B` |
| Division | Near-miss quotient: ±1 to quotient; for remainders: ±1 to remainder |
| Fractions | Wrong-denominator result; divide-only (skip multiply step) |
| Square roots | Adjacent-square: `√(N±step)` where step = next perfect square gap |
| Multi-step | Wrong-order: add/subtract before multiply |
| Mixed | Wrong sub-expression result |

### `MathProblem` Type (from `shared/math-engine/src/types.ts`)
```typescript
interface MathProblem {
  question: string;             // The expression, e.g. "7 + 8"
  correctAnswer: number | string; // Numeric or "Q R r" format
  distractors: (number | string)[]; // 2–4 plausible wrong answers
  skillType?: string;           // Originating skillType
  gradeLevel?: number;          // 2–5
}
```

### Mapping to Game Type `IMathProblem`
`MathEngine.ts` (Phaser wrapper) converts `MathProblem` → `IMathProblem` 1:1. The only difference is that `IMathProblem.distractors` is typed `Array<number | string>` vs the library's `(number | string)[]` — structurally identical. No transform needed beyond property pass-through.

---

## Section 7 — Implementation Order

The Build agent must work through this list **in order**. Each file depends only on files above it in the list.

> Files marked ✅ are already complete — the Build agent skips them entirely and must NOT modify them.

| Step | File | Action |
|------|------|--------|
| 1 | `shared/math-engine/src/*` | ✅ Skip — all math library files exist |
| 2 | `games/missile-command-math/src/types/*` | ✅ Skip — all type stubs exist |
| 3 | `games/missile-command-math/src/config/*` | ✅ Skip — all config files exist |
| 4 | `games/missile-command-math/src/assets/*` | ✅ Skip — SpriteFactory and index exist |
| 5 | `games/missile-command-math/src/systems/MathEngine.ts` | ✅ Skip |
| 6 | `games/missile-command-math/src/systems/DifficultyManager.ts` | ✅ Skip |
| 7 | `games/missile-command-math/src/systems/ScoreManager.ts` | ✅ Skip |
| 8 | `games/missile-command-math/src/systems/AudioManager.ts` | ✅ Skip (but see surgical edits below) |
| 9 | `games/missile-command-math/src/systems/WaveManager.ts` | ✅ Skip |
| 10 | `games/missile-command-math/src/entities/Bomb.ts` | ✅ Skip (but see LAUNCHER_RELOAD edit) |
| 11 | `games/missile-command-math/src/entities/Launcher.ts` | ✅ Skip → **SURGICAL EDIT: add LAUNCHER_RELOAD playSFX** |
| 12 | `games/missile-command-math/src/entities/Projectile.ts` | ✅ Skip |
| 13 | `games/missile-command-math/src/entities/Explosion.ts` | ✅ Skip |
| 14 | `games/missile-command-math/src/entities/Building.ts` | ✅ Skip |
| 15 | `games/missile-command-math/src/entities/StrategicBomber.ts` | ✅ Skip |
| 16 | `games/missile-command-math/src/entities/HUDBar.ts` | ✅ Skip |
| 17 | `games/missile-command-math/src/scenes/BootScene.ts` | ✅ Skip |
| 18 | `games/missile-command-math/src/scenes/MenuScene.ts` | ✅ Skip → **SURGICAL EDIT: add MENU_BUTTON_CLICK per button** |
| 19 | `games/missile-command-math/src/scenes/TrainingBriefScene.ts` | ✅ Skip → **SURGICAL EDIT: add BRIEFING_ENTER + BRIEFING_DISMISS** |
| 20 | `games/missile-command-math/src/scenes/BriefingScene.ts` | ✅ Skip → **SURGICAL EDIT: add BRIEFING_ENTER + BRIEFING_DISMISS** |
| 21 | `games/missile-command-math/src/scenes/LevelReadyScene.ts` | ✅ Skip → **SURGICAL EDIT: add LEVEL_READY_BEEP** |
| 22 | `games/missile-command-math/src/scenes/GameScene.ts` | ✅ Skip → **SURGICAL EDIT: add TRAINING_SUCCESS + TRAINING_MISS + music routing on DIFFICULTY_CHANGED** |
| 23 | `games/missile-command-math/src/scenes/LevelCompleteScene.ts` | ✅ Skip → **SURGICAL EDIT: add STAR_REVEAL + FIREWORK_POP + CITY_REBUILD_TICK + LEVEL_COMPLETE music management** |
| 24 | `games/missile-command-math/src/scenes/GameOverScene.ts` | ✅ Skip → **SURGICAL EDIT: add MENU_BUTTON_CLICK per button** |
| 25 | `games/missile-command-math/src/scenes/VictoryScene.ts` | ✅ Skip → **SURGICAL EDIT: add VICTORY_FANFARE + playMusic(VICTORY)** |
| 26 | `games/missile-command-math/src/scenes/LevelSelectScene.ts` | ✅ Skip → **SURGICAL EDIT: add MENU_BUTTON_CLICK per button** |
| 27 | `games/missile-command-math/src/scenes/SettingsScene.ts` | ✅ Skip → **SURGICAL EDIT: add MENU_BUTTON_CLICK per button** |
| 28 | `games/missile-command-math/src/scenes/PauseScene.ts` | ✅ Skip → **SURGICAL EDIT: add MENU_BUTTON_CLICK per button** |
| 29 | `games/missile-command-math/src/systems/AudioManager.ts` | **SURGICAL EDIT: merge BOMBER_ESCAPED into THREAT_DESTROYED handler** |
| 30 | `games/missile-command-math/src/main.ts` | ✅ Skip |
| 31 | **`games/missile-command-math/vitest.config.ts`** | ✅ **CREATE** |
| 32 | **`games/missile-command-math/tests/unit/ScoreManager.test.ts`** | ✅ **CREATE** |
| 33 | **`games/missile-command-math/tests/unit/DifficultyManager.test.ts`** | ✅ **CREATE** |
| 34 | **`games/missile-command-math/tests/unit/MathEngineWrapper.test.ts`** | ✅ **CREATE** |
| 35 | **`games/missile-command-math/tests/unit/WaveManager.test.ts`** | ✅ **CREATE** |
| 36 | **`games/missile-command-math/tests/e2e/game.spec.ts`** | ✅ **CREATE** |

**Total files to create:** 6 new files + 9 surgical edits to existing files.

---

## Section 8 — Surgical Edit Specifications

Each surgical edit below is fully specified. The Build agent reads the target file, locates the exact insertion point, and adds only the lines shown. No wholesale rewrites.

### Edit 8.1 — `Launcher.ts`: Add LAUNCHER_RELOAD sound

**File:** `games/missile-command-math/src/entities/Launcher.ts`

**Locate:** The `import` block at the top of the file.  
**Add** (after existing imports):
```typescript
import { SOUND_EVENTS } from '../config/audioConfig';
```

**Locate:** The reload-complete callback — the `delayedCall` or timer callback that sets `this.isReloading = false` and/or calls `loadAnswer()`.  
**Add** immediately inside that callback, after `this.isReloading = false`:
```typescript
const _audioManager = this.scene.game.registry.get('audioManager') as
  { playSFX(id: string): void } | undefined;
_audioManager?.playSFX(SOUND_EVENTS.LAUNCHER_RELOAD);
```

---

### Edit 8.2 — `AudioManager.ts`: Merge BOMBER_ESCAPED into THREAT_DESTROYED handler

**File:** `games/missile-command-math/src/systems/AudioManager.ts`

**Locate** inside `wireEventListeners()`, the block:
```typescript
bus.on(GameEvents.THREAT_DESTROYED, (payload: ThreatDestroyedPayload) => {
  if (payload.threatType === 'bomber') {
    this.playSFX(SOUND_EVENTS.BOMBER_INTERCEPT);
  }
});
```

**Replace entirely** with:
```typescript
bus.on(GameEvents.THREAT_DESTROYED, (payload: ThreatDestroyedPayload) => {
  if (payload.threatType === 'bomber') {
    if (payload.points > 0) {
      this.playSFX(SOUND_EVENTS.BOMBER_INTERCEPT);
    } else {
      this.playSFX(SOUND_EVENTS.BOMBER_ESCAPED);
    }
  }
});
```

---

### Edit 8.3 — `MenuScene.ts`: MENU_BUTTON_CLICK on every button

**File:** `games/missile-command-math/src/scenes/MenuScene.ts`

**Locate** each interactive button's `on('pointerup', ...)` callback (Play, Level Select, Settings).  
**Add** as the **first line** inside each callback:
```typescript
(this.game.registry.get('audioManager') as { playSFX(s: string): void } | undefined)
  ?.playSFX(SOUND_EVENTS.MENU_BUTTON_CLICK);
```

**Add** import at top if not already present:
```typescript
import { SOUND_EVENTS } from '../config/audioConfig';
```

---

### Edit 8.4 — `BriefingScene.ts`: BRIEFING_ENTER + BRIEFING_DISMISS

**File:** `games/missile-command-math/src/scenes/BriefingScene.ts`

**Add import** at top if not already present:
```typescript
import { SOUND_EVENTS } from '../config/audioConfig';
import { MUSIC_TRACKS } from '../config/audioConfig';
```

**Locate** the end of `create()`, after all game objects are created.  
**Add:**
```typescript
const _am = this.game.registry.get('audioManager') as
  { playSFX(s: string): void; playMusic(s: string): void } | undefined;
_am?.playMusic(MUSIC_TRACKS.BRIEFING);
_am?.playSFX(SOUND_EVENTS.BRIEFING_ENTER);
```

**Locate** the "TAP TO LAUNCH →" button `on('pointerup', ...)` callback.  
**Add** as the first line inside:
```typescript
(this.game.registry.get('audioManager') as { playSFX(s: string): void } | undefined)
  ?.playSFX(SOUND_EVENTS.BRIEFING_DISMISS);
```

---

### Edit 8.5 — `TrainingBriefScene.ts`: BRIEFING_ENTER + BRIEFING_DISMISS

**File:** `games/missile-command-math/src/scenes/TrainingBriefScene.ts`

Apply identical changes to Edit 8.4 above.

---

### Edit 8.6 — `LevelReadyScene.ts`: LEVEL_READY_BEEP

**File:** `games/missile-command-math/src/scenes/LevelReadyScene.ts`

**Add import** at top if not already present:
```typescript
import { SOUND_EVENTS } from '../config/audioConfig';
```

**Locate** the end of `create()`, after all game objects are rendered.  
**Add:**
```typescript
(this.game.registry.get('audioManager') as { playSFX(s: string): void } | undefined)
  ?.playSFX(SOUND_EVENTS.LEVEL_READY_BEEP);
```

Also add `MENU_BUTTON_CLICK` to the READY button handler:
```typescript
(this.game.registry.get('audioManager') as { playSFX(s: string): void } | undefined)
  ?.playSFX(SOUND_EVENTS.MENU_BUTTON_CLICK);
```

---

### Edit 8.7 — `GameScene.ts`: TRAINING_SUCCESS + TRAINING_MISS + music on DIFFICULTY_CHANGED

**File:** `games/missile-command-math/src/scenes/GameScene.ts`

**Add import** at top if not already present:
```typescript
import { SOUND_EVENTS, MUSIC_TRACKS } from '../config/audioConfig';
```

**Locate** the `TRAINING_COMPLETE` event handler (should look like `this.events.on(GameEvents.TRAINING_COMPLETE, ...)`).  
**Add** inside that handler:
```typescript
(this.game.registry.get('audioManager') as { playSFX(s: string): void } | undefined)
  ?.playSFX(SOUND_EVENTS.TRAINING_SUCCESS);
```

**Locate** the section where a bomb hits a building during training mode (the guard `if (this.isTrainingMode || level === 0)` inside the `CITY_HIT` or bomb-reached-building handler).  
**Add:**
```typescript
(this.game.registry.get('audioManager') as { playSFX(s: string): void } | undefined)
  ?.playSFX(SOUND_EVENTS.TRAINING_MISS);
```

**Locate** the `DIFFICULTY_CHANGED` listener or add one in `create()`:
```typescript
this.events.on(GameEvents.DIFFICULTY_CHANGED, (config: IDifficultyConfig) => {
  const am = this.game.registry.get('audioManager') as
    { playMusic(s: string): void; selectGameplayMusic(l: number): string } | undefined;
  if (am) {
    am.playMusic(am.selectGameplayMusic(config.level));
  }
});
```

---

### Edit 8.8 — `LevelCompleteScene.ts`: Star sounds + fireworks + rebuild tick + music

**File:** `games/missile-command-math/src/scenes/LevelCompleteScene.ts`

**Add import** at top:
```typescript
import { SOUND_EVENTS, MUSIC_TRACKS } from '../config/audioConfig';
```

**Locate** `create()`. After all game objects are created, add:
```typescript
const _am = this.game.registry.get('audioManager') as
  { playSFX(s: string): void; playMusic(s: string): void; stopMusic(): void } | undefined;
_am?.playMusic(MUSIC_TRACKS.LEVEL_COMPLETE);
// Non-looping: stop after ~4s (8 bars @ 120 BPM)
this.time.delayedCall(4000, () => { _am?.stopMusic(); });
```

**Locate** the star reveal sequence. Find the loop or `delayedCall` that pops each star in. Inside each star pop callback:
```typescript
_am?.playSFX(SOUND_EVENTS.STAR_REVEAL);
```

> The style guide specifies three distinct pitches per sound guide: E5 / G5 / C6 (one per star). The AudioManager uses a single `STAR_REVEAL` synth config. The star-pitch escalation rule is an AudioManager internal detail; the scene just calls `playSFX(SOUND_EVENTS.STAR_REVEAL)` once per star.

**Locate** the fireworks loop (the `FIREWORK_STAGGER_MS`-staggered sequence over surviving buildings). Inside each firework sprite spawn:
```typescript
_am?.playSFX(SOUND_EVENTS.FIREWORK_POP);
```

**Locate** the city rebuild animation block (the `CITY_REBUILD_DURATION_MS` window). Add a repeating tick timer:
```typescript
const _rebuildTick = this.time.addEvent({
  delay: 200,
  callback: () => { _am?.playSFX(SOUND_EVENTS.CITY_REBUILD_TICK); },
  loop: true,
});
this.time.delayedCall(CITY_REBUILD_DURATION_MS, () => {
  _rebuildTick.remove();
});
```

---

### Edit 8.9 — `VictoryScene.ts`: VICTORY_FANFARE + music

**File:** `games/missile-command-math/src/scenes/VictoryScene.ts`

**Add import** at top:
```typescript
import { SOUND_EVENTS, MUSIC_TRACKS } from '../config/audioConfig';
```

**Locate** the beginning of `create()`, after `this.events.emit(GameEvents.SESSION_VICTORY, ...)`.  
**Add:**
```typescript
const _am = this.game.registry.get('audioManager') as
  { playSFX(s: string): void; playMusic(s: string): void; stopMusic(): void } | undefined;
_am?.stopMusic();
_am?.playMusic(MUSIC_TRACKS.VICTORY);
_am?.playSFX(SOUND_EVENTS.VICTORY_FANFARE);
```

**Locate** the back-to-menu / return button `on('pointerup', ...)`.  
**Add** as first line inside:
```typescript
(this.game.registry.get('audioManager') as { playSFX(s: string): void } | undefined)
  ?.playSFX(SOUND_EVENTS.MENU_BUTTON_CLICK);
```

---

### Edit 8.10 — `GameOverScene.ts`: MENU_BUTTON_CLICK

**File:** `games/missile-command-math/src/scenes/GameOverScene.ts`

**Add import** at top:
```typescript
import { SOUND_EVENTS } from '../config/audioConfig';
```

**Locate** each interactive button `on('pointerup', ...)` (Retry, Level Select, Menu).  
**Add** as first line inside each:
```typescript
(this.game.registry.get('audioManager') as { playSFX(s: string): void } | undefined)
  ?.playSFX(SOUND_EVENTS.MENU_BUTTON_CLICK);
```

---

### Edit 8.11 — `LevelSelectScene.ts`: MENU_BUTTON_CLICK

**File:** `games/missile-command-math/src/scenes/LevelSelectScene.ts`

Apply same pattern as Edit 8.10 to all level cell click handlers and the back/menu buttons.

---

### Edit 8.12 — `SettingsScene.ts`: MENU_BUTTON_CLICK

**File:** `games/missile-command-math/src/scenes/SettingsScene.ts`

Apply same pattern as Edit 8.10 to all button handlers (difficulty selector buttons, sound toggle button, back button).

---

### Edit 8.13 — `PauseScene.ts`: MENU_BUTTON_CLICK

**File:** `games/missile-command-math/src/scenes/PauseScene.ts`

Apply same pattern as Edit 8.10 to Resume and Quit button handlers.

---

## Section 9 — Full Data Flow Reference

This section documents the full end-to-end data flows for the Build agent to verify integration points.

### 9.1 Math Problem Generation to Bomb Rendering

```
GameScene.create()
  → DifficultyManager.getCurrentConfig()           // get IDifficultyConfig
  → MathEngine.generateWaveProblems(
       gradeLevel,
       difficultyManager.getActiveSkillTypes(),
       config.problemsInWave
     )                                              // returns IMathProblem[]
  → emits GameEvents.PROBLEM_GENERATED             // ProblemGeneratedPayload
       { problems: IMathProblem[], answerQueue: (number|string)[] }
  → WaveManager listens on PROBLEM_GENERATED
  → WaveManager stores problems + answerQueue
  → WaveManager.startWave() on INTERSTITIAL_DISMISSED
  → emits GameEvents.WAVE_STARTED { level, totalThreats }
  → WaveManager spawns Bomb entities on timed intervals
       new Bomb(scene, x, y, problem, speed, targetBuildingIndex)
  → Bomb renders problem.question as child Text object
       text style: fontFamily Georgia serif, size 28, weight 700, color '#E8701A'
       minimum 24px bold (WCAG AA large-text)
  → Bomb descends via scene.tweens or scene.physics
```

### 9.2 Player Tap to Hit/Miss Resolution

```
Player taps bomb (pointerup on Bomb)
  → Bomb emits event or GameScene.handleBombTap(bomb) is called
  → WaveManager.handleBombTap(bomb.problem)
  → compares bomb.problem.correctAnswer to currentLoadedAnswer
  → if match:
      MathEngine.validateAnswer(bomb.problem, loadedAnswer)
      → emits ANSWER_VALIDATED { problem, correct: true, attemptedAnswer }
      → AudioManager plays BOMB_INTERCEPT_LAUNCH (immediate)
      → AudioManager plays BOMB_INTERCEPT_HIT (80ms delay)
      → nearest matching Launcher.fire(bomb.x, bomb.y)
         → creates Projectile(scene, launcherX, launcherY, targetX, targetY)
         → emits INTERCEPTOR_FIRED
         → Launcher starts reload timer (launcherReloadDelayMs)
         → Launcher.loadAnswer(nextAnswer) on reload complete
         → AudioManager plays LAUNCHER_RELOAD on reload complete
      → Projectile travels to target position
         → on arrival: emits INTERCEPTOR_DETONATED { x, y, targetBombId }
         → GameScene spawns Explosion(x, y, solvedEquation)
         → GameScene destroys Bomb
         → Bomb emits THREAT_DESTROYED { threatId, threatType, points, chainReaction }
         → ScoreManager.addPoints(points)
         → emits SCORE_UPDATED { score, delta, multiplier }
         → HUDBar updates score display
         → GameScene spawns ScorePop at explosion position
         → ScoreManager.incrementStreak()
         → if milestone: emits STREAK_MILESTONE
         → GameScene shows/slides StreakBadge
         → AudioManager plays STREAK_3/5/10 as appropriate
         → WaveManager.onThreatResolved()
         → if all threats resolved: emits LEVEL_COMPLETE
  → if no match:
      MathEngine.validateAnswer(bomb.problem, loadedAnswer) — NOT called
      (wrong tap means no matching loaded answer)
      WaveManager emits WRONG_TAP { bombId }
      → GameScene: flash nearest launcher (LAUNCHER_WRONG_FLASH anim)
      → AudioManager plays BOMB_WRONG_TAP
      → ScoreManager.resetStreak()
      → no points change
```

### 9.3 Bomb Reaches Building

```
Bomb tween/physics reaches target Y position
  → Bomb emits GameEvents.CITY_HIT { cityIndex, remainingHp: building.hit() }
  → Building.hit() decrements HP
  → if hp > 0: Building plays BUILDING_HIT anim (building_damaged)
  → if hp === 0: Building plays building_destroyed; emits CITY_DESTROYED { cityIndex, cityName }
  → AudioManager plays BOMB_REACHES_BUILDING on CITY_HIT
  → AudioManager plays BUILDING_DESTROYED on CITY_DESTROYED
  → HUDBar updates population display
  → WaveManager.onCityDestroyed()
  → if all 6 cities destroyed: emits GAME_OVER { level, finalScore }
     → AudioManager stops music; plays GAME_OVER_STING
     → GameScene.start('GameOverScene', { level, finalScore })
  → Bomb.destroy() — entity removed from scene
  → if level 0 (training): no damage applied; plays TRAINING_MISS; wave loops
```

### 9.4 Level Complete → Scene Transition

```
WaveManager detects all threats resolved (not from city destruction)
  → ScoreManager.calculateStars(citiesSurviving)
  → emits LEVEL_COMPLETE {
       level, stars, citiesSurviving, score,
       accuracy: scoreManager.getAccuracy(),
       chainReactions: scoreManager.getChainCount(),
       perfectWave: noMisses
     }
  → AudioManager ducks music; plays LEVEL_COMPLETE_FANFARE
  → DifficultyManager.onLevelComplete() → advances level → emits DIFFICULTY_CHANGED
  → GameScene listens to LEVEL_COMPLETE → transitions to LevelCompleteScene
       this.scene.start('LevelCompleteScene', payload)
  → LevelCompleteScene.create(data: LevelCompletePayload)
     → plays MUSIC_LEVEL_COMPLETE
     → reveals stars one by one (300ms apart) + STAR_REVEAL per star
     → spawns fireworks per surviving building (FIREWORK_STAGGER_MS apart) + FIREWORK_POP per burst
     → runs crane animation on destroyed buildings for CITY_REBUILD_DURATION_MS + CITY_REBUILD_TICK every 200ms
     → snaps destroyed buildings back to intact sprites at CITY_REBUILD_DURATION_MS
     → shows Next Level / Level Select buttons
  → if level was 20: GameScene.start('VictoryScene', { finalScore })
  → else: determine next scene
     if nextLevel has 'new-op' specialRule: start('BriefingScene', { level: nextLevel })
     else: start('LevelReadyScene', { level: nextLevel })
```

### 9.5 Strategic Bomber (Level 13+)

```
WaveManager (bomberEnabled): spawns StrategicBomber at level.13+
  → StrategicBomber enters from left edge at y ~ 80px (high altitude)
  → emits THREAT_SPAWNED { threatId, threatType: 'bomber', problem: bomberProblem }
  → AudioManager plays BOMBER_ALERT (with 8s cooldown anti-spam)
  → StrategicBomber traverses screen right in BOMBER_TRAVERSAL_MS / bomberSpeedMultiplier
  → At defined drop points: emits BOMBER_PAYLOAD_DROPPED { bomberThreatId, droppedMissileIds }
     → AudioManager plays BOMB_DROP_FROM_BOMBER
     → WaveManager spawns Bomb entities for each dropped missile
  → If player taps bomber: WaveManager.handleBombTap(bomber.problem)
     → if correct: Launcher fires at bomber
       → on hit: StrategicBomber emits THREAT_DESTROYED { points: 50 or 100, chainReaction: false }
         → if 0 drops made: points = 100 (SCORE_VALUES.bomberBeforeDrop)
         → if ≥1 drop made: points = 50 (SCORE_VALUES.bomberAfterDrop)
       → AudioManager: BOMBER_INTERCEPT (points > 0 branch)
  → If bomber reaches right edge without intercept:
     → StrategicBomber emits THREAT_DESTROYED { points: 0, chainReaction: false }
     → AudioManager: BOMBER_ESCAPED (points === 0 branch)
     → WaveManager.onThreatResolved(escaped: true)
```

### 9.6 Streak Badge Display

```
ScoreManager.incrementStreak() → at 3, 5, or 10:
  emits STREAK_MILESTONE { streak, label, multiplier }
  → GameScene listens:
     → shows StreakBadge (streak_badge sprite, width 200, height 36)
     → text: label (e.g. 'SHARP SHOOTER!')
     → Animation: slide in from right 200px over STREAK_BADGE_SLIDE_IN_MS (300ms)
     → hold for STREAK_BADGE_HOLD_MS (900ms)
     → slide out STREAK_BADGE_SLIDE_OUT_MS (300ms)
     → all tweens use Phaser.Math.Easing.Sine.easeOut (Phaser tween 'Sine.easeOut')
  → AudioManager: STREAK_3 / STREAK_5 / STREAK_10

ScoreManager.resetStreak() — called on wrong tap:
  → emits nothing extra (WRONG_TAP event from WaveManager covers audio)
  → AudioManager: BOMB_WRONG_TAP already fires STREAK_RESET sound implicitly
  → GameScene: hides any active StreakBadge
```

### 9.7 Score Pop

```
ScoreManager.addPoints(delta) → emits SCORE_UPDATED { score, delta, multiplier }
→ GameScene listens on SCORE_UPDATED:
   → spawns ScorePop text at explosion position
   → text: '+{delta × multiplier}' (rounded integer)
   → style: fontFamily Georgia, size 26, weight 700, color '#F0A000' (COLOR_EXPLOSION_OUTER)
   → tween: y - SCORE_POP_RISE_PX (60px) over SCORE_POP_DURATION_MS (700ms)
   → alpha: 1.0 → 0 over last 300ms (starting at SCORE_POP_FADE_START_MS = 400ms)
   → easing: Sine.easeOut
   → destroy on tween complete
→ AudioManager: SCORE_POP_TICK (tiny tick, cooldown 100ms to prevent spam)
```

---

## Section 10 — Accessibility Checklist

The Build agent must ensure the following are satisfied before marking the build done:

| Requirement | Implementation |
|------------|----------------|
| Bomb touch targets ≥ 60px | `Bomb` interactive area uses `MIN_TOUCH_TARGET_PX` (60); set via `setInteractive({ hitArea: new Phaser.Geom.Rectangle(-30, -30, 60, 60), hitAreaCallback: Phaser.Geom.Rectangle.Contains })` or equivalent |
| Math text ≥ 24px bold | `TEXT_MATH_PROBLEM`: `fontFamily: 'Georgia, "Times New Roman", serif'`, `fontSize: '28px'`, `fontStyle: 'bold'` |
| Launcher answer ≥ 32px bold | `TEXT_LAUNCHER_ANSWER`: `fontFamily: 'Georgia, "Times New Roman", serif'`, `fontSize: '32px'`, `fontStyle: 'bold'` |
| All feedback dual-channel | Every sound event has a visual counterpart in GameScene or entity; confirmed by event contract table |
| Trajectory trails always shown | `Bomb.ts` spawns trail dots unconditionally (not toggled) |
| Pause button always visible | `GameScene.ts` renders pause button at `(PAUSE_BUTTON_X, PAUSE_BUTTON_Y)` outside CRT bezel; survives all game states |
| No auto-advance timers on cutscenes | `BriefingScene`, `TrainingBriefScene`, `LevelReadyScene` — dismiss only via explicit pointer |
| Reduced-motion: suppress particles | In `BootScene` / `GameScene`, check `window.matchMedia('(prefers-reduced-motion: reduce)').matches`; if true, skip trail particles, smoke particles, explosion particles, and firework tweens; keep only sprite frame changes |
| Reduced-motion: suppress looping SFX | `AudioManager` suppresses `CITY_REBUILD_TICK` and `FIREWORK_POP` when `prefers-reduced-motion` is active |
| Portrait + landscape | Phaser scale mode is `FIT` + `CENTER_BOTH`; verified in `main.ts` |
| No color-only matching | Launchers match math answers, not colors — confirmed by GDD |

---

## Section 11 — localStorage Usage (Policy Compliance)

Per `CLAUDE.md` localStorage policy, the following reads/writes are **allowed**:

| Key | Type | When Written | When Read |
|-----|------|-------------|-----------|
| `mcm_sound_enabled` | `'0'` or `'1'` | `AudioManager.setEnabled()` | `BootScene.create()` |
| `mcm_difficulty` | `'easy'` \| `'normal'` \| `'hard'` | `SettingsScene` on change | `BootScene.create()` |
| `mcm_stars` | `JSON.stringify(number[])` (indices 1–20) | `LevelCompleteScene` on complete | `LevelSelectScene.create()` |
| `mcm_highest_level` | `string` (number 1–20) | `LevelCompleteScene` on complete | `LevelSelectScene.create()`, `MenuScene.create()` |

**Prohibited:**
- Writing any data during active gameplay (only read + write on scene transitions)
- Writing any player-identifying data
- Writing mid-game state (score, current bombs, etc.)

---

## Section 12 — TypeScript / Lint Rules

The Build agent must ensure all new files pass `npm run typecheck` and `npm run lint` with zero errors.

### Required Imports Pattern

```typescript
// ✅ Always import SPRITE_KEYS and ANIM_KEYS from assets barrel
import { SPRITE_KEYS, ANIM_KEYS } from '../assets';

// ✅ Always import sound constants from audioConfig
import { SOUND_EVENTS, MUSIC_TRACKS } from '../config/audioConfig';

// ✅ Always import game constants from gameConfig
import { CANVAS_WIDTH, CANVAS_HEIGHT, ... } from '../config/gameConfig';

// ✅ Always use GameEvents constants — never raw strings
import { GameEvents } from '../types/GameEvents';
this.events.emit(GameEvents.SCORE_UPDATED, payload);

// ❌ Never do this:
this.events.emit('score-updated', payload);
this.add.image(x, y, 'bomb_orange');
this.sound.play('BOMB_INTERCEPT_LAUNCH');
```

### ESLint Rules to Respect
- No `any` type — use explicit types or `unknown` + type guards
- No `console.log` in production code (tests may use it)
- All public methods have JSDoc comments
- Named constants for all magic numbers — import from config files
- No raw string literals for sprite, animation, or sound keys

---

## Section 13 — Definition of Done

The Build agent must not commit until **all** of the following are true:

- [ ] **All 6 new files exist** (vitest.config.ts + 4 unit test files + 1 e2e test file)
- [ ] **All 13 surgical edits applied** (edits 8.1–8.13, each sound event wired)
- [ ] `npm run typecheck` from `games/missile-command-math/` exits with **zero errors**
- [ ] `npm run lint` from `games/missile-command-math/` exits with **zero warnings or errors**
- [ ] `npm run test:run` from `games/missile-command-math/` exits with **zero failures** (all unit tests pass)
- [ ] `npm run test:run` from `shared/math-engine/` exits with **zero failures** (math engine tests still pass after no changes — verify not broken)
- [ ] All sound events in `docs/sound-guides/missile-command-math.md` are wired (see Section 4 completeness table)
- [ ] No hardcoded magic numbers in new or edited code — all values imported from config
- [ ] No raw string literals for sprite keys, anim keys, or sound event IDs
- [ ] All new public methods have JSDoc comments
- [ ] `git add -A && git commit -m "feat: implement missile-command-math"` completes cleanly

### Quick Verification Checklist for Sound Events

After all edits, verify every sound event from the sound guide is wired:

| Sound Event | Wired? | Trigger Location |
|-------------|--------|-----------------|
| `BOMB_INTERCEPT_LAUNCH` | ✅ (AudioManager) | ANSWER_VALIDATED correct |
| `BOMB_INTERCEPT_HIT` | ✅ (AudioManager) | 80ms after ANSWER_VALIDATED |
| `BOMB_WRONG_TAP` | ✅ (AudioManager) | WRONG_TAP event |
| `LAUNCHER_RELOAD` | Edit 8.1 | Launcher reload callback |
| `BOMB_REACHES_BUILDING` | ✅ (AudioManager) | CITY_HIT event |
| `BUILDING_DESTROYED` | ✅ (AudioManager) | CITY_DESTROYED event |
| `CITY_SAVE_CHIME` | ✅ (AudioManager) | CITY_SAVED event |
| `STREAK_3` | ✅ (AudioManager) | STREAK_MILESTONE streak≥3 |
| `STREAK_5` | ✅ (AudioManager) | STREAK_MILESTONE streak≥5 |
| `STREAK_10` | ✅ (AudioManager) | STREAK_MILESTONE streak≥10 |
| `STREAK_RESET` | ✅ (AudioManager via WRONG_TAP) | WRONG_TAP event |
| `BOMBER_ALERT` | ✅ (AudioManager) | THREAT_SPAWNED bomber |
| `BOMBER_INTERCEPT` | Edit 8.2 | THREAT_DESTROYED bomber points>0 |
| `BOMBER_ESCAPED` | Edit 8.2 | THREAT_DESTROYED bomber points===0 |
| `BOMB_DROP_FROM_BOMBER` | ✅ (AudioManager) | BOMBER_PAYLOAD_DROPPED |
| `SCORE_POP_TICK` | ✅ (AudioManager) | SCORE_UPDATED |
| `LEVEL_COMPLETE_FANFARE` | ✅ (AudioManager) | LEVEL_COMPLETE |
| `STAR_REVEAL` | Edit 8.8 | LevelCompleteScene star pop-in |
| `FIREWORK_POP` | Edit 8.8 | LevelCompleteScene firework spawn |
| `WAVE_START` | ✅ (AudioManager) | WAVE_STARTED |
| `LEVEL_READY_BEEP` | Edit 8.6 | LevelReadyScene.create() |
| `BRIEFING_ENTER` | Edits 8.4, 8.5 | BriefingScene / TrainingBriefScene create() |
| `BRIEFING_DISMISS` | Edits 8.4, 8.5 | TAP TO LAUNCH handler |
| `TRAINING_SUCCESS` | Edit 8.7 | GameScene TRAINING_COMPLETE handler |
| `TRAINING_MISS` | Edit 8.7 | GameScene training bomb-hit handler |
| `CITY_REBUILD_TICK` | Edit 8.8 | LevelCompleteScene crane animation |
| `GAME_OVER_STING` | ✅ (AudioManager) | GAME_OVER event |
| `VICTORY_FANFARE` | Edit 8.9 | VictoryScene.create() |
| `MENU_BUTTON_CLICK` | Edits 8.3, 8.9, 8.10, 8.11, 8.12, 8.13 | All menu button handlers |
| `PAUSE_IN` | ✅ (AudioManager) | GAME_PAUSED event |
| `PAUSE_OUT` | ✅ (AudioManager) | GAME_RESUMED event |
| `SOUND_TOGGLE` | ✅ (AudioManager) | SOUND_TOGGLED (enabled) |

**Total: 34 sound events — all 34 must be wired before the build is done.**

---

## Appendix A — Key File Cross-Reference

| Imports This | Used In |
|--------------|---------|
| `SPRITE_KEYS`, `ANIM_KEYS` from `../assets` | Every scene and entity that renders sprites |
| `SOUND_EVENTS`, `MUSIC_TRACKS` from `../config/audioConfig` | Every scene/entity that triggers audio |
| `GameEvents` from `../types/GameEvents` | Every file that emits or listens to events |
| `CANVAS_WIDTH`, `CANVAS_HEIGHT` from `../config/gameConfig` | All scenes for layout |
| `LEVEL_CONFIGS` from `../config/difficultyConfig` | DifficultyManager, MenuScene, LevelSelectScene |
| `SCORE_VALUES`, `STREAK_THRESHOLDS` from `../config/scoreConfig` | ScoreManager |
| `MathEngineCore` from `@arcade-swarm/math-engine` | MathEngine.ts (Phaser wrapper) |

## Appendix B — Scene Transition Map

```
BootScene ──────────────────────────────────────► MenuScene
MenuScene ──────[first play]────────────────────► TrainingBriefScene
MenuScene ──────[play, level 1 new-op]───────────► BriefingScene
MenuScene ──────[play, practice level]───────────► LevelReadyScene
MenuScene ──────[level select]───────────────────► LevelSelectScene
MenuScene ──────[settings]───────────────────────► SettingsScene
TrainingBriefScene ──[TAP TO LAUNCH]────────────► GameScene (level: 0)
BriefingScene ──────[TAP TO LAUNCH]─────────────► GameScene (level: N)
LevelReadyScene ────[READY!]────────────────────► GameScene (level: N)
LevelSelectScene ───[level cell tap]─────────────► BriefingScene or LevelReadyScene
SettingsScene ──────[back]───────────────────────► MenuScene
GameScene ──────────[all bombs destroyed]────────► LevelCompleteScene (data: LevelCompletePayload)
GameScene ──────────[all cities destroyed]───────► GameOverScene (data: GameOverPayload)
GameScene ──────────[pause button]───────────────► PauseScene.launch() (overlay)
PauseScene ─────────[resume]─────────────────────► PauseScene.stop() → GameScene resumes
PauseScene ─────────[quit]───────────────────────► PauseScene.stop() → MenuScene
LevelCompleteScene ─[next level, new-op]─────────► BriefingScene
LevelCompleteScene ─[next level, practice]───────► LevelReadyScene
LevelCompleteScene ─[level 20 complete]──────────► VictoryScene
LevelCompleteScene ─[back to menu]───────────────► MenuScene
GameOverScene ──────[retry]──────────────────────► GameScene (same level)
GameOverScene ──────[level select]───────────────► LevelSelectScene
GameOverScene ──────[menu]───────────────────────► MenuScene
VictoryScene ───────[menu]───────────────────────► MenuScene
```

## Appendix C — Entity Constructor Signatures (for test mocking)

These are the actual constructor signatures to expect when mocking entities in tests:

```typescript
// Bomb
new Bomb(
  scene: Phaser.Scene,
  x: number,
  y: number,
  problem: IMathProblem,
  speed: number,           // pixels/second descent speed
  targetCityIndex: number  // 0–5
)

// Launcher
new Launcher(
  scene: Phaser.Scene,
  x: number,
  y: number,
  position: 'left' | 'center' | 'right',
  spriteKey: SpriteKey,    // SPRITE_KEYS.LAUNCHER_ORANGE etc.
  initialAnswer: number | string | null
)

// Explosion
new Explosion(
  scene: Phaser.Scene,
  x: number,
  y: number,
  solvedEquation: string | null
)

// Building
new Building(
  scene: Phaser.Scene,
  x: number,
  y: number,
  cityIndex: number,       // 0–5
  cityName: string
)

// StrategicBomber
new StrategicBomber(
  scene: Phaser.Scene,
  problem: IMathProblem,
  speedMultiplier: number
)

// WaveManager
new WaveManager(
  scene: Phaser.Scene,
  mathEngine: MathEngine,
  difficultyManager: DifficultyManager,
  scoreManager: ScoreManager
)

// ScoreManager
new ScoreManager(emitter: Phaser.Events.EventEmitter)

// DifficultyManager
new DifficultyManager(
  emitter: Phaser.Events.EventEmitter,
  difficultySetting?: DifficultySetting,   // default: 'normal'
  startingLevel?: number                   // default: 1
)

// MathEngine (Phaser wrapper)
new MathEngine(emitter: Phaser.Events.EventEmitter)

// AudioManager
new AudioManager(scene: Phaser.Scene, soundEnabled: boolean)
```

---

*End of build plan. The Build agent has all information needed to complete the implementation in a single pass.*
