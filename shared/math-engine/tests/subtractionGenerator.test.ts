import { describe, it, expect } from 'vitest';
import { generateSubtraction } from '../src/generators/subtractionGenerator';
import type { GeneratorParams } from '../src/types';

describe('subtractionGenerator', () => {
  it('single-digit-subtraction: result ≥ 0, A ≥ B', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'single-digit-subtraction', gradeLevel: 3, difficultyLevel: 1 };
      const result = generateSubtraction(params);
      const parts = result.question.split(' - ');
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      expect(a).toBeGreaterThanOrEqual(b);
      expect(result.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(a - b).toBe(result.correctAnswer);
    }
  });

  it('single-digit-subtraction diff 1: minuend ≤ 10', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'single-digit-subtraction', gradeLevel: 3, difficultyLevel: 1 };
      const result = generateSubtraction(params);
      const a = parseInt(result.question.split(' - ')[0], 10);
      expect(a).toBeLessThanOrEqual(10);
    }
  });

  it('single-digit-subtraction diff 2: minuend ≤ 18', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'single-digit-subtraction', gradeLevel: 3, difficultyLevel: 2 };
      const result = generateSubtraction(params);
      const a = parseInt(result.question.split(' - ')[0], 10);
      expect(a).toBeLessThanOrEqual(18);
    }
  });

  it('two-digit-subtraction: result ≥ 0', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'two-digit-subtraction', gradeLevel: 3, difficultyLevel: 2 };
      const result = generateSubtraction(params);
      expect(result.correctAnswer).toBeGreaterThanOrEqual(0);
      const parts = result.question.split(' - ');
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      expect(a - b).toBe(result.correctAnswer);
    }
  });

  it('three-digit-subtraction: result ≥ 0', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'three-digit-subtraction', gradeLevel: 4, difficultyLevel: 1 };
      const result = generateSubtraction(params);
      expect(result.correctAnswer).toBeGreaterThanOrEqual(0);
      const parts = result.question.split(' - ');
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      expect(a).toBeGreaterThanOrEqual(200);
      expect(a).toBeLessThanOrEqual(999);
      expect(a - b).toBe(result.correctAnswer);
    }
  });

  it('four-digit-subtraction: result ≥ 0', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'four-digit-subtraction', gradeLevel: 4, difficultyLevel: 2 };
      const result = generateSubtraction(params);
      expect(result.correctAnswer).toBeGreaterThanOrEqual(0);
      const parts = result.question.split(' - ');
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      expect(a).toBeGreaterThanOrEqual(2000);
      expect(a).toBeLessThanOrEqual(9999);
      expect(a - b).toBe(result.correctAnswer);
    }
  });

  it('always 3 unique distractors, none equal correctAnswer', () => {
    const skillTypes = [
      'single-digit-subtraction',
      'two-digit-subtraction',
      'three-digit-subtraction',
      'four-digit-subtraction',
    ];
    for (const skillType of skillTypes) {
      for (let i = 0; i < 50; i++) {
        const params: GeneratorParams = { skillType, gradeLevel: 4, difficultyLevel: 2 };
        const result = generateSubtraction(params);
        expect(result.distractors).toHaveLength(3);
        const unique = new Set(result.distractors.map(String));
        expect(unique.size).toBe(3);
        expect(result.distractors.map(String)).not.toContain(String(result.correctAnswer));
      }
    }
  });
});
