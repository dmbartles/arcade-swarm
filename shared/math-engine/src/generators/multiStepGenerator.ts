/**
 * Multi-step expression problem generator.
 *
 * Handles: multi-step-expression.
 * Format: (A × B) ± C
 *
 * @see docs/curriculum-maps/missile-command-math.md
 */

import type { GeneratorParams, MathProblem } from '../types';
import { randInt, pickRandom, ensureDistractors } from '../utils';

/**
 * Generate a multi-step expression problem.
 * (A × B) ± C, with constraints per difficulty level.
 */
export function generateMultiStep(params: GeneratorParams): MathProblem {
  if (params.skillType !== 'multi-step-expression') {
    throw new Error(`multiStepGenerator: unknown skillType "${params.skillType}"`);
  }

  const { difficultyLevel, skillType, gradeLevel } = params;

  let maxC: number;
  let maxProduct: number;
  if (difficultyLevel <= 1) {
    maxC = 9;
    maxProduct = 36;
  } else if (difficultyLevel <= 2) {
    maxC = 20;
    maxProduct = 72;
  } else {
    maxC = 20;
    maxProduct = 108;
  }

  let a: number, b: number, product: number;
  do {
    a = randInt(2, 9);
    b = randInt(2, 9);
    product = a * b;
  } while (product > maxProduct);

  const c = randInt(1, maxC);
  const op = pickRandom(['+', '-'] as const);

  let correctAnswer: number;
  if (op === '+') {
    correctAnswer = product + c;
  } else {
    correctAnswer = product - c;
    // Ensure non-negative result
    if (correctAnswer < 0) {
      // Switch to addition
      return generateMultiStep({ ...params, difficultyLevel }); // Retry
    }
  }

  // Distractor: order-of-operations swap (compute without respecting parens)
  let orderSwap: number;
  if (op === '+') {
    orderSwap = a * (b + c); // A × (B + C) instead of (A × B) + C
  } else {
    orderSwap = a * (b - c); // A × (B - C) instead of (A × B) - C
  }

  const candidates = [
    orderSwap,
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
  ].filter(v => v > 0);

  return {
    question: `(${a} × ${b}) ${op} ${c}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}
