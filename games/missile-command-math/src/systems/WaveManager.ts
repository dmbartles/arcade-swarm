/**
 * WaveManager.ts — Wave lifecycle manager for Missile Command Math.
 *
 * Manages the full lifecycle of a wave: problem distribution, threat spawning
 * schedule, answer queue, player tap routing, and wave-completion detection.
 *
 * @see docs/gdds/missile-command-math.md §2 (Game Loop)
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import type {
  IMathProblem,
} from '../types/IMathProblem';
import type {
  ThreatSpawnedPayload,
  ThreatDestroyedPayload,
  WaveStartedPayload,
  LevelCompletePayload,
  GameOverPayload,
  AnswerValidatedPayload,
} from '../types/GameEvents';
import type { IDifficultyConfig } from '../types/IDifficultyConfig';
import { Bomb } from '../entities/Bomb';
import { Projectile } from '../entities/Projectile';
import { Explosion } from '../entities/Explosion';
import { StrategicBomber } from '../entities/StrategicBomber';
import { Launcher } from '../entities/Launcher';
import type { Building } from '../entities/Building';
import { ScoreManager } from './ScoreManager';
import { SCORE_VALUES } from '../config/scoreConfig';
import {
  PLAYFIELD_X,
  PLAYFIELD_WIDTH,
  GROUND_LINE_Y,
  LAUNCHER_LEFT_X,
  LAUNCHER_CENTER_X,
  LAUNCHER_RIGHT_X,
  SPEED_BONUS_TIME_FRACTION,
} from '../config/gameConfig';
import {
  BASE_SPAWN_INTERVAL_MS,
  SPAWN_INTERVAL_MIN_MS,
  SPAWN_INTERVAL_DECREMENT_MS,
} from '../config/difficultyConfig';

/** Gap in pixels around launcher x-positions to avoid spawning bombs directly over them. */
const LAUNCHER_EXCLUSION_PX = 60;

/** Probability of spawning a bomber when bombers are enabled. */
const BOMBER_SPAWN_PROBABILITY = 0.2;

/** How many bombs a strategic bomber drops. */
const BOMBER_DROP_COUNT = 2;

/** Unique ID counter for threats. */
let threatIdCounter = 0;

/** Generate a unique threat ID. */
function nextThreatId(): string {
  return `threat-${Date.now()}-${++threatIdCounter}`;
}

export class WaveManager {
  /** Active bomb entities currently on screen. */
  private activeBombs: Map<string, Bomb> = new Map();

  /** Active projectile entities. */
  private activeProjectiles: Map<string, Projectile> = new Map();

  /** Active strategic bombers. */
  private activeBombers: Map<string, StrategicBomber> = new Map();

  /** The pre-generated problems for this wave. */
  private waveProblems: IMathProblem[] = [];

  /** Remaining problems yet to be spawned. */
  private pendingProblems: IMathProblem[] = [];

  /** Current answer queue (correct answers in playable order). */
  private answerQueue: Array<number | string> = [];

  /** Answers not yet distributed to launchers (beyond the first 3). */
  private distributionPool: Array<number | string> = [];

  /** Current head of the answer queue. */
  private loadedRound: number | string | null = null;

  /** References to the three launcher entities. */
  private launchers: {
    left: Launcher;
    center: Launcher;
    right: Launcher;
  };

  /** Building references for surviving-count queries. */
  private buildings: Building[] = [];

  /** Timer event for spawning threats. */
  private spawnTimer: Phaser.Time.TimerEvent | null = null;

  /** Whether the wave is currently active. */
  private isActive: boolean = false;

  /** Total threats spawned this wave. */
  private totalSpawned: number = 0;

  /** Total threats destroyed this wave. */
  private totalDestroyed: number = 0;

  /** Total misses (threats that reached a building) this wave. */
  private totalMisses: number = 0;

  /** Current difficulty config. */
  private diffConfig: IDifficultyConfig;

  /** Reference to scene. */
  private scene: Phaser.Scene;

  /** Reference to score manager. */
  private scoreManager: ScoreManager;

  /** Whether wave-complete check has already fired. */
  private waveCompleteEmitted: boolean = false;

