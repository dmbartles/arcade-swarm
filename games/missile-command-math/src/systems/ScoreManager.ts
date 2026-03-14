/**
 * ScoreManager — In-memory scoring system for Missile Command Math.
 *
 * Implements IScoreManager. Tracks score, streaks, accuracy, and chain reactions.
 * Emits SCORE_UPDATED and STREAK_MILESTONE events on the Phaser event bus.
 * Never writes to localStorage during gameplay.
 *
 * @see docs/gdds/missile-command-math.md §6 (Scoring Model)
 * @see IScoreManager interface for the full contract.
 */

import Phaser from 'phaser';
import type { IScoreManager, ScoreUpdatedPayload, StreakMilestonePayload } from '../types/IScoreManager';
import { GameEvents } from '../types/GameEvents';
import { STREAK_MULTIPLIERS, STREAK_MILESTONE_THRESHOLDS } from '../config/scoreConfig';

export class ScoreManager implements IScoreManager {
  private scene: Phaser.Scene;
  private score: number;
  private streak: number;
  private totalTaps: number;
  private correctTaps: number;
  private chainCount: number;
  /** Current number of surviving cities — used for live star projection. */
  private currentCities: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.score = 0;
    this.streak = 0;
    this.totalTaps = 0;
    this.correctTaps = 0;
    this.chainCount = 0;
    this.currentCities = 6;
  }

  /**
   * Add points to the current score, applying any active multiplier.
   * Emits SCORE_UPDATED with the new score, delta, and multiplier.
   * After adding points, emits STAR_RATING_UPDATED with projected stars.
   */
  addPoints(points: number): void {
    const multiplier = this.getStreakMultiplier();
    const finalPoints = Math.round(points * multiplier);
    this.score += finalPoints;

    const payload: ScoreUpdatedPayload = {
      score: this.score,
      delta: points,
      multiplier,
    };
    this.scene.events.emit(GameEvents.SCORE_UPDATED, payload);

    // Emit live star rating projection
    const stars = this.calculateStars(this.currentCities);
    this.scene.events.emit(GameEvents.STAR_RATING_UPDATED, { stars });
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
    this.currentCities = 6;
  }

  /**
   * Increment the streak counter.
   * If streak hits a milestone (3, 5, 10), emits STREAK_MILESTONE.
   * @returns The new streak value.
   */
  incrementStreak(): number {
    this.streak += 1;

    // Check if we've hit a milestone
    if (STREAK_MILESTONE_THRESHOLDS.includes(this.streak)) {
      const entry = STREAK_MULTIPLIERS.find((e) => this.streak >= e.minStreak);
      if (entry) {
        const payload: StreakMilestonePayload = {
          streak: this.streak,
          label: entry.label,
          multiplier: entry.multiplier,
        };
        this.scene.events.emit(GameEvents.STREAK_MILESTONE, payload);
      }
    }

    return this.streak;
  }

  /** Reset the streak counter to zero. */
  resetStreak(): void {
    this.streak = 0;
  }

  /** Get the current streak count. */
  getStreak(): number {
    return this.streak;
  }

  /**
   * Get the current streak multiplier.
   * Iterates STREAK_MULTIPLIERS (sorted highest-first), returns first match.
   *   - 0–2 streak: 1.0×
   *   - 3–4 streak: 1.5×
   *   - 5–9 streak: 2.0×
   *   - 10+  streak: 3.0×
   */
  getStreakMultiplier(): number {
    for (const entry of STREAK_MULTIPLIERS) {
      if (this.streak >= entry.minStreak) {
        return entry.multiplier;
      }
    }
    return 1.0;
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
   * Calculate the star rating for the current wave state (GDD §3).
   *   - 0 cities → 0 stars
   *   - 1–3 cities → 1 star
   *   - 4–5 cities → 2 stars
   *   - 6 cities → 3 stars (base)
   *
   * Bonus: chain count >= 3 → +1 star (cap at 3).
   * Bonus: accuracy >= 0.9 → +1 star (cap at 3).
   *
   * @param citiesSurviving - Number of cities still standing (0–6).
   * @returns Star rating (0–3).
   */
  calculateStars(citiesSurviving: number): number {
    if (citiesSurviving <= 0) return 0;

    let stars: number;
    if (citiesSurviving === 6) {
      stars = 3;
    } else if (citiesSurviving >= 4) {
      stars = 2;
    } else {
      stars = 1;
    }

    // Bonus for chain reactions
    if (this.chainCount >= 3) {
      stars = Math.min(3, stars + 1);
    }

    // Bonus for high accuracy
    if (this.getAccuracy() >= 0.9) {
      stars = Math.min(3, stars + 1);
    }

    return stars;
  }

  /**
   * Not in interface; used internally by WaveManager to keep star projection current.
   * @param count - Number of surviving cities.
   */
  setCurrentCities(count: number): void {
    this.currentCities = count;
  }
}
