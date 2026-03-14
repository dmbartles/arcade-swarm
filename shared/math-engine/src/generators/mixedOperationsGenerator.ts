/**
 * Mixed operations problem generator.
 *
 * Handles: mixed-operations.
 * Format: (√P) OP (A × B)
 *
 * @see docs/curriculum-maps/missile-command-math.md
 */

import type { GeneratorParams, MathProblem } from '../types';
import { randInt, pickRandom, ensureDistractors } from '../utils';
import { PERFECT_SQUARES } from './squareRootGenerator';

/** Perfect squares per difficulty level for mixed operations. */
const MIXED_POOLS: Record<number, ReadonlyArray<{ square: number; root: number }>> = {
  1: PERFECT_SQUARES.filter(p => [4, 9, 16, 25].includes(p.square)),
  2: PERFECT_SQUARES.filter(p => p.square <= 64),
  3: PERFECT_SQUARES.filter(p => [81, 100, 121, 144].includes(p.square)),
  4: PERFECT_SQUARES.filter(p => [81, 100, 121, 144].includes(p.square)),
  5: PERFECT_SQUARES.filter(p => [81, 100, 121, 144].includes(p.square)),
};

/**
 * Generate a mixed operations problem.
 * (√P) OP (A × B), ensuring subtraction result ≥ 0.
 */
export function generateMixedOperations(params: GeneratorParams): MathProblem {
  if (params.skillType !== 'mixed-operations') {
    throw new Error(`mixedOperationsGenerator: unknown skillType "${params.skillType}"`);
  }

  const { difficultyLevel, skillType, gradeLevel } = params;

  const pool = MIXED_POOLS[Math.min(difficultyLevel, 5)] || MIXED_POOLS[3];
  const chosen = pickRandom(pool);
  const sqrtVal = chosen.root;

  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const product = a * b;

  // Determine operator
  let op: '+' | '-';
  if (difficultyLevel <= 1) {
    op = '+'; // diff 1: only addition
  } else {
    op = pickRandom(['+', '-'] as const);
  }

  // Ensure subtraction result ≥ 0; if not, switch to addition
  if (op === '-' && sqrtVal < product) {
    op = '+';
  }

  let correctAnswer: number;
  if (op === '+') {
    correctAnswer = sqrtVal + product;
  } else {
    correctAnswer = sqrtVal - product;
  }

  // Component-error distractors:
  // 1. Wrong square root (adjacent root ±1)
  const wrongSqrt1 = (sqrtVal + 1) + (op === '+' ? product : -product);
  const wrongSqrt2 = (sqrtVal - 1) + (op === '+' ? product : -product);
  // 2. Wrong product (A × (B±1))
  const wrongProduct1 = sqrtVal + (op === '+' ? (a * (b + 1)) : -(a * (b + 1)));
  const wrongProduct2 = sqrtVal + (op === '+' ? (a * (b - 1)) : -(a * (b - 1)));

  const candidates = [
    wrongSqrt1,
    wrongSqrt2,
    wrongProduct1,
    wrongProduct2,
    correctAnswer + 1,
    correctAnswer - 1,
  ].filter(v => v >= 0);

  return {
    question: `(√${chosen.square}) ${op} (${a} × ${b})`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}
