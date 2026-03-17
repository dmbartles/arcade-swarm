/**
 * Launcher.ts — Player launcher entity for Missile Command Math.
 *
 * One of three fixed launchers at the bottom of the playfield. Each launcher
 * holds a loaded answer number drawn from the wave's answer queue.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import { SPRITE_KEYS, ANIM_KEYS } from '../assets/index';
import type { SpriteKey } from '../assets/index';
import {
  LAUNCHER_NOZZLE_TWEEN_MS,
  MIN_TOUCH_TARGET_PX,
} from '../config/gameConfig';

/** Sprite key per launcher placement. */
const LAUNCHER_SPRITE_MAP: Record<'left' | 'center' | 'right', SpriteKey> = {
  left:   SPRITE_KEYS.LAUNCHER_ORANGE,
  center: SPRITE_KEYS.LAUNCHER_TEAL,
  right:  SPRITE_KEYS.LAUNCHER_MAGENTA,
};

export class Launcher extends Phaser.GameObjects.Container {
  /**
   * Playfield placement: 'left' | 'center' | 'right'.
   * Named `launcherPosition` to avoid conflict with Phaser Container's numeric `position`.
   */
  readonly launcherPosition: 'left' | 'center' | 'right';

  /** The answer currently loaded in this launcher. Null if reloading. */
  loadedAnswer: number | string | null;

  /** True while the launcher is in its reload delay. */
  isReloading: boolean = false;

  /** Sprite key for this launcher's color variant. */
  readonly spriteKey: SpriteKey;

  /** Reload delay in milliseconds (from IDifficultyConfig). */
  private reloadDelayMs: number;

  /** The launcher sprite for nozzle tween. */
  private launcherSprite: Phaser.GameObjects.Sprite | null = null;

  /** The badge answer text. */
  private badgeText: Phaser.GameObjects.Text | null = null;

  /**
   * @param scene          - Parent scene.
   * @param x              - Center-x position.
   * @param y              - Bottom-y position (LAUNCHER_Y).
   * @param placement      - 'left' | 'center' | 'right'.
   * @param initialAnswer  - First answer to load.
   * @param reloadDelayMs  - From IDifficultyConfig.launcherReloadDelayMs.
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    placement: 'left' | 'center' | 'right',
    initialAnswer: number | string | null,
    reloadDelayMs: number,
  ) {
    super(scene, x, y);

    this.launcherPosition = placement;
    this.loadedAnswer = initialAnswer;
    this.reloadDelayMs = reloadDelayMs;
    this.spriteKey = LAUNCHER_SPRITE_MAP[placement];

    this.buildVisual();

    scene.add.existing(this);

    // Make the whole launcher interactive for touch
    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -MIN_TOUCH_TARGET_PX / 2,
        -45,
        MIN_TOUCH_TARGET_PX,
        90,
      ),
      Phaser.Geom.Rectangle.Contains,
    );
  }

  /**
   * Load a new answer into this launcher.
   * Updates the badge text and clears isReloading.
   */
  loadAnswer(answer: number | string): void {
    this.loadedAnswer = answer;
    this.isReloading = false;
    this.updateBadge();

    this.scene.events.emit(GameEvents.QUEUE_ADVANCED, { position: this.launcherPosition });
  }

  /**
   * Fire this launcher toward the given world coordinates.
   */
  fire(targetX: number, targetY: number): void {
    if (this.isReloading) return;

    this.isReloading = true;
    this.loadedAnswer = null;
    this.updateBadge();

    // Nozzle punch-down tween
    if (this.launcherSprite) {
      this.scene.tweens.add({
        targets: this.launcherSprite,
        scaleY: 0.8,
        duration: LAUNCHER_NOZZLE_TWEEN_MS / 2,
        ease: 'Sine.easeIn',
        yoyo: true,
        onComplete: () => {
          if (this.launcherSprite) {
            this.launcherSprite.setScale(1, 1);
          }
        },
      });
    }

    this.scene.events.emit(GameEvents.INTERCEPTOR_FIRED, {
      launcherPosition: this.launcherPosition,
      targetX,
      targetY,
    });
  }

  /**
   * Flash the launcher red for wrong-tap feedback.
   * Plays LAUNCHER_WRONG_FLASH animation.
   */
  flashWrong(): void {
    if (this.launcherSprite) {
      this.launcherSprite.play(ANIM_KEYS.LAUNCHER_WRONG_FLASH);
    }
  }

  /**
   * Update the reload delay (called when difficulty changes).
   */
  setReloadDelay(ms: number): void {
    this.reloadDelayMs = ms;
  }

  /**
   * Get the current reload delay.
   */
  getReloadDelay(): number {
    return this.reloadDelayMs;
  }

  // ── Private Methods ──────────────────────────────────────────────────────

  /** Update the badge text to show the current loadedAnswer. */
  private updateBadge(): void {
    if (!this.badgeText) return;

    if (this.loadedAnswer === null) {
      this.badgeText.setText('—');
    } else {
      this.badgeText.setText(String(this.loadedAnswer));
    }
  }

  /** Build visual: launcher sprite + gold answer text badge. */
  private buildVisual(): void {
    // Launcher sprite (Sprite so we can play animations on it)
    this.launcherSprite = this.scene.add.sprite(0, 0, this.spriteKey);
    this.add(this.launcherSprite);

    // Badge text (gold answer number)
    // Positioned at center of launcher badge area (approx y=+9 from container center)
    const answerStr = this.loadedAnswer !== null ? String(this.loadedAnswer) : '—';
    this.badgeText = this.scene.add.text(0, 9, answerStr, {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#C8A040',
    });
    this.badgeText.setOrigin(0.5, 0.5);
    this.add(this.badgeText);
  }
}
