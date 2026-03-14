# Build Plan — Missile Command Math — Coding Agent 2 (Gameplay)

## Role Summary
You are responsible for all gameplay mechanics: every enemy entity, the player's `Launcher` and `AnswerQueue`, the `ScoreManager`, the `WaveManager` spawner, and all input handling. You do **not** create scenes, config files, or math problem generators — those belong to Coding Agents 1 and 3. You communicate with other agents exclusively through Phaser's event bus.

---

## 1. Files to Create

All paths are relative to the repo root. Your worktree is checked out at `games/missile-command-math/`.

```
games/missile-command-math/src/entities/City.ts
games/missile-command-math/src/entities/StandardMissile.ts
games/missile-command-math/src/entities/BomberMissile.ts
games/missile-command-math/src/entities/MIRVMissile.ts
games/missile-command-math/src/entities/MIRVChild.ts
games/missile-command-math/src/entities/StrategicBomber.ts
games/missile-command-math/src/entities/ParatrooperPlane.ts
games/missile-command-math/src/entities/Paratrooper.ts
games/missile-command-math/src/entities/Launcher.ts
games/missile-command-math/src/entities/AnswerQueue.ts
games/missile-command-math/src/entities/Explosion.ts
games/missile-command-math/src/entities/TrajectoryLine.ts
games/missile-command-math/src/systems/ScoreManager.ts
games/missile-command-math/src/systems/WaveManager.ts
```

---

## 2. Class and Interface Definitions

### 2.1 `src/entities/City.ts`

```typescript
class City extends Phaser.GameObjects.Container {
  /** 0-based index matching CITY_X_POSITIONS row order. */
  readonly cityIndex: number;
  /** Human-readable name (e.g. "NEW YORK"). */
  readonly cityName: string;
  /** Current hit points; starts at CITY_HIT_POINTS (3). */
  hitPoints: number;
  /** True when hitPoints reaches 0. */
  destroyed: boolean;
  /** The texture key for this city's sprite (e.g. 'SPRITE_CITY_NYC'). */
  private spriteKey: string;

  constructor(
    scene: Phaser.Scene,
    cityIndex: number,   // 0–5
    cityName: string,    // 'NEW YORK' | 'CHICAGO' | 'LOS ANGELES' | 'HOUSTON' | 'WASHINGTON' | 'SEATTLE'
    x: number,           // world X — from CITY_X_POSITIONS[cityIndex % 3]
    y: number,           // world Y — CITY_ROW_TOP_Y (cities 0–2) or CITY_ROW_BOTTOM_Y (cities 3–5)
  )

  /**
   * Apply one hit to this city.
   * Emits CITY_HIT. If hitPoints reaches 0, calls destroy().
   * @returns remaining hitPoints after the hit.
   */
  hit(): number

  /**
   * Destroy this city: set destroyed = true, swap to SPRITE_CITY_DESTROYED tint.
   * Emits CITY_DESTROYED with { cityIndex, cityName }.
   */
  destroyCity(): void

  /**
   * Rebuild this city (called between levels).
   * Resets hitPoints to CITY_HIT_POINTS, plays SPRITE_CITY_REBUILD animation,
   * restores active sprite. Emits CITY_REBUILT when animation completes.
   */
  rebuild(): void

  /**
   * Flash the city gold (city-save celebration).
   * Pulses COLOR_CITY_CELEBRATE tint: 2 pulses × 500 ms each.
   */
  celebrateSave(): void

  /** Returns the world-space center-top position for trajectory line targeting. */
  getTargetPoint(): { x: number; y: number }
}
```

**City layout map** (define as a `const` inside this file):
```typescript
const CITY_CONFIGS: Array<{ name: string; spriteKey: string }> = [
  { name: 'NEW YORK',      spriteKey: 'SPRITE_CITY_NYC' },
  { name: 'CHICAGO',       spriteKey: 'SPRITE_CITY_CHI' },
  { name: 'LOS ANGELES',   spriteKey: 'SPRITE_CITY_LAX' },
  { name: 'HOUSTON',       spriteKey: 'SPRITE_CITY_HOU' },
  { name: 'WASHINGTON',    spriteKey: 'SPRITE_CITY_DC'  },
  { name: 'SEATTLE',       spriteKey: 'SPRITE_CITY_SEA' },
];
```

---

### 2.2 `src/entities/StandardMissile.ts`

Base missile class. All other missile types extend this.

