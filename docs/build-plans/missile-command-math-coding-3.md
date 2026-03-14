# Build Plan — Missile Command Math — Coding Agent 3 (Math Engine)

## Role Summary
You are responsible for the math problem generation pipeline and the difficulty configuration system. This means two distinct areas:

1. **`shared/math-engine/`** — A pure TypeScript library with zero Phaser dependencies. It generates procedurally valid `IMathProblem` objects for all 18 skill types across grades 3–5. It is tested in isolation.
2. **`games/missile-command-math/src/systems/`** — Two Phaser-aware system classes (`MathEngine` and `DifficultyManager`) that wrap the shared library and connect it to the game via events.

You do **not** create scenes, entities, scoring logic, or config files — those belong to Coding Agents 1 and 2.

---

## 1. Files to Create

All paths are relative to the repo root.

```
shared/math-engine/src/generators/additionGenerator.ts
shared/math-engine/src/generators/subtractionGenerator.ts
shared/math-engine/src/generators/multiplicationGenerator.ts
shared/math-engine/src/generators/divisionGenerator.ts
shared/math-engine/src/generators/fractionGenerator.ts
shared/math-engine/src/generators/multiStepGenerator.ts
shared/math-engine/src/generators/squareRootGenerator.ts
shared/math-engine/src/generators/mixedOperationsGenerator.ts
shared/math-engine/src/MathEngineCore.ts
shared/math-engine/src/index.ts
shared/math-engine/src/types.ts
shared/math-engine/tests/additionGenerator.test.ts
shared/math-engine/tests/subtractionGenerator.test.ts
shared/math-engine/tests/multiplicationGenerator.test.ts
shared/math-engine/tests/divisionGenerator.test.ts
shared/math-engine/tests/fractionGenerator.test.ts
shared/math-engine/tests/multiStepGenerator.test.ts
shared/math-engine/tests/squareRootGenerator.test.ts
shared/math-engine/tests/mixedOperationsGenerator.test.ts
shared/math-engine/tests/MathEngineCore.test.ts
games/missile-command-math/src/systems/MathEngine.ts
games/missile-command-math/src/systems/DifficultyManager.ts
```

---

## 2. Class and Interface Definitions

### 2.1 `shared/math-engine/src/types.ts`

Defines types local to the shared library. **Do not import from any game file.** The game imports `IMathProblem` from `src/types/IMathProblem.ts`; this file mirrors the same shape for library-internal use and re-exports it.

```typescript
/** Mirror of games/missile-command-math/src/types/IMathProblem.ts for library isolation. */
export interface MathProblem {
  question: string;
  correctAnswer: number | string;
  distractors: Array<number | string>;
  skillType?: string;
  gradeLevel?: number;
}

/**
 * Input parameters for all generator functions.
 * difficultyLevel: 1–5 per curriculum map §Difficulty Parameters.
 */
export interface GeneratorParams {
  skillType: string;
  gradeLevel: number;
  difficultyLevel: number;  // 1–5
}

/** A generator function signature — all generators implement this. */
export type ProblemGenerator = (params: GeneratorParams) => MathProblem;
```

---

### 2.2 `shared/math-engine/src/generators/additionGenerator.ts`

Handles four skill types: `single-digit-addition`, `two-digit-addition-no-regroup`, `two-digit-addition-regroup`, and (when called with gradeLevel 4) `three-digit-addition`, `four-digit-addition`.

```typescript
import type { GeneratorParams, MathProblem } from '../types';

/**
 * Generate an addition problem.
 * Routes to correct sub-generator based on skillType.
 */
export function generateAddition(params: GeneratorParams): MathProblem
```

**Routing table** (implement each as a private/internal function in this file):

| skillType | Function | Operand constraints per curriculum map |
|---|---|---|
| `single-digit-addition` | `genSingleDigitAdd` | diff 1: A+B ≤ 10; diff 2: A+B ≤ 18. A∈[1,9], B∈[1,9] |
| `two-digit-addition-no-regroup` | `genTwoDigitAddNoRegroup` | ones sum ≤ 9; diff 1: tens∈[1,4]; diff 2: tens∈[1,8] |
| `two-digit-addition-regroup` | `genTwoDigitAddRegroup` | ones sum ≥ 10; diff 1: tens∈[1,4]; diff 2: tens∈[1,7]; diff 3: tens∈[1,9] |
| `three-digit-addition` | `genThreeDigitAdd` | diff 1: no double-regroup; diff 2: single regroup; diff 3: double regroup |
| `four-digit-addition` | `genFourDigitAdd` | diff 1: no double-regroup; diff 2: single regroup; diff 3: double regroup; numbers ∈[1000,4999] |

**Question format:** `"A + B"` (space-delimited). Use `toString()` on operands; no leading zeros.