  /**
   * @param scene          - The GameScene instance.
   * @param diffConfig     - Current difficulty config from DifficultyManager.
   * @param launchers      - The three Launcher entity references.
   * @param buildings      - Building entities for surviving-count queries.
   * @param scoreManager   - ScoreManager instance.
   */
  constructor(
    scene: Phaser.Scene,
    diffConfig: IDifficultyConfig,
    launchers: { left: Launcher; center: Launcher; right: Launcher },
    buildings: Building[],
    scoreManager: ScoreManager,
  ) {
    this.scene = scene;
    this.diffConfig = diffConfig;
    this.launchers = launchers;
    this.buildings = buildings;
    this.scoreManager = scoreManager;

    // Listen for projectile detonations
    this.scene.events.on(GameEvents.INTERCEPTOR_DETONATED, this.onInterceptorDetonated, this);

    // Listen for bombs reaching their city
    this.scene.events.on('bomb-reached-city', this.onBombReachedCityEvent, this);

    // Listen for pause/resume
    this.scene.events.on(GameEvents.GAME_PAUSED, this.stopWave, this);
    this.scene.events.on(GameEvents.GAME_RESUMED, this.resumeWave, this);
  }

  /**
   * Initialize the wave with pre-generated problems.
   * Called by GameScene after PROBLEM_GENERATED is received.
   */
  initWave(problems: IMathProblem[]): void {
    this.waveProblems = [...problems];
    this.pendingProblems = [...problems];
    this.totalSpawned = 0;
    this.totalDestroyed = 0;
    this.totalMisses = 0;
    this.waveCompleteEmitted = false;
    this.activeBombs.clear();
    this.activeProjectiles.clear();
    this.activeBombers.clear();

    // Build answer queue: extract correctAnswer from each problem, then shuffle
    this.answerQueue = problems.map(p => p.correctAnswer);
    this.shuffleArray(this.answerQueue);

    // Distribute first 3 answers to launchers; rest go in distribution pool
    this.distributionPool = [...this.answerQueue];
    this.distributeAnswersToLaunchers();

    // Set loaded round to the first answer in the queue
    this.loadedRound = this.answerQueue[0] ?? null;

    const payload: WaveStartedPayload = {
      level: this.diffConfig.level,
      totalThreats: problems.length,
    };
    this.scene.events.emit(GameEvents.WAVE_STARTED, payload);
  }

  /**
   * Start the spawning timer.
   */
  startWave(): void {
    if (this.isActive) return;
    this.isActive = true;

    const interval = this.computeSpawnInterval();
    this.spawnTimer = this.scene.time.addEvent({
      delay: interval,
      loop: true,
      callback: this.spawnThreat,
      callbackScope: this,
    });
  }

