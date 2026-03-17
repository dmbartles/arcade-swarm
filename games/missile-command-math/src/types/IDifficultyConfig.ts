/**
 * IDifficultyConfig — Tunable parameters consumed by the DifficultyManager.
 *
 * All gameplay-tuning values live in config files — nothing is hardcoded in
 * entity or system files. The DifficultyManager reads these configs and
 * adjusts parameters at runtime based on the current level and global
 * difficulty setting.
 *
 * @see docs/gdds/missile-command-math.md §7 (Difficulty Scaling)
 */

/** Global difficulty setting chosen by the player at game start (GDD §Difficulty Scaling). */
export type DifficultySetting = 'easy' | 'normal' | 'hard';

/** Math problem complexity tier, driven by the current level. */
export type ProblemComplexity = 'easy' | 'medium' | 'hard';

/**
 * The set of math skill types that can appear in a given level.
 * Derived from GDD §Level Progression table.
 */
export type MathSkillType =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'two-digit-addition'
  | 'two-digit-subtraction'
  | 'three-digit-addition'
  | 'three-digit-subtraction'
  | 'four-digit-addition'
  | 'four-digit-subtraction'
  | 'division'
  | 'division-with-remainders'
  | 'unit-fractions'
  | 'equivalent-fractions'
  | 'multi-step'
  | 'square-roots'
  | 'mixed-operations';

/**
 * Per-level configuration derived from the GDD §Level Progression table.
 * Each level (0–20) has one of these defining what threats and math appear.
 */
export interface ILevelConfig {
  /** Level number (0–20). Level 0 = training. */
  level: number;

  /** Human-readable skill description. */
  skillType: string;

  /** CCSS standard codes active for this level (e.g. "2.OA.B.2"). */
  ccssStandards: string[];

  /** Math skill types active for this level. */
  mathTypes: MathSkillType[];

  /** Difficulty label for the level. */
  difficulty: 'Tutorial' | 'Intro' | 'Easy' | 'Medium' | 'Hard' | 'Expert';

  /** Maximum number of simultaneous on-screen bombs. */
  maxSimultaneous: number;

  /** Whether strategic bombers can spawn this level (Level 13+). */
  bomberEnabled: boolean;

  /** Base speed multiplier for bomb descent (0.4×–1.2×, GDD §Level Progression). */
  baseSpeedMultiplier: number;

  /** Total number of enemy threats in the wave. */
  enemyCount: number;

  /**
   * Soft time limit in seconds for the wave.
   * Unlimited (Infinity) for Level 0 (training).
   */
  timeLimitSeconds: number;

  /**
   * Special rules for this level (free-form description).
   * E.g. "Cannot fail; loops until 1 success; no score".
   */
  specialRule?: string;
}

/**
 * Runtime difficulty configuration passed to systems each frame/wave.
 * Combines the per-level config with the player's global difficulty setting.
 */
export interface IDifficultyConfig {
  /** Current level number (0–20). */
  level: number;

  /** Global difficulty setting chosen by the player. */
  difficultySetting: DifficultySetting;

  /**
   * Effective missile speed multiplier.
   * Computed as: levelConfig.baseSpeedMultiplier × difficultyPresetMultiplier.
   * Example: Level 13 (0.9×) on Hard (1.3×) = 1.17×.
   */
  missileSpeedMultiplier: number;

  /**
   * Milliseconds between threat spawns during a wave.
   * Decreases at higher levels for more pressure.
   */
  spawnIntervalMs: number;

  /** Math problem complexity tier for the current level. */
  problemComplexity: ProblemComplexity;

  /** Math skill types active for the current level. */
  activeMathTypes: MathSkillType[];

  /** Maximum simultaneous on-screen threats. */
  maxSimultaneousThreats: number;

  /** Whether bombers are active this level (Level 13+). */
  bomberEnabled: boolean;

  /** Total problems in the current wave. */
  problemsInWave: number;

  /**
   * Launcher reload delay in milliseconds.
   * Range: 400–800 ms (GDD §Difficulty Scaling).
   * Decreases on higher difficulty presets.
   */
  launcherReloadDelayMs: number;

  /**
   * Bomber speed multiplier (Level 13+ only).
   * Range: 0.84×–1.56×. Computed as 1.2× × difficultyPresetMultiplier.
   */
  bomberSpeedMultiplier: number;

  /**
   * Soft time limit in seconds for the wave (GDD §Level Progression).
   * Unlimited (Infinity) for Level 0 (training).
   */
  timeLimitSeconds: number;
}

/** Speed multiplier map for the global difficulty selector (GDD §Difficulty Scaling). */
export interface IDifficultySpeedMap {
  /** Recommended for Grade 3 / younger players. 0.7× multiplier. */
  easy: number;
  /** Default. Recommended for Grade 4. 1.0× multiplier. */
  normal: number;
  /** Recommended for Grade 5 / challenge seekers. 1.3× multiplier. */
  hard: number;
}