**Distractor strategy — near-miss:**
- Two-digit no-regroup: swap tens/ones digit of answer.
- Two-digit regroup: omit-carry error (answer − 10).
- Three-digit: omit-carry (answer − 100 or answer − 10).
- Four-digit: omit-carry (answer − 1000 or answer − 100).
- Single-digit: answer ± 1 (ensure non-negative, non-zero duplicate).

**Always produce exactly 3 distractors.** Distractors must be unique and must not equal `correctAnswer`. If a formula produces a duplicate or negative, add/subtract 1 until valid.

---

### 2.3 `shared/math-engine/src/generators/subtractionGenerator.ts`

Handles: `single-digit-subtraction`, `two-digit-subtraction`, `three-digit-subtraction`, `four-digit-subtraction`.

```typescript
import type { GeneratorParams, MathProblem } from '../types';

export function generateSubtraction(params: GeneratorParams): MathProblem
```

| skillType | Constraints |
|---|---|
| `single-digit-subtraction` | A∈[6,18], B∈[1,9], A≥B. diff 1: A ≤ 10; diff 2: A ≤ 18. Distractor: answer ± 1 |
| `two-digit-subtraction` | AB∈[20,99], CD∈[10,89], AB > CD. diff 1: no zeros; diff 2: zero in ones; diff 3: zero in tens and ones. Distractor: borrow-error (answer + 10 or − 10) |
| `three-digit-subtraction` | ABC∈[200,999], DEF < ABC. diff 1: no zero in minuend; diff 2: zero in ones; diff 3: zero in tens and ones. Distractor: borrow-error (answer + 100) |
| `four-digit-subtraction` | ABCD∈[2000,9999], EFGH < ABCD. diff 1: no zeros; diff 2: zeros in ones; diff 3: zeros in tens/ones. Distractor: borrow-error (answer + 1000) |

**Question format:** `"A - B"`.

---

### 2.4 `shared/math-engine/src/generators/multiplicationGenerator.ts`

Handles: `multiplication-partial`, `multiplication-full`.

```typescript
import type { GeneratorParams, MathProblem } from '../types';

export function generateMultiplication(params: GeneratorParams): MathProblem
```

| skillType | Constraints |
|---|---|
| `multiplication-partial` | A∈{2,5,10}, B∈[1,10]. diff 1: A∈{2,5} only; diff 2: A∈{2,5,10}; diff 3: A∈{2,5,10}, B∈[6,10]. Distractor: adjacent-multiple (answer ± A) |
| `multiplication-full` | A∈[2,12], B∈[2,12]. diff 1: A,B∈[2,6]; diff 2: A,B∈[2,9]; diff 3: A,B∈[2,12]. Distractor: near-miss (answer ± B or answer ± A) |

**Question format:** `"A × B"`.

**Distractor uniqueness:** Same rules as addition — 3 unique distractors, none equal to `correctAnswer`, all positive integers.

---

### 2.5 `shared/math-engine/src/generators/divisionGenerator.ts`

Handles: `division-basic`, `division-with-remainder`.

```typescript
import type { GeneratorParams, MathProblem } from '../types';

export function generateDivision(params: GeneratorParams): MathProblem
```

| skillType | Constraints |
|---|---|
| `division-basic` | A = B×Q, B∈[2,10], Q∈[2,10]. diff 1: B∈[2,5],Q∈[2,5]; diff 2: B∈[2,9],Q∈[2,9]; diff 3: B∈[2,10],Q∈[2,10]. Distractor: adjacent-quotient (Q+1, Q-1, Q+2). correctAnswer is integer Q |
| `division-with-remainder` | A∈[13,99], B∈[2,9], Q = floor(A/B), r = A mod B. diff 1: A∈[13,40]; diff 2: A∈[13,69]; diff 3: A∈[13,99]. correctAnswer: string `"Q R r"` e.g. `"7 R1"`. Distractors: `"Q R (r+1)"`, `"(Q+1) R r"`, `"(Q-1) R r"` — validate all remain non-negative |

**Question format:**
- `division-basic`: `"A ÷ B"`
- `division-with-remainder`: `"A ÷ B"`

---

### 2.6 `shared/math-engine/src/generators/fractionGenerator.ts`

Handles: `unit-fraction-of-whole`, `fraction-of-whole`.

```typescript
import type { GeneratorParams, MathProblem } from '../types';

export function generateFraction(params: GeneratorParams): MathProblem
```