  /**
   * Stop the spawning timer and mark wave inactive.
   */
  stopWave(): void {
    this.isActive = false;
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }
  }

  /**
   * Called each frame from GameScene.update().
   */
  update(time: number, delta: number): void {
    // Update all active bombs
    for (const bomb of this.activeBombs.values()) {
      if (bomb.active) {
        bomb.update(time, delta);
      }
    }

    // Update all active projectiles
    for (const projectile of this.activeProjectiles.values()) {
      if (projectile.active) {
        projectile.update(time, delta);
      }
    }

    // Update all active bombers
    for (const bomber of this.activeBombers.values()) {
      if (bomber.active) {
        bomber.update(time, delta);
      }
    }

    // Clean up destroyed entities from maps
    for (const [id, bomb] of this.activeBombs) {
      if (!bomb.active) {
        this.activeBombs.delete(id);
      }
    }
    for (const [id, proj] of this.activeProjectiles) {
      if (!proj.active) {
        this.activeProjectiles.delete(id);
      }
    }
    for (const [id, bomber] of this.activeBombers) {
      if (!bomber.active) {
        this.activeBombers.delete(id);
      }
    }
  }

  /**
   * Handle a player tap on a specific bomb.
   */
  handleBombTap(bomb: Bomb): void {
    if (!bomb.active || bomb.isIntercepted) return;

    // Check if bomb's correctAnswer matches loadedRound
    const answerMatches =
      this.loadedRound !== null &&
      String(bomb.problem.correctAnswer) === String(this.loadedRound);

    if (answerMatches) {
      // Find the launcher whose loadedAnswer matches (left → center → right)
      const launcherOrder: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];
      let matchingLauncher: Launcher | null = null;

      for (const pos of launcherOrder) {
        const launcher = this.launchers[pos];
        if (
          !launcher.isReloading &&
          launcher.loadedAnswer !== null &&
          String(launcher.loadedAnswer) === String(this.loadedRound)
        ) {
          matchingLauncher = launcher;
          break;
        }
      }

      if (!matchingLauncher) {
        // No launcher available with this answer — treat as wrong tap
        this.handleWrongTap(bomb);
        return;
      }

      // Fire the matching launcher
      matchingLauncher.fire(bomb.x, bomb.y);

      // Record correct tap
      this.scoreManager.recordTap(true);

      // Create projectile
      const nozzleY = matchingLauncher.y - 45; // launcher nozzle top
      const projectile = new Projectile(
        this.scene,
        matchingLauncher.x,
        nozzleY,
        bomb,
        matchingLauncher.launcherPosition,
      );
      this.activeProjectiles.set(bomb.threatId, projectile);

      // Advance answer queue
      const queueIndex = this.answerQueue.indexOf(this.loadedRound!);
      if (queueIndex !== -1) {
        this.answerQueue.splice(queueIndex, 1);
      }
      this.loadedRound = this.answerQueue[0] ?? null;

      // Schedule launcher reload
      const reloadDelay = this.diffConfig.launcherReloadDelayMs;
      this.scene.time.delayedCall(reloadDelay, () => {
        this.reloadLauncher(matchingLauncher!.launcherPosition);
      });

      const payload: AnswerValidatedPayload = {
        problem: bomb.problem,
        correct: true,
        attemptedAnswer: bomb.problem.correctAnswer,
      };
      this.scene.events.emit(GameEvents.ANSWER_VALIDATED, payload);

    } else {
      this.handleWrongTap(bomb);
    }
  }

  /**
   * Handle wrong tap — emit events and reset streak.
   */
  private handleWrongTap(bomb: Bomb): void {
    this.scoreManager.recordTap(false);
    this.scoreManager.resetStreak();

    // Flash the launcher that's loaded (or nearest)
    this.flashNearestLauncher(bomb.x);

    const payload: AnswerValidatedPayload = {
      problem: bomb.problem,
      correct: false,
      attemptedAnswer: bomb.problem.correctAnswer,
    };
    this.scene.events.emit(GameEvents.ANSWER_VALIDATED, payload);
    this.scene.events.emit(GameEvents.WRONG_TAP, {});
  }

  /** Flash the nearest launcher to a given x position. */
  private flashNearestLauncher(bombX: number): void {
    const positions: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];
    const launcherXMap: Record<string, number> = {
      left:   LAUNCHER_LEFT_X,
      center: LAUNCHER_CENTER_X,
      right:  LAUNCHER_RIGHT_X,
    };

    let nearest: 'left' | 'center' | 'right' = 'left';
    let minDist = Infinity;

    for (const pos of positions) {
      const dist = Math.abs(bombX - launcherXMap[pos]);
      if (dist < minDist) {
        minDist = dist;
        nearest = pos;
      }
    }

    this.launchers[nearest].flashWrong();
  }

  /**
   * Called by INTERCEPTOR_DETONATED handler.
   * Destroys the targeted bomb, creates Explosion entity, notifies ScoreManager.
   */
  onInterceptorDetonated(payload: {
    x: number;
    y: number;
    solvedEquation: string;
    threatId: string;
  }): void {
    const { x, y, solvedEquation, threatId } = payload;

    const bomb = this.activeBombs.get(threatId);
    if (!bomb) return;

    // Compute points
    const hasSpeedBonus = bomb.descentFraction < SPEED_BONUS_TIME_FRACTION;
    const basePoints = hasSpeedBonus ? SCORE_VALUES.citySaveBonus : SCORE_VALUES.standardMissile;

    if (hasSpeedBonus) {
      this.scoreManager.setSpeedBonusEarned();
    }

    this.scoreManager.addPoints(basePoints);
    this.scoreManager.incrementStreak();

    const destroyedPayload: ThreatDestroyedPayload = {
      threatId,
      threatType: 'standard-missile',
      points: basePoints,
      chainReaction: false,
    };
    this.scene.events.emit(GameEvents.THREAT_DESTROYED, destroyedPayload);

    // Create explosion at bomb position
    const explosion = new Explosion(this.scene, x, y, solvedEquation);
    explosion.play();

    // Remove and destroy bomb
    this.activeBombs.delete(threatId);
    bomb.intercept();

    this.totalDestroyed += 1;
    this.checkWaveComplete();
  }

  /**
   * Called when a bomb reaches its target building.
   */
  onBombReachedBuilding(threatId: string): void {
    const bomb = this.activeBombs.get(threatId);
    if (!bomb) return;

    this.activeBombs.delete(threatId);
    this.totalMisses += 1;
    this.scoreManager.recordTap(false);

    this.totalDestroyed += 1;
    this.checkWaveComplete();
  }

  /**
   * Reload a launcher after its delay expires.
   */
  reloadLauncher(position: 'left' | 'center' | 'right'): void {
    const launcher = this.launchers[position];
    if (!launcher.isReloading) return; // Already reloaded by another path

    if (this.distributionPool.length > 0) {
      const nextAnswer = this.distributionPool.shift()!;
      launcher.loadAnswer(nextAnswer);
    } else {
      // No more answers — show empty
      launcher.loadAnswer('—');
    }
  }

  // ── Private Methods ──────────────────────────────────────────────────────

  /**
   * Check if the wave is complete.
   */
  private checkWaveComplete(): void {
    if (this.waveCompleteEmitted) return;

    const allSpawned = this.pendingProblems.length === 0 && !this.isActive;
    const allResolved =
      this.activeBombs.size === 0 && this.activeBombers.size === 0;
    const allDestroyedCount = this.totalDestroyed >= this.waveProblems.length;

    // Check game over: all buildings destroyed
    const survivingBuildings = this.getSurvivingBuildingCount();
    if (survivingBuildings === 0 && this.waveProblems.length > 0) {
      this.waveCompleteEmitted = true;
      this.stopWave();

      const payload: GameOverPayload = {
        level: this.diffConfig.level,
        finalScore: this.scoreManager.getScore(),
      };
      this.scene.events.emit(GameEvents.GAME_OVER, payload);
      return;
    }

    // Wave complete when all threats have been spawned and resolved
    if ((allSpawned && allResolved) || allDestroyedCount) {
      // Make sure spawning is truly done
      if (this.pendingProblems.length > 0 && !allDestroyedCount) return;

      this.waveCompleteEmitted = true;
      this.stopWave();

      const completePayload = this.buildLevelCompletePayload();
      this.scene.events.emit(GameEvents.LEVEL_COMPLETE, completePayload);
    }
  }

  /**
   * Spawn a single threat.
   */
  private spawnThreat(): void {
    if (!this.isActive) return;
    if (this.pendingProblems.length === 0) {
      this.stopWave();
      this.checkWaveComplete();
      return;
    }

    // Respect max simultaneous threats
    if (this.activeBombs.size >= this.diffConfig.maxSimultaneousThreats) return;

    // Bomber spawn (with probability, if enabled and we have room)
    if (
      this.diffConfig.bomberEnabled &&
      this.activeBombers.size === 0 &&
      this.activeBombs.size < this.diffConfig.maxSimultaneousThreats - 1 &&
      Math.random() < BOMBER_SPAWN_PROBABILITY
    ) {
      this.spawnBomber();
      return;
    }

    // Spawn standard bomb
    const problem = this.pendingProblems.shift()!;
    const threatId = nextThreatId();

    // Randomize x within playfield, avoiding launcher exclusion zones
    const spawnX = this.pickSafeSpawnX();
    const spawnY = 30; // top of playfield
    const targetY = GROUND_LINE_Y - 20;

    // Randomly target left (0) or right (1) cluster
    const targetCityIndex = Math.random() < 0.5 ? 0 : 1;

    const bomb = new Bomb(
      this.scene,
      spawnX,
      spawnY,
      problem,
      targetY,
      targetCityIndex,
      threatId,
      this.diffConfig.missileSpeedMultiplier,
    );

    // Wire up tap handler
    bomb.on('pointerdown', () => {
      this.handleBombTap(bomb);
    });

    this.activeBombs.set(threatId, bomb);
    this.totalSpawned += 1;

    const spawnPayload: ThreatSpawnedPayload = {
      threatId,
      threatType: 'standard-missile',
      problem,
      targetCityIndex,
    };
    this.scene.events.emit(GameEvents.THREAT_SPAWNED, spawnPayload);
  }

  /** Spawn a strategic bomber. */
  private spawnBomber(): void {
    const threatId = nextThreatId();
    const bomber = new StrategicBomber(
      this.scene,
      this.diffConfig.bomberSpeedMultiplier,
      BOMBER_DROP_COUNT,
      threatId,
      null,
    );

    // Wire up tap handler
    bomber.on('pointerdown', () => {
      bomber.intercept();
      this.activeBombers.delete(threatId);
      this.scoreManager.addPoints(
        bomber.hasDropped ? SCORE_VALUES.bomberAfterDrop : SCORE_VALUES.bomberBeforeDrop,
      );
      this.scoreManager.incrementStreak();
    });

    this.activeBombers.set(threatId, bomber);

    const spawnPayload: ThreatSpawnedPayload = {
      threatId,
      threatType: 'bomber',
      problem: null,
    };
    this.scene.events.emit(GameEvents.THREAT_SPAWNED, spawnPayload);
  }

  /**
   * Distribute answers to launchers.
   * Takes the first 3 from distributionPool and assigns one per launcher.
   */
  private distributeAnswersToLaunchers(): void {
    const positions: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];

    for (const pos of positions) {
      if (this.distributionPool.length > 0) {
        const answer = this.distributionPool.shift()!;
        this.launchers[pos].loadAnswer(answer);
      }
    }
  }

  /**
   * Compute spawn interval for the current level and difficulty.
   */
  private computeSpawnInterval(): number {
    return Math.max(
      SPAWN_INTERVAL_MIN_MS,
      BASE_SPAWN_INTERVAL_MS - this.diffConfig.level * SPAWN_INTERVAL_DECREMENT_MS,
    );
  }

  /** Get the count of surviving buildings. */
  private getSurvivingBuildingCount(): number {
    return this.buildings.filter(b => !b.isDestroyed).length;
  }

  /** Build the LevelCompletePayload. */
  private buildLevelCompletePayload(): LevelCompletePayload {
    const citiesSurviving = this.getSurvivingBuildingCount();
    const accuracy = this.scoreManager.getAccuracy();
    const chainReactions = this.scoreManager.getChainCount();

    return {
      level: this.diffConfig.level,
      stars: this.scoreManager.calculateStars(citiesSurviving),
      citiesSurviving,
      score: this.scoreManager.getScore(),
      accuracy,
      chainReactions,
      perfectWave: this.totalMisses === 0,
    };
  }

  /**
   * Pick a safe x spawn position, avoiding launcher exclusion zones.
   */
  private pickSafeSpawnX(): number {
    const xMin = PLAYFIELD_X + 20;
    const xMax = PLAYFIELD_X + PLAYFIELD_WIDTH - 20;
    const launcherXs = [LAUNCHER_LEFT_X, LAUNCHER_CENTER_X, LAUNCHER_RIGHT_X];

    let attempts = 0;
    while (attempts < 20) {
      const x = Math.random() * (xMax - xMin) + xMin;
      let safe = true;
      for (const lx of launcherXs) {
        if (Math.abs(x - lx) < LAUNCHER_EXCLUSION_PX) {
          safe = false;
          break;
        }
      }
      if (safe) return x;
      attempts += 1;
    }

    // Fallback: center of playfield
    return PLAYFIELD_X + PLAYFIELD_WIDTH / 2;
  }

  /** Fisher-Yates shuffle in-place. */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /** Event handler for 'bomb-reached-city'. */
  private onBombReachedCityEvent(payload: { threatId: string; cityIndex: number }): void {
    this.onBombReachedBuilding(payload.threatId);
  }

  /** Resume wave (called on GAME_RESUMED). */
  private resumeWave(): void {
    if (!this.isActive && this.pendingProblems.length > 0) {
      this.startWave();
    }
  }

  /** Destroy all active entities and clean up event listeners. */
  destroy(): void {
    this.stopWave();

    for (const bomb of this.activeBombs.values()) {
      if (bomb.active) bomb.destroy();
    }
    for (const proj of this.activeProjectiles.values()) {
      if (proj.active) proj.destroy();
    }
    for (const bomber of this.activeBombers.values()) {
      if (bomber.active) bomber.destroy();
    }

    this.scene.events.off(GameEvents.INTERCEPTOR_DETONATED, this.onInterceptorDetonated, this);
    this.scene.events.off('bomb-reached-city', this.onBombReachedCityEvent, this);
    this.scene.events.off(GameEvents.GAME_PAUSED, this.stopWave, this);
    this.scene.events.off(GameEvents.GAME_RESUMED, this.resumeWave, this);
  }
}


