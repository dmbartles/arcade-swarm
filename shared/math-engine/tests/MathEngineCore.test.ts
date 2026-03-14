import { describe, it, expect } from 'vitest';
import { MathEngineCore } from '../src/MathEngineCore';

const ALL_SKILL_TYPES = [
  'single-digit-addition',
  'two-digit-addition-no-regroup',
  'two-digit-addition-regroup',
  'three-digit-addition',
  'four-digit-addition',
  'single-digit-subtraction',
  'two-digit-subtraction',
  'three-digit-subtraction',
  'four-digit-subtraction',
  'multiplication-partial',
  'multiplication-full',
  'division-basic',
  'division-with-remainder',
  'unit-fraction-of-whole',
  'fraction-of-whole',
  'multi-step-expression',
  'perfect-square-root',
  'mixed-operations',
];

describe('MathEngineCore', () => {
  const engine = new MathEngineCore();

  it('generateProblem: returns valid IMathProblem shape for all 18 skillTypes', () => {
    for (const skillType of ALL_SKILL_TYPES) {
      const result = engine.generateProblem(4, skillType, 2);
      expect(result).toHaveProperty('question');
      expect(result).toHaveProperty('correctAnswer');
      expect(result).toHaveProperty('distractors');
      expect(typeof result.question).toBe('string');
      expect(result.question.length).toBeGreaterThan(0);
      expect(result.distractors).toHaveLength(3);
      expect(result.skillType).toBe(skillType);
    }
  });

  it('generateProblem: throws for unknown skillType', () => {
    expect(() => engine.generateProblem(3, 'nonexistent-skill', 1)).toThrow(
      'Unknown skillType: nonexistent-skill',
    );
  });

  it('generateWaveProblems: returns count problems', () => {
    const result = engine.generateWaveProblems(3, ['single-digit-addition'], 10, 1);
    expect(result.problems).toHaveLength(10);
  });

  it('generateWaveProblems: answerQueue contains exactly the correct answers', () => {
    const result = engine.generateWaveProblems(
      3,
      ['single-digit-addition', 'single-digit-subtraction'],
      15,
      1,
    );
    const expectedAnswers = result.problems.map(p => p.correctAnswer);
    // answerQueue should contain the same elements (possibly in different order)
    const sortedExpected = [...expectedAnswers].sort();
    const sortedQueue = [...result.answerQueue].sort();
    expect(sortedQueue).toEqual(sortedExpected);
  });

  it('generateWaveProblems: answerQueue length equals problems length', () => {
    const result = engine.generateWaveProblems(4, ['multiplication-full'], 8, 2);
    expect(result.answerQueue).toHaveLength(result.problems.length);
  });

  it('generateWaveProblems: answerQueue is not in original problem order (shuffled — probabilistic check over 100 runs)', () => {
    let inOrderCount = 0;
    for (let run = 0; run < 100; run++) {
      const result = engine.generateWaveProblems(3, ['single-digit-addition'], 10, 1);
      const original = result.problems.map(p => p.correctAnswer);
      const isInOrder = result.answerQueue.every((a, i) => String(a) === String(original[i]));
      if (isInOrder) inOrderCount++;
    }
    // Over 100 runs with 10 items, the chance of ALL being in order is astronomically low
    // Allow up to 5 coincidental matches
    expect(inOrderCount).toBeLessThan(5);
  });

  it('validateAnswer: returns true for correct numeric answer', () => {
    const problem = engine.generateProblem(3, 'single-digit-addition', 1);
    expect(engine.validateAnswer(problem, problem.correctAnswer)).toBe(true);
  });

  it('validateAnswer: returns true for correct string answer "7 R1"', () => {
    const problem = {
      question: '15 ÷ 2',
      correctAnswer: '7 R1',
      distractors: ['7 R2', '8 R1', '6 R1'],
      skillType: 'division-with-remainder',
      gradeLevel: 4,
    };
    expect(engine.validateAnswer(problem, '7 R1')).toBe(true);
  });

  it('validateAnswer: case-insensitive and space-normalised for string answers', () => {
    const problem = {
      question: '15 ÷ 2',
      correctAnswer: '7 R1',
      distractors: ['7 R2', '8 R1', '6 R1'],
      skillType: 'division-with-remainder',
      gradeLevel: 4,
    };
    expect(engine.validateAnswer(problem, '7 r1')).toBe(true);
    expect(engine.validateAnswer(problem, '7  R 1')).toBe(true);
    expect(engine.validateAnswer(problem, '7R1')).toBe(true);
  });

  it('validateAnswer: returns false for wrong answer', () => {
    const problem = engine.generateProblem(3, 'single-digit-addition', 1);
    // Use a distractor as the wrong answer
    expect(engine.validateAnswer(problem, problem.distractors[0])).toBe(false);
  });

  it('validateAnswer: returns false for type mismatch', () => {
    const problem = engine.generateProblem(3, 'single-digit-addition', 1);
    expect(engine.validateAnswer(problem, 'not a number')).toBe(false);
  });

  // Fuzz test: 1000 iterations per skillType
  for (const skillType of ALL_SKILL_TYPES) {
    it(`generateProblem(${skillType}) generates valid problems 1000 times without error`, () => {
      for (let i = 0; i < 1000; i++) {
        const gradeLevel = skillType.includes('square') || skillType === 'mixed-operations' ? 5 : 4;
        const result = engine.generateProblem(gradeLevel, skillType, 2);
        expect(result.question).toBeTruthy();
        expect(result.distractors).toHaveLength(3);
        // Ensure all distractors are unique and not the correct answer
        const unique = new Set(result.distractors.map(String));
        expect(unique.size).toBe(3);
        expect(unique.has(String(result.correctAnswer))).toBe(false);
      }
    });
  }
});
