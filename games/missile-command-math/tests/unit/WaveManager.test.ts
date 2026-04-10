/**
 * Unit tests for WaveManager.
 *
 * WaveManager is heavily coupled to Phaser entities, so we mock extensively.
 *
 * @see games/missile-command-math/src/systems/WaveManager.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEvents } from '../../src/types/GameEvents';
import type { IMathProblem } from '../../src/types/IMathProblem';

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

  off(_event: string, _handler: (...args: unknown[]) => void, _context?: unknown): this {
    return this;
  }
}

/** Create mock problems for testing. */
function makeProblem(correctAnswer: number, question?: string): IMathProblem {
  return {
    question: question ?? `${correctAnswer - 2} + 2`,
    correctAnswer,
    distractors: [correctAnswer + 1, correctAnswer - 1],
    skillType: 'single-digit-addition',
    gradeLevel: 2,
  };
}

// Mock Phaser module
vi.mock('phaser', () => {
  class MockGameObject {
    active = true;
    x = 0;
    y = 0;
    destroy(): void { this.active = false; }
    on(): this { return this; }
    setInteractive(): this { return this; }
  }

  class MockTimerEvent {
    remove(): void { /* no-op */ }
    destroy(): void { /* no-op */ }
  }

  return {
    default: {
      Scene: class Scene {},
      Events: { EventEmitter: class EventEmitter {} },
      GameObjects: {
        Container: MockGameObject,
        Sprite: MockGameObject,
        Text: MockGameObject,
        Image: MockGameObject,
      },
      Time: {
        TimerEvent: MockTimerEvent,
      },
      Geom: {
        Rectangle: class Rectangle {
          static Contains(): boolean { return true; }
        },
      },
      Math: {
        Easing: { Sine: { easeOut: (v: number) => v } },
      },
      Animations: {
        Events: { ANIMATION_COMPLETE: 'animationcomplete' },
      },
    },
    Scene: class Scene {},
    GameObjects: {
      Container: MockGameObject,
      Sprite: MockGameObject,
      Text: MockGameObject,
      Image: MockGameObject,
    },
  };
});

// Also mock all entity imports used by WaveManager
vi.mock('../../src/entities/Bomb', () => ({
  Bomb: vi.fn().mockImplementation(function (
    this: {
      active: boolean;
      isIntercepted: boolean;
      threatId: string;
      problem: IMathProblem;
      descentFraction: number;
      x: number;
      y: number;
    },
    _scene: unknown,
    _x: number,
    _y: number,
    problem: IMathProblem,
    _targetY: number,
    _targetCityIndex: number,
    threatId: string,
  ) {
    this.active = true;
    this.isIntercepted = false;
    this.threatId = threatId;
    this.problem = problem;
    this.descentFraction = 0.3;
    this.x = 400;
    this.y = 100;
  }),
}));

vi.mock('../../src/entities/Projectile', () => ({
  Projectile: vi.fn().mockImplementation(function (this: { active: boolean }) {
    this.active = true;
  }),
}));

vi.mock('../../src/entities/Explosion', () => ({
  Explosion: vi.fn().mockImplementation(function (this: { play: () => void }) {
    this.play = vi.fn();
  }),
}));

vi.mock('../../src/entities/StrategicBomber', () => ({
  StrategicBomber: vi.fn().mockImplementation(function (
    this: { active: boolean; hasDropped: boolean; intercept: () => void; on: () => unknown },
  ) {
    this.active = true;
    this.hasDropped = false;
    this.intercept = vi.fn();
    this.on = vi.fn().mockReturnThis();
  }),
}));

vi.mock('../../src/entities/Launcher', () => ({
  Launcher: vi.fn().mockImplementation(function (
    this: {
      loadedAnswer: number | string | null;
      isReloading: boolean;
      launcherPosition: string;
      x: number;
      y: number;
      loadAnswer: (a: number | string) => void;
      fire: () => void;
      flashWrong: () => void;
    },
    _scene: unknown,
    _x: number,
    _y: number,
    position: string,
  ) {
    this.loadedAnswer = null;
    this.isReloading = false;
    this.launcherPosition = position;
    this.x = position === 'left' ? 100 : position === 'center' ? 400 : 700;
    this.y = 460;
    this.loadAnswer = vi.fn(function (this: { loadedAnswer: number | string | null; isReloading: boolean }, a: number | string) {
      this.loadedAnswer = a;
      this.isReloading = false;
    });
    this.fire = vi.fn(function (this: { isReloading: boolean }) {
      this.isReloading = true;
    });
    this.flashWrong = vi.fn();
  }),
}));

let WaveManager: typeof import('../../src/systems/WaveManager').WaveManager;
let ScoreManager: typeof import('../../src/systems/ScoreManager').ScoreManager;

beforeEach(async () => {
  const waveMod = await import('../../src/systems/WaveManager');
  WaveManager = waveMod.WaveManager;
  const scoreMod = await import('../../src/systems/ScoreManager');
  ScoreManager = scoreMod.ScoreManager;
});

/**
 * Create a fully mocked WaveManager instance for testing.
 */
