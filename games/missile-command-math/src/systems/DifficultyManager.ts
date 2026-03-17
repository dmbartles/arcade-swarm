/**
 * DifficultyManager — Runtime difficulty scaling for Missile Command Math.
 *
 * Reads IDifficultyConfig and adjusts parameters at runtime based on the
 * current level and the player's global difficulty setting (Easy/Normal/Hard).
 *
 * Listens for:
 *  - GameEvents.LEVEL_COMPLETE → advances to next level
 *  - GameEvents.WAVE_STARTED   → (re-)applies difficulty config for current level
 *
 * Emits:
 *  - GameEvents.DIFFICULTY_CHANGED → IDifficultyConfig (updated config)
 *
 * @see docs/gdds/missile-command-math.md §7 (Difficulty Scaling), §8 (Level Progression)
 * @see games/missile-command-math/src/types/IDifficultyConfig.ts
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import type {
  IDifficultyConfig,
  ILevelConfig,
  DifficultySetting,
} from '../types/IDifficultyConfig';
import type { LevelCompletePayload } from '../types/GameEvents';

// ─── Difficulty preset multipliers (GDD §Difficulty Scaling) ────────────────

/** Speed multipliers for global difficulty selector. */
const DIFFICULTY_SPEED_MULTIPLIERS: Record<DifficultySetting, number> = {
  easy:   0.7,
  normal: 1.0,
  hard:   1.3,
};

/** Launcher reload delay (ms) per difficulty setting (GDD range 400–800 ms). */
const DIFFICULTY_RELOAD_DELAY_MS: Record<DifficultySetting, number> = {
  easy:   800,
  normal: 600,
  hard:   400,
};

// ─── Level configuration table (GDD §Level Progression) ─────────────────────
//
// skillType strings use the exact kebab-case values from the curriculum map.
// Each entry includes every skill type active for that level (cumulative from
// prior levels as noted in the GDD).

