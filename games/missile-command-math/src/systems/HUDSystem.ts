/**
 * HUDSystem — Manages the HUD bar and in-game overlays.
 *
 * Renders score, star rating, pause/sound buttons, badge overlays, and
 * city one-liner notifications. Created by GameScene; updates each frame.
 *
 * @see docs/style-guides/missile-command-math.md §UI Layout
 */

import Phaser from 'phaser';
import {
  CANVAS_WIDTH, HUD_HEIGHT, SAFE_MARGIN,
  MIN_TOUCH_TARGET, CITY_ONELINER_DURATION_MS,
  BADGE_HOLD_MS, BADGE_INTRO_MS, CANVAS_HEIGHT,
} from '../config/gameConfig';
import {
  COLOR_BG_HUD, COLOR_BADGE_BG,
  TEXT_HUD_SCORE, TEXT_HUD_STARS, TEXT_BADGE,
  TEXT_CITY_ONELINER, FONT_FAMILY,
} from '../config/styleConfig';
import { GameEvents } from '../types/GameEvents';
import type { ScoreUpdatedPayload, StreakMilestonePayload } from '../types/IScoreManager';
import type {
  StarRatingUpdatedPayload,
  CitySavedPayload,
  CityDestroyedPayload,
  ChainReactionPayload,
} from '../types/GameEvents';