| skillType | Constraints |
|---|---|
| `unit-fraction-of-whole` | W = D×K where D∈{2,3,4,5,8}, K∈[2,12]. correctAnswer = W/D (integer). diff 1: D∈{2,4},K∈[2,6]; diff 2: D∈{2,3,4,5},K∈[2,9]; diff 3: D∈{2,3,4,5,8},K∈[2,12]. Question: `"1/D of W"`. Distractor: apply adjacent unit fraction: (W/(D±1)) — if not integer, use W/D ± 1 instead |
| `fraction-of-whole` | N/D ∈ {3/4, 2/3, 3/5}. W = D×K, K∈[2,10]. correctAnswer = (N×W)/D (integer). diff 1: N/D∈{1/2,1/4}; diff 2: N/D∈{3/4,2/3}; diff 3: N/D∈{3/5,3/4,2/3},K∈[4,10]. Question: `"N/D × W"` e.g. `"3/4 × 12"`. Distractor: unit-fraction-only answer (W/D, omitting N multiply) |

**All correctAnswers are integers.** Validate that `(N×W)/D` has no remainder before returning; resample K if needed (max 20 attempts, then fallback to K=D).

---

### 2.7 `shared/math-engine/src/generators/multiStepGenerator.ts`

Handles: `multi-step-expression`.

```typescript
import type { GeneratorParams, MathProblem } from '../types';

export function generateMultiStep(params: GeneratorParams): MathProblem
```

| skillType | Constraints |
|---|---|
| `multi-step-expression` | `(A × B) ± C`. A∈[2,9], B∈[2,9], C∈[1,20], OP∈{+,−}. diff 1: C∈[1,9], product≤36; diff 2: C∈[1,20], product≤72; diff 3: C∈[1,20], product≤108. correctAnswer: integer |

**Question format:** `"(A × B) + C"` or `"(A × B) - C"` (use literal parentheses and ×/− symbols).

**Distractor:** order-of-operations swap: compute `A × (B + C)` or `A × (B - C)` (i.e. without parentheses precedence); also provide `(A × B) ± (C ± 1)`.

---

### 2.8 `shared/math-engine/src/generators/squareRootGenerator.ts`

Handles: `perfect-square-root`.

```typescript
import type { GeneratorParams, MathProblem } from '../types';

export function generateSquareRoot(params: GeneratorParams): MathProblem
```

| skillType | Constraints |
|---|---|
| `perfect-square-root` | P ∈ {4,9,16,25,36,49,64,81,100,121,144}. diff 1: P∈{4,9,16,25}; diff 2: P∈{36,49,64}; diff 3: P∈{81,100,121,144}. correctAnswer: √P (integer). Distractor: adjacent perfect square roots: e.g. if √P=7, distractors are 6, 8, 5 |

**Question format:** `"√P"` using the √ Unicode character (U+221A).

**Distractor:** Pick 3 values from adjacent root integers (√P ± 1, √P ± 2), each clamped to [1, 12] and deduplicated.

---

### 2.9 `shared/math-engine/src/generators/mixedOperationsGenerator.ts`

Handles: `mixed-operations`.

```typescript
import type { GeneratorParams, MathProblem } from '../types';

export function generateMixedOperations(params: GeneratorParams): MathProblem
```

| skillType | Constraints |
|---|---|
| `mixed-operations` | `(√P) OP (A × B)`. P perfect square, A∈[2,9], B∈[2,9], OP∈{+,−}. diff 1: one operand √ only, OP=+; diff 2: both computed, OP∈{+,−}; diff 3: larger values, P∈{81,100,121,144}; diff 4–5: P∈{81,100,121,144}, all values at ceiling |

**Ensure subtraction result ≥ 0:** if OP=−, re-draw until `√P > A×B` or swap operator to +.

**Question format:** `"(√P) + (A × B)"` or `"(√P) - (A × B)"` with literal parentheses.

**Distractor:** component-error — compute with wrong sub-result for one operand (e.g. √P uses adjacent square root, or A×B uses A×(B±1)).

---

### 2.10 `shared/math-engine/src/MathEngineCore.ts`

The pure-JS core library class. Zero game-engine dependencies. All generators are called from here.

```typescript
import type { MathProblem, GeneratorParams } from './types';
import { generateAddition } from './generators/additionGenerator';
import { generateSubtraction } from './generators/subtractionGenerator';
import { generateMultiplication } from './generators/multiplicationGenerator';
import { generateDivision } from './generators/divisionGenerator';
import { generateFraction } from './generators/fractionGenerator';
import { generateMultiStep } from './generators/multiStepGenerator';
import { generateSquareRoot } from './generators/squareRootGenerator';
import { generateMixedOperations } from './generators/mixedOperationsGenerator';

export class MathEngineCore {
  /**
   * Generate a single math problem.
   * @param gradeLevel - Grade level (3–5); influences operand ranges.
   * @param skillType  - One of the 18 skillType strings from the curriculum map.
   * @param difficultyLevel - 1–5; maps to operand constraints per curriculum map.
   * @returns A MathProblem with question, correctAnswer, distractors, skillType, gradeLevel.
   */
  generateProblem(gradeLevel: number, skillType: string, difficultyLevel: number): MathProblem

  /**
   * Generate a complete wave problem set.
   * Ensures all correct answers are present in the returned answerQueue.
   * The answerQueue is shuffled but guaranteed to contain exactly the answers needed.
   *
   * @param gradeLevel    - Target grade level (3–5).
   * @param skillTypes    - Array of active skill types for this wave.
   * @param count         - Number of problems to generate.
   * @param difficultyLevel - 1–5 difficulty level.
   * @returns Object with problems array and shuffled answerQueue array.
   */
  generateWaveProblems(
    gradeLevel: number,
    skillTypes: string[],
    count: number,
    difficultyLevel: number,
  ): { problems: MathProblem[]; answerQueue: Array<number | string> }

  /**
   * Validate a player answer against a problem.
   * String answers (division-with-remainder): case-insensitive, space-normalised comparison.
   * Numeric answers: strict equality.
   */
  validateAnswer(problem: MathProblem, answer: number | string): boolean
}
```

