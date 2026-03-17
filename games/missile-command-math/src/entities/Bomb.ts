/**
 * Bomb.ts — Descending threat entity carrying a math problem.
 *
 * The player taps a bomb to attempt an intercept. The bomb renders its
 * problem text as a child Text object and emits trail particles during descent.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import type { CityHitPayload } from '../types/GameEvents';
import type { IMathProblem } from '../types/IMathProblem';
import { SPRITE_KEYS } from '../assets/index';
import {
  TRAIL_SPAWN_INTERVAL_MS,
  TRAIL_DOT_LIFETIME_MS,
  TRAIL_MAX_DOTS_PER_BOMB,
  MIN_TOUCH_TARGET_PX,
} from '../config/gameConfig';

/** Base descent speed in pixels per second at 1.0× multiplier. */
const BASE_BOMB_SPEED_PX_S = 60;

/** Sprite key map by mod-3 hash. */
const BOMB_SPRITE_KEYS = [
  SPRITE_KEYS.BOMB_ORANGE,
  SPRITE_KEYS.BOMB_TEAL,
  SPRITE_KEYS.BOMB_MAGENTA,
] as const;

export class Bomb extends Phaser.GameObjects.Container {
  /** The math problem displayed on this bomb. */
  readonly problem: IMathProblem;

  /**
   * How far the bomb has traveled as a fraction of its total descent (0.0–1.0).
   * Used by WaveManager to determine speed-bonus eligibility.
   */
  descentFraction: number = 0;

  /** World-y coordinate of the bomb's spawn point. */
  readonly spawnY: number;

  /** World-y coordinate of the bomb's target (building top or ground line). */
  readonly targetY: number;

  /** Index of the city cluster this bomb targets (0 = left, 1 = right). */
  readonly targetCityIndex: number;

  /** Unique identifier matching ThreatSpawnedPayload.threatId. */
  readonly threatId: string;

  /** Whether this bomb has been intercepted (set by WaveManager). */
  private _intercepted: boolean = false;

  /** Timer event for trail dot emission. */
  private trailTimer: Phaser.Time.TimerEvent | null = null;

  /** Active trail dot objects. */
  private trailDots: Phaser.GameObjects.Image[] = [];

  /** The Arcade physics body (typed after addExisting). */
  declare body: Phaser.Physics.Arcade.Body;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    problem: IMathProblem,
    targetY: number,
    targetCityIndex: number,
    threatId: string,
    speedMultiplier: number,
  ) {
    super(scene, x, y);

    this.problem = problem;
    this.spawnY = y;
    this.targetY = targetY;
    this.targetCityIndex = targetCityIndex;
    this.threatId = threatId;

    // Add to scene and enable physics BEFORE using this.body
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set downward velocity
    const velocityY = BASE_BOMB_SPEED_PX_S * speedMultiplier;
    (this.body as Phaser.Physics.Arcade.Body).setVelocityY(velocityY);

    this.buildVisual();
    this.setInteractive(
      new Phaser.Geom.Rectangle(
        -MIN_TOUCH_TARGET_PX / 2,
        -32,
        MIN_TOUCH_TARGET_PX,
        64,
      ),
      Phaser.Geom.Rectangle.Contains,
    );

    this.startTrail();
  }

  /** True if this bomb has been intercepted. */
  get isIntercepted(): boolean {
    return this._intercepted;
  }

  /**
   * Called each frame by WaveManager.
   * Updates descentFraction and checks if bomb has reached targetY.
   */
  update(_time: number, _delta: number): void {
    if (this._intercepted) return;

    const totalDescent = this.targetY - this.spawnY;
    if (totalDescent > 0) {
      this.descentFraction = Math.min(1, (this.y - this.spawnY) / totalDescent);
    }

    if (this.y >= this.targetY) {
      this.onReachedTarget();
    }
  }

  /**
   * Destroy this bomb cleanly: stop trail dots, remove physics body, destroy container.
   * Called by WaveManager when the bomb is intercepted.
   */
  intercept(): void {
    this._intercepted = true;
    this.stopTrail();
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }
    this.destroy();
  }

  // ── Private Methods ──────────────────────────────────────────────────────

  /** Called when bomb reaches targetY — emit CITY_HIT. */
  private onReachedTarget(): void {
    if (this._intercepted) return;
    this._intercepted = true;
    this.stopTrail();

    const payload: CityHitPayload = {
      cityIndex: this.targetCityIndex,
      remainingHp: 0, // will be updated by Building.hit()
    };
    this.scene.events.emit(GameEvents.CITY_HIT, payload);

    // Signal that this specific bomb reached its city (includes threatId)
    this.scene.events.emit('bomb-reached-city', { threatId: this.threatId, cityIndex: this.targetCityIndex });

    this.destroy();
  }

  /**
   * Start emitting trajectory trail dots every TRAIL_SPAWN_INTERVAL_MS ms.
   */
  private startTrail(): void {
    this.trailTimer = this.scene.time.addEvent({
      delay: TRAIL_SPAWN_INTERVAL_MS,
      loop: true,
      callback: this.spawnTrailDot,
      callbackScope: this,
    });
  }

  /** Stop trail emission timer and destroy active dots. */
  private stopTrail(): void {
    if (this.trailTimer) {
      this.trailTimer.destroy();
      this.trailTimer = null;
    }
    for (const dot of this.trailDots) {
      if (dot && dot.active) {
        dot.destroy();
      }
    }
    this.trailDots = [];
  }

  /** Spawn a single trail dot at the current bomb position. */
  private spawnTrailDot(): void {
    if (this._intercepted) return;

    // Enforce max active dots
    if (this.trailDots.length >= TRAIL_MAX_DOTS_PER_BOMB) {
      const oldest = this.trailDots.shift();
      if (oldest && oldest.active) {
        oldest.destroy();
      }
    }

    const dot = this.scene.add.image(this.x, this.y, SPRITE_KEYS.TRAJECTORY_TRAIL_DOT);
    dot.setAlpha(1.0);
    this.trailDots.push(dot);

    // Fade out over TRAIL_DOT_LIFETIME_MS
    this.scene.tweens.add({
      targets: dot,
      alpha: 0,
      duration: TRAIL_DOT_LIFETIME_MS,
      ease: 'Linear',
      onComplete: () => {
        if (dot && dot.active) {
          dot.destroy();
        }
        const idx = this.trailDots.indexOf(dot);
        if (idx !== -1) {
          this.trailDots.splice(idx, 1);
        }
      },
    });
  }

  /**
   * Build internal visual: add bomb sprite (color variant based on threatId hash mod 3),
   * add math problem text label.
   */
  private buildVisual(): void {
    // Hash threatId to pick color variant
    let hash = 0;
    for (let i = 0; i < this.threatId.length; i++) {
      hash = (hash * 31 + this.threatId.charCodeAt(i)) & 0xffff;
    }
    const spriteKey = BOMB_SPRITE_KEYS[hash % 3];

    const sprite = this.scene.add.image(0, 0, spriteKey);
    this.add(sprite);

    // Math problem text label — offset 20px right of center
    const label = this.scene.add.text(20, 0, this.problem.question, {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#E8701A',
    });
    label.setOrigin(0, 0.5);
    this.add(label);
  }
}
