/**
 * WaveManager — Primary gameplay system that orchestrates spawning,
 * answer queue, intercept handling, and wave completion.
 *
 * Listens for math engine events and spawns threats accordingly.
 * Manages the lifecycle of all active threats during a wave.
 *
 * @see docs/gdds/missile-command-math.md §2 (Game Loop)
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import type {
  ProblemGeneratedPayload,
  ThreatDestroyedPayload,
  CityDestroyedPayload,
  LevelCompletePayload,
  GameOverPayload,
  WaveStartedPayload,
  ChainReactionPayload,
} from '../types/GameEvents';
import type { StreakMilestonePayload } from '../types/IScoreManager';
import type { IDifficultyConfig } from '../types/IDifficultyConfig';
import type { IMathProblem } from '../types/IMathProblem';
import {
  CANVAS_WIDTH,
  SAFE_MARGIN,
  PLAY_FIELD_TOP,
  BASE_MISSILE_SPEED,
} from '../config/gameConfig';
import { SCORE_VALUES } from '../config/scoreConfig';
import { StandardMissile } from '../entities/StandardMissile';
import { BomberMissile } from '../entities/BomberMissile';
import { MIRVMissile } from '../entities/MIRVMissile';
import { StrategicBomber } from '../entities/StrategicBomber';
import { ParatrooperPlane } from '../entities/ParatrooperPlane';
import { Paratrooper } from '../entities/Paratrooper';
import { Explosion } from '../entities/Explosion';
import type { AnswerQueue } from '../entities/AnswerQueue';
import type { Launcher } from '../entities/Launcher';
import type { City } from '../entities/City';
import type { ScoreManager } from './ScoreManager';

/** Default MIRV child count if not specified. */
const DEFAULT_MIRV_CHILD_COUNT = 2;
/** Default bomber payload count. */
const DEFAULT_BOMBER_PAYLOAD_COUNT = 2;
/** Default MIRV split altitude percent. */
const DEFAULT_MIRV_SPLIT_PERCENT = 40;
/** MIRV spawn chance when enabled. */
const MIRV_SPAWN_CHANCE = 0.2;
/** Wave fraction at which bomber spawns. */
const BOMBER_SPAWN_FRACTION = 0.4;
/** Wave fraction at which paratrooper plane spawns. */
const PLANE_SPAWN_FRACTION = 0.65;

export class WaveManager {
  private scene: Phaser.Scene;
  private difficultyConfig: IDifficultyConfig;
  private scoreManager: ScoreManager;
  private answerQueue: AnswerQueue;
  private launcher: Launcher;
  private cities: City[];

  // Wave state
  private waveProblems: IMathProblem[];
  private answerQueueData: Array<number | string>;
  private activeMissiles: StandardMissile[];
  private activeBombers: StrategicBomber[];
  private activePlanes: ParatrooperPlane[];
  private activeParatroopers: Paratrooper[];
  private totalThreats: number;
  private threatsSpawned: number;
  private threatsResolved: number;
  private spawnTimer: Phaser.Time.TimerEvent | null;
  private waveActive: boolean;
  /** Index into waveProblems for the next problem to assign. */
  private problemIndex: number;
  /** Whether bomber has been spawned this wave. */
  private bomberSpawned: boolean;
  /** Whether paratrooper plane has been spawned this wave. */
  private planeSpawned: boolean;

  constructor(
    scene: Phaser.Scene,
    difficultyConfig: IDifficultyConfig,
    scoreManager: ScoreManager,
    answerQueue: AnswerQueue,
    launcher: Launcher,
    cities: City[],
  ) {
    this.scene = scene;
    this.difficultyConfig = difficultyConfig;
    this.scoreManager = scoreManager;
    this.answerQueue = answerQueue;
    this.launcher = launcher;
    this.cities = cities;

    this.waveProblems = [];
    this.answerQueueData = [];
    this.activeMissiles = [];
    this.activeBombers = [];
    this.activePlanes = [];
    this.activeParatroopers = [];
    this.totalThreats = 0;
    this.threatsSpawned = 0;
    this.threatsResolved = 0;
    this.spawnTimer = null;
    this.waveActive = false;
    this.problemIndex = 0;
    this.bomberSpawned = false;
    this.planeSpawned = false;

    this.setupEventListeners();
  }

