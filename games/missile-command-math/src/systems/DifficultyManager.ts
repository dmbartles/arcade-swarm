/**
 * DifficultyManager.ts — Runtime difficulty configuration resolver.
 *
 * Computes the live IDifficultyConfig from the current level number and
 * the player's chosen difficulty setting. Does not hold game state —
 * purely a config resolver.
 *
 * @see docs/gdds/missile-command-math.md §7 (Difficulty Scaling)
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import type { IDifficultyConfig, DifficultySetting, MathSkillType, ProblemComplexity } from '../types/IDifficultyConfig';
import {
  LEVEL_CONFIGS,
  DIFFICULTY_SPEED_MAP,
  LAUNCHER_RELOAD_DELAY_MS,
  BOMBER_BASE_SPEED_MULTIPLIER,
  BASE_SPAWN_INTERVAL_MS,
  SPAWN_INTERVAL_DECREMENT_MS,
  SPAWN_INTERVAL_MIN_MS,
} from '../config/difficultyConfig';

/** Grade level per level index (0–20). */
const LEVEL_GRADE_MAP: number[] = [
  2,  // Level 0
  2,  // Level 1
  2,  // Level 2
  2,  // Level 3
  2,  // Level 4
  2,  // Level 5
  2,  // Level 6
  3,  // Level 7
  3,  // Level 8
  3,  // Level 9
  3,  // Level 10
  3,  // Level 11
  4,  // Level 12
  4,  // Level 13
  4,  // Level 14
  4,  // Level 15
  3,  // Level 16
  4,  // Level 17
  4,  // Level 18
  4,  // Level 19
  5,  // Level 20
];

export class DifficultyManager {
  private currentLevel: number;
  private difficultySetting: DifficultySetting;
  private scene: Phaser.Scene;

  /**
   * @param scene            - Scene for event bus emission.
   * @param level            - Starting level (0–20).
   * @param difficultySetting - Player's chosen preset.
   */
  constructor(scene: Phaser.Scene, level: number, difficultySetting: DifficultySetting) {
    this.scene = scene;
    this.currentLevel = Math.max(0, Math.min(20, level));
    this.difficultySetting = difficultySetting;
  }

  /**
   * Compute and return the full IDifficultyConfig for current level + setting.
   */
  getConfig(): IDifficultyConfig {
    const levelConfig = LEVEL_CONFIGS[this.currentLevel];
    const presetMultiplier = DIFFICULTY_SPEED_MAP[this.difficultySetting];

    const missileSpeedMultiplier = levelConfig.baseSpeedMultiplier * presetMultiplier;
    const bomberSpeedMultiplier = BOMBER_BASE_SPEED_MULTIPLIER * presetMultiplier;
    const launcherReloadDelayMs = LAUNCHER_RELOAD_DELAY_MS[this.difficultySetting];

    const spawnIntervalMs = Math.max(
      SPAWN_INTERVAL_MIN_MS,
      BASE_SPAWN_INTERVAL_MS - this.currentLevel * SPAWN_INTERVAL_DECREMENT_MS,
    );

    const problemComplexity = this.resolveProblemComplexity();
    const activeMathTypes = levelConfig.mathTypes as MathSkillType[];

    return {
      level: this.currentLevel,
      difficultySetting: this.difficultySetting,
      missileSpeedMultiplier,
      spawnIntervalMs,
      problemComplexity,
      activeMathTypes,
      maxSimultaneousThreats: levelConfig.maxSimultaneous,
      bomberEnabled: levelConfig.bomberEnabled,
      problemsInWave: levelConfig.enemyCount,
      launcherReloadDelayMs,
      bomberSpeedMultiplier,
      timeLimitSeconds: levelConfig.timeLimitSeconds,
    };
  }

  /**
   * Update to a new level and return the new config.
   * Emits DIFFICULTY_CHANGED on the scene event bus.
   */
  setLevel(level: number): IDifficultyConfig {
    this.currentLevel = Math.max(0, Math.min(20, level));
    const config = this.getConfig();
    this.scene.events.emit(GameEvents.DIFFICULTY_CHANGED, config);
    return config;
  }

  /**
   * Update the difficulty preset and return the new config.
   * Emits DIFFICULTY_CHANGED on the scene event bus.
   */
  setDifficultySetting(setting: DifficultySetting): IDifficultyConfig {
    this.difficultySetting = setting;
    const config = this.getConfig();
    this.scene.events.emit(GameEvents.DIFFICULTY_CHANGED, config);
    return config;
  }

  /** Return the grade level for the current level (used by MathEngine). */
  getGradeLevel(): number {
    return LEVEL_GRADE_MAP[this.currentLevel] ?? 2;
  }

  /** Return the active skill types for the current level (for MathEngine). */
  getActiveSkillTypes(): string[] {
    return this.resolveSkillTypes(this.currentLevel);
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /** Map MathSkillType to kebab-case skill strings for MathEngine. */
  private resolveSkillTypes(level: number): string[] {
    const levelConfig = LEVEL_CONFIGS[level];
    const result: string[] = [];

    for (const mathType of levelConfig.mathTypes) {
      const resolved = this.mapMathType(mathType, level);
      if (resolved && !result.includes(resolved)) {
        result.push(resolved);
      }
    }

    return result;
  }

  /** Map a single MathSkillType to the curriculum kebab-case string. */
  private mapMathType(mathType: MathSkillType, level: number): string {
    switch (mathType) {
      case 'addition':
        return 'single-digit-addition';
      case 'subtraction':
        return 'single-digit-subtraction';
      case 'two-digit-addition':
        return level <= 6
          ? 'two-digit-addition-no-regroup'
          : 'two-digit-addition-regroup';
      case 'two-digit-subtraction':
        return level <= 6
          ? 'two-digit-subtraction-no-regroup'
          : 'two-digit-subtraction-regroup';
      case 'multiplication':
        if (level <= 9) return 'multiplication-easy-facts';
        if (level === 10) return 'multiplication-mid-facts';
        return 'multiplication-full-facts';
      case 'three-digit-addition':
        return 'three-digit-addition';
      case 'three-digit-subtraction':
        return 'three-digit-subtraction';
      case 'four-digit-addition':
        return 'four-digit-addition';
      case 'four-digit-subtraction':
        return 'four-digit-subtraction';
      case 'division':
        return 'division-basic-facts';
      case 'division-with-remainders':
        return 'division-with-remainder';
      case 'unit-fractions':
        return 'unit-fraction-of-number';
      case 'equivalent-fractions':
        return 'fraction-of-number';
      case 'multi-step':
        return 'multi-step-expression';
      case 'square-roots':
        return 'square-root-perfect';
      case 'mixed-operations':
        return 'mixed-operations';
      default:
        return mathType;
    }
  }

  /** Derive problem complexity tier from current level. */
  private resolveProblemComplexity(): ProblemComplexity {
    if (this.currentLevel <= 4) return 'easy';
    if (this.currentLevel <= 11) return 'medium';
    return 'hard';
  }
}
