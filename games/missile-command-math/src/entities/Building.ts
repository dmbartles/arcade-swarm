/**
 * Building.ts — City building entity for Missile Command Math.
 *
 * A single building in a city cluster. Tracks HP and manages three visual
 * states: intact, damaged, and destroyed.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import type { CityHitPayload, CityDestroyedPayload, CityRebuiltPayload } from '../types/GameEvents';
import { SPRITE_KEYS, ANIM_KEYS } from '../assets/index';

/** Visual variant: 'a' (coral), 'b' (blue), 'c' (peach). */
export type BuildingVariant = 'a' | 'b' | 'c';

/** Which cluster this building belongs to. */
export type BuildingCluster = 'left' | 'right';

/** Maximum hit points for a building. */
const MAX_BUILDING_HP = 2;

/** Color used for city celebrate gold flash. */
const COLOR_CITY_CELEBRATE = 0xF0C030;

/** Color used for smoke particles. */
const COLOR_SMOKE_TINT = 0x9A9A9A;

export class Building extends Phaser.GameObjects.Container {
  /** Visual variant: 'a' (coral), 'b' (blue), 'c' (peach). */
  readonly variant: BuildingVariant;

  /** Which cluster this building belongs to. */
  readonly cluster: BuildingCluster;

  /** City index (0 for left cluster, 1 for right cluster). */
  readonly cityIndex: number;

  /**
   * Remaining hit points.
   * 2 = intact, 1 = damaged, 0 = destroyed.
   */
  hitPoints: number;

  /** City name for event payload display. */
  readonly cityName: string;

  /** The building sprite (swapped on state change). */
  private buildingSprite: Phaser.GameObjects.Sprite | null = null;

