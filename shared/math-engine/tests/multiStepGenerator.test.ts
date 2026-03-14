import { describe, it, expect } from 'vitest';
import { generateMultiStep } from '../src/generators/multiStepGenerator';
import type { GeneratorParams } from '../src/types';

describe('multiStepGenerator', () => {
  it('correctAnswer equals (A × B) ± C', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'multi-step-expression', gradeLevel: 4, difficultyLevel: 2 };
      const result = generateMultiStep(params);
      // Parse "(A × B) + C" or "(A × B) - C"
      const match = result.question.match(/^\((\d+) × (\d+)\) ([+-]) (\d+)$/);
      expect(match).not.toBeNull();
      const a = parseInt(match![1], 10);
      const b = parseInt(match![2], 10);
      const op = match![3];
      const c = parseInt(match![4], 10);

      const expected = op === '+' ? (a * b) + c : (a * b) - c;
      expect(result.correctAnswer).toBe(expected);
      expect(result.correctAnswer).toBeGreaterThanOrEqual(0);
    }
  });

  it('diff 1: product ≤ 36, C ∈ [1,9]', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'multi-step-expression', gradeLevel: 4, difficultyLevel: 1 };
      const result = generateMultiStep(params);
      const match = result.question.match(/^\((\d+) × (\d+)\) ([+-]) (\d+)$/);
      expect(match).not.toBeNull();
      const a = parseInt(match![1], 10);
      const b = parseInt(match![2], 10);
      const c = parseInt(match![4], 10);
      expect(a * b).toBeLessThanOrEqual(36);
      expect(c).toBeGreaterThanOrEqual(1);
      expect(c).toBeLessThanOrEqual(9);
    }
  });

  it('diff 3: product ≤ 108, C ∈ [1,20]', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'multi-step-expression', gradeLevel: 4, difficultyLevel: 3 };
      const result = generateMultiStep(params);
      const match = result.question.match(/^\((\d+) × (\d+)\) ([+-]) (\d+)$/);
      expect(match).not.toBeNull();
      const a = parseInt(match![1], 10);
      const b = parseInt(match![2], 10);
      const c = parseInt(match![4], 10);
      expect(a * b).toBeLessThanOrEqual(108);
      expect(c).toBeGreaterThanOrEqual(1);
      expect(c).toBeLessThanOrEqual(20);
    }
  });

  it('question contains parentheses', () => {
    const params: GeneratorParams = { skillType: 'multi-step-expression', gradeLevel: 4, difficultyLevel: 2 };
    const result = generateMultiStep(params);
    expect(result.question).toContain('(');
    expect(result.question).toContain(')');
  });

  it('always 3 unique distractors', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'multi-step-expression', gradeLevel: 4, difficultyLevel: 2 };
      const result = generateMultiStep(params);
      expect(result.distractors).toHaveLength(3);
      const unique = new Set(result.distractors.map(String));
      expect(unique.size).toBe(3);
      expect(result.distractors.map(String)).not.toContain(String(result.correctAnswer));
    }
  });
});
