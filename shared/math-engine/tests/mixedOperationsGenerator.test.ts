import { describe, it, expect } from 'vitest';
import { generateMixedOperations } from '../src/generators/mixedOperationsGenerator';
import type { GeneratorParams } from '../src/types';

const ALL_PERFECT_SQUARES = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144];

describe('mixedOperationsGenerator', () => {
  it('correctAnswer equals √P ± (A × B)', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'mixed-operations', gradeLevel: 5, difficultyLevel: 2 };
      const result = generateMixedOperations(params);
      // Parse "(√P) + (A × B)" or "(√P) - (A × B)"
      const match = result.question.match(/^\(√(\d+)\) ([+-]) \((\d+) × (\d+)\)$/);
      expect(match).not.toBeNull();
      const p = parseInt(match![1], 10);
      expect(ALL_PERFECT_SQUARES).toContain(p);
      const sqrtP = Math.sqrt(p);
      const op = match![2];
      const a = parseInt(match![3], 10);
      const b = parseInt(match![4], 10);

      const expected = op === '+' ? sqrtP + (a * b) : sqrtP - (a * b);
      expect(result.correctAnswer).toBe(expected);
    }
  });

  it('subtraction result is always ≥ 0', () => {
    for (let i = 0; i < 200; i++) {
      const params: GeneratorParams = { skillType: 'mixed-operations', gradeLevel: 5, difficultyLevel: 3 };
      const result = generateMixedOperations(params);
      expect(result.correctAnswer).toBeGreaterThanOrEqual(0);
    }
  });

  it('question contains √ symbol and parentheses', () => {
    for (let i = 0; i < 20; i++) {
      const params: GeneratorParams = { skillType: 'mixed-operations', gradeLevel: 5, difficultyLevel: 2 };
      const result = generateMixedOperations(params);
      expect(result.question).toContain('√');
      expect(result.question).toContain('(');
      expect(result.question).toContain(')');
    }
  });

  it('always 3 unique distractors', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'mixed-operations', gradeLevel: 5, difficultyLevel: 2 };
      const result = generateMixedOperations(params);
      expect(result.distractors).toHaveLength(3);
      const unique = new Set(result.distractors.map(String));
      expect(unique.size).toBe(3);
      expect(result.distractors.map(String)).not.toContain(String(result.correctAnswer));
    }
  });
});