const LEVEL_CONFIGS: ILevelConfig[] = [
  // Level 0 — Training
  {
    level: 0,
    skillType: 'Addition only (training)',
    ccssStandards: ['2.OA.B.2'],
    mathTypes: ['addition'],
    difficulty: 'Tutorial',
    maxSimultaneous: 1,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.3,
    enemyCount: 1,
    timeLimitSeconds: Infinity,
    specialRule: 'Cannot fail; loops until 1 success; no score',
  },
  // Level 1 — Addition (single-digit)
  {
    level: 1,
    skillType: 'Addition (single-digit)',
    ccssStandards: ['2.OA.B.2'],
    mathTypes: ['addition'],
    difficulty: 'Intro',
    maxSimultaneous: 2,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.4,
    enemyCount: 8,
    timeLimitSeconds: 90,
  },
  // Level 2 — Subtraction (single-digit)
  {
    level: 2,
    skillType: 'Subtraction (single-digit)',
    ccssStandards: ['2.OA.B.2'],
    mathTypes: ['subtraction'],
    difficulty: 'Intro',
    maxSimultaneous: 2,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.4,
    enemyCount: 8,
    timeLimitSeconds: 90,
  },
  // Level 3 — Mixed add + subtract
  {
    level: 3,
    skillType: 'Mixed add + subtract',
    ccssStandards: ['2.OA.B.2'],
    mathTypes: ['addition', 'subtraction'],
    difficulty: 'Easy',
    maxSimultaneous: 2,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.5,
    enemyCount: 10,
    timeLimitSeconds: 100,
  },
  // Level 4 — Mixed add + subtract (practice)
  {
    level: 4,
    skillType: 'Mixed add + subtract (practice)',
    ccssStandards: ['2.OA.B.2'],
    mathTypes: ['addition', 'subtraction'],
    difficulty: 'Easy',
    maxSimultaneous: 3,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.5,
    enemyCount: 10,
    timeLimitSeconds: 100,
    specialRule: 'Mild speed ramp',
  },
  // Level 5 — Two-digit add (no regroup)
  {
    level: 5,
    skillType: 'Two-digit add (no regroup)',
    ccssStandards: ['2.NBT.B.5'],
    mathTypes: ['two-digit-addition'],
    difficulty: 'Easy',
    maxSimultaneous: 3,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.5,
    enemyCount: 10,
    timeLimitSeconds: 110,
    specialRule: 'New-op pacing',
  },
  // Level 6 — Two-digit subtract (no regroup)
  {
    level: 6,
    skillType: 'Two-digit subtract (no regroup)',
    ccssStandards: ['2.NBT.B.5'],
    mathTypes: ['two-digit-addition', 'two-digit-subtraction'],
    difficulty: 'Easy',
    maxSimultaneous: 3,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.6,
    enemyCount: 12,
    timeLimitSeconds: 110,
  },
  // Level 7 — Two-digit add (regroup)
  {
    level: 7,
    skillType: 'Two-digit add (regroup)',
    ccssStandards: ['3.NBT.A.2'],
    mathTypes: ['two-digit-addition', 'two-digit-subtraction'],
    difficulty: 'Medium',
    maxSimultaneous: 3,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.6,
    enemyCount: 12,
    timeLimitSeconds: 110,
  },
  // Level 8 — Two-digit subtract (regroup)
  {
    level: 8,
    skillType: 'Two-digit subtract (regroup)',
    ccssStandards: ['3.NBT.A.2'],
    mathTypes: ['two-digit-addition', 'two-digit-subtraction'],
    difficulty: 'Medium',
    maxSimultaneous: 3,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.6,
    enemyCount: 12,
    timeLimitSeconds: 110,
  },
  // Level 9 — Multiply ×2 ×5 ×10
  {
    level: 9,
    skillType: 'Above + Multiply ×2 ×5 ×10',
    ccssStandards: ['3.OA.C.7'],
    mathTypes: ['addition', 'subtraction', 'multiplication'],
    difficulty: 'Medium',
    maxSimultaneous: 3,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.7,
    enemyCount: 12,
    timeLimitSeconds: 120,
    specialRule: 'New-op pacing',
  },
  // Level 10 — Multiply ×3 ×4 ×6
  {
    level: 10,
    skillType: 'Above + Multiply ×3 ×4 ×6',
    ccssStandards: ['3.OA.C.7'],
    mathTypes: ['addition', 'subtraction', 'multiplication'],
    difficulty: 'Medium',
    maxSimultaneous: 3,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.7,
    enemyCount: 14,
    timeLimitSeconds: 120,
  },
  // Level 11 — Full multiplication (12×12)
  {
    level: 11,
    skillType: 'Full multiplication (12×12)',
    ccssStandards: ['3.OA.C.7'],
    mathTypes: ['addition', 'subtraction', 'multiplication'],
    difficulty: 'Medium',
    maxSimultaneous: 4,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.8,
    enemyCount: 14,
    timeLimitSeconds: 120,
  },
  // Level 12 — Three-digit add
  {
    level: 12,
    skillType: 'Above + Three-digit add',
    ccssStandards: ['4.NBT.B.4'],
    mathTypes: ['addition', 'subtraction', 'multiplication', 'three-digit-addition'],
    difficulty: 'Hard',
    maxSimultaneous: 4,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.8,
    enemyCount: 14,
    timeLimitSeconds: 130,
  },
  // Level 13 — Three-digit subtract (bombers introduced)
  {
    level: 13,
    skillType: 'Above + Three-digit subtract',
    ccssStandards: ['4.NBT.B.4'],
    mathTypes: [
      'addition',
      'subtraction',
      'multiplication',
      'three-digit-addition',
      'three-digit-subtraction',
    ],
    difficulty: 'Hard',
    maxSimultaneous: 4,
    bomberEnabled: true,
    baseSpeedMultiplier: 0.9,
    enemyCount: 16,
    timeLimitSeconds: 130,
    specialRule: 'Bombers introduced',
  },
  // Level 14 — Division (basic)
  {
    level: 14,
    skillType: 'Above + Division (basic)',
    ccssStandards: ['3.OA.C.7'],
    mathTypes: [
      'addition',
      'subtraction',
      'multiplication',
      'three-digit-addition',
      'three-digit-subtraction',
      'division',
    ],
    difficulty: 'Hard',
    maxSimultaneous: 4,
    bomberEnabled: true,
    baseSpeedMultiplier: 0.9,
    enemyCount: 16,
    timeLimitSeconds: 130,
  },
  // Level 15 — Division w/ remainders
  {
    level: 15,
    skillType: 'Above + Division w/ remainders',
    ccssStandards: ['4.OA.A.3'],
    mathTypes: [
      'addition',
      'subtraction',
      'multiplication',
      'three-digit-addition',
      'three-digit-subtraction',
      'division',
      'division-with-remainders',
    ],
    difficulty: 'Hard',
    maxSimultaneous: 4,
    bomberEnabled: true,
    baseSpeedMultiplier: 1.0,
    enemyCount: 16,
    timeLimitSeconds: 140,
  },
  // Level 16 — Unit fractions
  {
    level: 16,
    skillType: 'Above + Unit fractions',
    ccssStandards: ['3.NF.A.1'],
    mathTypes: [
      'addition',
      'subtraction',
      'multiplication',
      'division',
      'division-with-remainders',
      'unit-fractions',
    ],
    difficulty: 'Hard',
    maxSimultaneous: 4,
    bomberEnabled: true,
    baseSpeedMultiplier: 1.0,
    enemyCount: 16,
    timeLimitSeconds: 140,
    specialRule: 'New-op pacing',
  },
  // Level 17 — Fraction of a number
  {
    level: 17,
    skillType: 'Above + Fraction of a number',
    ccssStandards: ['4.NF.A.1'],
    mathTypes: [
      'multiplication',
      'division',
      'division-with-remainders',
      'unit-fractions',
      'equivalent-fractions',
    ],
    difficulty: 'Expert',
    maxSimultaneous: 5,
    bomberEnabled: true,
    baseSpeedMultiplier: 1.0,
    enemyCount: 18,
    timeLimitSeconds: 140,
  },
  // Level 18 — Multi-step
  {
    level: 18,
    skillType: 'Above + Multi-step',
    ccssStandards: ['4.OA.A.3'],
    mathTypes: [
      'multiplication',
      'division',
      'division-with-remainders',
      'unit-fractions',
      'equivalent-fractions',
      'multi-step',
    ],
    difficulty: 'Expert',
    maxSimultaneous: 5,
    bomberEnabled: true,
    baseSpeedMultiplier: 1.1,
    enemyCount: 18,
    timeLimitSeconds: 150,
  },
  // Level 19 — Square roots
  {
    level: 19,
    skillType: 'Above + Square roots',
    ccssStandards: ['5.NBT.A.2'],
    mathTypes: [
      'multiplication',
      'division',
      'multi-step',
      'square-roots',
    ],
    difficulty: 'Expert',
    maxSimultaneous: 5,
    bomberEnabled: true,
    baseSpeedMultiplier: 1.1,
    enemyCount: 20,
    timeLimitSeconds: 150,
  },
  // Level 20 — All types mixed
  {
    level: 20,
    skillType: 'All types — mixed',
    ccssStandards: ['5.OA.A.1'],
    mathTypes: [
      'addition',
      'subtraction',
      'multiplication',
      'division',
      'division-with-remainders',
      'unit-fractions',
      'equivalent-fractions',
      'multi-step',
      'square-roots',
      'mixed-operations',
    ],
    difficulty: 'Expert',
    maxSimultaneous: 6,
    bomberEnabled: true,
    baseSpeedMultiplier: 1.2,
    enemyCount: 24,
    timeLimitSeconds: 150,
    specialRule: 'All bombers',
  },
];

