/**
 * MathEngine — Phaser-side wrapper for @arcade-swarm/math-engine.
 *
 * Implements IMathEngine. Wraps MathEngineCore and emits Phaser event-bus
 * events on problem generation and answer validation.
 *
 * Events emitted:
 *  - GameEvents.PROBLEM_GENERATED  → ProblemGeneratedPayload
 *  - GameEvents.ANSWER_VALIDATED   → AnswerValidatedPayload
 *
 * @see games/missile-command-math/src/types/IMathEngine.ts
 * @see docs/gdds/missile-command-math.md §2 (Game Loop)
 */

import Phaser from 'phaser';
import { MathEngineCore } from '@arcade-swarm/math-engine';
import { GameEvents } from '../types/GameEvents';
import type { IMathEngine } from '../types/IMathEngine';
import type { IMathProblem } from '../types/IMathProblem';
import type {
  ProblemGeneratedPayload,
  AnswerValidatedPayload,
} from '../types/GameEvents';

/**
 * MathEngine wraps MathEngineCore and integrates it with the Phaser event bus.
 *
 * Usage:
 *   const mathEngine = new MathEngine(this.events);
 *   const problems = mathEngine.generateWaveProblems(3, ['single-digit-addition'], 8);
 *   // PROBLEM_GENERATED is emitted automatically with problems + answerQueue
 */
export class MathEngine implements IMathEngine {
  /** The pure-JS core library — zero Phaser dependencies. */
  private readonly core: MathEngineCore;

  /**
   * Phaser scene event emitter used to broadcast math events to other systems.
   * Injected so this class remains testable without a full Phaser scene.
   */
  private readonly emitter: Phaser.Events.EventEmitter;

  /**
   * @param emitter - The Phaser scene's event emitter (`this.events` in a scene).
   */
  constructor(emitter: Phaser.Events.EventEmitter) {
    this.core = new MathEngineCore();
    this.emitter = emitter;
  }

  // ─── IMathEngine ───────────────────────────────────────────────────────────

  /**
   * Generate a single math problem for the given grade level and skill type.
   *
   * Delegates to MathEngineCore. Difficulty is derived from gradeLevel:
   *   grade 2 → 1, grade 3 → 2, grade 4 → 3, grade 5 → 4.
   *
   * Does NOT emit an event — single problem generation is a utility call.
   * Use generateWaveProblems() to emit PROBLEM_GENERATED.
   *
   * @param gradeLevel - Target grade level (2–5).
   * @param skillType  - Kebab-case skill type string from curriculum map.
   * @returns IMathProblem with question, correctAnswer, distractors, skillType, gradeLevel.
   */
  generateProblem(gradeLevel: number, skillType: string): IMathProblem {
    const difficulty = this.resolveDifficulty(gradeLevel);
    const problem = this.core.generateProblem(gradeLevel, skillType, difficulty);

    return {
      question: problem.question,
      correctAnswer: problem.correctAnswer,
      distractors: problem.distractors,
      skillType: problem.skillType ?? skillType,
      gradeLevel: problem.gradeLevel ?? gradeLevel,
    };
  }

  /**
   * Generate a complete wave problem set and emit PROBLEM_GENERATED.
   *
   * Ensures:
   * - Exactly `count` problems generated
   * - Unique correct answers within the wave (for WaveManager routing)
   * - answerQueue is shuffled but contains every problem's correct answer
   *
   * Emits GameEvents.PROBLEM_GENERATED with ProblemGeneratedPayload.
   *
   * @param gradeLevel  - Target grade level (2–5).
   * @param skillTypes  - Array of active skill types for this level.
   * @param count       - Number of problems to generate.
   * @returns Array of IMathProblem for the wave.
   */
  generateWaveProblems(
    gradeLevel: number,
    skillTypes: string[],
    count: number,
  ): IMathProblem[] {
    const difficulty = this.resolveDifficulty(gradeLevel);

    // Retry loop: ensure wave-level answer uniqueness
    const MAX_WAVE_RETRIES = 10;
    let problems: IMathProblem[] = [];

    for (let attempt = 0; attempt < MAX_WAVE_RETRIES; attempt++) {
      const raw = this.core.generateWaveProblems(
        gradeLevel,
        skillTypes,
        count,
        difficulty,
      );

      const mapped: IMathProblem[] = raw.problems.map(p => ({
        question: p.question,
        correctAnswer: p.correctAnswer,
        distractors: p.distractors,
        skillType: p.skillType ?? skillTypes[0],
        gradeLevel: p.gradeLevel ?? gradeLevel,
      }));

      // Validate uniqueness of correct answers (WaveManager routing requirement)
      const answerSet = new Set(mapped.map(p => String(p.correctAnswer)));
      if (answerSet.size === mapped.length) {
        problems = mapped;
        break;
      }

      // On final attempt, accept duplicates rather than looping forever
      if (attempt === MAX_WAVE_RETRIES - 1) {
        problems = mapped;
      }
    }

    // Build shuffled answer queue from all correct answers
    const answerQueue = this.buildAnswerQueue(problems);

    // Emit PROBLEM_GENERATED so GameScene and WaveManager can react
    const payload: ProblemGeneratedPayload = {
      problems,
      answerQueue,
    };
    this.emitter.emit(GameEvents.PROBLEM_GENERATED, payload);

    return problems;
  }

  /**
   * Validate a player's answer against a problem's correct answer.
   *
   * For string answers (division-with-remainder): normalises whitespace before
   * comparing — "7 R 1" and "7R1" both match "7 R 1".
   * For number answers: strict equality.
   *
   * Emits GameEvents.ANSWER_VALIDATED with AnswerValidatedPayload.
   *
   * @param problem - The math problem being answered.
   * @param answer  - The player's submitted answer.
   * @returns `true` if the answer matches.
   */
  validateAnswer(problem: IMathProblem, answer: number | string): boolean {
    // Delegate normalisation logic to the pure core
    const coreProblem = {
      question: problem.question,
      correctAnswer: problem.correctAnswer,
      distractors: problem.distractors,
      skillType: problem.skillType,
      gradeLevel: problem.gradeLevel,
    };

    const correct = this.core.validateAnswer(coreProblem, answer);

    const payload: AnswerValidatedPayload = {
      problem,
      correct,
      attemptedAnswer: answer,
    };
    this.emitter.emit(GameEvents.ANSWER_VALIDATED, payload);

    return correct;
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  /**
   * Map grade level (2–5) to a difficulty integer (1–5).
   * Grade 2 → 1, grade 3 → 2, grade 4 → 3, grade 5 → 4.
   * Difficulty 5 is used internally by generators for max-range operations.
   */
  private resolveDifficulty(gradeLevel: number): number {
    const map: Record<number, number> = {
      2: 1,
      3: 2,
      4: 3,
      5: 4,
    };
    return map[gradeLevel] ?? 3;
  }

  /**
   * Build a Fisher-Yates-shuffled answer queue from a problem set.
   * Contains exactly one entry per problem (the correct answer).
   */
  private buildAnswerQueue(
    problems: IMathProblem[],
  ): Array<number | string> {
    const queue: Array<number | string> = problems.map(p => p.correctAnswer);

    // Fisher-Yates shuffle
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }

    return queue;
  }
}