```typescript
class StandardMissile extends Phaser.GameObjects.Container {
  /** Unique ID for this threat instance (UUID v4 string). */
  readonly threatId: string;
  /** Math problem displayed on this missile's body. */
  problem: IMathProblem;
  /** Index of the target city (0–5). */
  targetCityIndex: number;
  /** Speed in px/s — set from difficultyConfig.missileSpeedMultiplier × base descent speed. */
  speed: number;
  /** Whether this missile has already been destroyed. */
  destroyed: boolean;
  /** Reference to the attached TrajectoryLine. */
  private trajectoryLine: TrajectoryLine;
  /** Reference to the math problem text object. */
  private problemText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,          // spawn X (random within play field width)
    problem: IMathProblem,
    targetCityIndex: number,
    speed: number,      // px/s
    cities: City[],     // array of all 6 city instances for TrajectoryLine
  )

  /** Called each frame by Phaser update loop. Moves missile toward target city. */
  preUpdate(time: number, delta: number): void

  /**
   * Destroy this missile (intercepted or chain reaction).
   * Plays missile-destroyed visual feedback if needed, emits THREAT_DESTROYED,
   * removes trajectory line, removes self from scene.
   * @param chainReaction - true if destroyed by chain reaction (not direct tap).
   * @param points - points to award (calculated by WaveManager or ScoreManager).
   */
  intercept(chainReaction: boolean, points: number): void

  /**
   * Called when this missile reaches its target city.
   * Calls city.hit(). Does NOT emit THREAT_DESTROYED (was not intercepted).
   */
  private onReachCity(): void

  /** Returns world position as { x, y } for explosion origin. */
  getPosition(): { x: number; y: number }

  /** Returns the math question string for display. */
  getQuestion(): string

  /** Returns the correct answer for this missile's problem. */
  getAnswer(): number | string
}
```

**`THREAT_DESTROYED` payload emitted by `intercept()`:**
```typescript
{
  threatId: string,
  threatType: 'standard-missile',
  points: number,
  chainReaction: boolean,
  x: number,        // world X of explosion (this.x)
  y: number,        // world Y of explosion (this.y)
}
```

> ⚠️ The `x` and `y` fields are **required** by Coding Agent 1's `EffectsSystem` to position the explosion animation. Always include them.

**Spawn tween:** Scale 0 → 1 over 80 ms using `Back.Out` easing on `preUpdate` first frame.

**Problem text:** Rendered using `TEXT_MISSILE_PROBLEM` style from `styleConfig.ts`. Positioned centered on the missile container. Minimum font size 18 px per accessibility requirements.

---

### 2.3 `src/entities/BomberMissile.ts`

```typescript
class BomberMissile extends StandardMissile {
  /** Reference to the parent bomber that dropped this missile. */
  readonly parentBomberId: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,          // drops from bomber's Y position
    problem: IMathProblem,
    targetCityIndex: number,
    speed: number,
    cities: City[],
    parentBomberId: string,
  )

  preUpdate(time: number, delta: number): void  // descends vertically from drop Y
}
```

`threatType` in `THREAT_DESTROYED` payload: `'bomber-missile'`.

---

### 2.4 `src/entities/MIRVMissile.ts`

```typescript
class MIRVMissile extends StandardMissile {
  /** Y altitude (world Y) at which this MIRV splits. Computed from MIRV_SPLIT_ALTITUDE_PERCENT. */
  splitY: number;
  /** Number of children to spawn on split (from difficultyConfig.mirvChildCount). */
  childCount: number;
  /** True after the split has occurred. */
  hasSplit: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    problem: IMathProblem,
    targetCityIndex: number,
    speed: number,
    cities: City[],
    splitAltitudePercent: number,  // e.g. 40 → split at 40% from top of play field
    childCount: number,
  )

  preUpdate(time: number, delta: number): void  // overrides to check for splitY threshold

  /**
   * Execute the MIRV split: spawn childCount MIRVChild entities,
   * emit MIRV_SPLIT, then call intercept() on self (not a scoring event).
   */
  private split(): void
}
```

`threatType` in `THREAT_DESTROYED` payload: `'mirv'`.

`MIRV_SPLIT` payload:
```typescript
{ parentThreatId: string; childThreatIds: string[] }
```

---

### 2.5 `src/entities/MIRVChild.ts`

```typescript
class MIRVChild extends StandardMissile {
  readonly parentMIRVId: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,           // spawn at parent's split position
    problem: IMathProblem,
    targetCityIndex: number,
    speed: number,        // parent speed × 1.2 (faster after split)
    cities: City[],
    parentMIRVId: string,
  )
}
```

`threatType` in `THREAT_DESTROYED` payload: `'mirv-child'`.

Uses `COLOR_MIRV_CHILD` tint on sprite.

---

### 2.6 `src/entities/StrategicBomber.ts`

```typescript
class StrategicBomber extends Phaser.GameObjects.Container {
  readonly threatId: string;
  /** The bonus math problem attached to this bomber (answered for +100 before drop). */
  bonusProblem: IMathProblem;
  /** Number of payload missiles this bomber will drop. */
  payloadCount: number;
  /** Horizontal direction: 1 = left→right, -1 = right→left. */
  horizontalDir: 1 | -1;
  /** Speed in px/s. */
  speed: number;
  /** True once payload has been dropped. */
  hasDroppedPayload: boolean;
  destroyed: boolean;

  constructor(
    scene: Phaser.Scene,
    bonusProblem: IMathProblem,
    payloadProblems: IMathProblem[],  // problems for BomberMissiles it drops
    cities: City[],
    speed: number,
    payloadCount: number,
    horizontalDir: 1 | -1,
  )

  preUpdate(time: number, delta: number): void

  /**
   * Drop the payload: spawn `payloadCount` BomberMissile entities,
   * emit BOMBER_PAYLOAD_DROPPED, set hasDroppedPayload = true.
   */
  dropPayload(): void

  /**
   * Intercept this bomber (player taps correct answer before payload drop).
   * Points: SCORE_VALUES.bomberBeforeDrop (+100).
   * Emits THREAT_DESTROYED with threatType 'bomber' and x, y position.
   */
  intercept(): void

  /**
   * Destroy after payload drop.
   * Points: SCORE_VALUES.bomberAfterDrop (+40).
   * Emits THREAT_DESTROYED with threatType 'bomber' and x, y position.
   */
  destroyAfterDrop(): void
}
```

