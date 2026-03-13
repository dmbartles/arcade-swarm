/**
 * IDifficultyConfig — Tunable parameters consumed by the DifficultyManager.
 *
 * All gameplay-tuning values live in config files — nothing is hardcoded in
 * entity or system files. The DifficultyManager reads these configs and
 * adjusts parameters at runtime based on the current level and global
 * difficulty setting.
 */

/** Global difficulty setting chosen by the player at game start. */
export type DifficultySetting = 'easy' | 'normal' | 'hard';

/** Math problem complexity tier, driven by the current level. */
export type ProblemComplexity = 'easy' | 'medium' | 'hard';

/** The set of math skill types that can appear in a given level. */
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

/** Per-level configuration derived from the GDD §7.1 level table. */
export interface ILevelConfig {
  /** Level number (1–10). */
  level: number;

  /** Narrative year for the interstitial card (1981–1987). */
  year: number;

  /** Math skill types active for this level. */
  mathTypes: MathSkillType[];

  /** Maximum number of threats on screen simultaneously. */
  maxSimultaneousThreats: number;

  /** Whether strategic bombers can spawn this level. */
  bomberEnabled: boolean;

  /** Whether paratrooper transports can spawn this level. */
  paratrooperEnabled: boolean;

  /** Whether MIRVs can spawn this level. */
  mirvEnabled: boolean;

  /** Base speed multiplier for missile descent (0.5–1.5). */
  baseSpeedMultiplier: number;

  /** Total number of problems/threats in the wave. */
  problemsInWave: number;
}

/** Runtime difficulty configuration passed to systems each frame/wave. */
export interface IDifficultyConfig {
  /** Current level number (1–10). */
  level: number;

  /** Global difficulty setting chosen by the player. */
  difficultySetting: DifficultySetting;

  /**
   * Effective missile speed multiplier.
   * Computed as: levelConfig.baseSpeedMultiplier × difficultySpeedMultiplier.
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

  /** Whether bombers are active this level. */
  bomberEnabled: boolean;

  /** Whether paratroopers are active this level. */
  paratrooperEnabled: boolean;

  /** Whether MIRVs are active this level. */
  mirvEnabled: boolean;

  /** Total problems in the current wave. */
  problemsInWave: number;

  /** Hit points per city (default: 3, configurable). */
  cityHitPoints: number;

  /** Player explosion blast radius in pixels. */
  explosionRadius: number;

  /** Chain reaction blast radius in pixels. */
  chainReactionRadius: number;

  /** MIRV split altitude as a percentage of screen height (default: 40). */
  mirvSplitAltitudePercent: number;

  /** Number of answer queue items visible at once (default: 6). */
  queueVisibleCount: number;
}

/** Speed multiplier map for the global difficulty selector (GDD §7.2). */
export interface IDifficultySpeedMap {
  easy: number;   // 0.7
  normal: number; // 1.0
  hard: number;   // 1.3
}
