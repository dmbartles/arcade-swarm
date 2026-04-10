/**
 * Unit tests for MathEngine (Phaser wrapper around @arcade-swarm/math-engine).
 *
 * @see games/missile-command-math/src/systems/MathEngine.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEvents } from '../../src/types/GameEvents';

// ── Mock Phaser ──────────────────────────────────────────────────────────────

class MockEmitter {
  private handlers: Map<string, Array<(...args: unknown[]) => void>> = new Map();
  readonly emitted: Array<{ event: string; payload: unknown }> = [];

  emit(event: string, payload?: unknown): void {
    this.emitted.push({ event, payload });
    (this.handlers.get(event) ?? []).forEach(h => h(payload));
  }

  on(event: string, handler: (...args: unknown[]) => void): this {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
    return this;
  }

  off(_event: string, _handler: (...args: unknown[]) => void): this {
    return this;
  }
}

vi.mock('phaser', () => ({
  default: {
    Scene: class Scene {},
    Events: { EventEmitter: class EventEmitter {} },
  },
  Scene: class Scene {},
  Events: { EventEmitter: class EventEmitter {} },
}));

let MathEngine: typeof import('../../src/systems/MathEngine').MathEngine;

beforeEach(async () => {
  const mod = await import('../../src/systems/MathEngine');
  MathEngine = mod.MathEngine;
});

describe('MathEngine (Phaser wrapper)', () => {
  let emitter: MockEmitter;
  let engine: InstanceType<typeof MathEngine>;

  beforeEach(() => {
    emitter = new MockEmitter();
    engine = new MathEngine(emitter as unknown);
  });

  it('generateProblem returns a valid IMathProblem', () => {
    const problem = engine.generateProblem(2, 'single-digit-addition');
    expect(problem).toBeDefined();
    expect(typeof problem.question).toBe('string');
    expect(problem.correctAnswer).toBeDefined();
    expect(Array.isArray(problem.distractors)).toBe(true);
    expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
  });

  it('generateProblem does not emit PROBLEM_GENERATED', () => {
    engine.generateProblem(2, 'single-digit-addition');
    const emitted = emitter.emitted.find(
      (e: { event: string }) => e.event === GameEvents.PROBLEM_GENERATED,
    );
    expect(emitted).toBeUndefined();
  });

  it('generateWaveProblems returns array of requested length', () => {
    const result = engine.generateWaveProblems(2, ['single-digit-addition'], 8);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(8);
  });

  it('generateWaveProblems emits PROBLEM_GENERATED', () => {
    engine.generateWaveProblems(2, ['single-digit-addition'], 5);
    const emitted = emitter.emitted.find(
      (e: { event: string }) => e.event === GameEvents.PROBLEM_GENERATED,
    );
    expect(emitted).toBeDefined();
  });

  it('PROBLEM_GENERATED payload has problems and answerQueue', () => {
    engine.generateWaveProblems(2, ['single-digit-addition'], 5);
    const emitted = emitter.emitted.find(
      (e: { event: string }) => e.event === GameEvents.PROBLEM_GENERATED,
    );
    expect(emitted).toBeDefined();
    const payload = emitted!.payload as { problems: unknown[]; answerQueue: unknown[] };
    expect(Array.isArray(payload.problems)).toBe(true);
    expect(Array.isArray(payload.answerQueue)).toBe(true);
  });

  it('answerQueue contains all correct answers', () => {
    engine.generateWaveProblems(2, ['single-digit-addition'], 5);
    const emitted = emitter.emitted.find(
      (e: { event: string }) => e.event === GameEvents.PROBLEM_GENERATED,
    );
    const payload = emitted!.payload as {
      problems: Array<{ correctAnswer: number | string }>;
      answerQueue: Array<number | string>;
    };
    for (const problem of payload.problems) {
      expect(payload.answerQueue).toContain(problem.correctAnswer);
    }
  });

  it('validateAnswer returns true for correct numeric answer', () => {
    const problem = engine.generateProblem(2, 'single-digit-addition');
    const result = engine.validateAnswer(problem, problem.correctAnswer);
    expect(result).toBe(true);
  });

  it('validateAnswer returns false for wrong answer', () => {
    const problem = engine.generateProblem(2, 'single-digit-addition');
    // Use a clearly wrong answer
    const wrongAnswer = typeof problem.correctAnswer === 'number'
      ? problem.correctAnswer + 999
      : 'WRONG_ANSWER';
    const result = engine.validateAnswer(problem, wrongAnswer);
    expect(result).toBe(false);
  });

  it('validateAnswer emits ANSWER_VALIDATED', () => {
    const problem = engine.generateProblem(2, 'single-digit-addition');
    engine.validateAnswer(problem, problem.correctAnswer);
    const emitted = emitter.emitted.find(
      (e: { event: string }) => e.event === GameEvents.ANSWER_VALIDATED,
    );
    expect(emitted).toBeDefined();
  });

  it('ANSWER_VALIDATED payload has correct: true on match', () => {
    const problem = engine.generateProblem(2, 'single-digit-addition');
    engine.validateAnswer(problem, problem.correctAnswer);
    const emitted = emitter.emitted.find(
      (e: { event: string }) => e.event === GameEvents.ANSWER_VALIDATED,
    );
    const payload = emitted!.payload as { correct: boolean };
    expect(payload.correct).toBe(true);
  });

  it('ANSWER_VALIDATED payload has correct: false on mismatch', () => {
    const problem = engine.generateProblem(2, 'single-digit-addition');
    const wrongAnswer = typeof problem.correctAnswer === 'number'
      ? problem.correctAnswer + 999
      : 'WRONG_ANSWER';
    engine.validateAnswer(problem, wrongAnswer);
    const emitted = emitter.emitted.find(
      (e: { event: string }) => e.event === GameEvents.ANSWER_VALIDATED,
    );
    const payload = emitted!.payload as { correct: boolean };
    expect(payload.correct).toBe(false);
  });

  it('generateWaveProblems works for all grade levels 2–5', () => {
    const skillsByGrade: Record<number, string> = {
      2: 'single-digit-addition',
      3: 'multiplication-partial',
      4: 'three-digit-addition',
      5: 'perfect-square-root',
    };

    for (const grade of [2, 3, 4, 5]) {
      expect(() => {
        engine.generateWaveProblems(grade, [skillsByGrade[grade]], 3);
      }).not.toThrow();
    }
  });

  it('generateProblem throws for unknown skillType', () => {
    expect(() => {
      engine.generateProblem(3, 'unknown-type');
    }).toThrow();
  });
});
