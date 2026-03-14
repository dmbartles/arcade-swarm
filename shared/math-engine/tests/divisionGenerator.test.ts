import { describe, it, expect } from 'vitest';
import { generateDivision } from '../src/generators/divisionGenerator';
import type { GeneratorParams } from '../src/types';

describe('divisionGenerator', () => {
  it('division-basic: A = B × Q exactly (no remainder)', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'division-basic', gradeLevel: 4, difficultyLevel: 2 };
      const result = generateDivision(params);
      const parts = result.question.split(' ÷ ');
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      expect(a % b).toBe(0);
      expect(a / b).toBe(result.correctAnswer);
    }
  });

  it('division-basic: correctAnswer is an integer', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'division-basic', gradeLevel: 4, difficultyLevel: 1 };
      const result = generateDivision(params);
      expect(typeof result.correctAnswer).toBe('number');
      expect(Number.isInteger(result.correctAnswer)).toBe(true);
    }
  });

  it('division-with-remainder: correctAnswer string format "Q R r"', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'division-with-remainder', gradeLevel: 4, difficultyLevel: 2 };
      const result = generateDivision(params);
      expect(typeof result.correctAnswer).toBe('string');
      // Format: "Q Rr" e.g. "7 R1"
      const match = (result.correctAnswer as string).match(/^(\d+) R(\d+)$/);
      expect(match).not.toBeNull();
    }
  });

  it('division-with-remainder: Q and r satisfy A = B×Q + r', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'division-with-remainder', gradeLevel: 4, difficultyLevel: 3 };
      const result = generateDivision(params);
      const questionParts = result.question.split(' ÷ ');
      const a = parseInt(questionParts[0], 10);
      const b = parseInt(questionParts[1], 10);

      const answerMatch = (result.correctAnswer as string).match(/^(\d+) R(\d+)$/);
      expect(answerMatch).not.toBeNull();
      const q = parseInt(answerMatch![1], 10);
      const r = parseInt(answerMatch![2], 10);

      expect(a).toBe(b * q + r);
      expect(r).toBeGreaterThan(0);
      expect(r).toBeLessThan(b);
    }
  });

  it('division-with-remainder distractors: wrong remainder or wrong quotient format', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'division-with-remainder', gradeLevel: 4, difficultyLevel: 2 };
      const result = generateDivision(params);
      expect(result.distractors).toHaveLength(3);
      for (const d of result.distractors) {
        expect(typeof d).toBe('string');
        // Each distractor should match "Q Rr" format
        expect(d).toMatch(/^\d+ R\d+$/);
      }
    }
  });

  it('always 3 unique distractors', () => {
    for (let i = 0; i < 100; i++) {
      const params: GeneratorParams = { skillType: 'division-basic', gradeLevel: 4, difficultyLevel: 2 };
      const result = generateDivision(params);
      expect(result.distractors).toHaveLength(3);
      const unique = new Set(result.distractors.map(String));
      expect(unique.size).toBe(3);
      expect(result.distractors.map(String)).not.toContain(String(result.correctAnswer));
    }
  });
});