  /** Reference to particle emitter for smoke. */
  private smokeParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    variant: BuildingVariant,
    cluster: BuildingCluster,
    cityIndex: number,
    cityName: string,
  ) {
    super(scene, x, y);
    this.variant = variant;
    this.cluster = cluster;
    this.cityIndex = cityIndex;
    this.cityName = cityName;
    this.hitPoints = MAX_BUILDING_HP;

    this.buildVisual();

    scene.add.existing(this);
  }

  /** True when hitPoints === 0. */
  get isDestroyed(): boolean {
    return this.hitPoints <= 0;
  }

  /**
   * Apply one hit to this building.
   * HP 2 → 1: play BUILDING_HIT anim; emit CITY_HIT.
   * HP 1 → 0: play BUILDING_HIT anim then swap to building_destroyed sprite;
   *           spawn smoke particles; emit CITY_DESTROYED.
   * No-op if already destroyed.
   */
  hit(): void {
    if (this.isDestroyed) return;

    this.hitPoints -= 1;

    if (this.hitPoints === 1) {
      // Damaged state
      if (this.buildingSprite) {
        this.buildingSprite.play(ANIM_KEYS.BUILDING_HIT);
      }

      const payload: CityHitPayload = {
        cityIndex: this.cityIndex,
        remainingHp: 1,
      };
      this.scene.events.emit(GameEvents.CITY_HIT, payload);

    } else if (this.hitPoints <= 0) {
      // Destroyed state
      this.hitPoints = 0;

      if (this.buildingSprite) {
        this.buildingSprite.play(ANIM_KEYS.BUILDING_HIT);
        this.buildingSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          this.swapToDestroyedSprite();
          this.spawnDestructionSmoke();
        });
      }

      const destroyedPayload: CityDestroyedPayload = {
        cityIndex: this.cityIndex,
        cityName: this.cityName,
      };
      this.scene.events.emit(GameEvents.CITY_DESTROYED, destroyedPayload);
    }
  }

  /**
   * Restore building to intact state (hitPoints = 2, swap to intact sprite).
   * Called during level-complete city rebuild sequence.
   */
  rebuild(): void {
    this.hitPoints = MAX_BUILDING_HP;

    // Remove old sprite if any
    if (this.buildingSprite) {
      this.buildingSprite.destroy();
      this.buildingSprite = null;
    }

    // Destroy any lingering smoke
    if (this.smokeParticles) {
      this.smokeParticles.destroy();
      this.smokeParticles = null;
    }

    // Create fresh intact sprite
    const spriteKey = this.getSpriteKeyForVariant();
    this.buildingSprite = this.scene.add.sprite(0, 0, spriteKey);
    this.buildingSprite.setOrigin(0.5, 1);
    this.add(this.buildingSprite);

    const payload: CityRebuiltPayload = {
      cityIndex: this.cityIndex,
      cityName: this.cityName,
    };
    this.scene.events.emit(GameEvents.CITY_REBUILT, payload);
  }

  /**
   * Apply a gold tint flash (COLOR_CITY_CELEBRATE) fading to #FFFFFF over 1000ms.
   * Called by GameScene on CITY_SAVED.
   */
  flashSaved(): void {
    if (!this.buildingSprite) return;

    this.buildingSprite.setTint(COLOR_CITY_CELEBRATE);
    this.scene.tweens.add({
      targets: this.buildingSprite,
      duration: 1000,
      onComplete: () => {
        if (this.buildingSprite) {
          this.buildingSprite.clearTint();
        }
      },
    });
  }

  // ── Private Methods ──────────────────────────────────────────────────────

  /**
   * Build initial visual: add the correct building_intact_X sprite based on variant.
   */
  private buildVisual(): void {
    const spriteKey = this.getSpriteKeyForVariant();
    this.buildingSprite = this.scene.add.sprite(0, 0, spriteKey);
    this.buildingSprite.setOrigin(0.5, 1); // bottom-center: container y = ground level
    this.add(this.buildingSprite);
  }

  /** Return the intact sprite key for this building's variant. */
  private getSpriteKeyForVariant(): string {
    switch (this.variant) {
      case 'a': return SPRITE_KEYS.BUILDING_INTACT_A;
      case 'b': return SPRITE_KEYS.BUILDING_INTACT_B;
      case 'c': return SPRITE_KEYS.BUILDING_INTACT_C;
    }
  }

  /** Swap the building sprite to the destroyed version. */
  private swapToDestroyedSprite(): void {
    if (this.buildingSprite) {
      this.buildingSprite.destroy();
    }
    this.buildingSprite = this.scene.add.sprite(0, 0, SPRITE_KEYS.BUILDING_DESTROYED);
    this.buildingSprite.setOrigin(0.5, 1);
    this.add(this.buildingSprite);
  }

  /**
   * Spawn smoke particles above this building after destruction.
   * 4–6 particles, COLOR_SMOKE tint, drift upward 40px over 2000ms, fade to 0 opacity.
   */
  private spawnDestructionSmoke(): void {
    // Clean up any previous emitter
    if (this.smokeParticles) {
      this.smokeParticles.destroy();
      this.smokeParticles = null;
    }

    try {
      const worldX = this.x;
      const worldY = this.y - 20;

      const emitter = this.scene.add.particles(
        worldX,
        worldY,
        SPRITE_KEYS.TRAJECTORY_TRAIL_DOT,
        {
          speed: { min: 10, max: 25 },
          angle: { min: 250, max: 290 },
          scale: { start: 2.5, end: 0 },
          alpha: { start: 0.8, end: 0 },
          lifespan: 2000,
          quantity: 1,
          frequency: 200,
          tint: COLOR_SMOKE_TINT,
          maxParticles: 6,
        },
      );

      this.smokeParticles = emitter;

      // Stop emitting after 1200ms but let particles finish their lifespan
      this.scene.time.delayedCall(1200, () => {
        if (this.smokeParticles) {
          this.smokeParticles.stop();
        }
      });
    } catch {
      // Particle system unavailable — silently skip
    }
  }
}
