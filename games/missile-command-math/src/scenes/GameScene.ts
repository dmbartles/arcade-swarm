/**
 * GameScene — Core gameplay orchestrator scene.
 *
 * Owns the visual rendering layer (CRT frame, playfield, HUD, ground line,
 * pause/sound buttons) and coordinates between systems via the Phaser event bus.
 *
 * This scene is an orchestrator only — no scoring logic, no math generation,
 * no entity spawning logic. Those responsibilities belong to:
 *   - MathEngine  (Math agent)     — generates problems
 *   - WaveManager (Gameplay agent) — spawns and manages threats
 *   - ScoreManager(Gameplay agent) — tracks score and streaks
 *
 * Entity creation (Bomb, Launcher, Building, etc.) is delegated entirely to
 * WaveManager so GameScene never calls `new Bomb()` directly.
 *
 * @see docs/build-plans/missile-command-math-engine.md §2.12
 * @see docs/gdds/missile-command-math.md §Game Loop
 */

import Phaser from 'phaser';
import { SPRITE_KEYS, ANIM_KEYS } from '../assets';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYFIELD_X,
  LAUNCHER_LEFT_X,
  LAUNCHER_CENTER_X,
  LAUNCHER_RIGHT_X,
  LAUNCHER_Y,
  HUD_BAR_Y,
  PAUSE_BUTTON_X,
  PAUSE_BUTTON_Y,
  SOUND_BUTTON_X,
  SOUND_BUTTON_Y,
  SCORE_POP_DURATION_MS,
  SCORE_POP_RISE_PX,
  SCORE_POP_FADE_START_MS,
  STREAK_BADGE_SLIDE_IN_MS,
  STREAK_BADGE_HOLD_MS,
  STREAK_BADGE_SLIDE_OUT_MS,
  FIREWORK_STAGGER_MS,
  CITY_REBUILD_DURATION_MS,
  POPULATION_PER_BUILDING,
  COLOR_HUD_TEXT,
  COLOR_EXPLOSION_OUTER,
  COLOR_CITY_CELEBRATE,
} from '../config/gameConfig';
import { LEVEL_CONFIGS } from '../config/difficultyConfig';
import { GameEvents } from '../types/GameEvents';
import type {
  ThreatSpawnedPayload,
  ThreatDestroyedPayload,
  CityHitPayload,
  CityDestroyedPayload,
  CitySavedPayload,
  LevelCompletePayload,
  GameOverPayload,
} from '../types/GameEvents';
import type {
  ScoreUpdatedPayload,
  StreakMilestonePayload,
} from '../types/IScoreManager';

// ── Text style constants ──────────────────────────────────────────────────────

const HUD_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '18px',
  fontStyle: 'bold',
  color: COLOR_HUD_TEXT,
};

const SCORE_POP_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '26px',
  fontStyle: 'bold',
  color: COLOR_EXPLOSION_OUTER,
};

const STREAK_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '20px',
  fontStyle: 'bold',
  color: '#FFFFFF',
};

const EQUATION_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '22px',
  fontStyle: 'bold',
  color: '#E8701A',
};

// ── Firework positions (within playfield) ─────────────────────────────────────
const FIREWORK_X_POSITIONS = [60, 150, 230, 540, 630, 720];
const FIREWORK_Y = 360;

export class GameScene extends Phaser.Scene {
  // ── Scene init data ──
  private level      = 1;
  private isTraining = false;

  // ── HUD text refs ──
  private hudPopulation!: Phaser.GameObjects.Text;
  private hudMissiles!:   Phaser.GameObjects.Text;
  private hudLevel!:      Phaser.GameObjects.Text;
  private hudScore!:      Phaser.GameObjects.Text;

  // ── Pause / Sound button refs ──
  private pauseBtn!:  Phaser.GameObjects.Rectangle;
  private soundBtn!:  Phaser.GameObjects.Rectangle;

  // ── Streak badge ──
  private streakBadgeBg!:   Phaser.GameObjects.Rectangle;
  private streakBadgeText!: Phaser.GameObjects.Text;
  private streakBadgeGroup!: Phaser.GameObjects.Container;

  // ── State ──
  private currentScore        = 0;
  private survivingBuildings  = 6;
  private isPaused            = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  // ── Phaser lifecycle ──────────────────────────────────────────────────────

  init(data: { level: number; isTraining?: boolean }): void {
    this.level      = data?.level ?? 1;
    this.isTraining = data?.isTraining ?? false;

    // Reset per-scene state
    this.currentScore       = 0;
    this.survivingBuildings = 6;
    this.isPaused           = false;
  }

