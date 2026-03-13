/**
 * IScoreManager — Contract for the in-memory scoring system.
 *
 * The ScoreManager tracks points, streaks, accuracy, and chain reactions
 * during a wave. It communicates state changes via the Phaser event bus
 * using `SCORE_UPDATED` and `STREAK_MILESTONE` events.
 *
 * @see docs/gdds/missile-command-math.md §6 (Scoring Model)
 */

export interface IScoreManager {
  /** Add points to the current score, applying any active multiplier. */
  addPoints(points: number): void;

  /** Get the current total score for this wave/session. */
  getScore(): number;

  /** Reset score, streak, and accuracy counters (e.g. on level restart). */
  reset(): void;

  /** Increment the streak counter. Returns the new streak value. */
  incrementStreak(): number;

  /** Reset the streak counter to zero (on miss or wrong tap). */
  resetStreak(): void;

  /** Get the current streak count. */
  getStreak(): number;

  /**
   * Get the current streak multiplier.
   *   - 0–2 streak: 1.0×
   *   - 3–4 streak: 1.5× ("SHARP SHOOTER!")
   *   - 5–9 streak: 2.0× ("ON FIRE!")
   *   - 10+  streak: 3.0× ("MATH GENIUS!")
   */
  getStreakMultiplier(): number;

  /** Record a tap attempt for accuracy tracking. */
  recordTap(correct: boolean): void;

  /** Get accuracy as a ratio (0–1). Returns 0 if no taps recorded. */
  getAccuracy(): number;

  /** Record a chain reaction link. */
  addChainLink(): void;

  /** Get the total number of chain reaction links this wave. */
  getChainCount(): number;

  /**
   * Calculate the star rating for the current wave state.
   *   - 1 star: Level completed (≥1 city surviving)
   *   - 2 stars: 4+ cities surviving AND ≥70% accuracy
   *   - 3 stars: All 6 cities surviving AND ≥85% accuracy AND ≥1 chain reaction
   *
   * @param citiesSurviving - Number of cities still standing (0–6).
   * @returns Star rating (0–3). 0 if all cities destroyed.
   */
  calculateStars(citiesSurviving: number): number;
}

/** Payload emitted with the `SCORE_UPDATED` event. */
export interface ScoreUpdatedPayload {
  /** New total score. */
  score: number;
  /** Points added in this update (before multiplier). */
  delta: number;
  /** Multiplier applied to this update. */
  multiplier: number;
}

/** Payload emitted with the `STREAK_MILESTONE` event. */
export interface StreakMilestonePayload {
  /** Current streak count. */
  streak: number;
  /** Label to display: "SHARP SHOOTER!", "ON FIRE!", or "MATH GENIUS!" */
  label: string;
  /** Active multiplier at this milestone. */
  multiplier: number;
}

/** Base point values for scoring actions (GDD §6.1). */
export interface IScoreValues {
  /** Standard missile intercepted: +10. */
  standardMissile: number;
  /** Bomber intercepted before payload drop: +50. */
  bomberBeforeDrop: number;
  /** Bomber payload missile intercepted after drop: +10 each. */
  bomberPayloadMissile: number;
  /** MIRV intercepted before split: +40. */
  mirvBeforeSplit: number;
  /** MIRV child intercepted after split: +10 each. */
  mirvChild: number;
  /** Paratrooper caught in blast radius: +15. */
  paratrooper: number;
  /** Chain reaction bonus per link after the first: +15. */
  chainReactionLink: number;
  /** Perfect wave bonus (all 6 cities intact): +100. */
  perfectWave: number;
}
