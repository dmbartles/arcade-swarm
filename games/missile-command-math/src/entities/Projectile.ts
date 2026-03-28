/**
 * Projectile.ts — Counter-missile traveling from launcher to a fixed world point.
 *
 * Travels in a straight line to the target world coordinates set at fire time.
 * Emits PROJECTILE_AT_TARGET on arrival; WaveManager then performs the blast-radius
 * check against all active bombs and emits INTERCEPTOR_DETONATED for visuals.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import { SPRITE_KEYS } from '../assets/index';

/** Projectile speed in pixels per second. */
const PROJECTILE_SPEED_PX_S = 400;

/** Distance (px) at which the projectile is considered to have reached its target. */
const HIT_THRESHOLD_PX = 12;

export class Projectile extends Phaser.GameObjects.Image {
  /** Fixed world-space target coordinates set at fire time. */
  readonly targetX: number;
  readonly targetY: number;

  /** Which launcher fired this projectile. */
  readonly originLauncher: 'left' | 'center' | 'right';

  /** The answer loaded in the launcher when it fired. */
  readonly firedAnswer: number | string | null;

  /** Unique ID for this projectile instance. */
  readonly projectileId: string;

  /** Phaser Arcade physics body. */
  declare body: Phaser.Physics.Arcade.Body;

  /**
   * @param scene          - Parent scene.
   * @param x              - Launch origin x (launcher center).
   * @param y              - Launch origin y (launcher nozzle top).
   * @param targetX        - Fixed world-x to fly toward.
   * @param targetY        - Fixed world-y to fly toward.
   * @param originLauncher - 'left' | 'center' | 'right'.
   * @param firedAnswer    - The answer loaded in the launcher at fire time.
   * @param projectileId   - Unique ID assigned by WaveManager.
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    originLauncher: 'left' | 'center' | 'right',
    firedAnswer: number | string | null,
    projectileId: string,
  ) {
    super(scene, x, y, SPRITE_KEYS.PROJECTILE);

    this.targetX = targetX;
    this.targetY = targetY;
    this.originLauncher = originLauncher;
    this.firedAnswer = firedAnswer;
    this.projectileId = projectileId;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Compute direction vector from launch point to fixed target
    const dx = targetX - x;
    const dy = targetY - y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len > 0) {
      const vx = (dx / len) * PROJECTILE_SPEED_PX_S;
      const vy = (dy / len) * PROJECTILE_SPEED_PX_S;
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(vx, vy);

      // Rotate sprite to face direction of travel (+90° since sprite faces up)
      this.setRotation(Math.atan2(dy, dx) + Math.PI / 2);
    }
  }

  /**
   * Called each frame by WaveManager.
   * Checks distance to the fixed target point; emits PROJECTILE_AT_TARGET on arrival.
   */
  update(_time: number, _delta: number): void {
    if (!this.active) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;

    if (dx * dx + dy * dy <= HIT_THRESHOLD_PX * HIT_THRESHOLD_PX) {
      this.scene.events.emit(GameEvents.PROJECTILE_AT_TARGET, {
        x: this.targetX,
        y: this.targetY,
        firedAnswer: this.firedAnswer,
        projectileId: this.projectileId,
      });
      this.destroy();
    }
  }
}