// ─── Skill-type strings used by curriculum map / math-engine ────────────────
//
// Maps IDifficultyConfig MathSkillType values to math-engine skillType strings.
// The DifficultyManager uses MathSkillType for its own level table; MathEngine
// receives the kebab-case strings that the @arcade-swarm/math-engine library
// actually understands.

/**
 * Active skill types per level, as exact strings passed to MathEngine.generateWaveProblems().
 *
 * These strings must exactly match the keys in MathEngineCore's GENERATORS map
 * (shared/math-engine/src/MathEngineCore.ts). They differ from the curriculum-map
 * kebab-case names in a few places where the core library merged skill variants:
 *   - 'two-digit-subtraction'   covers both no-regroup and regroup subtraction
 *   - 'multiplication-partial'  covers easy-facts and mid-facts
 *   - 'multiplication-full'     covers full-facts (12×12)
 *   - 'division-basic'          covers basic division facts
 *   - 'unit-fraction-of-whole'  maps to unit-fraction-of-number
 *   - 'fraction-of-whole'       maps to fraction-of-number
 *   - 'perfect-square-root'     maps to square-root-perfect
 */
const LEVEL_SKILL_TYPES: Record<number, string[]> = {
  0:  ['single-digit-addition'],
  1:  ['single-digit-addition'],
  2:  ['single-digit-subtraction'],
  3:  ['single-digit-addition', 'single-digit-subtraction'],
  4:  ['single-digit-addition', 'single-digit-subtraction'],
  5:  ['two-digit-addition-no-regroup'],
  6:  ['two-digit-addition-no-regroup', 'two-digit-subtraction'],
  7:  ['two-digit-addition-regroup', 'two-digit-subtraction'],
  8:  ['two-digit-addition-regroup', 'two-digit-subtraction'],
  9:  ['single-digit-addition', 'single-digit-subtraction', 'multiplication-partial'],
  10: ['single-digit-addition', 'single-digit-subtraction', 'multiplication-partial'],
  11: ['multiplication-full', 'two-digit-addition-regroup', 'two-digit-subtraction'],
  12: ['multiplication-full', 'three-digit-addition', 'two-digit-subtraction'],
  13: ['multiplication-full', 'three-digit-addition', 'three-digit-subtraction'],
  14: ['multiplication-full', 'three-digit-subtraction', 'division-basic'],
  15: ['multiplication-full', 'division-basic', 'division-with-remainder'],
  16: ['division-basic', 'division-with-remainder', 'unit-fraction-of-whole'],
  17: ['division-with-remainder', 'unit-fraction-of-whole', 'fraction-of-whole'],
  18: ['fraction-of-whole', 'unit-fraction-of-whole', 'multi-step-expression'],
  19: ['multi-step-expression', 'perfect-square-root', 'multiplication-full'],
  20: [
    'single-digit-addition',
    'single-digit-subtraction',
    'multiplication-full',
    'division-basic',
    'division-with-remainder',
    'unit-fraction-of-whole',
    'fraction-of-whole',
    'multi-step-expression',
    'perfect-square-root',
  ],
};

