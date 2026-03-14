/**
 * IMathProblem — The math problem contract shared between the game and
 * the `@arcade-swarm/math-engine` library.
 *
 * Every math problem displayed on a missile, bomber, or MIRV conforms to this
 * interface. Problems are pre-generated per wave and are always 100% solvable.
 *
 * @see docs/gdds/missile-command-math.md §2.2 (Micro Loop), §8 (Curriculum Alignment)
 */

export interface IMathProblem {
  /** The math expression shown on the threat, e.g. "7 + 8" or "√81". */
  question: string;

  /**
   * The correct answer.
   * Numeric for standard problems; string for remainder notation (e.g. "7 R1").
   */
  correctAnswer: number | string;

  /**
   * Plausible wrong answers for distractor generation.
   * Used by the answer queue to include decoys when needed.
   */
  distractors: Array<number | string>;

  /** The CCSS skill type that generated this problem (e.g. "addition", "multiplication"). */
  skillType?: string;

  /** The grade level this problem targets (2–5). */
  gradeLevel?: number;
}
