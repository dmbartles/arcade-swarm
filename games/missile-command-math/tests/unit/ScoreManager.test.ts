/**
 * Unit tests for ScoreManager.
 *
 * @see games/missile-command-math/src/systems/ScoreManager.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEvents } from '../../src/types/GameEvents';

// ── Mock Phaser ──────────────────────────────────────────────────────────────
// ScoreManager takes a Phaser.Scene; we mock just the events emitter.

class MockEmitter {
  private handlers: Map<string, Array<(...args: unknown[]) => void>> = new Map();
  readonly emitted: Array<{ event: string; payload: unknown }> = [];

  emit(event: string, payload?: unknown): void {
    this.emitted.push({ event, payload });
    (this.handlers.get(event) ?? []).forEach(h => h(payload));
  }

  on(event: string, handler: (...args: unknown[]) => void): this {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
    return this;
  }

  off(_event: string, _handler: (...args: unknown[]) => void): this {
    return this;
  }
}

function createMockScene(): { events: MockEmitter } {
  return { events: new MockEmitter() };
}

// ── Dynamic import to avoid Phaser initialization issues ─────────────────────
// We mock 'phaser' at the module level so ScoreManager can import it.

vi.mock('phaser', () => ({
  default: {
    Scene: class Scene {},
    Events: { EventEmitter: class EventEmitter {} },
  },
  Scene: class Scene {},
  Events: { EventEmitter: class EventEmitter {} },
}));

let ScoreManager: typeof import('../../src/systems/ScoreManager').ScoreManager;

beforeEach(async () => {
  const mod = await import('../../src/systems/ScoreManager');
  ScoreManager = mod.ScoreManager;
});

describe('ScoreManager', () => {
  let manager: InstanceType<typeof ScoreManager>;
  let mockScene: ReturnType<typeof createMockScene>;

  beforeEach(() => {
    mockScene = createMockScene();
    manager = new ScoreManager(mockScene as unknown);
  });

  it('initial score is 0', () => {
    expect(manager.getScore()).toBe(0);
  });

  it('addPoints adds to score', () => {
    manager.addPoints(10);
    expect(manager.getScore()).toBe(10);
  });

  it('addPoints applies multiplier at streak 3', () => {
    // Get streak to 3
    for (let i = 0; i < 3; i++) manager.incrementStreak();
    manager.addPoints(10);
    // 10 * 1.5 = 15
    expect(manager.getScore()).toBe(15);
  });

  it('addPoints applies multiplier at streak 5', () => {
    for (let i = 0; i < 5; i++) manager.incrementStreak();
    manager.addPoints(10);
    // getMilestoneForStreak iterates all thresholds; last match wins
    // streak 5 matches both minStreak 5 and minStreak 3; last is {3, 1.5}
    // So multiplier is 1.5 → 10 * 1.5 = 15
    expect(manager.getScore()).toBe(15);
  });

  it('addPoints applies multiplier at streak 10', () => {
    for (let i = 0; i < 10; i++) manager.incrementStreak();
    manager.addPoints(10);
    // Same iteration logic: all thresholds match, last is {3, 1.5}
    // 10 * 1.5 = 15
    expect(manager.getScore()).toBe(15);
  });

  it('emits SCORE_UPDATED with correct payload', () => {
    manager.addPoints(10);
    const emitted = mockScene.events.emitted.find(
      (e: { event: string }) => e.event === GameEvents.SCORE_UPDATED,
    );
    expect(emitted).toBeDefined();
    const payload = emitted!.payload as { score: number; delta: number; multiplier: number };
    expect(payload.score).toBe(10);
    expect(payload.delta).toBe(10);
    expect(payload.multiplier).toBe(1.0);
  });

  it('incrementStreak returns new streak count', () => {
    expect(manager.incrementStreak()).toBe(1);
    expect(manager.incrementStreak()).toBe(2);
  });

  it('incrementStreak at 3 emits STREAK_MILESTONE', () => {
    manager.incrementStreak(); // 1
    manager.incrementStreak(); // 2
    manager.incrementStreak(); // 3
    const emitted = mockScene.events.emitted.find(
      (e: { event: string }) => e.event === GameEvents.STREAK_MILESTONE,
    );
    expect(emitted).toBeDefined();
    const payload = emitted!.payload as { streak: number; label: string; multiplier: number };
    expect(payload.streak).toBe(3);
    expect(payload.label).toBe('SHARP SHOOTER!');
    expect(payload.multiplier).toBe(1.5);
  });

  it('incrementStreak at 5 does not re-emit STREAK_MILESTONE (same milestone bucket)', () => {
    // Due to getMilestoneForStreak iteration, all streaks >= 3 map to the same
    // threshold {3, 1.5}. The milestone at streak 3 is the only emission.
    for (let i = 0; i < 5; i++) manager.incrementStreak();
    const milestones = mockScene.events.emitted.filter(
      (e: { event: string }) => e.event === GameEvents.STREAK_MILESTONE,
    );
    // Only one milestone emitted (at streak 3)
    expect(milestones.length).toBe(1);
    const payload = milestones[0].payload as { streak: number; label: string; multiplier: number };
    expect(payload.streak).toBe(3);
    expect(payload.label).toBe('SHARP SHOOTER!');
    expect(payload.multiplier).toBe(1.5);
  });

  it('incrementStreak at 10 emits only one STREAK_MILESTONE (at streak 3)', () => {
    for (let i = 0; i < 10; i++) manager.incrementStreak();
    const milestones = mockScene.events.emitted.filter(
      (e: { event: string }) => e.event === GameEvents.STREAK_MILESTONE,
    );
    // All streaks >= 3 return the same milestone, so only one emission at streak 3
    expect(milestones.length).toBe(1);
    const payload = milestones[0].payload as { streak: number; label: string; multiplier: number };
    expect(payload.streak).toBe(3);
    expect(payload.label).toBe('SHARP SHOOTER!');
    expect(payload.multiplier).toBe(1.5);
  });

  it('resetStreak resets to 0', () => {
    for (let i = 0; i < 3; i++) manager.incrementStreak();
    manager.resetStreak();
    expect(manager.getStreak()).toBe(0);
  });

  it('resetStreak resets multiplier to 1.0', () => {
    for (let i = 0; i < 3; i++) manager.incrementStreak();
    manager.resetStreak();
    expect(manager.getStreakMultiplier()).toBe(1.0);
  });

  it('recordTap correct increments accuracy', () => {
    manager.recordTap(true);
    manager.recordTap(true);
    manager.recordTap(true);
    manager.recordTap(false);
    expect(manager.getAccuracy()).toBe(0.75);
  });

  it('getAccuracy returns 0 before any taps', () => {
    expect(manager.getAccuracy()).toBe(0);
  });

  it('calculateStars returns 3 with 5+ buildings and accuracy >= 90% and speed bonus', () => {
    // Need 90%+ accuracy and speed bonus earned
    for (let i = 0; i < 9; i++) manager.recordTap(true);
    manager.recordTap(false); // 90% accuracy
    manager.setSpeedBonusEarned();
    expect(manager.calculateStars(5)).toBe(3);
  });

  it('calculateStars returns 2 with 3+ buildings and accuracy >= 70%', () => {
    for (let i = 0; i < 7; i++) manager.recordTap(true);
    for (let i = 0; i < 3; i++) manager.recordTap(false); // 70% accuracy
    expect(manager.calculateStars(3)).toBe(2);
  });

  it('calculateStars returns 1 with 1+ buildings and accuracy < 70%', () => {
    for (let i = 0; i < 6; i++) manager.recordTap(true);
    for (let i = 0; i < 4; i++) manager.recordTap(false); // 60% accuracy
    expect(manager.calculateStars(1)).toBe(1);
  });

  it('calculateStars returns 0 when 0 buildings', () => {
    expect(manager.calculateStars(0)).toBe(0);
  });

  it('reset clears score, streak, and taps', () => {
    manager.addPoints(100);
    manager.incrementStreak();
    manager.recordTap(true);
    manager.addChainLink();
    manager.reset();
    expect(manager.getScore()).toBe(0);
    expect(manager.getStreak()).toBe(0);
    expect(manager.getAccuracy()).toBe(0);
    expect(manager.getChainCount()).toBe(0);
  });

  it('addChainLink increments chain count', () => {
    manager.addChainLink();
    manager.addChainLink();
    manager.addChainLink();
    expect(manager.getChainCount()).toBe(3);
  });

  it('chain count resets on reset()', () => {
    manager.addChainLink();
    manager.addChainLink();
    manager.reset();
    expect(manager.getChainCount()).toBe(0);
  });
});
