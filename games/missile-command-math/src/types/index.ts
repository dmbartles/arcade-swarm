/**
 * Type exports — central barrel file for all shared type contracts.
 *
 * Import from `@/types` in game code to access any interface or event constant.
 */

export { GameEvents } from './GameEvents';
export type { GameEvent } from './GameEvents';

export type { IMathProblem } from './IMathProblem';

export type {
  IScoreManager,
  ScoreUpdatedPayload,
  StreakMilestonePayload,
} from './IScoreManager';

export type {
  IDifficultyConfig,
  ILevelConfig,
  IDifficultySpeedMap,
  MathSkillType,
  DifficultySetting,
  ProblemComplexity,
} from './IDifficultyConfig';

export type { IMathEngine } from './IMathEngine';
