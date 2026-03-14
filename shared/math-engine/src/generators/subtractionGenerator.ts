/**
 * Subtraction problem generators for all subtraction skill types.
 *
 * Handles: single-digit-subtraction, two-digit-subtraction,
 * three-digit-subtraction, four-digit-subtraction.
 *
 * @see docs/curriculum-maps/missile-command-math.md
 */

import type { GeneratorParams, MathProblem } from '../types';
import { randInt, ensureDistractors } from '../utils';

/**
 * Generate a subtraction problem, routing to the correct sub-generator
 * based on skillType.
 */
export function generateSubtraction(params: GeneratorParams): MathProblem {
  switch (params.skillType) {
    case 'single-digit-subtraction':
      return genSingleDigitSub(params);
    case 'two-digit-subtraction':
      return genTwoDigitSub(params);
    case 'three-digit-subtraction':
      return genThreeDigitSub(params);
    case 'four-digit-subtraction':
      return genFourDigitSub(params);
    default:
      throw new Error(`subtractionGenerator: unknown skillType "${params.skillType}"`);
  }
}

/**
 * Single-digit subtraction: A∈[6,18], B∈[1,9], A≥B.
 * diff 1: A ≤ 10; diff 2+: A ≤ 18.
 * Distractor: answer ± 1.
 */
function genSingleDigitSub(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;
  const maxMinuend = difficultyLevel <= 1 ? 10 : 18;

  const a = randInt(6, maxMinuend);
  const b = randInt(1, Math.min(9, a));
  const correctAnswer = a - b;

  const candidates = [
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
    correctAnswer - 2,
  ].filter(v => v >= 0);

  return {
    question: `${a} - ${b}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}

/**
 * Two-digit subtraction: AB∈[20,99], CD∈[10,89], AB > CD.
 * diff 1: no zeros in minuend; diff 2: zero in ones possible;
 * diff 3+: regrouping across zero.
 * Distractor: borrow-error (answer + 10 or − 10).
 */
function genTwoDigitSub(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;

  let a: number, b: number;

  if (difficultyLevel <= 1) {
    // No zeros in minuend
    do {
      a = randInt(20, 99);
      b = randInt(10, 89);
    } while (a <= b || a % 10 === 0);
  } else if (difficultyLevel <= 2) {
    // Zero in ones is possible
    do {
      a = randInt(20, 99);
      b = randInt(10, 89);
    } while (a <= b);
  } else {
    // Regrouping across zero — minuend has zero in ones
    do {
      a = randInt(20, 99);
      b = randInt(10, 89);
    } while (a <= b || a % 10 !== 0);
  }

  const correctAnswer = a - b;
  const candidates = [
    correctAnswer + 10,
    correctAnswer - 10,
    correctAnswer + 1,
    correctAnswer - 1,
  ].filter(v => v >= 0);

  return {
    question: `${a} - ${b}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}

/**
 * Three-digit subtraction: ABC∈[200,999], DEF < ABC.
 * diff 1: no zero in minuend; diff 2: zero in ones;
 * diff 3+: zero in tens and ones.
 * Distractor: borrow-error (answer + 100).
 */
function genThreeDigitSub(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;

  let a: number, b: number;

  if (difficultyLevel <= 1) {
    // No zero in minuend
    do {
      a = randInt(200, 999);
      b = randInt(100, a - 1);
    } while (a % 10 === 0 || Math.floor(a / 10) % 10 === 0);
  } else if (difficultyLevel <= 2) {
    // Zero in ones
    do {
      a = randInt(200, 999);
    } while (a % 10 !== 0 || Math.floor(a / 10) % 10 === 0);
    b = randInt(100, a - 1);
  } else {
    // Zero in tens and ones
    do {
      a = randInt(200, 999);
    } while (a % 100 !== 0);
    b = randInt(100, a - 1);
  }

  const correctAnswer = a - b;
  const candidates = [
    correctAnswer + 100,
    correctAnswer - 100,
    correctAnswer + 10,
    correctAnswer - 10,
  ].filter(v => v >= 0);

  return {
    question: `${a} - ${b}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}

/**
 * Four-digit subtraction: ABCD∈[2000,9999], EFGH < ABCD.
 * diff 1: no zeros; diff 2: zeros in ones;
 * diff 3+: zeros in tens/ones.
 * Distractor: borrow-error (answer + 1000).
 */
function genFourDigitSub(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;

  let a: number, b: number;

  if (difficultyLevel <= 1) {
    // No zeros in minuend
    do {
      a = randInt(2000, 9999);
    } while (
      a % 10 === 0 ||
      Math.floor(a / 10) % 10 === 0 ||
      Math.floor(a / 100) % 10 === 0
    );
    b = randInt(1000, a - 1);
  } else if (difficultyLevel <= 2) {
    // Zeros in ones
    do {
      a = randInt(2000, 9999);
    } while (a % 10 !== 0);
    b = randInt(1000, a - 1);
  } else {
    // Zeros in tens and ones
    do {
      a = randInt(2000, 9999);
    } while (a % 100 !== 0);
    b = randInt(1000, a - 1);
  }

  const correctAnswer = a - b;
  const candidates = [
    correctAnswer + 1000,
    correctAnswer - 1000,
    correctAnswer + 100,
    correctAnswer - 100,
  ].filter(v => v >= 0);

  return {
    question: `${a} - ${b}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}
