/**
 * Addition problem generators for all addition skill types.
 *
 * Handles: single-digit-addition, two-digit-addition-no-regroup,
 * two-digit-addition-regroup, three-digit-addition, four-digit-addition.
 *
 * @see docs/curriculum-maps/missile-command-math.md
 */

import type { GeneratorParams, MathProblem } from '../types';
import { randInt, ensureDistractors } from '../utils';

/**
 * Generate an addition problem, routing to the correct sub-generator
 * based on skillType.
 */
export function generateAddition(params: GeneratorParams): MathProblem {
  switch (params.skillType) {
    case 'single-digit-addition':
      return genSingleDigitAdd(params);
    case 'two-digit-addition-no-regroup':
      return genTwoDigitAddNoRegroup(params);
    case 'two-digit-addition-regroup':
      return genTwoDigitAddRegroup(params);
    case 'three-digit-addition':
      return genThreeDigitAdd(params);
    case 'four-digit-addition':
      return genFourDigitAdd(params);
    default:
      throw new Error(`additionGenerator: unknown skillType "${params.skillType}"`);
  }
}

/**
 * Single-digit addition: A + B = ?, A∈[1,9], B∈[1,9].
 * diff 1: A+B ≤ 10; diff 2+: A+B ≤ 18.
 * Distractor: near-miss (±1 sum).
 */
function genSingleDigitAdd(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;
  const maxSum = difficultyLevel <= 1 ? 10 : 18;

  let a: number, b: number;
  do {
    a = randInt(1, 9);
    b = randInt(1, 9);
  } while (a + b > maxSum);

  const correctAnswer = a + b;
  const candidates = [
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
    correctAnswer - 2,
  ].filter(v => v > 0);

  return {
    question: `${a} + ${b}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}

/**
 * Two-digit addition without regrouping: ones digits sum ≤ 9.
 * diff 1: tens∈[1,4]; diff 2+: tens∈[1,8].
 * Distractor: swap tens/ones digit of answer.
 */
function genTwoDigitAddNoRegroup(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;
  const maxTens = difficultyLevel <= 1 ? 4 : 8;

  let a: number, b: number;
  do {
    const tensA = randInt(1, maxTens);
    const onesA = randInt(0, 9);
    a = tensA * 10 + onesA;

    const tensB = randInt(1, maxTens);
    const onesB = randInt(0, 9);
    b = tensB * 10 + onesB;
  } while ((a % 10) + (b % 10) > 9 || a + b > 99);

  const correctAnswer = a + b;
  const ansStr = String(correctAnswer);
  // Swap tens/ones digits of answer
  const swapped = ansStr.length === 2
    ? parseInt(ansStr[1] + ansStr[0], 10)
    : correctAnswer + 10;

  const candidates = [
    swapped,
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 10,
  ].filter(v => v > 0);

  return {
    question: `${a} + ${b}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}

/**
 * Two-digit addition with regrouping: ones digits sum ≥ 10.
 * diff 1: tens∈[1,4]; diff 2: tens∈[1,7]; diff 3+: tens∈[1,9].
 * Distractor: omit-carry error (answer − 10).
 */
function genTwoDigitAddRegroup(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;
  const maxTens = difficultyLevel <= 1 ? 4 : difficultyLevel <= 2 ? 7 : 9;

  let a: number, b: number;
  do {
    const tensA = randInt(1, maxTens);
    const onesA = randInt(1, 9);
    a = tensA * 10 + onesA;

    const tensB = randInt(1, maxTens);
    const onesB = randInt(1, 9);
    b = tensB * 10 + onesB;
  } while ((a % 10) + (b % 10) < 10);

  const correctAnswer = a + b;
  const omitCarry = correctAnswer - 10;

  const candidates = [
    omitCarry,
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 10,
  ].filter(v => v > 0);

  return {
    question: `${a} + ${b}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}

/**
 * Three-digit addition: both∈[100,699].
 * diff 1: no double-regroup; diff 2: single regroup; diff 3+: double regroup.
 * Distractor: omit-carry (answer − 100 or answer − 10).
 */
function genThreeDigitAdd(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;

  let a: number, b: number;

  if (difficultyLevel <= 1) {
    // No regrouping: ones sum < 10, tens sum < 10
    do {
      a = randInt(100, 499);
      b = randInt(100, 499);
    } while (
      (a % 10) + (b % 10) >= 10 ||
      (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) >= 10
    );
  } else if (difficultyLevel <= 2) {
    // Single regroup: ones sum ≥ 10, tens sum < 10
    do {
      a = randInt(100, 499);
      b = randInt(100, 499);
    } while (
      (a % 10) + (b % 10) < 10 ||
      (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) >= 10
    );
  } else {
    // Double regroup: ones sum ≥ 10 AND tens sum ≥ 10
    do {
      a = randInt(100, 499);
      b = randInt(100, 499);
    } while (
      (a % 10) + (b % 10) < 10 ||
      (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) < 10
    );
  }

  const correctAnswer = a + b;
  const candidates = [
    correctAnswer - 100,
    correctAnswer - 10,
    correctAnswer + 10,
    correctAnswer + 100,
  ].filter(v => v > 0);

  return {
    question: `${a} + ${b}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}

/**
 * Four-digit addition: both∈[1000,4999].
 * diff 1: no double-regroup; diff 2: single regroup; diff 3+: double regroup.
 * Distractor: omit-carry (answer − 1000 or answer − 100).
 */
function genFourDigitAdd(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;

  let a: number, b: number;

  if (difficultyLevel <= 1) {
    // No regrouping
    do {
      a = randInt(1000, 4999);
      b = randInt(1000, 4999);
    } while (
      (a % 10) + (b % 10) >= 10 ||
      (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) >= 10
    );
  } else if (difficultyLevel <= 2) {
    // Single regroup: ones sum ≥ 10
    do {
      a = randInt(1000, 4999);
      b = randInt(1000, 4999);
    } while ((a % 10) + (b % 10) < 10);
  } else {
    // Double regroup: ones ≥ 10 AND tens ≥ 10
    do {
      a = randInt(1000, 4999);
      b = randInt(1000, 4999);
    } while (
      (a % 10) + (b % 10) < 10 ||
      (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) < 10
    );
  }

  const correctAnswer = a + b;
  const candidates = [
    correctAnswer - 1000,
    correctAnswer - 100,
    correctAnswer + 100,
    correctAnswer + 1000,
  ].filter(v => v > 0);

  return {
    question: `${a} + ${b}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}