Bomber flies across screen at constant velocity at Y ≈ 120 (above main play field). Drops payload at horizontal center of screen.

`BOMBER_PAYLOAD_DROPPED` payload:
```typescript
{ bomberThreatId: string; droppedMissileIds: string[] }
```

---

### 2.7 `src/entities/ParatrooperPlane.ts`

```typescript
class ParatrooperPlane extends Phaser.GameObjects.Container {
  readonly threatId: string;
  speed: number;
  dropCount: number;      // number of paratroopers to drop
  horizontalDir: 1 | -1;
  destroyed: boolean;

  constructor(
    scene: Phaser.Scene,
    speed: number,
    dropCount: number,
    horizontalDir: 1 | -1,
    cities: City[],
  )

  preUpdate(time: number, delta: number): void

  /**
   * Drop a single Paratrooper at the plane's current X position.
   * Picks a random non-destroyed city as target. Emits PARATROOPER_DROPPED.
   */
  dropParatrooper(): void
}
```

`PARATROOPER_DROPPED` payload:
```typescript
{ transportId: string; paratrooperId: string; targetCityIndex: number }
```

---

### 2.8 `src/entities/Paratrooper.ts`

Paratroopers are **blast-radius-only** — they carry no math problem and cannot be directly tapped.

```typescript
class Paratrooper extends Phaser.GameObjects.Container {
  readonly threatId: string;
  /** Descent speed in px/s. */
  descentSpeed: number;
  /** Target city index. */
  targetCityIndex: number;
  /** Horizontal oscillation phase (radians). */
  private swayPhase: number;
  destroyed: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,       // spawn Y = plane's Y
    descentSpeed: number,
    targetCityIndex: number,
    cities: City[],
  )

  preUpdate(time: number, delta: number): void  // descend + horizontal sway ±6px over 1200 ms

  /**
   * Caught in a blast radius. Plays neutralised animation (float up, alpha fade).
   * Emits PARATROOPER_CAUGHT with { paratrooperId: threatId }.
   * Emits THREAT_DESTROYED with threatType 'paratrooper', points = SCORE_VALUES.paratrooper.
   * Includes x, y position in THREAT_DESTROYED payload.
   */
  neutralise(): void

  /**
   * Reached the city. Calls city.hit(). Emits PARATROOPER_LANDED.
   * Does NOT emit THREAT_DESTROYED.
   */
  private onLandOnCity(): void
}
```

`PARATROOPER_LANDED` payload:
```typescript
{ paratrooperId: string; cityIndex: number }
```

---

### 2.9 `src/entities/Launcher.ts`

```typescript
class Launcher extends Phaser.GameObjects.Container {
  /** The currently loaded answer (top of queue). */
  loadedAnswer: number | string | null;
  /** True during lock-out period after wrong tap. */
  locked: boolean;
  /** Duration of wrong-tap lock in ms. */
  lockDurationMs: number;   // 500 ms default

  constructor(
    scene: Phaser.Scene,
    x: number,   // LAUNCHER_X
    y: number,   // LAUNCHER_Y
  )

  /**
   * Load the next answer from the queue into the launcher.
   * Called by AnswerQueue after queue advances.
   * Updates barrel visual.
   */
  loadAnswer(answer: number | string): void

  /**
   * Called when player taps a missile.
   * Checks if missile.getAnswer() === this.loadedAnswer.
   * If correct: emits INTERCEPTOR_FIRED, fires visual projectile to target.
   * If incorrect: emits WRONG_TAP, triggers red flash lock (lockDurationMs).
   */
  tryFire(missile: StandardMissile): void

  /**
   * Rotate the launcher barrel to aim at the given world (x, y) with
   * Cubic.Out easing over 150 ms.
   */
  aimAt(targetX: number, targetY: number): void

  /** Play the wrong-tap flash (SPRITE_LAUNCHER_FLASH, COLOR_LAUNCHER_LOCK). */
  private playWrongTapFlash(): void

  /** Play streak glow when streak >= 5. */
  playStreakGlow(): void

  /** Stop streak glow when streak < 5. */
  stopStreakGlow(): void

  preUpdate(time: number, delta: number): void
}
```

**Input handling:** `Launcher` listens for `Phaser.Input.Events.POINTER_DOWN` on the scene. On pointer-down, it finds the top-most missile at the pointer location (via `scene.input.hitTestPointer(pointer, missiles)`) and calls `this.tryFire(missile)`.

**`INTERCEPTOR_FIRED` payload:**
```typescript
{
  launcherX: number;
  launcherY: number;
  targetX: number;
  targetY: number;
  targetThreatId: string;
  loadedAnswer: number | string;
}
```

