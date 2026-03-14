/**
 * Multiplication problem generators.
 *
 * Handles: multiplication-partial, multiplication-full.
 *
 * @see docs/curriculum-maps/missile-command-math.md
 */

import type { GeneratorParams, MathProblem } from '../types';
import { randInt, pickRandom, ensureDistractors } from '../utils';

/**
 * Generate a multiplication problem, routing by skillType.
 */
export function generateMultiplication(params: GeneratorParams): MathProblem {
  switch (params.skillType) {
    case 'multiplication-partial':
      return genMultiplicationPartial(params);
    case 'multiplication-full':
      return genMultiplicationFull(params);
    default:
      throw new Error(`multiplicationGenerator: unknown skillType "${params.skillType}"`);
  }
}

/**
 * Partial multiplication: A∈{2,5,10}, B∈[1,10].
 * diff 1: A∈{2,5} only; diff 2: A∈{2,5,10}; diff 3+: A∈{2,5,10}, B∈[6,10].
 * Distractor: adjacent-multiple (answer ± A).
 */
function genMultiplicationPartial(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;

  let factorPool: number[];
  let minB: number;
  const maxB = 10;

  if (difficultyLevel <= 1) {
    factorPool = [2, 5];
    minB = 1;
  } else if (difficultyLevel <= 2) {
    factorPool = [2, 5, 10];
    minB = 1;
  } else {
    factorPool = [2, 5, 10];
    minB = 6;
  }

  const a = pickRandom(factorPool);
  const b = randInt(minB, maxB);
  const correctAnswer = a * b;

  const candidates = [
    correctAnswer + a,
    correctAnswer - a,
    correctAnswer + a * 2,
    correctAnswer - a * 2,
  ].filter(v => v > 0);

  return {
    question: `${a} × ${b}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}

/**
 * Full multiplication: A∈[2,12], B∈[2,12].
 * diff 1: A,B∈[2,6]; diff 2: A,B∈[2,9]; diff 3+: A,B∈[2,12].
 * Distractor: near-miss (answer ± B or answer ± A).
 */
function genMultiplicationFull(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;

  let maxFactor: number;
  if (difficultyLevel <= 1) {
    maxFactor = 6;
  } else if (difficultyLevel <= 2) {
    maxFactor = 9;
  } else {
    maxFactor = 12;
  }

  const a = randInt(2, maxFactor);
  const b = randInt(2, maxFactor);
  const correctAnswer = a * b;

  const candidates = [
    correctAnswer + b,
    correctAnswer - b,
    correctAnswer + a,
    correctAnswer - a,
  ].filter(v => v > 0);

  return {
    question: `${a} × ${b}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}
