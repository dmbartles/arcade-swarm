/**
 * GameScene — Primary gameplay scene.
 *
 * Owns the game loop orchestration: wires up systems via events, manages
 * scene transitions, and delegates entity logic to Coding Agent 2 systems
 * and math to Coding Agent 3 systems.
 *
 * @see docs/gdds/missile-command-math.md §2 (Game Loop)
 */

import Phaser from 'phaser';
import {
  CANVAS_WIDTH, CITY_X_POSITIONS,
  CITY_ROW_Y,
  TOTAL_CITIES, CITY_NAMES,
  LAUNCHER_X, LAUNCHER_Y,
  QUEUE_STRIP_Y, QUEUE_STRIP_HEIGHT,
  QUEUE_SLOT_0_X, QUEUE_SLOT_Y,
} from '../config/gameConfig';
import { LEVEL_CONFIGS } from '../config/levelConfig';
import { COLOR_BG } from '../config/styleConfig';
import { GameEvents } from '../types/GameEvents';
import type {
  WaveStartedPayload,
  ThreatDestroyedPayload,
  CityHitPayload,
  CityDestroyedPayload,
  LevelCompletePayload,
  GameOverPayload,
  ChainReactionPayload,
  ProblemGeneratedPayload,
} from '../types/GameEvents';
import type { ScoreUpdatedPayload, StreakMilestonePayload } from '../types/IScoreManager';
import type { DifficultySetting } from '../types/IDifficultyConfig';
import HUDSystem from '../systems/HUDSystem';
import EffectsSystem from '../systems/EffectsSystem';
import { DifficultyManager } from '../systems/DifficultyManager';
import { MathEngine } from '../systems/MathEngine';
import { ScoreManager } from '../systems/ScoreManager';
import { WaveManager } from '../systems/WaveManager';
import { Launcher } from '../entities/Launcher';
import { AnswerQueue } from '../entities/AnswerQueue';
import { City } from '../entities/City';

interface GameSceneData {
  level: number;
  difficulty: DifficultySetting;
}

/** Extended threat destroyed payload with position for EffectsSystem. */
interface ThreatDestroyedWithPosition extends ThreatDestroyedPayload {
  x: number;
  y: number;
}

export default class GameScene extends Phaser.Scene {
  private level = 1;
  private difficulty: DifficultySetting = 'normal';
  private hudSystem!: HUDSystem;
  private effectsSystem!: EffectsSystem;
  private citiesRemaining = TOTAL_CITIES;
  private isPaused = false;

  // Cross-agent system references
  private difficultyManager!: DifficultyManager;
  private mathEngine!: MathEngine;
  private scoreManager!: ScoreManager;
  private waveManager!: WaveManager;
  private launcher!: Launcher;
  private answerQueue!: AnswerQueue;
  private cities: City[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData): void {
    this.level = data.level ?? 1;
    this.difficulty = data.difficulty ?? 'normal';
    this.citiesRemaining = TOTAL_CITIES;
    this.isPaused = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLOR_BG);

    // ── Initialise cross-agent systems (guarded imports) ──────────────────
    this.initCrossAgentSystems();

    // ── Initialise own systems ────────────────────────────────────────────
    this.hudSystem = new HUDSystem(this);
    this.effectsSystem = new EffectsSystem(this);

    // ── Create city placeholders ──────────────────────────────────────────
    this.createCityPlaceholders();

    // ── Create playfield visual elements ──────────────────────────────────
    this.createPlayfieldElements();

    // ── Setup event listeners ─────────────────────────────────────────────
    this.setupEventListeners();

