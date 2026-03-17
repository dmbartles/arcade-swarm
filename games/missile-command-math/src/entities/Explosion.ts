/**
 * Explosion.ts — Starburst explosion entity for Missile Command Math.
 *
 * Plays once and self-destructs. Displays a solved equation beside the burst.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import { SPRITE_KEYS, ANIM_KEYS } from '../assets/index';
import {
  EXPLOSION_DURATION_MS,
  EXPLOSION_EQUATION_FADE_MS,
} from '../config/gameConfig';

export class Explosion extends Phaser.GameObjects.Container {
  /** The solved equation string to display ("7 + 8 = 15"). */
  readonly solvedEquation: string;

  /** The explosion sprite. */
  private explosionSprite: Phaser.GameObjects.Sprite | null = null;

  /** The equation text label. */
  private equationText: Phaser.GameObjects.Text | null = null;

  /**
   * @param scene          - Parent scene.
   * @param x              - Center of explosion.
   * @param y              - Center of explosion.
   * @param solvedEquation - Text shown beside burst.
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    solvedEquation: string,
  ) {
    super(scene, x, y);
    this.solvedEquation = solvedEquation;

    this.buildVisual();
    scene.add.existing(this);
  }

  /**
   * Play EXPLOSION_BURST animation.
   * Tween scale 1.0→1.4 over EXPLOSION_DURATION_MS.
   * At EXPLOSION_EQUATION_FADE_MS: fade out equation text.
   * On animation complete: emit EXPLOSION_COMPLETE; destroy self.
   */
  play(): void {
    if (!this.explosionSprite) return;

    // Scale tween
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: EXPLOSION_DURATION_MS,
      ease: 'Sine.easeOut',
    });

    // Fade out equation text at EXPLOSION_EQUATION_FADE_MS
    if (this.equationText) {
      this.scene.time.delayedCall(EXPLOSION_EQUATION_FADE_MS, () => {
        if (this.equationText) {
          this.scene.tweens.add({
            targets: this.equationText,
            alpha: 0,
            duration: EXPLOSION_DURATION_MS - EXPLOSION_EQUATION_FADE_MS,
            ease: 'Linear',
          });
        }
      });
    }

    // Play animation
    this.explosionSprite.play(ANIM_KEYS.EXPLOSION_BURST);
    this.explosionSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.scene.events.emit(GameEvents.EXPLOSION_COMPLETE, {
        x: this.x,
        y: this.y,
      });
      this.destroy();
    });
  }

  // ── Private Methods ──────────────────────────────────────────────────────

  /**
   * Build visual: explosion sprite + equation Text object.
   */
  private buildVisual(): void {
    // Explosion sprite
    this.explosionSprite = this.scene.add.sprite(0, 0, SPRITE_KEYS.EXPLOSION);
    this.add(this.explosionSprite);

    // Equation text: Georgia serif 26px bold, COLOR_EXPLOSION_OUTER (#F0A000)
    this.equationText = this.scene.add.text(90, -10, this.solvedEquation, {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#F0A000',
    });
    this.equationText.setOrigin(0, 0.5);
    this.add(this.equationText);
  }
}