The defensive missile visual (blue streak `COLOR_DEFENDER`) travels from launcher to target over `Math.hypot(dx, dy) / INTERCEPTOR_SPEED` ms (define `INTERCEPTOR_SPEED = 600` px/s in this file), then emits `INTERCEPTOR_DETONATED` and triggers `StandardMissile.intercept()`.

---

### 2.10 `src/entities/AnswerQueue.ts`

```typescript
class AnswerQueue extends Phaser.GameObjects.Container {
  /** All answers for this wave (shuffled). Index 0 = currently loaded. */
  private rounds: Array<number | string>;
  /** Index into rounds of the currently loaded answer. */
  private currentIndex: number;
  /** Whether highlight assist is enabled. */
  highlightAssistEnabled: boolean;
  /** Array of visible missile references for match highlighting. */
  private visibleMissiles: StandardMissile[];

  constructor(
    scene: Phaser.Scene,
    x: number,   // 0
    y: number,   // QUEUE_STRIP_Y (782)
  )

  /**
   * Initialize the queue with a full wave answer array.
   * Called by WaveManager after PROBLEM_GENERATED fires.
   * Resets currentIndex to 0. Renders all visible slots.
   * Notifies Launcher of the first loaded answer.
   */
  initialize(answerQueue: Array<number | string>, launcher: Launcher): void

  /**
   * Advance the queue by one position.
   * Plays slide-left animation over QUEUE_ADVANCE_DURATION_MS.
   * Emits QUEUE_ADVANCED with { loadedAnswer: rounds[currentIndex+1] }.
   * Notifies Launcher of the new loaded answer.
   */
  advance(launcher: Launcher): void

  /**
   * Register active missiles so match highlighting can compare
   * incoming problem answers against queue slots.
   */
  setVisibleMissiles(missiles: StandardMissile[]): void

  /**
   * Called each frame; updates match highlight state.
   * For each slot visible ahead of currentIndex: if any active missile's
   * correctAnswer matches the slot's value, apply COLOR_QUEUE_MATCH tint.
   */
  updateHighlights(): void

  /** Return the currently loaded answer. */
  getLoadedAnswer(): number | string | null

  preUpdate(time: number, delta: number): void
}
```

**Queue strip layout** (from style guide):
- Background rect: (0, 782, 480, 72) filled `COLOR_BG_QUEUE`.
- Slot 0 (loaded): center at (30, 787); size 60×60; `TEXT_QUEUE_LOADED` style; `SPRITE_QUEUE_LOADED_RING` pulsing animation.
- Slots 1–5: centers at (106, 182, 258, 334, 410), Y=787 (spaced 76 px apart after slot 0); size 60×60; `TEXT_QUEUE_NUMBER` style.
- Spent rounds: `COLOR_QUEUE_SPENT` tint.
- `QUEUE_ADVANCE_DURATION_MS = 120` ms slide animation using `Cubic.Out`.

---

### 2.11 `src/entities/Explosion.ts`

Represents a single explosion event at a world position.

```typescript
class Explosion extends Phaser.GameObjects.Container {
  /** World position of this explosion center. */
  readonly cx: number;
  readonly cy: number;
  /** Blast radius in px — used for chain reaction detection. */
  radius: number;
  /** Chain radius in px. */
  chainRadius: number;
  /** Duration in ms before emitting EXPLOSION_COMPLETE. */
  durationMs: number;
  /** Type determines which animation sprite to play. */
  type: 'player' | 'chain' | 'city';

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: 'player' | 'chain' | 'city',
    radius?: number,
    chainRadius?: number,
  )

  /**
   * Check for chain reaction: find all active threats within chainRadius.
   * For each found: call intercept() on missiles/paratroopers, emit CHAIN_REACTION.
   * Returns array of threat IDs caught in chain.
   */
  checkChainReaction(activeMissiles: StandardMissile[], activeParatroopers: Paratrooper[]): string[]

  /** Emit EXPLOSION_COMPLETE when animation finishes. */
  private onAnimationComplete(): void
}
```

**Type → sprite key mapping:**
- `'player'` → `SPRITE_EXPLOSION_PLAYER` (8 frames × 80 ms; radii: core 16 px, mid 48 px, outer 96 px)
- `'chain'` → `SPRITE_EXPLOSION_CHAIN` (8 frames × 70 ms)
- `'city'` → `SPRITE_EXPLOSION_CITY` (6 frames × 100 ms)

`EXPLOSION_COMPLETE` payload: `{ x: number; y: number; type: string }`

`CHAIN_REACTION` payload:
```typescript
{ chainLength: number; bonusPoints: number }
```
where `bonusPoints = SCORE_VALUES.chainReactionLink` per additional link after the first.

---

### 2.12 `src/entities/TrajectoryLine.ts`

```typescript
class TrajectoryLine extends Phaser.GameObjects.Graphics {
  private missile: StandardMissile;
  private targetCity: City;

  constructor(scene: Phaser.Scene, missile: StandardMissile, targetCity: City)

  /**
   * Redraws the dashed line from missile's current position to city's target point.
   * Uses COLOR_TRAJECTORY at TRAJECTORY_ALPHA, 1 px stroke, 6 on / 4 off dash.
   * Must be called each frame from missile's preUpdate().
   */
  redraw(): void

  /** Remove this line from the scene. Called by missile.intercept(). */
  remove(): void
}
```

