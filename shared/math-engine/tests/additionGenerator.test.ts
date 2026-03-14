import { describe, it, expect } from 'vitest';
import { generateAddition } from '../src/generators/additionGenerator';
import type { GeneratorParams } from '../src/types';

describe('additionGenerator', () => {
  it('single-digit-addition diff 1: sum ≤ 10', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'single-digit-addition', gradeLevel: 3, difficultyLevel: 1 };
      const result = generateAddition(params);
      expect(result.correctAnswer).toBeLessThanOrEqual(10);
      expect(typeof result.correctAnswer).toBe('number');

      // Parse operands from question
      const parts = result.question.split(' + ');
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(9);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(9);
      expect(a + b).toBe(result.correctAnswer);
    }
  });

  it('single-digit-addition diff 2: sum ≤ 18', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'single-digit-addition', gradeLevel: 3, difficultyLevel: 2 };
      const result = generateAddition(params);
      expect(result.correctAnswer).toBeLessThanOrEqual(18);
      expect(typeof result.correctAnswer).toBe('number');
    }
  });

  it('single-digit-addition: always 3 unique distractors, none equal correctAnswer', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'single-digit-addition', gradeLevel: 3, difficultyLevel: 1 };
      const result = generateAddition(params);
      expect(result.distractors).toHaveLength(3);
      const unique = new Set(result.distractors.map(String));
      expect(unique.size).toBe(3);
      expect(result.distractors).not.toContain(result.correctAnswer);
    }
  });

  it('two-digit-addition-no-regroup: ones digits sum ≤ 9', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'two-digit-addition-no-regroup', gradeLevel: 3, difficultyLevel: 1 };
      const result = generateAddition(params);
      const parts = result.question.split(' + ');
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      expect((a % 10) + (b % 10)).toBeLessThanOrEqual(9);
      expect(a + b).toBe(result.correctAnswer);
    }
  });

  it('two-digit-addition-regroup diff 1: ones digits sum ≥ 10, tens ∈ [1,4]', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'two-digit-addition-regroup', gradeLevel: 3, difficultyLevel: 1 };
      const result = generateAddition(params);
      const parts = result.question.split(' + ');
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      expect((a % 10) + (b % 10)).toBeGreaterThanOrEqual(10);
      expect(Math.floor(a / 10)).toBeGreaterThanOrEqual(1);
      expect(Math.floor(a / 10)).toBeLessThanOrEqual(4);
      expect(Math.floor(b / 10)).toBeGreaterThanOrEqual(1);
      expect(Math.floor(b / 10)).toBeLessThanOrEqual(4);
    }
  });

  it('three-digit-addition: correctAnswer equals sum of two operands', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'three-digit-addition', gradeLevel: 4, difficultyLevel: 2 };
      const result = generateAddition(params);
      const parts = result.question.split(' + ');
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      expect(a).toBeGreaterThanOrEqual(100);
      expect(b).toBeGreaterThanOrEqual(100);
      expect(a + b).toBe(result.correctAnswer);
      expect(result.distractors).toHaveLength(3);
    }
  });

  it('four-digit-addition: both operands ∈ [1000,4999]', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'four-digit-addition', gradeLevel: 4, difficultyLevel: 1 };
      const result = generateAddition(params);
      const parts = result.question.split(' + ');
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      expect(a).toBeGreaterThanOrEqual(1000);
      expect(a).toBeLessThanOrEqual(4999);
      expect(b).toBeGreaterThanOrEqual(1000);
      expect(b).toBeLessThanOrEqual(4999);
      expect(a + b).toBe(result.correctAnswer);
    }
  });

  it('unknown skillType throws', () => {
    const params: GeneratorParams = { skillType: 'unknown-addition', gradeLevel: 3, difficultyLevel: 1 };
    expect(() => generateAddition(params)).toThrow();
  });
});