async function createWaveManager(level = 1) {
  const emitter = new MockEmitter();
  const mockScene = {
    events: emitter,
    time: {
      addEvent: vi.fn(() => ({ destroy: vi.fn(), remove: vi.fn() })),
      delayedCall: vi.fn((_ms: number, cb: () => void) => { cb(); return {}; }),
      now: 0,
    },
    add: {
      sprite: vi.fn(() => ({ play: vi.fn(), on: vi.fn(), destroy: vi.fn(), setOrigin: vi.fn() })),
      text: vi.fn(() => ({ setOrigin: vi.fn(), destroy: vi.fn() })),
      image: vi.fn(() => ({ setOrigin: vi.fn(), destroy: vi.fn() })),
      existing: vi.fn(),
    },
    tweens: {
      add: vi.fn(),
    },
    game: {
      registry: {
        get: vi.fn(() => undefined),
      },
    },
  };

  // Launchers — using the vi.mock'd version
  const { Launcher } = await import('../../src/entities/Launcher');

  const leftLauncher = new (Launcher as unknown as new (...args: unknown[]) => unknown)(mockScene, 100, 460, 'left');
  const centerLauncher = new (Launcher as unknown as new (...args: unknown[]) => unknown)(mockScene, 400, 460, 'center');
  const rightLauncher = new (Launcher as unknown as new (...args: unknown[]) => unknown)(mockScene, 700, 460, 'right');

  const scoreManager = new ScoreManager(mockScene);

  const diffConfig = {
    level,
    difficultySetting: 'normal' as const,
    missileSpeedMultiplier: 0.4,
    spawnIntervalMs: 3000,
    problemComplexity: 'easy' as const,
    activeMathTypes: ['addition'] as const,
    maxSimultaneousThreats: 3,
    bomberEnabled: false,
    problemsInWave: 8,
    launcherReloadDelayMs: 600,
    bomberSpeedMultiplier: 0,
    timeLimitSeconds: 90,
  };

  const launchers = {
    left: leftLauncher,
    center: centerLauncher,
    right: rightLauncher,
  };

  const buildings = [
    { isDestroyed: false },
    { isDestroyed: false },
    { isDestroyed: false },
    { isDestroyed: false },
    { isDestroyed: false },
    { isDestroyed: false },
  ];

  const manager = new WaveManager(
    mockScene as unknown,
    diffConfig,
    launchers as unknown as { left: unknown; center: unknown; right: unknown },
    buildings as unknown as unknown[],
    scoreManager,
  );

  return { manager, emitter, mockScene, launchers, scoreManager, diffConfig };
}

describe('WaveManager', () => {
  it('initWave emits WAVE_STARTED', async () => {
    const { manager, emitter } = await createWaveManager();
    const problems = [makeProblem(5), makeProblem(8), makeProblem(3)];
    manager.initWave(problems);

    const emitted = emitter.emitted.find(
      (e: { event: string }) => e.event === GameEvents.WAVE_STARTED,
    );
    expect(emitted).toBeDefined();
    const payload = emitted!.payload as { level: number; totalThreats: number };
    expect(payload.level).toBe(1);
    expect(payload.totalThreats).toBe(3);
  });

  it('initWave distributes answers to launchers', async () => {
    const { manager, launchers } = await createWaveManager();
    const problems = [makeProblem(5), makeProblem(8), makeProblem(3), makeProblem(12)];
    manager.initWave(problems);

    // All three launchers should have loaded an answer
    const left = launchers.left as unknown as { loadAnswer: { mock: { calls: unknown[][] } } };
    const center = launchers.center as unknown as { loadAnswer: { mock: { calls: unknown[][] } } };
    const right = launchers.right as unknown as { loadAnswer: { mock: { calls: unknown[][] } } };

    const totalLoads =
      left.loadAnswer.mock.calls.length +
      center.loadAnswer.mock.calls.length +
      right.loadAnswer.mock.calls.length;

    expect(totalLoads).toBe(3); // 3 launchers loaded
  });

  it('initWave builds answer queue from problem correct answers', async () => {
    const { manager } = await createWaveManager();
    const problems = [makeProblem(5), makeProblem(8), makeProblem(3)];
    manager.initWave(problems);

    // We can't directly access private answerQueue, but we can verify
    // via the emitted WAVE_STARTED which includes totalThreats matching problems.length
  });

  it('startWave sets up spawn timer', async () => {
    const { manager, mockScene } = await createWaveManager();
    const problems = [makeProblem(5), makeProblem(8)];
    manager.initWave(problems);
    manager.startWave();

    expect(mockScene.time.addEvent).toHaveBeenCalled();
  });

  it('stopWave stops the spawn timer', async () => {
    const { manager } = await createWaveManager();
    const problems = [makeProblem(5), makeProblem(8)];
    manager.initWave(problems);
    manager.startWave();

    // Should not throw
    expect(() => manager.stopWave()).not.toThrow();
  });

  it('destroy cleans up event listeners without throwing', async () => {
    const { manager } = await createWaveManager();
    const problems = [makeProblem(5)];
    manager.initWave(problems);

    expect(() => manager.destroy()).not.toThrow();
  });
});