Dashed line implementation: Since Phaser Graphics does not natively support dashes, implement by manually computing dash segments along the line vector and drawing them as short line segments.

---

### 2.13 `src/systems/ScoreManager.ts`

Implements `IScoreManager`.

```typescript
class ScoreManager implements IScoreManager {
  private scene: Phaser.Scene;
  private score: number;
  private streak: number;
  private totalTaps: number;
  private correctTaps: number;
  private chainCount: number;

  constructor(scene: Phaser.Scene)

  addPoints(points: number): void
  getScore(): number
  reset(): void
  incrementStreak(): number
  resetStreak(): void
  getStreak(): number
  getStreakMultiplier(): number
  recordTap(correct: boolean): void
  getAccuracy(): number
  addChainLink(): void
  getChainCount(): number
  calculateStars(citiesSurviving: number): number
}
```

**`addPoints(points)` logic:**
1. Compute `multiplier = this.getStreakMultiplier()`.
2. Compute `finalPoints = Math.round(points * multiplier)`.
3. Add to `this.score`.
4. Emit `GameEvents.SCORE_UPDATED` with `{ score: this.score, delta: points, multiplier }` on `this.scene.events`.

**`incrementStreak()` logic:**
1. Increment `this.streak`.
2. If streak is in `STREAK_MILESTONE_THRESHOLDS` (3, 5, 10): emit `GameEvents.STREAK_MILESTONE` with `{ streak, label, multiplier }`.
   - Label lookup: use `STREAK_MULTIPLIERS` array from `scoreConfig.ts`.
3. If streak >= 5: emit `GameEvents.STREAK_MILESTONE` for glow trigger (WaveManager uses this to tell Launcher).
4. Return new streak.

**`getStreakMultiplier()` logic:** Iterate `STREAK_MULTIPLIERS` (imported from `scoreConfig.ts`), return first entry where `this.streak >= entry.minStreak`.

**`calculateStars(citiesSurviving)` logic (GDD §3 Win/Lose):**
- 0 cities → 0 stars.
- 1–3 cities → 1 star.
- 4–5 cities → 2 stars.
- 6 cities → 3 stars (base).
- Bonus: if chainCount >= 3, increment stars by 1 (cap at 3).
- Bonus: if accuracy >= 0.9, increment stars by 1 (cap at 3). *(Note: GDD says stars influenced by accuracy; implement as additive with cap.)*

**Live star projection:** After every `addPoints()`, compute `this.calculateStars(currentCitiesSurviving)` and emit `GameEvents.STAR_RATING_UPDATED`. WaveManager must call `scoreManager.setCurrentCities(n)` to keep this up to date; add that method to the class (not in interface, but needed internally).

```typescript
/** Not in interface; used internally by WaveManager to keep star projection current. */
setCurrentCities(count: number): void
```

---

### 2.14 `src/systems/WaveManager.ts`

The primary gameplay system. Orchestrates spawning, answer queue, intercept handling, and wave completion.

```typescript
class WaveManager {
  private scene: Phaser.Scene;
  private difficultyConfig: IDifficultyConfig;
  private scoreManager: ScoreManager;
  private answerQueue: AnswerQueue;
  private launcher: Launcher;
  private cities: City[];

  // Wave state
  private waveProblems: IMathProblem[];
  private answerQueueData: Array<number | string>;
  private activeMissiles: StandardMissile[];
  private activeBombers: StrategicBomber[];
  private activePlanes: ParatrooperPlane[];
  private activeParatroopers: Paratrooper[];
  private totalThreats: number;
  private threatsSpawned: number;
  private threatsResolved: number;  // destroyed or reached city
  private spawnTimer: Phaser.Time.TimerEvent | null;
  private waveActive: boolean;

  constructor(
    scene: Phaser.Scene,
    difficultyConfig: IDifficultyConfig,
    scoreManager: ScoreManager,
    answerQueue: AnswerQueue,
    launcher: Launcher,
    cities: City[],
  )

  /** Called each frame by GameScene.update(). */
  update(time: number, delta: number): void

  // Private methods
  private setupEventListeners(): void
  private onProblemGenerated(payload: ProblemGeneratedPayload): void
  private spawnNextThreat(): void
  private spawnStandardMissile(problem: IMathProblem): StandardMissile
  private spawnBomber(bonusProblem: IMathProblem, payloadProblems: IMathProblem[]): StrategicBomber
  private spawnParatrooperPlane(): ParatrooperPlane
  private spawnMIRV(problem: IMathProblem): MIRVMissile
  private onInterceptorDetonated(payload: { targetThreatId: string; x: number; y: number }): void
  private onExplosionComplete(payload: { x: number; y: number }): void
  private onThreatDestroyed(payload: ThreatDestroyedPayload & { x: number; y: number }): void
  private onCityDestroyed(payload: CityDestroyedPayload): void
  private onStreakMilestone(payload: StreakMilestonePayload): void
  private checkWaveComplete(): void
  private endWave(): void
}
```