    // ── Start wave ────────────────────────────────────────────────────────
    this.startWave();
  }

  update(time: number, delta: number): void {
    if (this.isPaused) return;

    this.waveManager.update(time, delta);
    this.hudSystem.update();
    this.effectsSystem.update();
  }

  /**
   * Initialise cross-agent systems: DifficultyManager, MathEngine,
   * ScoreManager, Launcher, AnswerQueue, City entities, and WaveManager.
   */
  private initCrossAgentSystems(): void {
    // DifficultyManager emits DIFFICULTY_CHANGED immediately on construction
    this.difficultyManager = new DifficultyManager(this, this.level, this.difficulty);

    // MathEngine listens for WAVE_STARTED → emits PROBLEM_GENERATED
    this.mathEngine = new MathEngine(this);

    // ScoreManager tracks points, streaks, accuracy
    this.scoreManager = new ScoreManager(this);

    // Create City entities at ground level
    this.cities = [];
    for (let i = 0; i < TOTAL_CITIES; i++) {
      const city = new City(
        this,
        i,
        CITY_NAMES[i],
        CITY_X_POSITIONS[i],
        CITY_ROW_Y,
      );
      this.cities.push(city);
    }

    // Launcher — bottom-center answer-queue turret
    this.launcher = new Launcher(this, LAUNCHER_X, LAUNCHER_Y);

    // AnswerQueue — visual strip below play field
    this.answerQueue = new AnswerQueue(this, QUEUE_SLOT_0_X, QUEUE_SLOT_Y);

    // WaveManager — orchestrates spawning and intercept handling
    const diffConfig = this.difficultyManager.getConfig();
    this.waveManager = new WaveManager(
      this,
      diffConfig,
      this.scoreManager,
      this.answerQueue,
      this.launcher,
      this.cities,
    );
  }

  /** Add city name labels beneath City entities (cities created in initCrossAgentSystems). */
  private createCityPlaceholders(): void {
    for (let i = 0; i < TOTAL_CITIES; i++) {
      const city = this.cities[i];
      // City name label positioned just below the city entity
      this.add.text(city.x, city.y + 36, CITY_NAMES[i], {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#E8F4E8',
        align: 'center',
      }).setOrigin(0.5, 0).setDepth(5);
    }
  }

  /** Create the queue strip background and ground line visual elements. */
  private createPlayfieldElements(): void {
    // Queue strip background
    const queueBg = this.add.graphics();
    queueBg.fillStyle(0x0d1a0d, 1);
    queueBg.fillRect(0, QUEUE_STRIP_Y, CANVAS_WIDTH, QUEUE_STRIP_HEIGHT);
    queueBg.setDepth(4);

    // Ground line just above city row for visual grounding
    const groundLine = this.add.graphics();
    groundLine.lineStyle(2, 0x1a3a1a, 1);
    groundLine.lineBetween(0, CITY_ROW_Y + 24, CANVAS_WIDTH, CITY_ROW_Y + 24);
    groundLine.setDepth(3);
  }

  /** Wire up all event listeners. */
  private setupEventListeners(): void {
    // Math engine events (from Agent 3)
    this.events.on(GameEvents.PROBLEM_GENERATED, (payload: ProblemGeneratedPayload) => {
      this.onProblemGenerated(payload);
    });

    // Threat events (from Agent 2)
    this.events.on(GameEvents.THREAT_DESTROYED, (payload: ThreatDestroyedWithPosition) => {
      this.onThreatDestroyed(payload);
    });

    // City events (from Agent 2)
    this.events.on(GameEvents.CITY_HIT, (payload: CityHitPayload) => {
      this.onCityHit(payload);
    });
    this.events.on(GameEvents.CITY_DESTROYED, (payload: CityDestroyedPayload) => {
      this.onCityDestroyed(payload);
    });

    // Score events (from Agent 2)
    this.events.on(GameEvents.SCORE_UPDATED, (payload: ScoreUpdatedPayload) => {
      this.onScoreUpdated(payload);
    });
    this.events.on(GameEvents.STREAK_MILESTONE, (payload: StreakMilestonePayload) => {
      this.onStreakMilestone(payload);
    });
    this.events.on(GameEvents.CHAIN_REACTION, (payload: ChainReactionPayload) => {
      this.onChainReaction(payload);
    });

    // Level flow events
    this.events.on(GameEvents.LEVEL_COMPLETE, (payload: LevelCompletePayload) => {
      this.onLevelComplete(payload);
    });
    this.events.on(GameEvents.GAME_OVER, (payload: GameOverPayload) => {
      this.onGameOver(payload);
    });

    // Pause/resume
    this.events.on(GameEvents.GAME_PAUSED, () => {
      this.onGamePaused();
    });
    this.events.on(GameEvents.GAME_RESUMED, () => {
      this.onGameResumed();
    });

    // Sound toggle
    this.events.on(GameEvents.SOUND_TOGGLED, () => {
      this.onSoundToggled();
    });

    // Clean up all listeners on shutdown to prevent leaks
    this.events.once('shutdown', () => {
      this.events.off(GameEvents.PROBLEM_GENERATED);
      this.events.off(GameEvents.THREAT_DESTROYED);
      this.events.off(GameEvents.CITY_HIT);
      this.events.off(GameEvents.CITY_DESTROYED);
      this.events.off(GameEvents.SCORE_UPDATED);
      this.events.off(GameEvents.STREAK_MILESTONE);
      this.events.off(GameEvents.CHAIN_REACTION);
      this.events.off(GameEvents.LEVEL_COMPLETE);
      this.events.off(GameEvents.GAME_OVER);
      this.events.off(GameEvents.GAME_PAUSED);
      this.events.off(GameEvents.GAME_RESUMED);
      this.events.off(GameEvents.SOUND_TOGGLED);
    });
  }

  /** Emit WAVE_STARTED to trigger math generation and spawning. */
  private startWave(): void {
    const levelConfig = LEVEL_CONFIGS[this.level - 1];
    const payload: WaveStartedPayload = {
      level: this.level,
      totalThreats: levelConfig?.problemsInWave ?? 10,
    };
    this.events.emit(GameEvents.WAVE_STARTED, payload);
  }

  // ── Event Handlers ───────────────────────────────────────────────────────

  /** Handle problem generation — route to WaveManager / display. */
  private onProblemGenerated(_payload: ProblemGeneratedPayload): void {
    // Problems are consumed by WaveManager (Agent 2) and AnswerQueue (Agent 2).
    // GameScene's role is to ensure the event flows through the event bus.
  }

  /** Handle threat destroyed — effects are auto-triggered via EffectsSystem listener. */
  private onThreatDestroyed(payload: ThreatDestroyedWithPosition): void {
    // Score pop at explosion position
    if (payload.x !== undefined && payload.y !== undefined && payload.points > 0) {
      this.effectsSystem.showScorePop(payload.x, payload.y, `+${payload.points}`);
    }
  }

  /** Handle city hit — track remaining cities. */
  private onCityHit(payload: CityHitPayload): void {
    if (payload.remainingHp <= 0) {
      // City destruction is handled by the CITY_DESTROYED event
    }
  }

  /** Handle city destroyed — check for game over. */
  private onCityDestroyed(_payload: CityDestroyedPayload): void {
    this.citiesRemaining--;

    if (this.citiesRemaining <= 0) {
      // All cities destroyed — emit game over
      const gameOverPayload: GameOverPayload = {
        level: this.level,
        finalScore: 0, // ScoreManager (Agent 2) will provide actual score
      };
      this.events.emit(GameEvents.GAME_OVER, gameOverPayload);
    }
  }

  /** Handle score updated — HUD auto-updates via its own listener. */
  private onScoreUpdated(_payload: ScoreUpdatedPayload): void {
    // HUDSystem auto-handles this via its own event listener
  }

  /** Handle streak milestone — HUD and effects auto-handle. */
  private onStreakMilestone(_payload: StreakMilestonePayload): void {
    // HUDSystem and EffectsSystem auto-handle via their own event listeners
  }

  /** Handle chain reaction — effects auto-handle. */
  private onChainReaction(_payload: ChainReactionPayload): void {
    // HUDSystem and EffectsSystem auto-handle via their own event listeners
  }

  /** Handle level complete — transition to LevelCompleteScene. */
  private onLevelComplete(payload: LevelCompletePayload): void {
    // Persist progress
    try {
      const nextLevel = this.level + 1;
      if (nextLevel <= 10) {
        localStorage.setItem('mcm_level', String(nextLevel));
      }
    } catch {
      // localStorage may be unavailable
    }

    this.scene.start('LevelCompleteScene', {
      ...payload,
      difficulty: this.difficulty,
    });
  }

  /** Handle game over — transition to GameOverScene. */
  private onGameOver(payload: GameOverPayload): void {
    this.scene.start('GameOverScene', {
      ...payload,
      difficulty: this.difficulty,
    });
  }

  /** Handle pause. */
  private onGamePaused(): void {
    this.isPaused = true;
    if (this.physics.world) {
      this.physics.pause();
    }
    this.time.paused = true;
  }

  /** Handle resume. */
  private onGameResumed(): void {
    this.isPaused = false;
    if (this.physics.world) {
      this.physics.resume();
    }
    this.time.paused = false;
  }

  /** Handle sound toggle — persist preference. */
  private onSoundToggled(): void {
    try {
      const current = localStorage.getItem('mcm_sound');
      const newValue = current === 'off' ? 'on' : 'off';
      localStorage.setItem('mcm_sound', newValue);
      this.sound.mute = newValue === 'off';
    } catch {
      // localStorage may be unavailable
    }
  }
}
