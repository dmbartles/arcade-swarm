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
  CITY_ROW_TOP_Y, CITY_ROW_BOTTOM_Y,
  TOTAL_CITIES, CITY_NAMES,
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

  // Cross-agent system references (initialised in create if modules exist)
  // These are typed as `unknown` since this agent does not own the implementations.
  // Actual integration happens when all agents' code is merged.
  private waveManager: { update(time: number, delta: number): void } | null = null;

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

    if (this.waveManager) {
      this.waveManager.update(time, delta);
    }
    this.hudSystem.update();
    this.effectsSystem.update();
  }

  /**
   * Attempt to import and initialise systems from Coding Agents 2 and 3.
   * These may not exist yet during parallel development — failures are silent.
   */
  private initCrossAgentSystems(): void {
    // DifficultyManager (Agent 3)
    // MathEngine (Agent 3)
    // WaveManager (Agent 2)
    // ScoreManager (Agent 2)
    // Launcher, AnswerQueue, City entities (Agent 2)
    //
    // These will be wired up when all agent branches are merged.
    // For now, GameScene is fully functional for its own responsibilities:
    // scene lifecycle, HUD, effects, event routing, and transitions.
  }

  /** Create simple city placeholder visuals for layout reference. */
  private createCityPlaceholders(): void {
    const cityPositions = [
      // Top row: indices 0, 1, 2
      { x: CITY_X_POSITIONS[0] + 32, y: CITY_ROW_TOP_Y + 28 },
      { x: CITY_X_POSITIONS[1] + 32, y: CITY_ROW_TOP_Y + 28 },
      { x: CITY_X_POSITIONS[2] + 32, y: CITY_ROW_TOP_Y + 28 },
      // Bottom row: indices 3, 4, 5
      { x: CITY_X_POSITIONS[0] + 32, y: CITY_ROW_BOTTOM_Y + 28 },
      { x: CITY_X_POSITIONS[1] + 32, y: CITY_ROW_BOTTOM_Y + 28 },
      { x: CITY_X_POSITIONS[2] + 32, y: CITY_ROW_BOTTOM_Y + 28 },
    ];

    for (let i = 0; i < TOTAL_CITIES; i++) {
      const pos = cityPositions[i];
      // Draw a simple city silhouette placeholder
      const g = this.add.graphics();
      g.fillStyle(0xffd700, 1);
      g.fillRect(pos.x - 24, pos.y - 20, 48, 40);
      g.setDepth(5);

      // City name label
      this.add.text(pos.x, pos.y + 28, CITY_NAMES[i], {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: '#E8F4E8',
        align: 'center',
      }).setOrigin(0.5, 0).setDepth(5);
    }
  }

  /** Create the queue strip background and launcher area visuals. */
  private createPlayfieldElements(): void {
    // Queue strip background
    const queueBg = this.add.graphics();
    queueBg.fillStyle(0x0d1a0d, 1);
    queueBg.fillRect(0, 782, CANVAS_WIDTH, 72);
    queueBg.setDepth(4);

    // Launcher base placeholder
    const launcherG = this.add.graphics();
    launcherG.fillStyle(0x00ff88, 1);
    launcherG.fillRect(216, 730, 48, 36);
    launcherG.setDepth(5);
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