  /** Called each frame by GameScene.update(). */
  update(_time: number, _delta: number): void {
    if (!this.waveActive) return;

    // Clean up destroyed missiles from active arrays
    this.activeMissiles = this.activeMissiles.filter((m) => !m.destroyed);
    this.activeBombers = this.activeBombers.filter((b) => !b.destroyed);
    this.activePlanes = this.activePlanes.filter((p) => !p.destroyed);
    this.activeParatroopers = this.activeParatroopers.filter((p) => !p.destroyed);

    // Update launcher with current active targets
    this.launcher.setActiveMissiles(this.activeMissiles);
    this.launcher.setActiveBombers(this.activeBombers);

    // Update answer queue visible missiles for highlighting
    this.answerQueue.setVisibleMissiles(this.activeMissiles);

    // Update entities that need frame updates
    for (const missile of this.activeMissiles) {
      if (!missile.destroyed) {
        missile.preUpdate(_time, _delta);
      }
    }
    for (const bomber of this.activeBombers) {
      if (!bomber.destroyed) {
        bomber.preUpdate(_time, _delta);
      }
    }
    for (const plane of this.activePlanes) {
      if (!plane.destroyed) {
        plane.preUpdate(_time, _delta);
      }
    }
    for (const para of this.activeParatroopers) {
      if (!para.destroyed) {
        para.preUpdate(_time, _delta);
      }
    }

    // Update answer queue highlights
    this.answerQueue.preUpdate(_time, _delta);

    // Check for all cities destroyed
    const aliveCities = this.cities.filter((c) => !c.destroyed).length;
    if (aliveCities === 0 && this.waveActive) {
      this.gameOver();
    }
  }

  /** Setup all event listeners. */
  private setupEventListeners(): void {
    this.scene.events.on(GameEvents.PROBLEM_GENERATED, (payload: ProblemGeneratedPayload) => {
      this.onProblemGenerated(payload);
    });

    this.scene.events.on(GameEvents.WAVE_STARTED, (_payload: WaveStartedPayload) => {
      // Wave start is handled by onProblemGenerated after math engine fires
    });

    this.scene.events.on(GameEvents.INTERCEPTOR_DETONATED, (payload: { targetThreatId: string; x: number; y: number }) => {
      this.onInterceptorDetonated(payload);
    });

    this.scene.events.on(GameEvents.EXPLOSION_COMPLETE, (payload: { x: number; y: number; type: string }) => {
      this.onExplosionComplete(payload);
    });

    this.scene.events.on(GameEvents.CITY_DESTROYED, (payload: CityDestroyedPayload) => {
      this.onCityDestroyed(payload);
    });

    this.scene.events.on(GameEvents.STREAK_MILESTONE, (payload: StreakMilestonePayload) => {
      this.onStreakMilestone(payload);
    });

    this.scene.events.on(GameEvents.WRONG_TAP, () => {
      this.scoreManager.resetStreak();
      this.launcher.stopStreakGlow();
      this.scoreManager.recordTap(false);
    });

    this.scene.events.on(GameEvents.DIFFICULTY_CHANGED, (config: IDifficultyConfig) => {
      this.difficultyConfig = config;
    });

    // Listen for bomber payload drops to track child missiles
    this.scene.events.on(GameEvents.BOMBER_PAYLOAD_DROPPED, () => {
      // After bomber drops payload, new BomberMissiles are added to scene
      // They'll be picked up in next update() frame
    });

    // Listen for MIRV split events to track child missiles
    this.scene.events.on(GameEvents.MIRV_SPLIT, () => {
      // After MIRV splits, new MIRVChild entities are added to scene
      // They'll be picked up in next update() frame
    });

    // Listen for paratrooper drops
    this.scene.events.on(GameEvents.PARATROOPER_DROPPED, () => {
      // New paratroopers are added to scene
    });

    // Track all threats that hit cities or are destroyed
    this.scene.events.on(GameEvents.THREAT_DESTROYED, (_payload: ThreatDestroyedPayload) => {
      this.onThreatDestroyed();
    });

    this.scene.events.on(GameEvents.CITY_HIT, () => {
      // A threat hit a city — count as resolved
      this.threatsResolved += 1;
      this.checkWaveComplete();
    });

    this.scene.events.on(GameEvents.PARATROOPER_LANDED, () => {
      this.threatsResolved += 1;
      this.checkWaveComplete();
    });
  }

