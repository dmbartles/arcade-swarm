/**
 * Utility functions for math problem generation.
 * Pure functions with zero game-engine dependencies.
 */

/**
 * Generate a random integer in [min, max] (inclusive).
 * @param min - Minimum value (inclusive).
 * @param max - Maximum value (inclusive).
 * @returns Random integer.
 */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random element from an array.
 * @param arr - Non-empty array.
 * @returns A randomly selected element.
 */
export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Ensure exactly 3 unique distractors that don't equal the correct answer.
 * Starts with the provided candidates and fills/adjusts as needed.
 *
 * @param correctAnswer - The correct answer (number or string).
 * @param candidates - Initial distractor candidates (may contain duplicates or the correct answer).
 * @param isNumeric - Whether the answer domain is numeric (affects fallback generation).
 * @returns Exactly 3 unique distractors.
 */
export function ensureDistractors(
  correctAnswer: number | string,
  candidates: Array<number | string>,
  isNumeric: boolean = true,
): Array<number | string> {
  const result: Array<number | string> = [];
  const seen = new Set<string>();
  const correctStr = String(correctAnswer);
  seen.add(correctStr);

  for (const c of candidates) {
    const cStr = String(c);
    if (!seen.has(cStr) && (typeof c !== 'number' || c > 0)) {
      seen.add(cStr);
      result.push(c);
    }
    if (result.length >= 3) break;
  }

  // Fill remaining slots if needed
  if (isNumeric) {
    const correctNum = typeof correctAnswer === 'number' ? correctAnswer : parseInt(String(correctAnswer), 10);
    let offset = 1;
    while (result.length < 3) {
      const candidate = correctNum + offset;
      const candidateStr = String(candidate);
      if (candidate > 0 && !seen.has(candidateStr)) {
        seen.add(candidateStr);
        result.push(candidate);
      }
      // Alternate positive and negative offsets
      if (offset > 0) {
        offset = -offset;
      } else {
        offset = -offset + 1;
      }
      // Safety: prevent infinite loop
      if (Math.abs(offset) > 100) break;
    }
  }

  return result.slice(0, 3);
}

/**
 * Fisher-Yates shuffle (in-place).
 * @param arr - Array to shuffle.
 * @returns The same array, shuffled.
 */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