**`generateProblem()` implementation — skillType routing table:**

```
const GENERATORS: Record<string, ProblemGenerator> = {
  'single-digit-addition':          generateAddition,
  'two-digit-addition-no-regroup':  generateAddition,
  'two-digit-addition-regroup':     generateAddition,
  'three-digit-addition':           generateAddition,
  'four-digit-addition':            generateAddition,
  'single-digit-subtraction':       generateSubtraction,
  'two-digit-subtraction':          generateSubtraction,
  'three-digit-subtraction':        generateSubtraction,
  'four-digit-subtraction':         generateSubtraction,
  'multiplication-partial':         generateMultiplication,
  'multiplication-full':            generateMultiplication,
  'division-basic':                 generateDivision,
  'division-with-remainder':        generateDivision,
  'unit-fraction-of-whole':         generateFraction,
  'fraction-of-whole':              generateFraction,
  'multi-step-expression':          generateMultiStep,
  'perfect-square-root':            generateSquareRoot,
  'mixed-operations':               generateMixedOperations,
};
```

If `skillType` is not in the map, throw `new Error(\`Unknown skillType: \${skillType}\`)`.

**`generateWaveProblems()` implementation:**
1. For each of `count` problems: pick a `skillType` from `skillTypes` uniformly at random. Call `generateProblem(gradeLevel, skillType, difficultyLevel)`.
2. Collect all `correctAnswer` values → `answerQueue`.
3. Shuffle `answerQueue` using Fisher-Yates algorithm with `Math.random()`.
4. Return `{ problems, answerQueue }`.

**`validateAnswer()` implementation:**
- If both are numbers: `problem.correctAnswer === answer`.
- If both are strings: normalise spaces and compare case-insensitively. E.g. `"7 R 1"` and `"7 R1"` should both match `"7 R1"`.
- If types differ: return `false`.

---

### 2.11 `shared/math-engine/src/index.ts`

Public API surface of the library.

```typescript
export { MathEngineCore } from './MathEngineCore';
export type { MathProblem, GeneratorParams, ProblemGenerator } from './types';
```

---

### 2.12 `games/missile-command-math/src/systems/MathEngine.ts`

Phaser-aware wrapper around `MathEngineCore`. Implements `IMathEngine`.

```typescript
import { MathEngineCore } from '../../../../shared/math-engine/src/index';
import type { IMathEngine } from '../types/IMathEngine';
import type { IMathProblem } from '../types/IMathProblem';
import { GameEvents } from '../types/GameEvents';
import type { WaveStartedPayload, ProblemGeneratedPayload } from '../types/GameEvents';

export class MathEngine implements IMathEngine {
  private scene: Phaser.Scene;
  private core: MathEngineCore;

  constructor(scene: Phaser.Scene)

  /**
   * Generate a single problem. Implements IMathEngine.
   * Converts MathProblem (library type) to IMathProblem (game type).
   */
  generateProblem(gradeLevel: number, skillType: string): IMathProblem

  /**
   * Generate a full wave problem set. Implements IMathEngine.
   * Converts results and returns IMathProblem[].
   */
  generateWaveProblems(gradeLevel: number, skillTypes: string[], count: number): IMathProblem[]

  /** Validate an answer. Implements IMathEngine. Delegates to MathEngineCore. */
  validateAnswer(problem: IMathProblem, answer: number | string): boolean

  /**
   * Listen for WAVE_STARTED and respond by emitting PROBLEM_GENERATED.
   * Called automatically in constructor.
   */
  private setupEventListeners(): void

  /**
   * Handler for WAVE_STARTED event.
   * Reads the level from payload, looks up the DifficultyManager config
   * (via DIFFICULTY_CHANGED or stored last config), generates the wave,
   * and emits PROBLEM_GENERATED.
   */
  private onWaveStarted(payload: WaveStartedPayload): void
}
```