  /** Handle PROBLEM_GENERATED event from MathEngine. */
  private onProblemGenerated(payload: ProblemGeneratedPayload): void {
    this.waveProblems = payload.problems;
    // Use spawn-order answers so queue[0] always corresponds to the current bomb.
    // The shuffled payload.answerQueue is independent of spawn order and would
    // show answers for bombs that haven't appeared yet, confusing players.
    this.answerQueueData = payload.problems.map((p: IMathProblem) => p.correctAnswer);
    this.totalThreats = this.waveProblems.length;
    this.threatsSpawned = 0;
    this.threatsResolved = 0;
    this.problemIndex = 0;
    this.bomberSpawned = false;
    this.planeSpawned = false;
    this.waveActive = true;

    // Initialize the answer queue
    this.answerQueue.initialize(this.answerQueueData, this.launcher);

    // Start the spawn timer
    const spawnInterval = this.difficultyConfig.spawnIntervalMs;
    this.spawnTimer = this.scene.time.addEvent({
      delay: spawnInterval,
      callback: () => this.spawnNextThreat(),
      callbackScope: this,
      loop: true,
    });

    // Spawn the first threat immediately
    this.spawnNextThreat();
  }

  /** Spawn the next threat entity based on wave progression. */
  private spawnNextThreat(): void {
    if (!this.waveActive) return;
    if (this.threatsSpawned >= this.totalThreats) return;

    // Check max simultaneous threats
    const activeCount = this.activeMissiles.length + this.activeBombers.length;
    if (activeCount >= this.difficultyConfig.maxSimultaneousThreats) return;

    // Get the next problem
    if (this.problemIndex >= this.waveProblems.length) return;

    const waveFraction = this.threatsSpawned / this.totalThreats;

    // Determine threat type based on wave fraction and config
    if (
      !this.bomberSpawned &&
      this.difficultyConfig.bomberEnabled &&
      waveFraction >= BOMBER_SPAWN_FRACTION
    ) {
      this.spawnBomberThreat();
      return;
    }

    if (
      !this.planeSpawned &&
      this.difficultyConfig.paratrooperEnabled &&
      waveFraction >= PLANE_SPAWN_FRACTION
    ) {
      this.spawnParatrooperPlaneThreat();
      // Don't return — also try to spawn a missile
    }

    // MIRV or standard missile
    if (
      this.difficultyConfig.mirvEnabled &&
      Math.random() < MIRV_SPAWN_CHANCE
    ) {
      this.spawnMIRVThreat();
    } else {
      this.spawnStandardMissileThreat();
    }
  }

  /** Spawn a standard missile. */
  private spawnStandardMissileThreat(): void {
    const problem = this.waveProblems[this.problemIndex];
    if (!problem) return;
    this.problemIndex += 1;

    const missile = this.spawnStandardMissile(problem);
    this.activeMissiles.push(missile);
    this.threatsSpawned += 1;
  }

