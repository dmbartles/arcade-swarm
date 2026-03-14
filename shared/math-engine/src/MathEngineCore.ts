/**
 * MathEngineCore — Pure TypeScript core library class.
 *
 * Zero game-engine dependencies. All generators are called from here.
 * This is the public entry point for procedural math problem generation.
 *
 * @see docs/curriculum-maps/missile-command-math.md
 */

import type { MathProblem, GeneratorParams, ProblemGenerator } from './types';
import { generateAddition } from './generators/additionGenerator';
import { generateSubtraction } from './generators/subtractionGenerator';
import { generateMultiplication } from './generators/multiplicationGenerator';
import { generateDivision } from './generators/divisionGenerator';
import { generateFraction } from './generators/fractionGenerator';
import { generateMultiStep } from './generators/multiStepGenerator';
import { generateSquareRoot } from './generators/squareRootGenerator';
import { generateMixedOperations } from './generators/mixedOperationsGenerator';
import { shuffle } from './utils';

/** Map of all 18 skill types to their generator functions. */
const GENERATORS: Record<string, ProblemGenerator> = {
  'single-digit-addition': generateAddition,
  'two-digit-addition-no-regroup': generateAddition,
  'two-digit-addition-regroup': generateAddition,
  'three-digit-addition': generateAddition,
  'four-digit-addition': generateAddition,
  'single-digit-subtraction': generateSubtraction,
  'two-digit-subtraction': generateSubtraction,
  'three-digit-subtraction': generateSubtraction,
  'four-digit-subtraction': generateSubtraction,
  'multiplication-partial': generateMultiplication,
  'multiplication-full': generateMultiplication,
  'division-basic': generateDivision,
  'division-with-remainder': generateDivision,
  'unit-fraction-of-whole': generateFraction,
  'fraction-of-whole': generateFraction,
  'multi-step-expression': generateMultiStep,
  'perfect-square-root': generateSquareRoot,
  'mixed-operations': generateMixedOperations,
};

export class MathEngineCore {
  /**
   * Generate a single math problem.
   *
   * @param gradeLevel - Grade level (3–5); influences operand ranges.
   * @param skillType  - One of the 18 skillType strings from the curriculum map.
   * @param difficultyLevel - 1–5; maps to operand constraints per curriculum map.
   * @returns A MathProblem with question, correctAnswer, distractors, skillType, gradeLevel.
   * @throws Error if skillType is unknown.
   */
  generateProblem(gradeLevel: number, skillType: string, difficultyLevel: number): MathProblem {
    const generator = GENERATORS[skillType];
    if (!generator) {
      throw new Error(`Unknown skillType: ${skillType}`);
    }

    const params: GeneratorParams = {
      skillType,
      gradeLevel,
      difficultyLevel,
    };

    return generator(params);
  }

  /**
   * Generate a complete wave problem set.
   * Ensures all correct answers are present in the returned answerQueue.
   * The answerQueue is shuffled but guaranteed to contain exactly the answers needed.
   *
   * @param gradeLevel    - Target grade level (3–5).
   * @param skillTypes    - Array of active skill types for this wave.
   * @param count         - Number of problems to generate.
   * @param difficultyLevel - 1–5 difficulty level.
   * @returns Object with problems array and shuffled answerQueue array.
   */
  generateWaveProblems(
    gradeLevel: number,
    skillTypes: string[],
    count: number,
    difficultyLevel: number,
  ): { problems: MathProblem[]; answerQueue: Array<number | string> } {
    if (skillTypes.length === 0) {
      throw new Error('skillTypes array must not be empty');
    }

    const problems: MathProblem[] = [];
    for (let i = 0; i < count; i++) {
      const skillType = skillTypes[Math.floor(Math.random() * skillTypes.length)];
      const problem = this.generateProblem(gradeLevel, skillType, difficultyLevel);
      problems.push(problem);
    }

    // Collect all correct answers into the answer queue
    const answerQueue: Array<number | string> = problems.map(p => p.correctAnswer);

    // Shuffle using Fisher-Yates
    shuffle(answerQueue);

    return { problems, answerQueue };
  }

  /**
   * Validate a player answer against a problem.
   * String answers (division-with-remainder): case-insensitive, space-normalised comparison.
   * Numeric answers: strict equality.
   *
   * @param problem - The math problem to validate against.
   * @param answer  - The player's submitted answer.
   * @returns true if the answer matches the problem's correctAnswer.
   */
  validateAnswer(problem: MathProblem, answer: number | string): boolean {
    const correct = problem.correctAnswer;

    // Both numeric: strict equality
    if (typeof correct === 'number' && typeof answer === 'number') {
      return correct === answer;
    }

    // Both strings: normalise and compare
    if (typeof correct === 'string' && typeof answer === 'string') {
      const normalise = (s: string): string =>
        s.toLowerCase().replace(/\s+/g, '').trim();
      return normalise(correct) === normalise(answer);
    }

    // Type mismatch
    return false;
  }
}