// ─── Spawn interval (ms) by level ────────────────────────────────────────────
// Decreases as levels increase to add threat pressure.

const BASE_SPAWN_INTERVAL_MS: Record<number, number> = {
  0:  8000,
  1:  4000,
  2:  4000,
  3:  3500,
  4:  3200,
  5:  3000,
  6:  2800,
  7:  2600,
  8:  2600,
  9:  2400,
  10: 2200,
  11: 2000,
  12: 1900,
  13: 1800,
  14: 1700,
  15: 1600,
  16: 1500,
  17: 1400,
  18: 1300,
  19: 1200,
  20: 1000,
};

// ─── DifficultyManager ────────────────────────────────────────────────────────

/**
 * DifficultyManager manages runtime difficulty configuration.
 *
 * Listens to LEVEL_COMPLETE events to advance the level.
 * Exposes getCurrentConfig() for GameScene, WaveManager, and other systems.
 */
export class DifficultyManager {
  /** Phaser event emitter for listening and emitting events. */
  private readonly emitter: Phaser.Events.EventEmitter;

  /** Current level (0–20). */
  private currentLevel: number;

  /** Player's chosen global difficulty setting. */
  private difficultySetting: DifficultySetting;

  /** Cached current config, recomputed on level change. */
  private config: IDifficultyConfig;