**`onProblemGenerated(payload)` logic:**
1. Store `this.waveProblems = payload.problems`.
2. Store `this.answerQueueData = payload.answerQueue`.
3. Call `this.answerQueue.initialize(this.answerQueueData, this.launcher)`.
4. Assign problems to threats in spawn order (one problem per standard missile/MIRV/bomber-bonus).
5. Start the spawn timer: `this.spawnTimer = this.scene.time.addEvent({ delay: difficultyConfig.spawnIntervalMs, callback: this.spawnNextThreat, callbackScope: this, loop: true })`.

**`spawnNextThreat()` logic:**
1. If `threatsSpawned >= totalThreats` or `activeMissiles.length >= difficultyConfig.maxSimultaneousThreats`: skip this tick.
2. Determine next threat type: bombers and planes spawn at specific wave-fraction thresholds (bomber at 40% through wave, plane at 65%). Other spawns are standard missiles or MIRVs (MIRVs at 20% chance once `mirvEnabled`).
3. Spawn the entity, push to appropriate `active*` array, increment `threatsSpawned`.

**`onInterceptorDetonated()` logic:**
1. Find target in `activeMissiles` or `activeBombers` by `targetThreatId`.
2. Determine points (based on threat type and whether bomber/MIRV has been triggered — check `hasDroppedPayload` / `hasSplit`).
3. Check if target missile was threatening a city — if city's trajectory line is active and city is not destroyed: award `SCORE_VALUES.citySaveBonus`, emit `CITY_SAVED`.
4. Create `Explosion` at `(x, y)` with appropriate type.
5. Run `explosion.checkChainReaction(activeMissiles, activeParatroopers)`.
6. For each chain-caught threat: call `scoreManager.addPoints(SCORE_VALUES.chainReactionLink)` and `scoreManager.addChainLink()`, emit `CHAIN_REACTION`.
7. Call `scoreManager.recordTap(true)`, `scoreManager.incrementStreak()`.
8. Call `scoreManager.addPoints(points)` (main threat points).
9. Advance `answerQueue`.
10. Call `checkWaveComplete()`.