  /** Spawn a MIRV missile. */
  private spawnMIRVThreat(): void {
    const problem = this.waveProblems[this.problemIndex];
    if (!problem) return;
    this.problemIndex += 1;

    // Gather child problems
    const childCount = this.difficultyConfig.mirvChildCount ?? DEFAULT_MIRV_CHILD_COUNT;
    const childProblems: IMathProblem[] = [];
    for (let i = 0; i < childCount; i++) {
      if (this.problemIndex < this.waveProblems.length) {
        childProblems.push(this.waveProblems[this.problemIndex]);
        this.problemIndex += 1;
        this.threatsSpawned += 1; // Count child threats
      }
    }

    const mirv = this.spawnMIRV(problem, childProblems);
    this.activeMissiles.push(mirv);
    this.threatsSpawned += 1;

    // Listen for the MIRV split to add children to active list
    const onSplit = () => {
      // Find new MIRVChild instances that aren't in our active list
      this.scene.children.each((child: Phaser.GameObjects.GameObject) => {
        if (child instanceof StandardMissile && !this.activeMissiles.includes(child) && !child.destroyed) {
          this.activeMissiles.push(child);
        }
      });
    };
    this.scene.events.once(GameEvents.MIRV_SPLIT, onSplit);
  }

  /** Spawn a bomber threat. */
  private spawnBomberThreat(): void {
    this.bomberSpawned = true;

    const bonusProblem = this.waveProblems[this.problemIndex];
    if (!bonusProblem) return;
    this.problemIndex += 1;

    const payloadCount = this.difficultyConfig.bomberPayloadCount ?? DEFAULT_BOMBER_PAYLOAD_COUNT;
    const payloadProblems: IMathProblem[] = [];
    for (let i = 0; i < payloadCount; i++) {
      if (this.problemIndex < this.waveProblems.length) {
        payloadProblems.push(this.waveProblems[this.problemIndex]);
        this.problemIndex += 1;
        this.threatsSpawned += 1; // Count payload threats
      }
    }

    const bomber = this.spawnBomber(bonusProblem, payloadProblems);
    this.activeBombers.push(bomber);
    this.threatsSpawned += 1;

    // Listen for payload drops to add BomberMissiles to active list
    this.scene.events.once(GameEvents.BOMBER_PAYLOAD_DROPPED, () => {
      this.scene.children.each((child: Phaser.GameObjects.GameObject) => {
        if (child instanceof BomberMissile && !this.activeMissiles.includes(child) && !child.destroyed) {
          this.activeMissiles.push(child);
        }
      });
    });
  }

  /** Spawn a paratrooper plane. */
  private spawnParatrooperPlaneThreat(): void {
    this.planeSpawned = true;
    const plane = this.spawnParatrooperPlane();
    this.activePlanes.push(plane);

    // Listen for paratrooper drops to add them to active list
    this.scene.events.on(GameEvents.PARATROOPER_DROPPED, () => {
      this.scene.children.each((child: Phaser.GameObjects.GameObject) => {
        if (child instanceof Paratrooper && !this.activeParatroopers.includes(child) && !child.destroyed) {
          this.activeParatroopers.push(child);
        }
      });
    });
  }

  /** Create a standard missile entity. */
  private spawnStandardMissile(problem: IMathProblem): StandardMissile {
    const x = SAFE_MARGIN + Math.random() * (CANVAS_WIDTH - 2 * SAFE_MARGIN);
    const speed = BASE_MISSILE_SPEED * this.difficultyConfig.missileSpeedMultiplier;

    // Pick a random non-destroyed city as target
    const aliveCities = this.cities
      .map((c, i) => ({ city: c, index: i }))
      .filter((entry) => !entry.city.destroyed);

    const targetIndex = aliveCities.length > 0
      ? aliveCities[Math.floor(Math.random() * aliveCities.length)].index
      : 0;

    const missile = new StandardMissile(
      this.scene,
      x,
      problem,
      targetIndex,
      speed,
      this.cities,
    );

    // Set spawn Y
    missile.y = PLAY_FIELD_TOP;

    return missile;
  }