**`onWaveStarted()` implementation:**
1. Retrieve the current `IDifficultyConfig` from the stored last `DIFFICULTY_CHANGED` payload (DifficultyManager emits this before `WAVE_STARTED` fires — see §5 cross-agent assumptions).
2. Determine `gradeLevel` from level: levels 1–2 → grade 3; levels 3–5 → grade 3–4; levels 6–10 → grade 4–5. Use this mapping:
   ```
   level 1–2: gradeLevel = 3
   level 3–5: gradeLevel = 3
   level 6–7: gradeLevel = 4
   level 8–10: gradeLevel = 5
   ```
3. Map `IDifficultyConfig.difficultySetting` to `difficultyLevel` for `MathEngineCore`:
   ```
   easy   → difficultyLevel = 1
   normal → difficultyLevel = 2
   hard   → difficultyLevel = 3
   ```
4. Call `this.core.generateWaveProblems(gradeLevel, skillTypes, payload.totalThreats, difficultyLevel)`.
   - `skillTypes` comes from `activeMathTypes` in the stored config, **mapped to the curriculum-map skillType strings**:

   ```
   const MATH_TYPE_TO_SKILL_TYPES: Record<string, string[]> = {
     'addition':          ['single-digit-addition', 'two-digit-addition-no-regroup', 'two-digit-addition-regroup', 'three-digit-addition', 'four-digit-addition'],
     'subtraction':       ['single-digit-subtraction', 'two-digit-subtraction', 'three-digit-subtraction', 'four-digit-subtraction'],
     'multiplication':    ['multiplication-partial', 'multiplication-full'],
     'division':          ['division-basic', 'division-with-remainder'],
     'unit-fractions':    ['unit-fraction-of-whole'],
     'equivalent-fractions': ['fraction-of-whole'],
     'multi-step':        ['multi-step-expression'],
     'square-roots':      ['perfect-square-root'],
     'mixed-operations':  ['mixed-operations'],
   };
   ```
   Expand all `activeMathTypes` using this map, then flatten into a single `skillTypes` array. Filter to only include skill types whose grade requirement is ≤ the resolved `gradeLevel` (use the curriculum map grade column for this check).

5. Emit `GameEvents.PROBLEM_GENERATED` on `this.scene.events` with `ProblemGeneratedPayload`:
   ```typescript
   { problems: IMathProblem[]; answerQueue: Array<number | string> }
   ```

**Type conversion** (`MathProblem` → `IMathProblem`): The shapes are identical; cast directly. Both have `question`, `correctAnswer`, `distractors`, `skillType?`, `gradeLevel?`.

---

### 2.13 `games/missile-command-math/src/systems/DifficultyManager.ts`

Computes the runtime `IDifficultyConfig` from the current level and global difficulty setting. Emits `DIFFICULTY_CHANGED` immediately on construction and again on any change.

```typescript
import { GameEvents } from '../types/GameEvents';
import type { IDifficultyConfig, DifficultySetting, ILevelConfig } from '../types/IDifficultyConfig';
import { LEVEL_CONFIGS, DIFFICULTY_SPEED_MAP, DIFFICULTY_SPAWN_SCALE } from '../config/levelConfig';
import {
  WAVE_SPAWN_INTERVAL_BASE_MS,
  EXPLOSION_RADIUS_PLAYER,
  CHAIN_REACTION_RADIUS,
  MIRV_SPLIT_ALTITUDE_PERCENT,
  CITY_HIT_POINTS,
} from '../config/gameConfig';

export class DifficultyManager {
  private scene: Phaser.Scene;
  private currentConfig: IDifficultyConfig;

  constructor(scene: Phaser.Scene, level: number, difficultySetting: DifficultySetting)

  /**
   * Return the current computed IDifficultyConfig.
   * Called synchronously by GameScene before startWave().
   */
  getConfig(): IDifficultyConfig

  /**
   * Change the difficulty setting (called if player changes difficulty mid-session).
   * Recomputes config and emits DIFFICULTY_CHANGED.
   */
  setDifficulty(difficultySetting: DifficultySetting): void

  /**
   * Advance to the next level. Recomputes config and emits DIFFICULTY_CHANGED.
   */
  setLevel(level: number): void

  /** Compute the IDifficultyConfig from level and difficulty setting. */
  private computeConfig(level: number, difficultySetting: DifficultySetting): IDifficultyConfig

  /** Emit DIFFICULTY_CHANGED with the current config. */
  private emitChange(): void
}
```

**`computeConfig()` implementation:**

