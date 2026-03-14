/**
 * Fraction problem generators.
 *
 * Handles: unit-fraction-of-whole, fraction-of-whole.
 *
 * @see docs/curriculum-maps/missile-command-math.md
 */

import type { GeneratorParams, MathProblem } from '../types';
import { randInt, pickRandom, ensureDistractors } from '../utils';

/**
 * Generate a fraction problem, routing by skillType.
 */
export function generateFraction(params: GeneratorParams): MathProblem {
  switch (params.skillType) {
    case 'unit-fraction-of-whole':
      return genUnitFractionOfWhole(params);
    case 'fraction-of-whole':
      return genFractionOfWhole(params);
    default:
      throw new Error(`fractionGenerator: unknown skillType "${params.skillType}"`);
  }
}

/**
 * Unit fraction of whole: 1/D of W = ?, W = D×K.
 * diff 1: D∈{2,4},K∈[2,6]; diff 2: D∈{2,3,4,5},K∈[2,9]; diff 3+: D∈{2,3,4,5,8},K∈[2,12].
 * Distractor: adjacent unit fraction result: W/(D±1), or W/D ± 1 if not integer.
 */
function genUnitFractionOfWhole(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;

  let dPool: number[];
  let maxK: number;
  if (difficultyLevel <= 1) {
    dPool = [2, 4];
    maxK = 6;
  } else if (difficultyLevel <= 2) {
    dPool = [2, 3, 4, 5];
    maxK = 9;
  } else {
    dPool = [2, 3, 4, 5, 8];
    maxK = 12;
  }

  const d = pickRandom(dPool);
  const k = randInt(2, maxK);
  const w = d * k;
  const correctAnswer = k; // W / D = K

  // Distractor: apply adjacent unit fraction
  const candidates: number[] = [];

  // W / (D+1) — may not be integer, use floor
  if (d + 1 > 0) {
    const adj1 = Math.floor(w / (d + 1));
    if (adj1 > 0) candidates.push(adj1);
  }
  // W / (D-1) — may not be integer, use floor
  if (d - 1 > 0) {
    const adj2 = Math.floor(w / (d - 1));
    if (adj2 > 0) candidates.push(adj2);
  }
  // Fallback: W/D ± 1
  candidates.push(correctAnswer + 1);
  if (correctAnswer - 1 > 0) candidates.push(correctAnswer - 1);
  candidates.push(correctAnswer + 2);

  return {
    question: `1/${d} of ${w}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}

/** Fraction definitions for fraction-of-whole generator. */
interface FractionDef {
  n: number;
  d: number;
  display: string;
}

/** Available fractions per difficulty level. */
const FRACTION_POOLS: Record<number, FractionDef[]> = {
  1: [
    { n: 1, d: 2, display: '1/2' },
    { n: 1, d: 4, display: '1/4' },
  ],
  2: [
    { n: 3, d: 4, display: '3/4' },
    { n: 2, d: 3, display: '2/3' },
  ],
  3: [
    { n: 3, d: 5, display: '3/5' },
    { n: 3, d: 4, display: '3/4' },
    { n: 2, d: 3, display: '2/3' },
  ],
};

/**
 * Fraction of whole: N/D × W = ?, W = D×K.
 * diff 1: N/D∈{1/2,1/4}; diff 2: N/D∈{3/4,2/3}; diff 3+: N/D∈{3/5,3/4,2/3},K∈[4,10].
 * Distractor: unit-fraction-only answer (W/D, omitting numerator multiply).
 */
function genFractionOfWhole(params: GeneratorParams): MathProblem {
  const { difficultyLevel, skillType, gradeLevel } = params;

  const pool = FRACTION_POOLS[Math.min(difficultyLevel, 3)] || FRACTION_POOLS[3];
  const frac = pickRandom(pool);

  const minK = difficultyLevel >= 3 ? 4 : 2;
  const maxK = 10;

  let k: number;
  let w: number;
  let result: number;

  // Ensure (N × W) / D is an integer — resample K up to 20 times
  let attempts = 0;
  do {
    k = randInt(minK, maxK);
    w = frac.d * k;
    result = (frac.n * w) / frac.d;
    attempts++;
  } while (result !== Math.floor(result) && attempts < 20);

  // Fallback: use K = D to guarantee integer
  if (result !== Math.floor(result)) {
    k = frac.d;
    w = frac.d * k;
    result = (frac.n * w) / frac.d;
  }

  const correctAnswer = result;
  const unitFractionOnly = w / frac.d; // Distractor: omit numerator multiply

  const candidates = [
    unitFractionOnly,
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + frac.n,
  ].filter(v => v > 0);

  return {
    question: `${frac.display} × ${w}`,
    correctAnswer,
    distractors: ensureDistractors(correctAnswer, candidates),
    skillType,
    gradeLevel,
  };
}
