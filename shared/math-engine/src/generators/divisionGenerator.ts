/**
 * Division problem generators.
 *
 * Handles: division-basic, division-with-remainder.
 *
 * @see docs/curriculum-maps/missile-command-math.md
 */

import type { GeneratorParams, MathProblem } from '../types';
import { randInt, ensureDistractors } from '../utils';

/**
 * Generate a division problem, routing by skillType.
 */
export function generateDivision(params: GeneratorParams): MathProblem {
  switch (params.skillType) {
    case 'division-basic':
      return genDivisionBasic(params);
    case 'division-with-remainder':
      return genDivisionWithRemainder(params);
    default:
      throw new Error(`divisionGenerator: unknown skillType "${params.skillType}"`);
  }
}

/**
 * Basic division: A = B×Q, B∈[2,10], Q∈[2,10].
 * diff 1: B∈[2,5],Q∈[2,5]; diff 2: B∈[2,9],Q∈[2,9]; diff 3+: B∈[2,10],Q∈[2,10].
 * Distractor: adjacent-quotient (Q+1, Q-1, Q+2).
 * correctAnswer is integer Q.
 */
function genDivisionBasic(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;

  let maxB: number, maxQ: number;
  if (difficultyLevel <= 1) {
    maxB = 5;
    maxQ = 5;
  } else if (difficultyLevel <= 2) {
    maxB = 9;
    maxQ = 9;
  } else {
    maxB = 10;
    maxQ = 10;
  }

  const b = randInt(2, maxB);
  const q = randInt(2, maxQ);
  const a = b * q;
  const correctAnswer = q;

  const candidates = [
    q + 1,
    q - 1,
    q + 2,
    q - 2,
  ].filter(v => v > 0);

  return {
    question: `${a} ÷ ${b}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}

/**
 * Division with remainder: A∈[13,99], B∈[2,9].
 * diff 1: A∈[13,40]; diff 2: A∈[13,69]; diff 3+: A∈[13,99].
 * correctAnswer: string "Q R r" e.g. "7 R1".
 * Distractors: wrong remainder (r±1) or wrong quotient (Q±1).
 */
function genDivisionWithRemainder(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;

  let maxA: number;
  if (difficultyLevel <= 1) {
    maxA = 40;
  } else if (difficultyLevel <= 2) {
    maxA = 69;
  } else {
    maxA = 99;
  }

  let a: number, b: number, q: number, r: number;
  do {
    a = randInt(13, maxA);
    b = randInt(2, 9);
    q = Math.floor(a / b);
    r = a % b;
  } while (r === 0 || q < 1); // Ensure there IS a remainder

  const correctAnswer = `${q} R${r}`;

  // Generate string distractors with wrong remainder or wrong quotient
  const candidates: string[] = [];

  if (r + 1 < b) {
    candidates.push(`${q} R${r + 1}`);
  }
  if (r - 1 >= 0) {
    candidates.push(`${q} R${r - 1}`);
  }
  if (q + 1 > 0) {
    candidates.push(`${q + 1} R${r}`);
  }
  if (q - 1 > 0) {
    candidates.push(`${q - 1} R${r}`);
  }
  // Extra fallbacks
  candidates.push(`${q + 2} R${r}`);
  if (r + 2 < b) {
    candidates.push(`${q} R${r + 2}`);
  }

  return {
    question: `${a} ÷ ${b}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates, false),
    skillType,
    gradeLevel,
  };
}
