/**
 * scoreConfig.ts — Scoring constants for Missile Command Math.
 *
 * All point values come from the GDD §Scoring Model and §Combo/multiplier rules.
 * ScoreManager (Gameplay agent) imports these constants.
 *
 * @see docs/gdds/missile-command-math.md §Scoring Model
 */

import type { IScoreValues } from '../types/IScoreManager';

/** Base point values for every scoreable action. */
export const SCORE_VALUES: IScoreValues = {
  standardMissile:       10,
  citySaveBonus:         25,   // speed bonus: > 50% descent time remaining
  bomberBeforeDrop:     100,
  bomberAfterDrop:       50,
  mirvBeforeSplit:       60,
  mirvChild:             15,
  paratrooper:           15,
  chainReactionLink:     20,
  perfectWaveBonus:      50,
  buildingSurvivedBonus: 15,
};

/** Bonus awarded when all bombs in a wave are cleared without a miss. */
export const WAVE_NO_MISS_BONUS = 50;

/**
 * Streak thresholds → multiplier mapping.
 * Sorted descending so the first match wins.
 */
export const STREAK_THRESHOLDS: ReadonlyArray<{
  minStreak: number;
  multiplier: number;
  label: string;
}> = [
  { minStreak: 10, multiplier: 3.0, label: 'MATH GENIUS!'   },
  { minStreak:  5, multiplier: 2.0, label: 'ON FIRE!'       },
  { minStreak:  3, multiplier: 1.5, label: 'SHARP SHOOTER!' },
];