**`onStreakMilestone()` logic:**
- If `payload.streak >= 5`: call `launcher.playStreakGlow()`.
- If `payload.streak < 5` (can't happen here, but on resetStreak path): call `launcher.stopStreakGlow()`.

**Streak reset triggers:** On `WRONG_TAP` event: call `scoreManager.resetStreak()`, call `launcher.stopStreakGlow()`, call `scoreManager.recordTap(false)`.

**`checkWaveComplete()` logic:**
```
threatsResolved = threats destroyed + threats that hit cities
if threatsResolved >= totalThreats → endWave()
```

**`endWave()` logic:**
1. Stop `spawnTimer`.
2. Count surviving cities: `cities.filter(c => !c.destroyed).length`.
3. Let `scoreManager.setCurrentCities(surviving)`.
4. Emit `LEVEL_COMPLETE` with payload:
```typescript
{
  level: difficultyConfig.level,
  stars: scoreManager.calculateStars(surviving),
  citiesSurviving: surviving,
  score: scoreManager.getScore(),
  accuracy: scoreManager.getAccuracy(),
  chainReactions: scoreManager.getChainCount(),
  perfectWave: surviving === 6,
}
```
5. If `surviving === 6` emit `PERFECT_WAVE`.

**Spawn position rules:**
- Standard missiles, MIRVs: spawn at random X within `[SAFE_MARGIN, CANVAS_WIDTH - SAFE_MARGIN]`, Y = `PLAY_FIELD_TOP`.
- Bombers: spawn at Y ≈ 120 (above city row). Enter from left (X = -80) or right (X = CANVAS_WIDTH + 80) at random.
- ParatrooperPlane: same as bomber entry Y ≈ 80.

---

## 3. Event Contract

| Event Constant | Direction | Payload Type | When |
|---|---|---|---|
| `THREAT_DESTROYED` | **emits** (per entity) | `ThreatDestroyedPayload & { x: number; y: number }` | Any threat intercepted or chain-caught |
| `CITY_HIT` | **emits** (City) | `CityHitPayload` | City.hit() called |
| `CITY_DESTROYED` | **emits** (City) | `CityDestroyedPayload` | City HP reaches 0 |
| `CITY_SAVED` | **emits** (WaveManager) | `CitySavedPayload` | Missile targeting city is intercepted |
| `CITY_REBUILT` | **emits** (City) | `CityRebuiltPayload` | City.rebuild() animation completes |
| `SCORE_UPDATED` | **emits** (ScoreManager) | `ScoreUpdatedPayload` | Any addPoints() call |
| `STREAK_MILESTONE` | **emits** (ScoreManager) | `StreakMilestonePayload` | Streak hits 3, 5, or 10 |
| `CHAIN_REACTION` | **emits** (WaveManager/Explosion) | `ChainReactionPayload` | Explosion catches a secondary threat |
| `STAR_RATING_UPDATED` | **emits** (ScoreManager) | `StarRatingUpdatedPayload` | After addPoints() recalculates stars |
| `LEVEL_COMPLETE` | **emits** (WaveManager) | `LevelCompletePayload` | All threats resolved, ≥ 1 city standing |
| `GAME_OVER` | **emits** (WaveManager) | `GameOverPayload` | All 6 cities destroyed |
| `QUEUE_ADVANCED` | **emits** (AnswerQueue) | `{ loadedAnswer: number \| string }` | AnswerQueue.advance() called |
| `WRONG_TAP` | **emits** (Launcher) | *(none)* | Loaded answer ≠ tapped missile answer |
| `INTERCEPTOR_FIRED` | **emits** (Launcher) | `{ launcherX, launcherY, targetX, targetY, targetThreatId, loadedAnswer }` | Correct tap, defender missile launched |
| `INTERCEPTOR_DETONATED` | **emits** (Launcher/defender missile) | `{ targetThreatId: string; x: number; y: number }` | Defender missile reaches target |
| `EXPLOSION_COMPLETE` | **emits** (Explosion) | `{ x: number; y: number; type: string }` | Explosion animation ends |
| `MIRV_SPLIT` | **emits** (MIRVMissile) | `MirvSplitPayload` | MIRV reaches split altitude |
| `BOMBER_PAYLOAD_DROPPED` | **emits** (StrategicBomber) | `BomberPayloadDroppedPayload` | Bomber drops payload |
| `PARATROOPER_DROPPED` | **emits** (ParatrooperPlane) | `ParatrooperDroppedPayload` | Plane drops a paratrooper |
| `PARATROOPER_CAUGHT` | **emits** (Paratrooper) | `{ paratrooperId: string }` | Paratrooper in blast radius |
| `PARATROOPER_LANDED` | **emits** (Paratrooper) | `ParatrooperLandedPayload` | Paratrooper reaches city |
| `THREAT_SPAWNED` | **emits** (WaveManager) | `ThreatSpawnedPayload` | Any new entity spawned |
| `PROBLEM_GENERATED` | **listens** (WaveManager) | `ProblemGeneratedPayload` | Math Engine finished generating wave |
| `WAVE_STARTED` | **listens** (WaveManager) | `WaveStartedPayload` | GameScene.startWave() fires |
| `INTERCEPTOR_DETONATED` | **listens** (WaveManager) | same as above | Triggers intercept resolution logic |
| `EXPLOSION_COMPLETE` | **listens** (WaveManager) | same as above | Cleanup hook |
| `DIFFICULTY_CHANGED` | **listens** (WaveManager) | `IDifficultyConfig` | DifficultyManager changes config |
| `STREAK_MILESTONE` | **listens** (WaveManager) | `StreakMilestonePayload` | Trigger launcher streak glow |
| `WRONG_TAP` | **listens** (WaveManager) | *(none)* | Reset streak on WaveManager |

---

## 4. Config Dependencies

All the following are **imported** from config files created by Coding Agent 1. Do not redefine these values.

| Constant | Source File | Used In |
|---|---|---|
| `CANVAS_WIDTH`, `CANVAS_HEIGHT` | `src/config/gameConfig.ts` | WaveManager (spawn bounds), entities |
| `LAUNCHER_X`, `LAUNCHER_Y` | `src/config/gameConfig.ts` | Launcher constructor |
| `CITY_X_POSITIONS`, `CITY_ROW_TOP_Y`, `CITY_ROW_BOTTOM_Y` | `src/config/gameConfig.ts` | City constructor (x/y args), WaveManager |
| `QUEUE_SLOT_0_X`, `QUEUE_SLOT_SPACING`, `QUEUE_SLOT_Y`, `QUEUE_SLOT_SIZE` | `src/config/gameConfig.ts` | AnswerQueue layout |
| `QUEUE_ADVANCE_DURATION_MS` | `src/config/gameConfig.ts` | AnswerQueue slide animation |
| `EXPLOSION_RADIUS_PLAYER`, `CHAIN_REACTION_RADIUS` | `src/config/gameConfig.ts` | Explosion defaults |
| `MIRV_SPLIT_ALTITUDE_PERCENT` | `src/config/gameConfig.ts` | MIRVMissile.splitY computation |
| `CITY_HIT_POINTS` | `src/config/gameConfig.ts` | City constructor |
| `SAFE_MARGIN` | `src/config/gameConfig.ts` | WaveManager spawn X bounds |
| `PLAY_FIELD_TOP` | `src/config/gameConfig.ts` | Missile spawn Y |
| `WAVE_SPAWN_INTERVAL_BASE_MS` | `src/config/gameConfig.ts` | Not used directly; DifficultyManager owns spawn interval |
| `COLOR_*` tokens | `src/config/styleConfig.ts` | All entity rendering |
| `TEXT_*` style presets | `src/config/styleConfig.ts` | Entity text rendering |
| `SCORE_VALUES` | `src/config/scoreConfig.ts` | ScoreManager, WaveManager point lookups |
| `STREAK_MULTIPLIERS`, `STREAK_MILESTONE_THRESHOLDS` | `src/config/scoreConfig.ts` | ScoreManager |

**From Coding Agent 3 (runtime, via constructor argument):**
| Value | Source | How Received |
|---|---|---|
| `IDifficultyConfig` | `DifficultyManager.getConfig()` | Passed to `WaveManager` constructor by `GameScene` |

---

## 5. Cross-Agent Assumptions

### From Coding Agent 1 (must exist before GameScene runs)
- All config files at `src/config/gameConfig.ts`, `src/config/styleConfig.ts`, `src/config/scoreConfig.ts`, `src/config/levelConfig.ts` export the constants listed in §4.
- `GameScene` creates all 6 `City` instances with the correct `(scene, cityIndex, name, x, y)` args:
  - Cities 0–2 at `(CITY_X_POSITIONS[0..2], CITY_ROW_TOP_Y)`.
  - Cities 3–5 at `(CITY_X_POSITIONS[0..2], CITY_ROW_BOTTOM_Y)`.
- `GameScene` calls `WaveManager.update(time, delta)` each frame.
- `GameScene` creates `ScoreManager(scene)`, `AnswerQueue(scene, 0, QUEUE_STRIP_Y)`, and `Launcher(scene, LAUNCHER_X, LAUNCHER_Y)` and passes them to `WaveManager` constructor.
- `EffectsSystem` listens for `THREAT_DESTROYED` and uses the `x, y` fields in the payload to position explosions.
- `HUDSystem` listens for `SCORE_UPDATED`, `STREAK_MILESTONE`, `CHAIN_REACTION`, `CITY_DESTROYED`, `CITY_SAVED`, and `STAR_RATING_UPDATED`.
- All sprite texture keys used in entity constructors have been loaded by `BootScene`.

### From Coding Agent 3 (must exist when WaveManager starts)
- `src/systems/MathEngine.ts` listens for `WAVE_STARTED` on `scene.events` and emits `PROBLEM_GENERATED` with `{ problems: IMathProblem[], answerQueue: Array<number | string> }`.
- `problems.length` equals `WaveStartedPayload.totalThreats`.
- `answerQueue` contains exactly the correct answers needed to solve all problems in shuffled order.
- `src/systems/DifficultyManager.ts` exposes `getConfig(): IDifficultyConfig` which returns a fully populated config including `spawnIntervalMs`, `missileSpeedMultiplier`, `maxSimultaneousThreats`, `bomberEnabled`, `paratrooperEnabled`, `mirvEnabled`, `mirvChildCount`, `bomberPayloadCount`.
- `DifficultyManager` emits `DIFFICULTY_CHANGED` with the full `IDifficultyConfig` payload if config changes at runtime.

---

## 6. Implementation Order

Build in this order — later files depend on earlier ones:

1. `src/entities/TrajectoryLine.ts` — Depends only on Phaser Graphics; needed by missiles.
2. `src/entities/City.ts` — Depends on `gameConfig.ts`, `styleConfig.ts`.
3. `src/entities/StandardMissile.ts` — Depends on `TrajectoryLine`, `City`, `IMathProblem`, style/game config.
4. `src/entities/BomberMissile.ts` — Extends `StandardMissile`.
5. `src/entities/MIRVChild.ts` — Extends `StandardMissile`.
6. `src/entities/MIRVMissile.ts` — Extends `StandardMissile`; spawns `MIRVChild`.
7. `src/entities/Paratrooper.ts` — Depends on `City`, `gameConfig.ts`.
8. `src/entities/ParatrooperPlane.ts` — Spawns `Paratrooper`.
9. `src/entities/StrategicBomber.ts` — Spawns `BomberMissile`.
10. `src/entities/Explosion.ts` — Depends on `StandardMissile`, `Paratrooper`, `scoreConfig.ts`.
11. `src/entities/Launcher.ts` — Depends on `StandardMissile`, `gameConfig.ts`.
12. `src/entities/AnswerQueue.ts` — Depends on `Launcher`, `StandardMissile`, style/game config.
13. `src/systems/ScoreManager.ts` — Implements `IScoreManager`; imports `scoreConfig.ts`.
14. `src/systems/WaveManager.ts` — Orchestrates everything above.

---

## 7. Definition of Done

- [ ] All 14 files listed in §1 exist at the correct paths.
- [ ] `npm run typecheck` from `games/missile-command-math/` passes with zero errors.
- [ ] `npm run lint` from `games/missile-command-math/` passes with zero warnings.
- [ ] Every entity that emits `THREAT_DESTROYED` includes `x: number` and `y: number` fields in the payload.
- [ ] `ScoreManager` correctly implements all methods in `IScoreManager`.
- [ ] `AnswerQueue` slot 0 has a 60×60 minimum touch target (accessibility requirement).
- [ ] All missile tap zones have a minimum 60×60 touch target (set `setInteractive(new Phaser.Geom.Rectangle(-30, -30, 60, 60), Phaser.Geom.Rectangle.Contains)` on missiles smaller than 60px).
- [ ] No math problems are hardcoded — all `IMathProblem` instances come from `PROBLEM_GENERATED` payload.
- [ ] All `GameEvents` constants referenced are imported from `src/types/GameEvents.ts` — no inline strings.
- [ ] All colour values reference constants from `src/config/styleConfig.ts` — no inline hex strings.
- [ ] No `localStorage` access in any gameplay entity or system.
- [ ] No `alert()`, `confirm()`, or `prompt()` calls.
- [ ] `WaveManager` correctly emits `LEVEL_COMPLETE` when all threats are resolved with ≥ 1 city alive, and `GAME_OVER` when all 6 cities are destroyed.
- [ ] Paratrooper sway oscillation respects reduced-motion: check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and skip oscillation if true.