  /** Create a bomber entity. */
  private spawnBomber(bonusProblem: IMathProblem, payloadProblems: IMathProblem[]): StrategicBomber {
    const speed = BASE_MISSILE_SPEED * this.difficultyConfig.missileSpeedMultiplier * 1.5;
    const payloadCount = this.difficultyConfig.bomberPayloadCount ?? DEFAULT_BOMBER_PAYLOAD_COUNT;
    const horizontalDir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;

    return new StrategicBomber(
      this.scene,
      bonusProblem,
      payloadProblems,
      this.cities,
      speed,
      payloadCount,
      horizontalDir,
    );
  }

  /** Create a paratrooper plane entity. */
  private spawnParatrooperPlane(): ParatrooperPlane {
    const speed = BASE_MISSILE_SPEED * this.difficultyConfig.missileSpeedMultiplier * 1.2;
    const dropCount = 3;
    const horizontalDir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;

    return new ParatrooperPlane(
      this.scene,
      speed,
      dropCount,
      horizontalDir,
      this.cities,
    );
  }

  /** Create a MIRV missile entity. */
  private spawnMIRV(problem: IMathProblem, childProblems: IMathProblem[]): MIRVMissile {
    const x = SAFE_MARGIN + Math.random() * (CANVAS_WIDTH - 2 * SAFE_MARGIN);
    const speed = BASE_MISSILE_SPEED * this.difficultyConfig.missileSpeedMultiplier;
    const splitPercent = this.difficultyConfig.mirvSplitAltitudePercent ?? DEFAULT_MIRV_SPLIT_PERCENT;
    const childCount = this.difficultyConfig.mirvChildCount ?? DEFAULT_MIRV_CHILD_COUNT;

    const aliveCities = this.cities
      .map((c, i) => ({ city: c, index: i }))
      .filter((entry) => !entry.city.destroyed);

    const targetIndex = aliveCities.length > 0
      ? aliveCities[Math.floor(Math.random() * aliveCities.length)].index
      : 0;

    const mirv = new MIRVMissile(
      this.scene,
      x,
      problem,
      targetIndex,
      speed,
      this.cities,
      splitPercent,
      childCount,
      childProblems,
    );

    mirv.y = PLAY_FIELD_TOP;

    return mirv;
  }

  /** Handle interceptor detonation. */
  private onInterceptorDetonated(payload: { targetThreatId: string; x: number; y: number }): void {
    // Find the target threat
    const missile = this.activeMissiles.find((m) => m.threatId === payload.targetThreatId && !m.destroyed);
    const bomber = this.activeBombers.find((b) => b.threatId === payload.targetThreatId && !b.destroyed);

    let points = 0;

    if (missile) {
      // Determine base points
      if (missile instanceof MIRVMissile && !(missile as MIRVMissile).hasSplit) {
        points = SCORE_VALUES.mirvBeforeSplit;
      } else if (missile.threatType === 'mirv-child') {
        points = SCORE_VALUES.mirvChild;
      } else if (missile.threatType === 'bomber-missile') {
        points = SCORE_VALUES.standardMissile;
      } else {
        points = SCORE_VALUES.standardMissile;
      }

      // Check if city was threatened
      const targetCity = this.cities[missile.targetCityIndex];
      if (targetCity && !targetCity.destroyed) {
        // City save bonus
        this.scoreManager.addPoints(SCORE_VALUES.citySaveBonus);
        targetCity.celebrateSave();
        this.scene.events.emit(GameEvents.CITY_SAVED, {
          cityIndex: missile.targetCityIndex,
          cityName: targetCity.cityName,
        });
      }

      // Intercept the missile
      missile.intercept(false, points);
    } else if (bomber) {
      // Bomber interception
      points = bomber.hasDroppedPayload
        ? SCORE_VALUES.bomberAfterDrop
        : SCORE_VALUES.bomberBeforeDrop;

      bomber.intercept();
    }

    // Record correct tap and increment streak
    this.scoreManager.recordTap(true);
    this.scoreManager.incrementStreak();

    // Add main threat points
    if (points > 0) {
      this.scoreManager.addPoints(points);
    }

    // Create explosion
    const explosion = new Explosion(
      this.scene,
      payload.x,
      payload.y,
      'player',
    );

    // Check chain reactions
    const chainCaught = explosion.checkChainReaction(
      this.activeMissiles.filter((m) => !m.destroyed),
      this.activeParatroopers.filter((p) => !p.destroyed),
    );

    if (chainCaught.length > 0) {
      // Award chain reaction points
      for (let i = 0; i < chainCaught.length; i++) {
        this.scoreManager.addPoints(SCORE_VALUES.chainReactionLink);
        this.scoreManager.addChainLink();
      }

      const chainPayload: ChainReactionPayload = {
        chainLength: chainCaught.length,
        bonusPoints: chainCaught.length * SCORE_VALUES.chainReactionLink,
      };
      this.scene.events.emit(GameEvents.CHAIN_REACTION, chainPayload);

      // Create chain explosions for each caught threat
      for (const caughtId of chainCaught) {
        const caughtMissile = this.activeMissiles.find((m) => m.threatId === caughtId);
        const caughtPara = this.activeParatroopers.find((p) => p.threatId === caughtId);
        const pos = caughtMissile?.getPosition() ?? caughtPara?.getPosition();

        if (pos) {
          new Explosion(this.scene, pos.x, pos.y, 'chain');
        }
      }
    }

    // Advance the answer queue
    this.answerQueue.advance(this.launcher);

    // Update city count for star projection
    const surviving = this.cities.filter((c) => !c.destroyed).length;
    this.scoreManager.setCurrentCities(surviving);

    this.checkWaveComplete();
  }

