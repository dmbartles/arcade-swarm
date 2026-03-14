/**
 * scoreConfig — Base point values and streak multiplier thresholds.
 *
 * Coding Agent 2's ScoreManager imports SCORE_VALUES and STREAK_MULTIPLIERS
 * from here. No scoring logic resides in this file — only data.
 *
 * @see docs/gdds/missile-command-math.md §6 (Scoring Model)
 */

import type { IScoreValues } from '../types/IScoreManager';

/** Base point values per GDD §6 Scoring Model. */
export const SCORE_VALUES: IScoreValues = {
  standardMissile: 10,
  citySaveBonus: 25,
  bomberBeforeDrop: 100,
  bomberAfterDrop: 40,
  mirvBeforeSplit: 60,
  mirvChild: 15,
  paratrooper: 15,
  chainReactionLink: 20,
} as const;

/** Streak multiplier thresholds (GDD §6 Combo Rules). Ordered high→low for first-match. */
export const STREAK_MULTIPLIERS = [
  { minStreak: 10, multiplier: 3.0, label: 'MATH GENIUS!' },
  { minStreak: 5, multiplier: 2.0, label: 'ON FIRE!' },
  { minStreak: 3, multiplier: 1.5, label: 'SHARP SHOOTER!' },
  { minStreak: 0, multiplier: 1.0, label: '' },
] as const;

/** Milestones at which STREAK_MILESTONE event fires. */
export const STREAK_MILESTONE_THRESHOLDS = [3, 5, 10] as const;