  create(): void {
    this.buildPlayfield();
    this.buildHUD();
    this.buildControlButtons();
    this.buildStreakBadge();
    this.registerEventListeners();
  }

  update(_time: number, _delta: number): void {
    // Intentionally lean — entity update loops are owned by WaveManager (Gameplay agent).
    // GameScene.update() is reserved for any future scene-level per-frame work.
  }

  // ── Visual layer builders ─────────────────────────────────────────────────

  /**
   * Build the playfield: background colour, CRT frame, ground line.
   * No entity placement here — WaveManager handles that via events.
   */
  private buildPlayfield(): void {
    // Canvas background (lavender surround outside CRT)
    this.add.rectangle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      0xC8B8DC
    );

    // Playfield interior (pale lavender inside CRT)
    this.add.rectangle(
      PLAYFIELD_X + 380,
      PLAYFIELD_X + 240,
      760,
      480,
      0xE8E0F0
    );

    // CRT bezel
    this.add.image(20, 20, SPRITE_KEYS.CRT_FRAME).setOrigin(0, 0);

    // Ground line
    this.add.image(20, 476, SPRITE_KEYS.GROUND_LINE).setOrigin(0, 0);

    // HUD bar (bottom)
    this.add.image(0, HUD_BAR_Y, SPRITE_KEYS.HUD_BAR).setOrigin(0, 0);
  }

  /** Create the HUD bar text nodes. */
  private buildHUD(): void {
    const hudTextY = HUD_BAR_Y + 11;

    // Population
    this.hudPopulation = this.add.text(20, hudTextY, 'POPULATION  0', HUD_STYLE);

    // Separator 1
    this.add.text(305, hudTextY, '|', HUD_STYLE);

    // Missiles remaining
    this.hudMissiles = this.add.text(320, hudTextY, 'MISSILES  —', HUD_STYLE);

    // Separator 2
    this.add.text(525, hudTextY, '|', HUD_STYLE);

    // Level
    this.hudLevel = this.add.text(540, hudTextY, `LEVEL  ${this.level}`, HUD_STYLE);

    // Score (far right)
    this.hudScore = this.add.text(670, hudTextY, 'SCORE  0', HUD_STYLE);

    // Initial population render
    this.updatePopulation(this.survivingBuildings);
  }

  /** Create pause and sound toggle buttons. */
  private buildControlButtons(): void {
    // Pause button
    this.pauseBtn = this.add.rectangle(PAUSE_BUTTON_X, PAUSE_BUTTON_Y, 32, 32, 0xC8952A, 0.2)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1.5, 0xC8952A, 0.7);

    this.add.text(PAUSE_BUTTON_X, PAUSE_BUTTON_Y, '⏸', {
      fontSize: '16px',
      color: '#C8952A',
    }).setOrigin(0.5, 0.5);

    this.pauseBtn.on('pointerdown', () => this.onPausePressed());

    // Sound toggle button
    const soundEnabled = (this.registry.get('soundEnabled') as boolean) ?? true;
    this.soundBtn = this.add.rectangle(SOUND_BUTTON_X, SOUND_BUTTON_Y, 32, 32, 0xC8952A, 0.2)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1.5, 0xC8952A, 0.7);

    this.add.text(SOUND_BUTTON_X, SOUND_BUTTON_Y, soundEnabled ? '🔊' : '🔇', {
      fontSize: '14px',
      color: '#C8952A',
    }).setOrigin(0.5, 0.5);

    this.soundBtn.on('pointerdown', () => this.onSoundPressed());
  }

  /** Create the streak badge container (hidden initially, slides in on milestone). */
  private buildStreakBadge(): void {
    // Position: badge starts off-screen to the right
    const BADGE_W  = 220;
    const BADGE_H  = 36;
    const BADGE_Y  = 80;
    const BADGE_X_HIDDEN = CANVAS_WIDTH + BADGE_W;

    this.streakBadgeBg = this.add.rectangle(0, 0, BADGE_W, BADGE_H, 0xC8952A, 1)
      .setStrokeStyle(2, 0xF0C030, 1);

    this.streakBadgeText = this.add.text(0, 0, '', STREAK_STYLE).setOrigin(0.5, 0.5);

    this.streakBadgeGroup = this.add.container(BADGE_X_HIDDEN, BADGE_Y, [
      this.streakBadgeBg,
      this.streakBadgeText,
    ]);
  }

  // ── Event registration ────────────────────────────────────────────────────

  /**
   * Wire all event listeners for inter-system communication.
   * All event names come from GameEvents constants — never raw strings.
   */
  private registerEventListeners(): void {
    // Score updates → refresh HUD
    this.events.on(GameEvents.SCORE_UPDATED,    this.onScoreUpdated,    this);

    // Streak milestone → show badge
    this.events.on(GameEvents.STREAK_MILESTONE, this.onStreakMilestone,  this);

    // Threats
    this.events.on(GameEvents.THREAT_SPAWNED,   this.onThreatSpawned,   this);
    this.events.on(GameEvents.THREAT_DESTROYED, this.onThreatDestroyed,  this);

    // Interceptor
    this.events.on(GameEvents.INTERCEPTOR_FIRED,      this.onInterceptorFired,    this);
    this.events.on(GameEvents.INTERCEPTOR_DETONATED,  this.onInterceptorDetonated, this);

    // City events
    this.events.on(GameEvents.CITY_HIT,       this.onCityHit,       this);
    this.events.on(GameEvents.CITY_DESTROYED, this.onCityDestroyed, this);
    this.events.on(GameEvents.CITY_SAVED,     this.onCitySaved,     this);
    this.events.on(GameEvents.CITY_REBUILT,   this.onCityRebuilt,   this);

    // Level lifecycle
    this.events.on(GameEvents.LEVEL_COMPLETE, this.onLevelComplete, this);
    this.events.on(GameEvents.GAME_OVER,      this.onGameOver,      this);
    this.events.on(GameEvents.WAVE_STARTED,   this.onWaveStarted,   this);

    // Wrong tap
    this.events.on(GameEvents.WRONG_TAP, this.onWrongTap, this);

    // Pause/resume from PauseScene (via global game event emitter)
    this.game.events.on(GameEvents.GAME_RESUMED, this.onGameResumed, this);

    // Math engine events
    this.events.on(GameEvents.PROBLEM_GENERATED, this.onProblemGenerated, this);

    // Cleanup event listeners when scene shuts down
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    this.events.once(Phaser.Scenes.Events.DESTROY,  this.cleanup, this);
  }

  /** Remove all listeners to prevent memory leaks on scene restart. */
  private cleanup(): void {
    this.game.events.off(GameEvents.GAME_RESUMED, this.onGameResumed, this);
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  /**
   * SCORE_UPDATED → refresh score display in HUD.
   */
  private onScoreUpdated(payload: ScoreUpdatedPayload): void {
    this.currentScore = payload.score;
    this.hudScore.setText(`SCORE  ${payload.score.toLocaleString()}`);
  }

  /**
   * STREAK_MILESTONE → slide in the streak badge with the milestone label.
   */
  private onStreakMilestone(payload: StreakMilestonePayload): void {
    this.showStreakBadge(payload.label);
  }

  /**
   * THREAT_SPAWNED → update missiles remaining in HUD.
   * (Actual entity creation is WaveManager's responsibility.)
   */
  private onThreatSpawned(_payload: ThreatSpawnedPayload): void {
    // HUD update may be handled here once WaveManager provides missile count
  }

  /**
   * THREAT_DESTROYED → spawn ScorePop at position, play explosion anim.
   */
  private onThreatDestroyed(payload: ThreatDestroyedPayload & { x?: number; y?: number }): void {
    if (payload.x !== undefined && payload.y !== undefined && payload.points > 0) {
      this.spawnScorePop(payload.points, payload.x, payload.y);
    }
  }

  /**
   * INTERCEPTOR_FIRED — visual effect hook (Gameplay agent handles physics).
   */
  private onInterceptorFired(_payload: { launcherPosition: 'left' | 'center' | 'right'; targetX: number; targetY: number }): void {
    // Visual response (e.g. nozzle tween) is owned by Launcher entity (Gameplay agent).
  }

  /**
   * INTERCEPTOR_DETONATED → play explosion sprite at detonation position.
   */
  private onInterceptorDetonated(payload: { x: number; y: number; solvedEquation: string }): void {
    const explosion = this.add.sprite(payload.x, payload.y, SPRITE_KEYS.EXPLOSION)
      .setScale(1.0);

    explosion.play(ANIM_KEYS.EXPLOSION_BURST);

    // Overlay solved equation text, fades out at EXPLOSION_EQUATION_FADE_MS
    const eqText = this.add.text(payload.x + 70, payload.y, payload.solvedEquation, EQUATION_STYLE)
      .setOrigin(0, 0.5);

    this.tweens.add({
      targets: eqText,
      alpha:   { from: 1, to: 0 },
      delay:   400,
      duration: 200,
      onComplete: () => eqText.destroy(),
    });

    // Scale explosion
    this.tweens.add({
      targets:  explosion,
      scaleX:   { from: 1.0, to: 1.4 },
      scaleY:   { from: 1.0, to: 1.4 },
      duration: 480,
      ease:     'Sine.easeOut',
    });

    explosion.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => explosion.destroy());
  }

  /**
   * CITY_HIT → visual hit feedback (entity handles its own damage animation).
   */
  private onCityHit(_payload: CityHitPayload): void {
    // Building entity (Gameplay agent) plays BUILDING_HIT anim on itself.
  }

  /**
   * CITY_DESTROYED → decrement surviving city count, update population HUD.
   */
  private onCityDestroyed(_payload: CityDestroyedPayload): void {
    this.survivingBuildings = Math.max(0, this.survivingBuildings - 1);
    this.updatePopulation(this.survivingBuildings);
  }

  /**
   * CITY_SAVED → gold flash tween on any surviving building near the intercept.
   * (The Launcher entity triggers the specific building flash via its own reference.)
   */
  private onCitySaved(_payload: CitySavedPayload): void {
    // Building entity applies its own gold-flash tween when it receives CITY_SAVED.
  }

  /** CITY_REBUILT → increment surviving city count (rebuild between levels). */
  private onCityRebuilt(_payload: unknown): void {
    this.survivingBuildings = Math.min(6, this.survivingBuildings + 1);
    this.updatePopulation(this.survivingBuildings);
  }

  /**
   * LEVEL_COMPLETE → play fireworks then transition to LevelCompleteScene.
   */
  private onLevelComplete(payload: LevelCompletePayload): void {
    this.spawnLevelCompleteFireworks();
    this.time.delayedCall(
      FIREWORK_X_POSITIONS.length * FIREWORK_STAGGER_MS + 500,
      () => {
        this.scene.start('LevelCompleteScene', payload);
      }
    );
  }

  /**
   * GAME_OVER → transition to GameOverScene.
   */
  private onGameOver(payload: GameOverPayload): void {
    this.time.delayedCall(600, () => {
      this.scene.start('GameOverScene', payload);
    });
  }

  /** WAVE_STARTED → update level display. */
  private onWaveStarted(payload: { level: number; totalThreats: number }): void {
    this.updateLevelDisplay(payload.level);
    this.updateMissilesRemaining(payload.totalThreats);
  }

  /**
   * WRONG_TAP → play LAUNCHER_WRONG_FLASH on the nearest launcher.
   * Launcher entity handles this directly; GameScene logs it for accessibility.
   */
  private onWrongTap(): void {
    // Launcher entity plays wrong-flash anim; this hook is available for
    // future accessibility additions (e.g. screen-reader announcements).
  }

  /**
   * GAME_PAUSED (from pause button) → launch PauseScene overlay, freeze physics.
   */
  private onGamePaused(): void {
    if (this.isPaused) return;
    this.isPaused = true;
    this.physics.pause();
    this.scene.launch('PauseScene');
  }

  /**
   * GAME_RESUMED (from PauseScene via game.events) → resume physics.
   */
  private onGameResumed(): void {
    this.isPaused = false;
    this.physics.resume();
  }

  /**
   * PROBLEM_GENERATED — update HUD missiles remaining based on wave size.
   */
  private onProblemGenerated(payload: { problems: unknown[] }): void {
    if (Array.isArray(payload?.problems)) {
      this.updateMissilesRemaining(payload.problems.length);
    }
  }

  // ── Input handlers ────────────────────────────────────────────────────────

  private onPausePressed(): void {
    this.events.emit(GameEvents.GAME_PAUSED);
    this.onGamePaused();
  }

  private onSoundPressed(): void {
    const current = (this.registry.get('soundEnabled') as boolean) ?? true;
    const next = !current;
    this.registry.set('soundEnabled', next);
    this.events.emit(GameEvents.SOUND_TOGGLED, { enabled: next });
  }

  // ── Visual effects ────────────────────────────────────────────────────────

  /**
   * Spawn a floating score pop text at (x, y).
   *
   * Tweens: y − SCORE_POP_RISE_PX over SCORE_POP_DURATION_MS,
   * opacity 1→0 over last (SCORE_POP_DURATION_MS − SCORE_POP_FADE_START_MS)ms,
   * easing: Sine.easeOut.
   */
  private spawnScorePop(value: number, x: number, y: number): void {
    const prefix  = value > 0 ? '+' : '';
    const popText = this.add.text(x, y, `${prefix}${value}`, SCORE_POP_STYLE)
      .setOrigin(0.5, 1)
      .setDepth(100);

    this.tweens.add({
      targets:  popText,
      y:        y - SCORE_POP_RISE_PX,
      duration: SCORE_POP_DURATION_MS,
      ease:     'Sine.easeOut',
    });

    this.tweens.add({
      targets:  popText,
      alpha:    { from: 1, to: 0 },
      delay:    SCORE_POP_FADE_START_MS,
      duration: SCORE_POP_DURATION_MS - SCORE_POP_FADE_START_MS,
      onComplete: () => popText.destroy(),
    });
  }

  /**
   * Show the streak badge sliding in from the right edge.
   *
   * Slide in 200px over STREAK_BADGE_SLIDE_IN_MS →
   * hold STREAK_BADGE_HOLD_MS →
   * slide out STREAK_BADGE_SLIDE_OUT_MS.
   */
  private showStreakBadge(label: string): void {
    const BADGE_W      = 220;
    const BADGE_Y      = 80;
    const TARGET_X     = CANVAS_WIDTH - BADGE_W / 2 - 10;
    const OFFSCREEN_X  = CANVAS_WIDTH + BADGE_W;

    this.streakBadgeText.setText(label);
    this.streakBadgeGroup.setPosition(OFFSCREEN_X, BADGE_Y);
    this.tweens.killTweensOf(this.streakBadgeGroup);

    this.tweens.add({
      targets:  this.streakBadgeGroup,
      x:        TARGET_X,
      duration: STREAK_BADGE_SLIDE_IN_MS,
      ease:     'Sine.easeOut',
      onComplete: () => {
        this.time.delayedCall(STREAK_BADGE_HOLD_MS, () => {
          this.tweens.add({
            targets:  this.streakBadgeGroup,
            x:        OFFSCREEN_X,
            duration: STREAK_BADGE_SLIDE_OUT_MS,
            ease:     'Sine.easeIn',
          });
        });
      },
    });
  }

  /**
   * Spawn firework_burst sprites above city positions, staggered.
   */
  private spawnLevelCompleteFireworks(): void {
    FIREWORK_X_POSITIONS.forEach((xPos, idx) => {
      this.time.delayedCall(idx * FIREWORK_STAGGER_MS, () => {
        const fw = this.add.sprite(xPos, FIREWORK_Y, SPRITE_KEYS.FIREWORK_BURST)
          .setDepth(50);
        fw.play(ANIM_KEYS.FIREWORK_POP);
        fw.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => fw.destroy());
      });
    });
  }

  /**
   * Play rebuild crane animation over building cluster centres.
   * Called between-level transitions (also used by LevelCompleteScene).
   */
  private playCityRebuild(): void {
    const cranePositions = [140, 640];
    const cranes: Phaser.GameObjects.Sprite[] = [];

    for (const cx of cranePositions) {
      const crane = this.add.sprite(cx, 370, SPRITE_KEYS.REBUILD_CRANE).setDepth(40);
      crane.play(ANIM_KEYS.REBUILD_CRANE_LIFT);
      cranes.push(crane);
    }

    this.time.delayedCall(CITY_REBUILD_DURATION_MS, () => {
      cranes.forEach(c => c.destroy());
    });
  }

  // ── HUD helpers ───────────────────────────────────────────────────────────

  /**
   * Update population counter.
   * Formula: survivingBuildings × POPULATION_PER_BUILDING (cosmetic only).
   */
  private updatePopulation(survivingBuildings: number): void {
    const population = survivingBuildings * POPULATION_PER_BUILDING;
    this.hudPopulation.setText(
      `POPULATION  ${population.toLocaleString()}`
    );
  }

  /** Update missiles-remaining text. */
  private updateMissilesRemaining(count: number): void {
    this.hudMissiles.setText(`MISSILES  ${count}`);
  }

  /** Update the level display text. */
  private updateLevelDisplay(level: number): void {
    const levelCfg = LEVEL_CONFIGS[level];
    const label = levelCfg ? `LEVEL  ${level}` : `LEVEL  ${level}`;
    this.hudLevel.setText(label);
  }

  /**
   * Apply a brief gold tint to a display object (city-save celebration).
   * @param target — The game object to tint.
   */
  private applyGoldFlash(target: Phaser.GameObjects.Components.Tint): void {
    (target as unknown as Phaser.GameObjects.Image).setTint(COLOR_CITY_CELEBRATE);
    this.time.delayedCall(1000, () => {
      (target as unknown as Phaser.GameObjects.Image).clearTint();
    });
  }

  /** Expose applyGoldFlash publicly so Building entity can call it via GameScene ref. */
  public triggerCityFlash(target: Phaser.GameObjects.Components.Tint): void {
    this.applyGoldFlash(target);
  }
}