export default class HUDSystem {
  private scene: Phaser.Scene;
  private scoreText!: Phaser.GameObjects.Text;
  private starsText!: Phaser.GameObjects.Text;
  private oneLinerText!: Phaser.GameObjects.Text;
  private oneLinerTimer?: Phaser.Time.TimerEvent;
  private pauseOverlay?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createHUDBar();
    this.createButtons();
    this.createOneLiner();
    this.setupEventListeners();
  }

  /** Create the HUD bar background and text labels. */
  private createHUDBar(): void {
    const bg = this.scene.add.graphics();
    bg.fillStyle(COLOR_BG_HUD, 1);
    bg.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);
    bg.setDepth(100);

    this.scoreText = this.scene.add.text(
      SAFE_MARGIN,
      8,
      'SCORE: 0',
      { ...TEXT_HUD_SCORE },
    ).setDepth(101);

    this.starsText = this.scene.add.text(
      176,
      10,
      '\u2606 \u2606 \u2606',
      { ...TEXT_HUD_STARS },
    ).setDepth(101);
  }

  /** Create pause and sound toggle buttons. */
  private createButtons(): void {
    // Pause button — 60×60 touch zone around a 32×32 icon
    this.scene.add.text(400, 14, '\u23F8', {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: '#E8F4E8',
    }).setDepth(101).setOrigin(0.5, 0);

    const pauseZone = this.scene.add.zone(400, HUD_HEIGHT / 2, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET)
      .setInteractive({ useHandCursor: true })
      .setDepth(102)
      .on('pointerdown', () => {
        this.scene.events.emit(GameEvents.GAME_PAUSED);
      });
    pauseZone.setOrigin(0.5, 0.5);

    // Sound toggle — 60×60 touch zone
    this.scene.add.text(448, 14, '\u266B', {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: '#E8F4E8',
    }).setDepth(101).setOrigin(0.5, 0);

    const soundZone = this.scene.add.zone(448, HUD_HEIGHT / 2, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET)
      .setInteractive({ useHandCursor: true })
      .setDepth(102)
      .on('pointerdown', () => {
        this.scene.events.emit(GameEvents.SOUND_TOGGLED);
      });
    soundZone.setOrigin(0.5, 0.5);
  }

  /** Create the city one-liner text (hidden by default). */
  private createOneLiner(): void {
    this.oneLinerText = this.scene.add.text(
      SAFE_MARGIN,
      52,
      '',
      { ...TEXT_CITY_ONELINER },
    ).setDepth(101).setAlpha(0);
  }

  /** Wire up event listeners on the scene event bus. */
  private setupEventListeners(): void {
    this.scene.events.on(GameEvents.SCORE_UPDATED, (payload: ScoreUpdatedPayload) => {
      this.updateScore(payload.score);
    });
    this.scene.events.on(GameEvents.STAR_RATING_UPDATED, (payload: StarRatingUpdatedPayload) => {
      this.updateStars(payload.stars);
    });
    this.scene.events.on(GameEvents.CITY_SAVED, (payload: CitySavedPayload) => {
      this.flashCitySaved(payload.cityName);
    });
    this.scene.events.on(GameEvents.CITY_DESTROYED, (payload: CityDestroyedPayload) => {
      this.flashCityLost(payload.cityName);
    });
    this.scene.events.on(GameEvents.GAME_PAUSED, () => {
      this.showPauseOverlay();
    });
    this.scene.events.on(GameEvents.GAME_RESUMED, () => {
      this.hidePauseOverlay();
    });
    this.scene.events.on(GameEvents.STREAK_MILESTONE, (payload: StreakMilestonePayload) => {
      this.showStreakBadge(payload.label, payload.multiplier);
    });
    this.scene.events.on(GameEvents.CHAIN_REACTION, (payload: ChainReactionPayload) => {
      this.showChainBadge(payload.chainLength);
    });

    // Clean up listeners on scene shutdown
    this.scene.events.once('shutdown', () => this.destroy());
  }

  /** Update the score label text. */
  updateScore(newScore: number): void {
    this.scoreText.setText(`SCORE: ${newScore}`);
  }

  /** Update the live star rating display (1–3 stars). */
  updateStars(stars: number): void {
    const filled = '\u2605';
    const empty = '\u2606';
    let display = '';
    for (let i = 0; i < 3; i++) {
      display += i < stars ? filled : empty;
      if (i < 2) display += ' ';
    }
    this.starsText.setText(display);
  }

  /** Show a floating streak badge label at center-screen. */
  showStreakBadge(label: string, _multiplier: number): void {
    if (!label) return;
    this.showBadge(label);
  }

  /** Show a chain reaction badge at center-screen. */
  showChainBadge(chainLength: number): void {
    this.showBadge(`CHAIN x${chainLength}`);
  }

  /** Show a city-lost one-liner in the HUD corner. */
  flashCityLost(cityName: string): void {
    this.showOneLiner(`${cityName} DESTROYED!`);
  }

  /** Show a city-saved one-liner in the HUD corner. */
  flashCitySaved(cityName: string): void {
    this.showOneLiner(`${cityName} SAVED!`);
  }

  /** Show the pause overlay. */
  showPauseOverlay(): void {
    if (this.pauseOverlay) return;

    this.pauseOverlay = this.scene.add.container(0, 0).setDepth(200);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.pauseOverlay.add(bg);

    const pauseText = this.scene.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 - 40,
      'PAUSED',
      { fontFamily: FONT_FAMILY, fontSize: '24px', color: '#FFD700', align: 'center' },
    ).setOrigin(0.5, 0.5);
    this.pauseOverlay.add(pauseText);

    const resumeText = this.scene.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 40,
      'TAP TO RESUME',
      { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#E8F4E8', align: 'center' },
    ).setOrigin(0.5, 0.5);
    this.pauseOverlay.add(resumeText);

    const resumeZone = this.scene.add.zone(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2,
      CANVAS_WIDTH, CANVAS_HEIGHT,
    ).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.events.emit(GameEvents.GAME_RESUMED);
      });
    this.pauseOverlay.add(resumeZone);
  }

  /** Hide the pause overlay. */
  hidePauseOverlay(): void {
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = undefined;
    }
  }

  /** Must be called each frame. Currently a no-op placeholder. */
  update(): void {
    // Reserved for future per-frame HUD animations
  }

  /** Internal: show a badge at center-screen with scale-in animation. */
  private showBadge(label: string): void {
    const badgeX = 140;
    const badgeY = 380;
    const badgeW = 200;
    const badgeH = 48;

    const container = this.scene.add.container(badgeX + badgeW / 2, badgeY + badgeH / 2)
      .setDepth(150);

    const bg = this.scene.add.graphics();
    bg.fillStyle(COLOR_BADGE_BG, 1);
    bg.fillRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 4);
    container.add(bg);

    const text = this.scene.add.text(0, 0, label, {
      ...TEXT_BADGE,
      align: 'center',
    }).setOrigin(0.5, 0.5);
    container.add(text);

    // Scale-in with Back.Out easing
    container.setScale(0.5);
    this.scene.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: BADGE_INTRO_MS,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Hold, then remove
        this.scene.time.delayedCall(BADGE_HOLD_MS, () => {
          container.destroy();
        });
      },
    });
  }

  /** Internal: show a one-liner in the HUD corner that fades after duration. */
  private showOneLiner(text: string): void {
    this.oneLinerTimer?.destroy();
    this.oneLinerText.setText(text).setAlpha(1);

    this.oneLinerTimer = this.scene.time.delayedCall(CITY_ONELINER_DURATION_MS, () => {
      this.scene.tweens.add({
        targets: this.oneLinerText,
        alpha: 0,
        duration: 300,
        ease: 'Linear',
      });
    });
  }

  /** Clean up event listeners. */
  private destroy(): void {
    this.scene.events.off(GameEvents.SCORE_UPDATED);
    this.scene.events.off(GameEvents.STAR_RATING_UPDATED);
    this.scene.events.off(GameEvents.CITY_SAVED);
    this.scene.events.off(GameEvents.CITY_DESTROYED);
    this.scene.events.off(GameEvents.GAME_PAUSED);
    this.scene.events.off(GameEvents.GAME_RESUMED);
    this.scene.events.off(GameEvents.STREAK_MILESTONE);
    this.scene.events.off(GameEvents.CHAIN_REACTION);
  }
}