  /** Handle explosion complete (cleanup). */
  private onExplosionComplete(_payload: { x: number; y: number; type: string }): void {
    // Cleanup hook — no action needed currently
  }

  /** Handle threat destroyed (count resolved). */
  private onThreatDestroyed(): void {
    this.threatsResolved += 1;
    this.checkWaveComplete();
  }

  /** Handle city destroyed. */
  private onCityDestroyed(_payload: CityDestroyedPayload): void {
    const surviving = this.cities.filter((c) => !c.destroyed).length;
    this.scoreManager.setCurrentCities(surviving);

    if (surviving === 0) {
      this.gameOver();
    }
  }

  /** Handle streak milestone. */
  private onStreakMilestone(payload: StreakMilestonePayload): void {
    if (payload.streak >= 5) {
      this.launcher.playStreakGlow();
    }
  }

  /** Check if the wave is complete. */
  private checkWaveComplete(): void {
    if (!this.waveActive) return;

    // Check if all threats have been resolved
    if (this.threatsResolved >= this.totalThreats) {
      this.endWave();
    }
  }

  /** End the current wave. */
  private endWave(): void {
    if (!this.waveActive) return;
    this.waveActive = false;

    // Stop spawn timer
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }

    // Count surviving cities
    const surviving = this.cities.filter((c) => !c.destroyed).length;
    this.scoreManager.setCurrentCities(surviving);

    if (surviving === 0) {
      this.gameOver();
      return;
    }

    const stars = this.scoreManager.calculateStars(surviving);

    const payload: LevelCompletePayload = {
      level: this.difficultyConfig.level,
      stars,
      citiesSurviving: surviving,
      score: this.scoreManager.getScore(),
      accuracy: this.scoreManager.getAccuracy(),
      chainReactions: this.scoreManager.getChainCount(),
      perfectWave: surviving === 6,
    };
    this.scene.events.emit(GameEvents.LEVEL_COMPLETE, payload);

    if (surviving === 6) {
      this.scene.events.emit(GameEvents.PERFECT_WAVE);
    }
  }

  /** Trigger game over when all cities are destroyed. */
  private gameOver(): void {
    if (!this.waveActive) return;
    this.waveActive = false;

    // Stop spawn timer
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }

    const payload: GameOverPayload = {
      level: this.difficultyConfig.level,
      finalScore: this.scoreManager.getScore(),
    };
    this.scene.events.emit(GameEvents.GAME_OVER, payload);
  }
}
