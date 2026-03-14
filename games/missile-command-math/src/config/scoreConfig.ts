/**
 * Score configuration constants — stub file.
 * Coding Agent 1 will overwrite this with correct values.
 * These placeholders allow ScoreManager to compile.
 */

import type { IScoreValues } from '../types/IScoreManager';

/** Base point values for scoring actions (GDD §6 Scoring Model). */
export const SCORE_VALUES: IScoreValues = {
  standardMissile: 10,
  citySaveBonus: 25,
  bomberBeforeDrop: 100,
  bomberAfterDrop: 40,
  mirvBeforeSplit: 60,
  mirvChild: 15,
  paratrooper: 15,
  chainReactionLink: 20,
};

/** Streak multiplier breakpoints — first match wins (highest minStreak first). */
export const STREAK_MULTIPLIERS: Array<{ minStreak: number; multiplier: number; label: string }> = [
  { minStreak: 10, multiplier: 3.0, label: 'MATH GENIUS!' },
  { minStreak: 5, multiplier: 2.0, label: 'ON FIRE!' },
  { minStreak: 3, multiplier: 1.5, label: 'SHARP SHOOTER!' },
  { minStreak: 0, multiplier: 1.0, label: '' },
];

/** Streak values at which milestones fire. */
export const STREAK_MILESTONE_THRESHOLDS = [3, 5, 10];
