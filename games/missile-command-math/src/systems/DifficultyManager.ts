/**
 * DifficultyManager — Computes runtime IDifficultyConfig from level and difficulty setting.
 *
 * Emits DIFFICULTY_CHANGED immediately on construction and again on any change,
 * so MathEngine always has a valid config before WAVE_STARTED fires.
 *
 * @see docs/gdds/missile-command-math.md §7 (Difficulty Progression)
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import type {
  IDifficultyConfig,
  DifficultySetting,
  ProblemComplexity,
} from '../types/IDifficultyConfig';
import { LEVEL_CONFIGS, DIFFICULTY_SPEED_MAP, DIFFICULTY_SPAWN_SCALE } from '../config/levelConfig';
import {
  WAVE_SPAWN_INTERVAL_BASE_MS,
  EXPLOSION_RADIUS_PLAYER,
  CHAIN_REACTION_RADIUS,
  MIRV_SPLIT_ALTITUDE_PERCENT,
  CITY_HIT_POINTS,
} from '../config/gameConfig';

/** Minimum spawn interval to prevent overwhelming the player. */
const MIN_SPAWN_INTERVAL_MS = 600;

/** Default number of visible queue items (GDD open question default). */
const DEFAULT_QUEUE_VISIBLE_COUNT = 6;

/** Default bomber queue constraint rounds (GDD §7.3). */
const DEFAULT_BOMBER_QUEUE_CONSTRAINT = 3;

export class DifficultyManager {
  private scene: Phaser.Scene;
  private currentConfig: IDifficultyConfig;
  private currentLevel: number;
  private currentDifficulty: DifficultySetting;

  /**
   * Create a DifficultyManager.
   * Emits DIFFICULTY_CHANGED synchronously in the constructor.
   *
   * @param scene - The Phaser scene this manager belongs to.
   * @param level - Starting level (1–10).
   * @param difficultySetting - Global difficulty setting.
   */
  constructor(scene: Phaser.Scene, level: number, difficultySetting: DifficultySetting) {
    this.scene = scene;
    this.currentLevel = level;
    this.currentDifficulty = difficultySetting;
    this.currentConfig = this.computeConfig(level, difficultySetting);
    this.emitChange();
  }

  /**
   * Return the current computed IDifficultyConfig.
   * Called synchronously by GameScene before startWave().
   */
  getConfig(): IDifficultyConfig {
    return this.currentConfig;
  }

  /**
   * Change the difficulty setting (called if player changes difficulty mid-session).
   * Recomputes config and emits DIFFICULTY_CHANGED.
   *
   * @param difficultySetting - New difficulty setting.
   */
  setDifficulty(difficultySetting: DifficultySetting): void {
    this.currentDifficulty = difficultySetting;
    this.currentConfig = this.computeConfig(this.currentLevel, difficultySetting);
    this.emitChange();
  }

  /**
   * Advance to a new level. Recomputes config and emits DIFFICULTY_CHANGED.
   *
   * @param level - New level number (1–10).
   */
  setLevel(level: number): void {
    this.currentLevel = level;
    this.currentConfig = this.computeConfig(level, this.currentDifficulty);
    this.emitChange();
  }

  /**
   * Compute the IDifficultyConfig from level and difficulty setting.
   *
   * @param level - Level number (1–10).
   * @param difficultySetting - Global difficulty selector.
   * @returns Fully populated IDifficultyConfig.
   */
  private computeConfig(level: number, difficultySetting: DifficultySetting): IDifficultyConfig {
    const levelIndex = Math.max(0, Math.min(level - 1, LEVEL_CONFIGS.length - 1));
    const levelCfg = LEVEL_CONFIGS[levelIndex];

    // Speed multiplier: level base × difficulty modifier
    const difficultySpeedMult = DIFFICULTY_SPEED_MAP[difficultySetting] ?? 1.0;
    const missileSpeedMultiplier = levelCfg.baseSpeedMultiplier * difficultySpeedMult;

    // Spawn interval: base / difficulty scale / level acceleration
    const spawnScale = DIFFICULTY_SPAWN_SCALE[difficultySetting] ?? 1.0;
    const levelAcceleration = 1 + (level - 1) * 0.08;
    const rawSpawnInterval = WAVE_SPAWN_INTERVAL_BASE_MS / spawnScale / levelAcceleration;
    const spawnIntervalMs = Math.max(MIN_SPAWN_INTERVAL_MS, Math.round(rawSpawnInterval));

    // Problem complexity tier
    let problemComplexity: ProblemComplexity;
    if (level <= 3) {
      problemComplexity = 'easy';
    } else if (level <= 6) {
      problemComplexity = 'medium';
    } else {
      problemComplexity = 'hard';
    }

    // MIRV child count: 2 for levels ≤ 8, 3 for levels 9+
    const mirvChildCount = level <= 8 ? 2 : 3;

    // Bomber payload count: 2 for levels ≤ 7, 3 for levels 8+
    const bomberPayloadCount = level <= 7 ? 2 : 3;

    return {
      level,
      difficultySetting,
      missileSpeedMultiplier,
      spawnIntervalMs,
      problemComplexity,
      activeMathTypes: levelCfg.mathTypes,
      maxSimultaneousThreats: levelCfg.maxSimultaneousThreats,
      bomberEnabled: levelCfg.bomberEnabled,
      paratrooperEnabled: levelCfg.paratrooperEnabled,
      mirvEnabled: levelCfg.mirvEnabled,
      problemsInWave: levelCfg.problemsInWave,
      cityHitPoints: CITY_HIT_POINTS,
      explosionRadius: EXPLOSION_RADIUS_PLAYER,
      chainReactionRadius: CHAIN_REACTION_RADIUS,
      mirvSplitAltitudePercent: MIRV_SPLIT_ALTITUDE_PERCENT,
      queueVisibleCount: DEFAULT_QUEUE_VISIBLE_COUNT,
      bomberQueueConstraint: DEFAULT_BOMBER_QUEUE_CONSTRAINT,
      mirvChildCount,
      bomberPayloadCount,
      timeLimitSeconds: levelCfg.timeLimitSeconds,
    };
  }

  /**
   * Emit DIFFICULTY_CHANGED with the current config on the scene event bus.
   */
  private emitChange(): void {
    this.scene.events.emit(GameEvents.DIFFICULTY_CHANGED, this.currentConfig);
  }
}
