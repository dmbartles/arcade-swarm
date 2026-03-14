import { describe, it, expect } from 'vitest';
import { generateSquareRoot } from '../src/generators/squareRootGenerator';
import type { GeneratorParams } from '../src/types';

const ALL_PERFECT_SQUARES = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144];

describe('squareRootGenerator', () => {
  it('P is always a perfect square from the allowed set', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'perfect-square-root', gradeLevel: 5, difficultyLevel: 2 };
      const result = generateSquareRoot(params);
      // Parse "√P"
      const match = result.question.match(/^√(\d+)$/);
      expect(match).not.toBeNull();
      const p = parseInt(match![1], 10);
      expect(ALL_PERFECT_SQUARES).toContain(p);
    }
  });

  it('correctAnswer equals Math.sqrt(P)', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'perfect-square-root', gradeLevel: 5, difficultyLevel: 2 };
      const result = generateSquareRoot(params);
      const match = result.question.match(/^√(\d+)$/);
      const p = parseInt(match![1], 10);
      expect(result.correctAnswer).toBe(Math.sqrt(p));
    }
  });

  it('diff 1: P ∈ {4,9,16,25}', () => {
    const diff1Squares = [4, 9, 16, 25];
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'perfect-square-root', gradeLevel: 5, difficultyLevel: 1 };
      const result = generateSquareRoot(params);
      const match = result.question.match(/^√(\d+)$/);
      const p = parseInt(match![1], 10);
      expect(diff1Squares).toContain(p);
    }
  });

  it('diff 3: P ∈ {81,100,121,144}', () => {
    const diff3Squares = [81, 100, 121, 144];
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'perfect-square-root', gradeLevel: 5, difficultyLevel: 3 };
      const result = generateSquareRoot(params);
      const match = result.question.match(/^√(\d+)$/);
      const p = parseInt(match![1], 10);
      expect(diff3Squares).toContain(p);
    }
  });

  it('distractors are adjacent integer square roots, all ≥ 1 and ≤ 12', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'perfect-square-root', gradeLevel: 5, difficultyLevel: 2 };
      const result = generateSquareRoot(params);
      for (const d of result.distractors) {
        expect(typeof d).toBe('number');
        expect(d).toBeGreaterThanOrEqual(1);
        expect(d).toBeLessThanOrEqual(12);
      }
    }
  });

  it('always 3 unique distractors, none equal correctAnswer', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'perfect-square-root', gradeLevel: 5, difficultyLevel: 2 };
      const result = generateSquareRoot(params);
      expect(result.distractors).toHaveLength(3);
      const unique = new Set(result.distractors.map(String));
      expect(unique.size).toBe(3);
      expect(result.distractors.map(String)).not.toContain(String(result.correctAnswer));
    }
  });
});