```
levelCfg = LEVEL_CONFIGS[level - 1]
speedMultiplier = levelCfg.baseSpeedMultiplier × DIFFICULTY_SPEED_MAP[difficultySetting]
spawnIntervalMs = WAVE_SPAWN_INTERVAL_BASE_MS / DIFFICULTY_SPAWN_SCALE[difficultySetting]
                  / (1 + (level - 1) × 0.08)   // 8% faster per level
                  (clamp to minimum 600 ms)

problemComplexity:
  levels 1–3  → 'easy'
  levels 4–6  → 'medium'
  levels 7–10 → 'hard'

mirvChildCount: level ≤ 8 ? 2 : 3
bomberPayloadCount: level ≤ 7 ? 2 : 3
queueVisibleCount: 6  (constant per GDD open question default)
bomberQueueConstraint: 3  (constant per GDD default)
cityHitPoints: CITY_HIT_POINTS  (3)
explosionRadius: EXPLOSION_RADIUS_PLAYER  (80)
chainReactionRadius: CHAIN_REACTION_RADIUS  (60)
mirvSplitAltitudePercent: MIRV_SPLIT_ALTITUDE_PERCENT  (40)
timeLimitSeconds: levelCfg.timeLimitSeconds
```

Return fully populated `IDifficultyConfig`.

**Constructor sequence:**
1. Call `this.currentConfig = this.computeConfig(level, difficultySetting)`.
2. Call `this.emitChange()` — so `MathEngine` has the config before `WAVE_STARTED` fires.

`DIFFICULTY_CHANGED` payload: the full `IDifficultyConfig` object.

---

## 3. Event Contract

| Event Constant | Direction | Payload Type | When |
|---|---|---|---|
| `DIFFICULTY_CHANGED` | **emits** (DifficultyManager) | `IDifficultyConfig` | Constructor, `setDifficulty()`, `setLevel()` |
| `PROBLEM_GENERATED` | **emits** (MathEngine) | `ProblemGeneratedPayload` | `onWaveStarted()` — after wave problems are computed |
| `WAVE_STARTED` | **listens** (MathEngine) | `WaveStartedPayload` | GameScene fires this to trigger math generation |
| `DIFFICULTY_CHANGED` | **listens** (MathEngine) | `IDifficultyConfig` | MathEngine caches config for use in `onWaveStarted()` |

All events are on `this.scene.events` (Phaser scene event emitter).

---

## 4. Config Dependencies

The following constants are **imported** from config files created by Coding Agent 1. Do not redefine them.

| Constant | Source File | Used In |
|---|---|---|
| `LEVEL_CONFIGS` | `src/config/levelConfig.ts` | `DifficultyManager.computeConfig()` |
| `DIFFICULTY_SPEED_MAP` | `src/config/levelConfig.ts` | `DifficultyManager.computeConfig()` |
| `DIFFICULTY_SPAWN_SCALE` | `src/config/levelConfig.ts` | `DifficultyManager.computeConfig()` |
| `WAVE_SPAWN_INTERVAL_BASE_MS` | `src/config/gameConfig.ts` | `DifficultyManager.computeConfig()` |
| `EXPLOSION_RADIUS_PLAYER` | `src/config/gameConfig.ts` | `DifficultyManager.computeConfig()` |
| `CHAIN_REACTION_RADIUS` | `src/config/gameConfig.ts` | `DifficultyManager.computeConfig()` |
| `MIRV_SPLIT_ALTITUDE_PERCENT` | `src/config/gameConfig.ts` | `DifficultyManager.computeConfig()` |
| `CITY_HIT_POINTS` | `src/config/gameConfig.ts` | `DifficultyManager.computeConfig()` |

**The `shared/math-engine/` package has zero config dependencies** — it is standalone pure TypeScript.

---

## 5. Cross-Agent Assumptions

### From Coding Agent 1 (must exist at import time)
- `src/config/levelConfig.ts` exports `LEVEL_CONFIGS`, `DIFFICULTY_SPEED_MAP`, `DIFFICULTY_SPAWN_SCALE`.
- `src/config/gameConfig.ts` exports `WAVE_SPAWN_INTERVAL_BASE_MS`, `EXPLOSION_RADIUS_PLAYER`, `CHAIN_REACTION_RADIUS`, `MIRV_SPLIT_ALTITUDE_PERCENT`, `CITY_HIT_POINTS`.
- `src/types/GameEvents.ts` exports `GameEvents`, `WaveStartedPayload`, `ProblemGeneratedPayload`.
- `src/types/IMathProblem.ts` exports `IMathProblem`.
- `src/types/IMathEngine.ts` exports `IMathEngine`.
- `src/types/IDifficultyConfig.ts` exports `IDifficultyConfig`, `DifficultySetting`, `ILevelConfig`.
- `GameScene` creates `DifficultyManager` **before** `MathEngine` in its `create()` sequence, ensuring `DIFFICULTY_CHANGED` is emitted before `MathEngine` sets up its listener. Concretely:
  ```
  new DifficultyManager(this, level, difficulty)  // emits DIFFICULTY_CHANGED synchronously
  new MathEngine(this)                            // registers DIFFICULTY_CHANGED listener
  ```
  This ordering guarantee means `MathEngine` will always have a valid cached config by the time `WAVE_STARTED` fires.

