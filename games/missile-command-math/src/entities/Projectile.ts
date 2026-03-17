/**
 * Projectile.ts — Counter-missile traveling from launcher to bomb.
 *
 * Travels in a straight line toward the target bomb's position at fire time.
 * Emits INTERCEPTOR_DETONATED when it reaches the target.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import { SPRITE_KEYS } from '../assets/index';
import type { Bomb } from './Bomb';

/** Projectile speed in pixels per second. */
const PROJECTILE_SPEED_PX_S = 400;

/** Distance (px) at which the projectile "hits" its target. */
const HIT_THRESHOLD_PX = 24;

export class Projectile extends Phaser.GameObjects.Image {
  /** The Bomb entity this projectile is targeting. */
  readonly targetBomb: Bomb;

  /** Which launcher fired this projectile. */
  readonly originLauncher: 'left' | 'center' | 'right';

  /** Unique ID linking to the interceptor event. */
  readonly threatId: string;

  /** Phaser Arcade physics body. */
  declare body: Phaser.Physics.Arcade.Body;

  /**
   * @param scene          - Parent scene.
   * @param x              - Launch origin x (launcher center).
   * @param y              - Launch origin y (launcher nozzle top).
   * @param targetBomb     - The bomb being intercepted.
   * @param originLauncher - 'left' | 'center' | 'right'.
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    targetBomb: Bomb,
    originLauncher: 'left' | 'center' | 'right',
  ) {
    super(scene, x, y, SPRITE_KEYS.PROJECTILE);

    this.targetBomb = targetBomb;
    this.originLauncher = originLauncher;
    this.threatId = targetBomb.threatId;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Compute direction vector from launch point to target bomb at fire time
    const dx = targetBomb.x - x;
    const dy = targetBomb.y - y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len > 0) {
      const vx = (dx / len) * PROJECTILE_SPEED_PX_S;
      const vy = (dy / len) * PROJECTILE_SPEED_PX_S;
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(vx, vy);

      // Rotate to face direction of travel
      const angle = Math.atan2(dy, dx) + Math.PI / 2; // +90° since sprite faces up
      this.setRotation(angle);
    }
  }

  /**
   * Called each frame by WaveManager.
   * Checks if distance to targetBomb < HIT_THRESHOLD_PX.
   * If close enough: emit INTERCEPTOR_DETONATED and destroy self.
   */
  update(_time: number, _delta: number): void {
    if (!this.active) return;

    // If the target bomb has already been destroyed, clean up
    if (!this.targetBomb || !this.targetBomb.active) {
      this.destroy();
      return;
    }

    const dx = this.targetBomb.x - this.x;
    const dy = this.targetBomb.y - this.y;
    const distSq = dx * dx + dy * dy;

    if (distSq <= HIT_THRESHOLD_PX * HIT_THRESHOLD_PX) {
      const solvedEquation = `${this.targetBomb.problem.question} = ${this.targetBomb.problem.correctAnswer}`;

      this.scene.events.emit(GameEvents.INTERCEPTOR_DETONATED, {
        x: this.targetBomb.x,
        y: this.targetBomb.y,
        solvedEquation,
        threatId: this.threatId,
      });

      this.destroy();
    }
  }
}
