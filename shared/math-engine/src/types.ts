/**
 * Types for the @arcade-swarm/math-engine shared library.
 *
 * These types mirror the game's IMathProblem interface but are declared
 * independently to maintain zero game-engine dependencies.
 */

/** A generated math problem with question, answer, and distractors. */
export interface MathProblem {
  /** The math expression, e.g. "7 + 8" or "√81". */
  question: string;
  /** The correct answer — numeric or string (e.g. "7 R1" for division with remainder). */
  correctAnswer: number | string;
  /** Exactly 3 plausible wrong answers. */
  distractors: Array<number | string>;
  /** The curriculum-map skillType that produced this problem. */
  skillType?: string;
  /** The grade level this problem targets (3–5). */
  gradeLevel?: number;
}

/**
 * Input parameters for all generator functions.
 * difficultyLevel: 1–5 per curriculum map §Difficulty Parameters.
 */
export interface GeneratorParams {
  /** One of the 18 skillType strings from the curriculum map. */
  skillType: string;
  /** Target grade level (3–5). */
  gradeLevel: number;
  /** Difficulty level 1–5 controlling operand ranges. */
  difficultyLevel: number;
}

/** A generator function signature — all generators implement this. */
export type ProblemGenerator = (params: GeneratorParams) => MathProblem;
