import { describe, it, expect } from 'vitest';
import { generateFraction } from '../src/generators/fractionGenerator';
import type { GeneratorParams } from '../src/types';

describe('fractionGenerator', () => {
  it('unit-fraction-of-whole: correctAnswer is a positive integer', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'unit-fraction-of-whole', gradeLevel: 4, difficultyLevel: 2 };
      const result = generateFraction(params);
      expect(typeof result.correctAnswer).toBe('number');
      expect(result.correctAnswer).toBeGreaterThan(0);
      expect(Number.isInteger(result.correctAnswer)).toBe(true);
    }
  });

  it('unit-fraction-of-whole: W is divisible by D', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'unit-fraction-of-whole', gradeLevel: 4, difficultyLevel: 1 };
      const result = generateFraction(params);
      // Parse "1/D of W"
      const match = result.question.match(/^1\/(\d+) of (\d+)$/);
      expect(match).not.toBeNull();
      const d = parseInt(match![1], 10);
      const w = parseInt(match![2], 10);
      expect(w % d).toBe(0);
      expect(w / d).toBe(result.correctAnswer);
    }
  });

  it('fraction-of-whole: correctAnswer is a positive integer', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'fraction-of-whole', gradeLevel: 4, difficultyLevel: 2 };
      const result = generateFraction(params);
      expect(typeof result.correctAnswer).toBe('number');
      expect(result.correctAnswer).toBeGreaterThan(0);
      expect(Number.isInteger(result.correctAnswer)).toBe(true);
    }
  });

  it('fraction-of-whole: (N × W) / D has no remainder', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'fraction-of-whole', gradeLevel: 4, difficultyLevel: 3 };
      const result = generateFraction(params);
      // Parse "N/D × W"
      const match = result.question.match(/^(\d+)\/(\d+) × (\d+)$/);
      expect(match).not.toBeNull();
      const n = parseInt(match![1], 10);
      const d = parseInt(match![2], 10);
      const w = parseInt(match![3], 10);
      expect((n * w) % d).toBe(0);
      expect((n * w) / d).toBe(result.correctAnswer);
    }
  });

  it('always 3 unique distractors, none equal correctAnswer', () => {
    const skillTypes = ['unit-fraction-of-whole', 'fraction-of-whole'];
    for (const skillType of skillTypes) {
      for (let i = 0; i < 50; i++) {
        const params: GeneratorParams = { skillType, gradeLevel: 4, difficultyLevel: 2 };
        const result = generateFraction(params);
        expect(result.distractors).toHaveLength(3);
        const unique = new Set(result.distractors.map(String));
        expect(unique.size).toBe(3);
        expect(result.distractors.map(String)).not.toContain(String(result.correctAnswer));
      }
    }
  });
});