### From Coding Agent 2 (none required for compilation)
- No Coding Agent 2 files are imported by this agent's code.
- However, `WaveManager` listens for `PROBLEM_GENERATED` (the event this agent emits) and must correctly destructure `{ problems: IMathProblem[], answerQueue: Array<number | string> }`.

### Shared Library Independence
- `shared/math-engine/` must **never** import from `games/` or use any Phaser APIs.
- The library's `MathProblem` type is a structural mirror of `IMathProblem` — compatible duck-typing, but separate declaration to preserve zero-dependency rule.
- The game's `MathEngine.ts` converts between the two types at the boundary (cast is safe since structures are identical).

---

## 6. Implementation Order

Build in this order — shared library first, game systems second:

1. `shared/math-engine/src/types.ts` — No dependencies.
2. `shared/math-engine/src/generators/additionGenerator.ts` — Depends on `types.ts`.
3. `shared/math-engine/src/generators/subtractionGenerator.ts` — Depends on `types.ts`.
4. `shared/math-engine/src/generators/multiplicationGenerator.ts` — Depends on `types.ts`.
5. `shared/math-engine/src/generators/divisionGenerator.ts` — Depends on `types.ts`.
6. `shared/math-engine/src/generators/fractionGenerator.ts` — Depends on `types.ts`.
7. `shared/math-engine/src/generators/multiStepGenerator.ts` — Depends on `types.ts`.
8. `shared/math-engine/src/generators/squareRootGenerator.ts` — Depends on `types.ts`.
9. `shared/math-engine/src/generators/mixedOperationsGenerator.ts` — Depends on `types.ts`, `squareRootGenerator.ts` (for perfect-square set).
10. `shared/math-engine/src/MathEngineCore.ts` — Depends on all generators.
11. `shared/math-engine/src/index.ts` — Re-exports from `MathEngineCore.ts` and `types.ts`.
12. Write all test files (steps 13–21) before game system files.
13. `shared/math-engine/tests/additionGenerator.test.ts`
14. `shared/math-engine/tests/subtractionGenerator.test.ts`
15. `shared/math-engine/tests/multiplicationGenerator.test.ts`
16. `shared/math-engine/tests/divisionGenerator.test.ts`
17. `shared/math-engine/tests/fractionGenerator.test.ts`
18. `shared/math-engine/tests/multiStepGenerator.test.ts`
19. `shared/math-engine/tests/squareRootGenerator.test.ts`
20. `shared/math-engine/tests/mixedOperationsGenerator.test.ts`
21. `shared/math-engine/tests/MathEngineCore.test.ts`
22. `games/missile-command-math/src/systems/DifficultyManager.ts` — Depends on config files from Agent 1 and type stubs.
23. `games/missile-command-math/src/systems/MathEngine.ts` — Depends on `shared/math-engine/src/index.ts` and `DifficultyManager`.

---

## 7. Test Specification

Every test file uses Vitest. Run from `shared/math-engine/` with `npm run test:run`.

### `tests/additionGenerator.test.ts`

```typescript
describe('additionGenerator', () => {
  it('single-digit-addition diff 1: sum ≤ 10')
  it('single-digit-addition diff 2: sum ≤ 18')
  it('single-digit-addition: always 3 unique distractors, none equal correctAnswer')
  it('two-digit-addition-no-regroup: ones digits sum ≤ 9')
  it('two-digit-addition-regroup diff 1: ones digits sum ≥ 10, tens ∈ [1,4]')
  it('three-digit-addition: correctAnswer equals sum of two operands')
  it('four-digit-addition: both operands ∈ [1000,4999]')
  it('unknown skillType throws')
})
```

### `tests/subtractionGenerator.test.ts`
```typescript
describe('subtractionGenerator', () => {
  it('single-digit-subtraction: result ≥ 0, A ≥ B')
  it('two-digit-subtraction: result ≥ 0')
  it('three-digit-subtraction: result ≥ 0')
  it('four-digit-subtraction: result ≥ 0')
  it('always 3 unique distractors, none equal correctAnswer')
})
```

### `tests/multiplicationGenerator.test.ts`
```typescript
describe('multiplicationGenerator', () => {
  it('multiplication-partial diff 1: A ∈ {2,5} only')
  it('multiplication-partial diff 2: A ∈ {2,5,10}')
  it('multiplication-full diff 3: A,B ∈ [2,12]')
  it('correctAnswer equals A × B')
  it('always 3 unique positive integer distractors')
})
```

