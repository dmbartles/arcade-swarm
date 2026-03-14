/**
 * Square root problem generator.
 *
 * Handles: perfect-square-root.
 *
 * @see docs/curriculum-maps/missile-command-math.md
 */

import type { GeneratorParams, MathProblem } from '../types';
import { pickRandom, ensureDistractors } from '../utils';

/** All allowed perfect squares mapped to their roots. */
export const PERFECT_SQUARES: ReadonlyArray<{ square: number; root: number }> = [
  { square: 4, root: 2 },
  { square: 9, root: 3 },
  { square: 16, root: 4 },
  { square: 25, root: 5 },
  { square: 36, root: 6 },
  { square: 49, root: 7 },
  { square: 64, root: 8 },
  { square: 81, root: 9 },
  { square: 100, root: 10 },
  { square: 121, root: 11 },
  { square: 144, root: 12 },
];

/** Perfect squares per difficulty level. */
const DIFFICULTY_POOLS: Record<number, ReadonlyArray<{ square: number; root: number }>> = {
  1: PERFECT_SQUARES.filter(p => [4, 9, 16, 25].includes(p.square)),
  2: PERFECT_SQUARES.filter(p => [36, 49, 64].includes(p.square)),
  3: PERFECT_SQUARES.filter(p => [81, 100, 121, 144].includes(p.square)),
};

/**
 * Generate a perfect square root problem.
 * √P = ?, P from the allowed set per difficulty level.
 */
export function generateSquareRoot(params: GeneratorParams): MathProblem {
  if (params.skillType !== 'perfect-square-root') {
    throw new Error(`squareRootGenerator: unknown skillType "${params.skillType}"`);
  }

  const { difficultyLevel, skillType, gradeLevel } = params;

  const pool = DIFFICULTY_POOLS[Math.min(difficultyLevel, 3)] || DIFFICULTY_POOLS[3];
  const chosen = pickRandom(pool);
  const correctAnswer = chosen.root;

  // Distractors: adjacent integer square roots (±1, ±2), clamped to [1,12]
  const candidates = [
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
    correctAnswer - 2,
  ].filter(v => v >= 1 && v <= 12);

  return {
    question: `√${chosen.square}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}
