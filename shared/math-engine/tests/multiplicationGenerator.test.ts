import { describe, it, expect } from 'vitest';
import { generateMultiplication } from '../src/generators/multiplicationGenerator';
import type { GeneratorParams } from '../src/types';

describe('multiplicationGenerator', () => {
  it('multiplication-partial diff 1: A ∈ {2,5} only', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'multiplication-partial', gradeLevel: 3, difficultyLevel: 1 };
      const result = generateMultiplication(params);
      const parts = result.question.split(' × ');
      const a = parseInt(parts[0], 10);
      expect([2, 5]).toContain(a);
    }
  });

  it('multiplication-partial diff 2: A ∈ {2,5,10}', () => {
    const aValues = new Set<number>();
    for (let i = 0; i < 200; i++) {
      const params: GeneratorParams = { skillType: 'multiplication-partial', gradeLevel: 3, difficultyLevel: 2 };
      const result = generateMultiplication(params);
      const parts = result.question.split(' × ');
      const a = parseInt(parts[0], 10);
      expect([2, 5, 10]).toContain(a);
      aValues.add(a);
    }
    // Over 200 runs, all three values should appear
    expect(aValues.size).toBe(3);
  });

  it('multiplication-full diff 3: A,B ∈ [2,12]', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'multiplication-full', gradeLevel: 4, difficultyLevel: 3 };
      const result = generateMultiplication(params);
      const parts = result.question.split(' × ');
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      expect(a).toBeGreaterThanOrEqual(2);
      expect(a).toBeLessThanOrEqual(12);
      expect(b).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(12);
    }
  });

  it('correctAnswer equals A × B', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'multiplication-full', gradeLevel: 4, difficultyLevel: 2 };
      const result = generateMultiplication(params);
      const parts = result.question.split(' × ');
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      expect(a * b).toBe(result.correctAnswer);
    }
  });

  it('always 3 unique positive integer distractors', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'multiplication-full', gradeLevel: 4, difficultyLevel: 2 };
      const result = generateMultiplication(params);
      expect(result.distractors).toHaveLength(3);
      const unique = new Set(result.distractors.map(String));
      expect(unique.size).toBe(3);
      for (const d of result.distractors) {
        expect(typeof d).toBe('number');
        expect(d).toBeGreaterThan(0);
      }
      expect(result.distractors.map(String)).not.toContain(String(result.correctAnswer));
    }
  });
});
