/**
 * Unit tests for shared/math-engine/src/utils.ts
 *
 * Covers: randInt, pickRandom, ensureDistractors, shuffle
 *
 * @see shared/math-engine/src/utils.ts
 */

import { describe, it, expect } from 'vitest';
import { randInt, pickRandom, ensureDistractors, shuffle } from '../src/utils';

// ─── randInt ─────────────────────────────────────────────────────────────────

describe('randInt', () => {
  it('returns an integer', () => {
    for (let i = 0; i < 200; i++) {
      const result = randInt(1, 10);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('always returns a value in [min, max] inclusive', () => {
    for (let i = 0; i < 500; i++) {
      const min = 3;
      const max = 9;
      const result = randInt(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    }
  });

  it('returns min when min === max', () => {
    for (let i = 0; i < 50; i++) {
      expect(randInt(7, 7)).toBe(7);
    }
  });

  it('returns 0 when called with (0, 0)', () => {
    expect(randInt(0, 0)).toBe(0);
  });

  it('can return min', () => {
    // Run many iterations and confirm min appears at least once
    const seen = new Set<number>();
    for (let i = 0; i < 5000; i++) {
      seen.add(randInt(1, 3));
    }
    expect(seen.has(1)).toBe(true);
  });

  it('can return max', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 5000; i++) {
      seen.add(randInt(1, 3));
    }
    expect(seen.has(3)).toBe(true);
  });

  it('works with large ranges', () => {
    for (let i = 0; i < 100; i++) {
      const result = randInt(1000, 9999);
      expect(result).toBeGreaterThanOrEqual(1000);
      expect(result).toBeLessThanOrEqual(9999);
    }
  });

  it('works with zero as min', () => {
    for (let i = 0; i < 100; i++) {
      const result = randInt(0, 5);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(5);
    }
  });
});

// ─── pickRandom ───────────────────────────────────────────────────────────────

describe('pickRandom', () => {
  it('returns an element that is in the array', () => {
    const arr = [10, 20, 30, 40, 50];
    for (let i = 0; i < 200; i++) {
      const result = pickRandom(arr);
      expect(arr).toContain(result);
    }
  });

  it('returns the only element when array has length 1', () => {
    for (let i = 0; i < 50; i++) {
      expect(pickRandom([42])).toBe(42);
    }
  });

  it('works with string arrays', () => {
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 100; i++) {
      expect(arr).toContain(pickRandom(arr));
    }
  });

  it('covers all elements eventually (distribution sanity)', () => {
    const arr = [1, 2, 3, 4, 5];
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      seen.add(pickRandom(arr) as number);
    }
    for (const v of arr) {
      expect(seen.has(v)).toBe(true);
    }
  });

  it('works with a two-element array and returns both elements over many calls', () => {
    const arr = [100, 200];
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) {
      seen.add(pickRandom(arr) as number);
    }
    expect(seen.has(100)).toBe(true);
    expect(seen.has(200)).toBe(true);
  });
});

// ─── ensureDistractors ────────────────────────────────────────────────────────
// Signature: ensureDistractors(correctAnswer, candidates, isNumeric?)

