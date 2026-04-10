/**
 * Unit tests for DifficultyManager.
 *
 * @see games/missile-command-math/src/systems/DifficultyManager.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEvents } from '../../src/types/GameEvents';

// ── Mock Phaser ──────────────────────────────────────────────────────────────

class MockEmitter {
  private handlers: Map<string, Array<(...args: unknown[]) => void>> = new Map();
  readonly emitted: Array<{ event: string; payload: unknown }> = [];

  emit(event: string, payload?: unknown): void {
    this.emitted.push({ event, payload });
    (this.handlers.get(event) ?? []).forEach(h => h(payload));
  }

  on(event: string, handler: (...args: unknown[]) => void, context?: unknown): this {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    const bound = context ? handler.bind(context) : handler;
    this.handlers.get(event)!.push(bound);
    return this;
  }

  off(event: string, _handler: (...args: unknown[]) => void, _context?: unknown): this {
    // Simple: clear all handlers for this event
    this.handlers.delete(event);
    return this;
  }
}

vi.mock('phaser', () => ({
  default: {
    Scene: class Scene {},
    Events: { EventEmitter: class EventEmitter {} },
  },
  Scene: class Scene {},
  Events: { EventEmitter: class EventEmitter {} },
}));

let DifficultyManager: typeof import('../../src/systems/DifficultyManager').DifficultyManager;

beforeEach(async () => {
  const mod = await import('../../src/systems/DifficultyManager');
  DifficultyManager = mod.DifficultyManager;
});

describe('DifficultyManager', () => {
  let emitter: MockEmitter;
  let manager: InstanceType<typeof DifficultyManager>;

  beforeEach(() => {
    emitter = new MockEmitter();
    manager = new DifficultyManager(emitter as unknown, 'normal', 1);
  });

  it('getCurrentConfig returns level 1 defaults at construction', () => {
    const cfg = manager.getCurrentConfig();
    expect(cfg.level).toBe(1);
    expect(cfg.difficultySetting).toBe('normal');
  });

  it('getCurrentConfig missileSpeedMultiplier is baseSpeed × 1.0 on Normal', () => {
    // Level 1 base = 0.4, Normal = 1.0
    const cfg = manager.getCurrentConfig();
    expect(cfg.missileSpeedMultiplier).toBeCloseTo(0.4, 2);
  });

  it('getCurrentConfig missileSpeedMultiplier is baseSpeed × 0.7 on Easy', () => {
    const easyManager = new DifficultyManager(emitter as unknown, 'easy', 1);
    const cfg = easyManager.getCurrentConfig();
    expect(cfg.missileSpeedMultiplier).toBeCloseTo(0.28, 2);
  });

  it('getCurrentConfig missileSpeedMultiplier is baseSpeed × 1.3 on Hard', () => {
    const hardManager = new DifficultyManager(emitter as unknown, 'hard', 1);
    const cfg = hardManager.getCurrentConfig();
    expect(cfg.missileSpeedMultiplier).toBeCloseTo(0.52, 2);
  });

  it('setDifficultySetting updates config and emits DIFFICULTY_CHANGED', () => {
    manager.setDifficultySetting('hard');
    const cfg = manager.getCurrentConfig();
    expect(cfg.difficultySetting).toBe('hard');
    const emitted = emitter.emitted.find(
      (e: { event: string }) => e.event === GameEvents.DIFFICULTY_CHANGED,
    );
    expect(emitted).toBeDefined();
  });

  it('setLevel clamps to 0–20', () => {
    manager.setLevel(-5);
    expect(manager.getCurrentConfig().level).toBe(0);
    manager.setLevel(99);
    expect(manager.getCurrentConfig().level).toBe(20);
  });

  it('setLevel updates config and emits DIFFICULTY_CHANGED', () => {
    manager.setLevel(5);
    expect(manager.getCurrentConfig().level).toBe(5);
    const emitted = emitter.emitted.find(
      (e: { event: string }) => e.event === GameEvents.DIFFICULTY_CHANGED,
    );
    expect(emitted).toBeDefined();
  });

  it('LEVEL_COMPLETE event advances to next level', () => {
    emitter.emit(GameEvents.LEVEL_COMPLETE, { level: 3, stars: 2, citiesSurviving: 4, score: 100, accuracy: 0.8, chainReactions: 0, perfectWave: false });
    expect(manager.getCurrentConfig().level).toBe(4);
  });

  it('LEVEL_COMPLETE at level 20 stays at 20', () => {
    manager.setLevel(20);
    emitter.emitted.length = 0; // clear emissions
    emitter.emit(GameEvents.LEVEL_COMPLETE, { level: 20, stars: 3, citiesSurviving: 6, score: 500, accuracy: 1.0, chainReactions: 0, perfectWave: true });
    expect(manager.getCurrentConfig().level).toBe(20);
  });

  it('bomberEnabled is false below level 13', () => {
    manager.setLevel(12);
    expect(manager.getCurrentConfig().bomberEnabled).toBe(false);
  });

  it('bomberEnabled is true at level 13+', () => {
    manager.setLevel(13);
    expect(manager.getCurrentConfig().bomberEnabled).toBe(true);
  });

  it('launcherReloadDelayMs is 800 on Easy, 600 Normal, 400 Hard', () => {
    const easyMgr = new DifficultyManager(emitter as unknown, 'easy', 1);
    expect(easyMgr.getCurrentConfig().launcherReloadDelayMs).toBe(800);

    const normalMgr = new DifficultyManager(emitter as unknown, 'normal', 1);
    expect(normalMgr.getCurrentConfig().launcherReloadDelayMs).toBe(600);

    const hardMgr = new DifficultyManager(emitter as unknown, 'hard', 1);
    expect(hardMgr.getCurrentConfig().launcherReloadDelayMs).toBe(400);
  });

  it('getActiveSkillTypes returns valid strings for all levels', () => {
    for (let level = 0; level <= 20; level++) {
      manager.setLevel(level);
      const types = manager.getActiveSkillTypes();
      expect(types.length).toBeGreaterThan(0);
      for (const t of types) {
        expect(typeof t).toBe('string');
      }
    }
  });

  it('getGradeLevel maps difficulty labels correctly', () => {
    // Tutorial/Intro/Easy → 2
    manager.setLevel(0); // Tutorial
    expect(manager.getGradeLevel()).toBe(2);
    manager.setLevel(1); // Intro
    expect(manager.getGradeLevel()).toBe(2);
    manager.setLevel(3); // Easy
    expect(manager.getGradeLevel()).toBe(2);

    // Medium → 3
    manager.setLevel(9); // Medium
    expect(manager.getGradeLevel()).toBe(3);

    // Hard → 4
    manager.setLevel(13); // Hard
    expect(manager.getGradeLevel()).toBe(4);

    // Expert → 5
    manager.setLevel(17); // Expert
    expect(manager.getGradeLevel()).toBe(5);
  });

  it('training level has timeLimitSeconds === Infinity', () => {
    manager.setLevel(0);
    expect(manager.getCurrentConfig().timeLimitSeconds).toBe(Infinity);
  });

  it('destroy removes LEVEL_COMPLETE listener', () => {
    manager.destroy();
    const currentLevel = manager.getCurrentConfig().level;
    emitter.emit(GameEvents.LEVEL_COMPLETE, { level: currentLevel, stars: 1, citiesSurviving: 1, score: 10, accuracy: 0.5, chainReactions: 0, perfectWave: false });
    // Level should NOT have advanced since listener was removed
    expect(manager.getCurrentConfig().level).toBe(currentLevel);
  });
});