### `tests/divisionGenerator.test.ts`
```typescript
describe('divisionGenerator', () => {
  it('division-basic: A = B × Q exactly (no remainder)')
  it('division-basic: correctAnswer is an integer')
  it('division-with-remainder: correctAnswer string format "Q R r"')
  it('division-with-remainder: Q and r satisfy A = B×Q + r')
  it('division-with-remainder distractors: wrong remainder or wrong quotient format')
  it('always 3 unique distractors')
})
```

### `tests/fractionGenerator.test.ts`
```typescript
describe('fractionGenerator', () => {
  it('unit-fraction-of-whole: correctAnswer is a positive integer')
  it('unit-fraction-of-whole: W is divisible by D')
  it('fraction-of-whole: correctAnswer is a positive integer')
  it('fraction-of-whole: (N × W) / D has no remainder')
  it('always 3 unique distractors, none equal correctAnswer')
})
```

### `tests/multiStepGenerator.test.ts`
```typescript
describe('multiStepGenerator', () => {
  it('correctAnswer equals (A × B) ± C')
  it('diff 1: product ≤ 36, C ∈ [1,9]')
  it('diff 3: product ≤ 108, C ∈ [1,20]')
  it('question contains parentheses')
  it('always 3 unique distractors')
})
```

### `tests/squareRootGenerator.test.ts`
```typescript
describe('squareRootGenerator', () => {
  it('P is always a perfect square from the allowed set')
  it('correctAnswer equals Math.sqrt(P)')
  it('diff 1: P ∈ {4,9,16,25}')
  it('diff 3: P ∈ {81,100,121,144}')
  it('distractors are adjacent integer square roots, all ≥ 1 and ≤ 12')
  it('always 3 unique distractors, none equal correctAnswer')
})
```

### `tests/mixedOperationsGenerator.test.ts`
```typescript
describe('mixedOperationsGenerator', () => {
  it('correctAnswer equals √P ± (A × B)')
  it('subtraction result is always ≥ 0')
  it('question contains √ symbol and parentheses')
  it('always 3 unique distractors')
})
```

### `tests/MathEngineCore.test.ts`
```typescript
describe('MathEngineCore', () => {
  it('generateProblem: returns valid IMathProblem shape for all 18 skillTypes')
  it('generateProblem: throws for unknown skillType')
  it('generateWaveProblems: returns count problems')
  it('generateWaveProblems: answerQueue contains exactly the correct answers')
  it('generateWaveProblems: answerQueue length equals problems length')
  it('generateWaveProblems: answerQueue is not in original problem order (shuffled — probabilistic check over 100 runs)')
  it('validateAnswer: returns true for correct numeric answer')
  it('validateAnswer: returns true for correct string answer "7 R1"')
  it('validateAnswer: case-insensitive and space-normalised for string answers')
  it('validateAnswer: returns false for wrong answer')
  it('validateAnswer: returns false for type mismatch')
  // Run 1000 iterations for each skillType and assert no throws and valid correctAnswer
  for each skillType in all 18 skillTypes:
    it(`generateProblem(${skillType}) generates valid problems 1000 times without error`)
})
```

> **Fuzz philosophy:** 1 000 iterations per skillType catches edge cases in random operand generation (e.g. fraction not evenly divisible, MIRV subtraction going negative).

---

## 8. Definition of Done

- [ ] All 22 files listed in §1 exist at the correct paths.
- [ ] `npm run typecheck` from `games/missile-command-math/` passes with zero errors.
- [ ] `npm run lint` from `games/missile-command-math/` passes with zero warnings.
- [ ] `npm run test:run` from `shared/math-engine/` passes — all tests green.
- [ ] All 18 `skillType` strings from the curriculum map are handled by `MathEngineCore.generateProblem()`.
- [ ] No skillType is handled by a hardcoded lookup table of problem strings — all problems are procedurally generated.
- [ ] Every generator produces exactly 3 distractors per problem.
- [ ] All distractors are unique and do not equal `correctAnswer`.
- [ ] `division-with-remainder` correctAnswer format is always `"Q R r"` (e.g. `"7 R1"`).
- [ ] `MathEngineCore` has zero imports from `games/` or `shared/audio`, `shared/visual`, or any Phaser package.
- [ ] `DifficultyManager.getConfig()` returns a synchronous result — no Promises, no async.
- [ ] `DifficultyManager` emits `DIFFICULTY_CHANGED` in its constructor (before `MathEngine` starts listening).
- [ ] `MathEngine.onWaveStarted()` emits `PROBLEM_GENERATED` with `problems.length === payload.totalThreats`.
- [ ] All `GameEvents` constants are imported from `src/types/GameEvents.ts` — no inline string literals.
- [ ] No `alert()`, `confirm()`, or `prompt()` calls.
- [ ] No `localStorage` access in any file owned by this agent.