describe('ensureDistractors', () => {
  it('always returns exactly 3 distractors', () => {
    for (let i = 0; i < 200; i++) {
      const correct = randInt(5, 15);
      const candidates = [correct + 1, correct - 1];
      const result = ensureDistractors(correct, candidates);
      expect(result).toHaveLength(3);
    }
  });

  it('never includes the correct answer', () => {
    for (let i = 0; i < 500; i++) {
      const correct = randInt(5, 20);
      const result = ensureDistractors(correct, []);
      expect(result.map(String)).not.toContain(String(correct));
    }
  });

  it('all 3 distractors are unique', () => {
    for (let i = 0; i < 200; i++) {
      const correct = randInt(5, 15);
      const result = ensureDistractors(correct, [correct + 1]);
      const unique = new Set(result.map(String));
      expect(unique.size).toBe(3);
    }
  });

  it('preserves valid seed candidates (3 provided)', () => {
    const correct = 10;
    // Provide exactly 3 valid candidates — they should all be preserved
    const candidates = [7, 12, 15];
    const result = ensureDistractors(correct, candidates);
    expect(result).toHaveLength(3);
    for (const c of candidates) {
      expect(result).toContain(c);
    }
  });

  it('filters out the correct answer from candidates', () => {
    const correct = 5;
    // Candidates include the correct answer — it must be removed and replaced
    const candidates = [correct, 3, 8];
    const result = ensureDistractors(correct, candidates);
    expect(result.map(String)).not.toContain(String(correct));
    expect(result).toHaveLength(3);
  });

  it('works when candidates is empty — fills with offset values', () => {
    for (let i = 0; i < 100; i++) {
      const correct = randInt(10, 50);
      const result = ensureDistractors(correct, []);
      expect(result).toHaveLength(3);
      expect(result.map(String)).not.toContain(String(correct));
    }
  });

  it('all numeric distractors are > 0 (positive guard)', () => {
    // The impl filters out c <= 0, so all numeric distractors must be positive
    for (let i = 0; i < 200; i++) {
      const correct = randInt(5, 50);
      const result = ensureDistractors(correct, []);
      for (const d of result) {
        if (typeof d === 'number') {
          expect(d).toBeGreaterThan(0);
        }
      }
    }
  });

  it('works with large correct answer values', () => {
    const correct = 500;
    const result = ensureDistractors(correct, []);
    expect(result).toHaveLength(3);
    expect(result.map(String)).not.toContain(String(correct));
  });

  it('works with string-typed correct answer (division remainder format)', () => {
    const correct = '7 R1';
    const candidates = ['7 R2', '6 R1', '8 R1'];
    const result = ensureDistractors(correct, candidates, false);
    expect(result).toHaveLength(3);
    expect(result.map(String)).not.toContain('7 R1');
  });

  it('handles correct answer of 1 (small boundary) without returning 0 or negatives', () => {
    const correct = 1;
    const result = ensureDistractors(correct, []);
    expect(result).toHaveLength(3);
    expect(result.map(String)).not.toContain('1');
    // All must be positive (> 0)
    for (const d of result) {
      if (typeof d === 'number') {
        expect(d).toBeGreaterThan(0);
      }
    }
  });

  it('deduplicates candidates that repeat the same value', () => {
    const correct = 10;
    // All candidates are the same wrong value — should only use it once
    const candidates = [7, 7, 7, 7];
    const result = ensureDistractors(correct, candidates);
    expect(result).toHaveLength(3);
    const unique = new Set(result.map(String));
    expect(unique.size).toBe(3);
  });
});

// ─── shuffle ────────────────────────────────────────────────────────────────

describe('shuffle', () => {
  it('returns the same array reference (in-place)', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result).toBe(arr);
  });

  it('preserves all original elements', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const arr = [...original];
    shuffle(arr);
    expect(arr.sort((a, b) => a - b)).toEqual(original.sort((a, b) => a - b));
  });

  it('returns the same single-element array unchanged', () => {
    const arr = [42];
    shuffle(arr);
    expect(arr).toEqual([42]);
  });

  it('returns an empty array unchanged', () => {
    const arr: number[] = [];
    shuffle(arr);
    expect(arr).toEqual([]);
  });

  it('actually reorders elements over many calls (not a no-op)', () => {
    // Over 100 shuffles, the array should not always be in the same order
    const original = [1, 2, 3, 4, 5];
    let sameOrderCount = 0;
    for (let i = 0; i < 100; i++) {
      const arr = [...original];
      shuffle(arr);
      if (arr.every((v, idx) => v === original[idx])) {
        sameOrderCount++;
      }
    }
    // Probability of all 100 shuffles being identity is astronomically low
    expect(sameOrderCount).toBeLessThan(10);
  });
});
