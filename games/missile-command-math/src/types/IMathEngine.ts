/**
 * IMathEngine — Contract for the math problem generation and validation system.
 *
 * Wraps `@arcade-swarm/math-engine` and exposes it to the game via Phaser
 * event bus events (`PROBLEM_GENERATED`, `ANSWER_VALIDATED`).
 *
 * All math problems in the game come from this interface — never from
 * hardcoded strings or static arrays.
 *
 * @see docs/gdds/missile-command-math.md §8 (Curriculum Alignment)
 */

import type { IMathProblem } from './IMathProblem';

export interface IMathEngine {
  /**
   * Generate a single math problem for the given grade level and skill type.
   *
   * @param gradeLevel - Target grade level (2–5).
   * @param skillType  - The math skill to test (e.g. "addition", "division", "fractions").
   * @returns A fully formed math problem with question, correct answer, and distractors.
   */
  generateProblem(gradeLevel: number, skillType: string): IMathProblem;

  /**
   * Generate a complete wave problem set.
   *
   * Pre-generates all problems for a wave, ensuring the answer queue
   * contains exactly the answers needed and the wave is 100% solvable.
   *
   * @param gradeLevel  - Target grade level (2–5).
   * @param skillTypes  - Array of active skill types for the current level.
   * @param count       - Number of problems to generate for the wave.
   * @returns Array of math problems for the entire wave.
   */
  generateWaveProblems(
    gradeLevel: number,
    skillTypes: string[],
    count: number,
  ): IMathProblem[];

  /**
   * Validate a player's answer against a problem's correct answer.
   *
   * @param problem - The math problem being answered.
   * @param answer  - The player's submitted answer.
   * @returns `true` if the answer matches the problem's `correctAnswer`.
   */
  validateAnswer(problem: IMathProblem, answer: number | string): boolean;
}