  /**
   * @param emitter           - Scene event emitter (`this.events` in a scene).
   * @param difficultySetting - Player's selected difficulty (default: 'normal').
   * @param startingLevel     - Level to begin from (default: 1; 0 for training).
   */
  constructor(
    emitter: Phaser.Events.EventEmitter,
    difficultySetting: DifficultySetting = 'normal',
    startingLevel: number = 1,
  ) {
    this.emitter = emitter;
    this.difficultySetting = difficultySetting;
    this.currentLevel = startingLevel;
    this.config = this.buildConfig(this.currentLevel);

    // Listen for level completion to advance difficulty
    this.emitter.on(
      GameEvents.LEVEL_COMPLETE,
      this.onLevelComplete,
      this,
    );
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Get the current difficulty configuration.
   * Called by GameScene, WaveManager, and other systems each wave setup.
   */
  getCurrentConfig(): IDifficultyConfig {
    return this.config;
  }

  /**
   * Get the exact skill type strings for the current level.
   * These are the kebab-case strings accepted by @arcade-swarm/math-engine.
   */
  getActiveSkillTypes(): string[] {
    return LEVEL_SKILL_TYPES[this.currentLevel] ?? LEVEL_SKILL_TYPES[1];
  }

  /**
   * Get the grade level for the current level.
   * Used to call MathEngine.generateWaveProblems(gradeLevel, ...).
   */
  getGradeLevel(): number {
    const levelCfg = this.getLevelConfig(this.currentLevel);
    // Map GDD difficulty label to grade level
    switch (levelCfg.difficulty) {
      case 'Tutorial':
      case 'Intro':
      case 'Easy':
        return 2;
      case 'Medium':
        return 3;
      case 'Hard':
        return 4;
      case 'Expert':
        return 5;
      default:
        return 3;
    }
  }

  /**
   * Set the global difficulty setting (Easy/Normal/Hard) and recompute config.
   * Called when the player changes difficulty in Settings.
   */
  setDifficultySetting(setting: DifficultySetting): void {
    this.difficultySetting = setting;
    this.config = this.buildConfig(this.currentLevel);
    this.emitter.emit(GameEvents.DIFFICULTY_CHANGED, this.config);
  }

  /**
   * Manually set the current level (used by level select screen).
   * Recomputes and emits the updated config.
   */
  setLevel(level: number): void {
    const clamped = Math.max(0, Math.min(20, level));
    this.currentLevel = clamped;
    this.config = this.buildConfig(this.currentLevel);
    this.emitter.emit(GameEvents.DIFFICULTY_CHANGED, this.config);
  }

  /**
   * Get the ILevelConfig for a specific level number.
   */
  getLevelConfig(level: number): ILevelConfig {
    return LEVEL_CONFIGS[level] ?? LEVEL_CONFIGS[1];
  }

  /**
   * Clean up event listeners. Call when the scene shuts down.
   */
  destroy(): void {
    this.emitter.off(GameEvents.LEVEL_COMPLETE, this.onLevelComplete, this);
  }

  // ─── Private methods ───────────────────────────────────────────────────────

  /**
   * Handle LEVEL_COMPLETE event — advance to next level and recompute config.
   */
  private onLevelComplete = (payload: LevelCompletePayload): void => {
    const nextLevel = Math.min(payload.level + 1, 20);
    this.currentLevel = nextLevel;
    this.config = this.buildConfig(nextLevel);
    this.emitter.emit(GameEvents.DIFFICULTY_CHANGED, this.config);
  };

  /**
   * Build a complete IDifficultyConfig for a given level + current difficulty setting.
   *
   * Applies the global difficulty preset multiplier on top of per-level base values.
   * newOperationBombCountCap is enforced for first-introduction levels.
   */
  private buildConfig(level: number): IDifficultyConfig {
    const levelCfg = this.getLevelConfig(level);
    const presetMultiplier = DIFFICULTY_SPEED_MULTIPLIERS[this.difficultySetting];

    // Effective missile speed = base level speed × difficulty preset
    const missileSpeedMultiplier =
      levelCfg.baseSpeedMultiplier * presetMultiplier;

    // Bomber speed: base 1.2× × difficulty preset (Level 13+ only, GDD §Difficulty Scaling)
    const bomberSpeedMultiplier = levelCfg.bomberEnabled
      ? 1.2 * presetMultiplier
      : 0;

    // Spawn interval: base interval for level; no per-preset adjustment
    const spawnIntervalMs =
      BASE_SPAWN_INTERVAL_MS[level] ?? BASE_SPAWN_INTERVAL_MS[1];

    // Problem complexity label
    const problemComplexity = this.mapProblemComplexity(levelCfg.difficulty);

    return {
      level,
      difficultySetting: this.difficultySetting,
      missileSpeedMultiplier,
      spawnIntervalMs,
      problemComplexity,
      activeMathTypes: levelCfg.mathTypes,
      maxSimultaneousThreats: levelCfg.maxSimultaneous,
      bomberEnabled: levelCfg.bomberEnabled,
      problemsInWave: levelCfg.enemyCount,
      launcherReloadDelayMs: DIFFICULTY_RELOAD_DELAY_MS[this.difficultySetting],
      bomberSpeedMultiplier,
      timeLimitSeconds: levelCfg.timeLimitSeconds,
    };
  }

  /**
   * Map a GDD difficulty label to ProblemComplexity tier.
   */
  private mapProblemComplexity(
    difficulty: ILevelConfig['difficulty'],
  ): IDifficultyConfig['problemComplexity'] {
    switch (difficulty) {
      case 'Tutorial':
      case 'Intro':
      case 'Easy':
        return 'easy';
      case 'Medium':
        return 'medium';
      case 'Hard':
      case 'Expert':
        return 'hard';
      default:
        return 'medium';
    }
  }
}
