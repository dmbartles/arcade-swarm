/**
 * IScoreManager — Contract for the in-memory scoring system.
 *
 * The ScoreManager tracks points, streaks, accuracy, and chain reactions
 * during a wave. It communicates state changes via the Phaser event bus
 * using `SCORE_UPDATED` and `STREAK_MILESTONE` events.
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

  /** Get the current streak multiplier (1.0, 1.5, 2.0, or 3.0). */
  getStreakMultiplier(): number;

  /** Record a tap attempt for accuracy tracking. */
  recordTap(correct: boolean): void;

  /** Get accuracy as a ratio (0–1). Returns 0 if no taps recorded. */
  getAccuracy(): number;

  /** Record a chain reaction link. */
  addChainLink(): void;

  /** Get the total number of chain reaction links this wave. */
  getChainCount(): number;
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
