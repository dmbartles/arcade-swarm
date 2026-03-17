/**
 * StrategicBomber.ts — Bomber aircraft entity for Missile Command Math.
 *
 * Traverses the screen from left to right at high altitude and drops bomb
 * payloads during traversal. Introduced at Level 13.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import type { ThreatDestroyedPayload, BomberPayloadDroppedPayload } from '../types/GameEvents';
import type { IMathProblem } from '../types/IMathProblem';
import { SPRITE_KEYS, ANIM_KEYS } from '../assets/index';
import {
  CANVAS_WIDTH,
  PLAYFIELD_Y,
  BOMBER_TRAVERSAL_MS,
} from '../config/gameConfig';
import { SCORE_VALUES } from '../config/scoreConfig';

/** Bomber altitude inside the playfield (px below playfield top). */
const BOMBER_ALTITUDE_OFFSET = 60;

/** Tint color for smoke trail. */
const SMOKE_TINT = 0x9A9A9A;

export class StrategicBomber extends Phaser.GameObjects.Container {
  /** Math problem attached to this bomber (for intercept scoring context). */
  readonly bonusProblem: IMathProblem | null;

  /** Total bombs this bomber will drop during traversal. */
  readonly bombDropCount: number;

  /** Bombs remaining to drop. */
  dropsRemaining: number;

  /** True if at least one bomb has already been dropped. */
  hasDropped: boolean = false;

  /** Unique threat ID. */
  readonly threatId: string;

  /** Speed multiplier applied. */
  private speedMultiplier: number;

  /** Calculated traversal speed in px/s. */
  private traversalSpeedPxS: number;

  /** Time elapsed since last drop (ms). */
  private timeSinceLastDrop: number = 0;

  /** Interval between drops (ms). */
  private dropIntervalMs: number;

  /** Time elapsed since last smoke particle (ms). */
  private timeSinceLastSmoke: number = 0;

  /** Whether this bomber has been intercepted. */
  private _intercepted: boolean = false;

  /** Phaser Arcade physics body. */
  declare body: Phaser.Physics.Arcade.Body;

  /**
   * @param scene            - Parent scene.
   * @param speedMultiplier  - From IDifficultyConfig.bomberSpeedMultiplier.
   * @param bombDropCount    - How many bombs to drop during traversal.
   * @param threatId         - Unique ID.
   * @param bonusProblem     - Optional bonus problem (null for standard bombers).
   */
  constructor(
    scene: Phaser.Scene,
    speedMultiplier: number,
    bombDropCount: number,
    threatId: string,
    bonusProblem: IMathProblem | null,
  ) {
    // Start off-screen left, at high altitude
    const startX = -64;
    const startY = PLAYFIELD_Y + BOMBER_ALTITUDE_OFFSET;
    super(scene, startX, startY);

    this.speedMultiplier = speedMultiplier;
    this.bombDropCount = bombDropCount;
    this.dropsRemaining = bombDropCount;
    this.threatId = threatId;
    this.bonusProblem = bonusProblem;

    // Calculate speed: CANVAS_WIDTH / (BOMBER_TRAVERSAL_MS / 1000) * multiplier
    this.traversalSpeedPxS =
      (CANVAS_WIDTH / (BOMBER_TRAVERSAL_MS / 1000)) * speedMultiplier;

    // Drop interval: spread drops evenly across traversal
    this.dropIntervalMs =
      bombDropCount > 0 ? BOMBER_TRAVERSAL_MS / (bombDropCount + 1) : Infinity;

    this.buildVisual();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Move right
    (this.body as Phaser.Physics.Arcade.Body).setVelocityX(this.traversalSpeedPxS);

    // Make interactive
    this.setInteractive(
      new Phaser.Geom.Rectangle(-64, -28, 128, 56),
      Phaser.Geom.Rectangle.Contains,
    );
  }

  /** True if this bomber has been intercepted. */
  get isIntercepted(): boolean {
    return this._intercepted;
  }

  /**
   * Called each frame by WaveManager.
   */
  update(_time: number, delta: number): void {
    if (this._intercepted) return;

    // Check if bomber has escaped off-screen
    if (this.x > CANVAS_WIDTH + 64) {
      this.onEscaped();
      return;
    }

    // Drop schedule
    if (this.dropsRemaining > 0) {
      this.timeSinceLastDrop += delta;
      if (this.timeSinceLastDrop >= this.dropIntervalMs) {
        this.timeSinceLastDrop = 0;
        this.dropBomb();
      }
    }

    // Engine smoke trail every 80ms
    this.timeSinceLastSmoke += delta;
    if (this.timeSinceLastSmoke >= 80) {
      this.timeSinceLastSmoke = 0;
      this.emitEngineTrail();
    }
  }

  /**
   * Intercept this bomber.
   * Points depend on hasDropped.
   */
  intercept(): void {
    if (this._intercepted) return;
    this._intercepted = true;

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }

    const points = this.hasDropped
      ? SCORE_VALUES.bomberAfterDrop
      : SCORE_VALUES.bomberBeforeDrop;

    const payload: ThreatDestroyedPayload = {
      threatId: this.threatId,
      threatType: 'bomber',
      points,
      chainReaction: false,
    };
    this.scene.events.emit(GameEvents.THREAT_DESTROYED, payload);

    this.destroy();
  }

  // ── Private Methods ──────────────────────────────────────────────────────

  /** Called when bomber exits the right edge without being intercepted. */
  private onEscaped(): void {
    const payload: ThreatDestroyedPayload = {
      threatId: this.threatId,
      threatType: 'bomber',
      points: 0,
      chainReaction: false,
    };
    this.scene.events.emit(GameEvents.THREAT_DESTROYED, payload);
    this.destroy();
  }

  /** Drop one bomb payload from the bomber's current position. */
  private dropBomb(): void {
    if (this.dropsRemaining <= 0) return;

    this.dropsRemaining -= 1;
    this.hasDropped = true;

    const payload: BomberPayloadDroppedPayload = {
      bomberThreatId: this.threatId,
      droppedMissileIds: [`${this.threatId}-drop-${this.bombDropCount - this.dropsRemaining}`],
    };
    this.scene.events.emit(GameEvents.BOMBER_PAYLOAD_DROPPED, payload);
  }

  /**
   * Build visual: add SPRITE_KEYS.BOMBER image, play BOMBER_FLY animation.
   */
  private buildVisual(): void {
    const sprite = this.scene.add.sprite(0, 0, SPRITE_KEYS.BOMBER);
    sprite.play(ANIM_KEYS.BOMBER_FLY);
    this.add(sprite);
  }

  /**
   * Emit smoke trail particles from nacelle positions.
   * 6px smoke dot, COLOR_SMOKE, 60% opacity, fade over 400ms.
   */
  private emitEngineTrail(): void {
    if (this._intercepted) return;

    // Two nacelle positions relative to container: approx x±32, y+8
    const nacelleOffsets = [
      { dx: -32, dy: 8 },
      { dx: 32,  dy: 8 },
    ];

    for (const offset of nacelleOffsets) {
      const dot = this.scene.add.image(
        this.x + offset.dx,
        this.y + offset.dy,
        SPRITE_KEYS.TRAJECTORY_TRAIL_DOT,
      );
      dot.setScale(1.0);
      dot.setAlpha(0.6);
      dot.setTint(SMOKE_TINT);

      this.scene.tweens.add({
        targets: dot,
        alpha: 0,
        y: dot.y - 10,
        duration: 400,
        ease: 'Linear',
        onComplete: () => {
          if (dot && dot.active) {
            dot.destroy();
          }
        },
      });
    }
  }
}
