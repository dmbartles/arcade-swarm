/**
 * ScoreManager.ts — In-memory scoring system for Missile Command Math.
 *
 * Tracks score, streaks, accuracy, and chain reactions during a wave.
 * Emits SCORE_UPDATED and STREAK_MILESTONE on the scene event bus.
 *
 * @see docs/gdds/missile-command-math.md §6 (Scoring Model)
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import type { IScoreManager, ScoreUpdatedPayload, StreakMilestonePayload } from '../types/IScoreManager';
import { STREAK_THRESHOLDS, SCORE_VALUES } from '../config/scoreConfig';

// Re-export SCORE_VALUES so it is reachable from WaveManager via ScoreManager
export { SCORE_VALUES };

export class ScoreManager implements IScoreManager {
  private score: number = 0;
  private streak: number = 0;
  private totalTaps: number = 0;
  private correctTaps: number = 0;
  private chainCount: number = 0;

  /** True if any intercept earned a speed bonus this wave. */
  private speedBonusEarned: boolean = false;

  /** Reference to scene event bus for emissions. */
  private scene: Phaser.Scene;

  /**
   * @param scene - The GameScene; used for event bus emissions.
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // ── IScoreManager implementation ─────────────────────────────────────────

  /**
   * Add points × current multiplier to score.
   * Emits SCORE_UPDATED with { score, delta: points, multiplier }.
   */
  addPoints(points: number): void {
    const multiplier = this.getStreakMultiplier();
    const delta = Math.round(points * multiplier);
    this.score += delta;

    const payload: ScoreUpdatedPayload = {
      score: this.score,
      delta: points,
      multiplier,
    };
    this.scene.events.emit(GameEvents.SCORE_UPDATED, payload);
  }

  /** Get the current total score. */
  getScore(): number {
    return this.score;
  }

  /** Reset score, streak, and accuracy counters. */
  reset(): void {
    this.score = 0;
    this.streak = 0;
    this.totalTaps = 0;
    this.correctTaps = 0;
    this.chainCount = 0;
    this.speedBonusEarned = false;
  }

  /**
   * Increment streak counter.
   * Emits STREAK_MILESTONE if a threshold boundary is crossed.
   * Returns new streak value.
   */
  incrementStreak(): number {
    const prevStreak = this.streak;
    this.streak += 1;

    // Check if we crossed a milestone threshold
    const prevMilestone = this.getMilestoneForStreak(prevStreak);
    const newMilestone = this.getMilestoneForStreak(this.streak);

    if (newMilestone && newMilestone !== prevMilestone) {
      const payload: StreakMilestonePayload = {
        streak: this.streak,
        label: newMilestone.label,
        multiplier: newMilestone.multiplier,
      };
      this.scene.events.emit(GameEvents.STREAK_MILESTONE, payload);
    }

    return this.streak;
  }

  /**
   * Reset streak to 0.
   * Per build plan: emit nothing here — WRONG_TAP event is already emitted by WaveManager.
   */
  resetStreak(): void {
    this.streak = 0;
  }

  /** Get the current streak count. */
  getStreak(): number {
    return this.streak;
  }

  /**
   * Returns multiplier based on current streak:
   * 0–2 → 1.0, 3–4 → 1.5, 5–9 → 2.0, 10+ → 3.0
   */
  getStreakMultiplier(): number {
    const milestone = this.getMilestoneForStreak(this.streak);
    return milestone ? milestone.multiplier : 1.0;
  }

  /** Record a tap attempt for accuracy tracking. */
  recordTap(correct: boolean): void {
    this.totalTaps += 1;
    if (correct) {
      this.correctTaps += 1;
    }
  }

  /** Get accuracy as a ratio (0–1). Returns 0 if no taps recorded. */
  getAccuracy(): number {
    if (this.totalTaps === 0) return 0;
    return this.correctTaps / this.totalTaps;
  }

  /** Record a chain reaction link. */
  addChainLink(): void {
    this.chainCount += 1;
  }

  /** Get the total number of chain reaction links this wave. */
  getChainCount(): number {
    return this.chainCount;
  }

  /**
   * Star calculation (GDD §Win/Lose Conditions):
   * 3 stars: citiesSurviving ≥ 5 AND accuracy ≥ 0.90 AND speedBonusEarned
   * 2 stars: citiesSurviving ≥ 3 AND accuracy ≥ 0.70
   * 1 star:  citiesSurviving ≥ 1
   * 0 stars: citiesSurviving === 0
   */
  calculateStars(citiesSurviving: number): number {
    if (citiesSurviving === 0) return 0;
    if (citiesSurviving >= 1) {
      if (
        citiesSurviving >= 5 &&
        this.getAccuracy() >= 0.9 &&
        this.speedBonusEarned
      ) {
        return 3;
      }
      if (citiesSurviving >= 3 && this.getAccuracy() >= 0.7) {
        return 2;
      }
      return 1;
    }
    return 0;
  }

  /** Mark that a speed bonus was earned this wave. Called by WaveManager. */
  setSpeedBonusEarned(): void {
    this.speedBonusEarned = true;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Return the highest STREAK_THRESHOLDS entry that applies to the given streak,
   * or null if streak < 3.
   */
  private getMilestoneForStreak(
    streak: number,
  ): (typeof STREAK_THRESHOLDS)[number] | null {
    let result: (typeof STREAK_THRESHOLDS)[number] | null = null;
    for (const threshold of STREAK_THRESHOLDS) {
      if (streak >= threshold.minStreak && threshold.minStreak >= 3) {
        result = threshold;
      }
    }
    return result;
  }
}
