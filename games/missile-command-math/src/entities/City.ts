/**
 * City — A defended city at the bottom of the screen.
 *
 * Cities have hit points and can be damaged by incoming missiles/paratroopers.
 * They emit events on hit, destruction, and rebuild.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 * @see docs/style-guides/missile-command-math.md §Sprite Specifications
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import type { CityHitPayload, CityDestroyedPayload, CityRebuiltPayload } from '../types/GameEvents';
import { CITY_HIT_POINTS } from '../config/gameConfig';
import {
  COLOR_CITY_ACTIVE,
  COLOR_CITY_DESTROYED,
  COLOR_CITY_CELEBRATE,
} from '../config/styleConfig';

/** City configuration data indexed by city slot. */
const CITY_CONFIGS: Array<{ name: string; spriteKey: string }> = [
  { name: 'NEW YORK', spriteKey: 'SPRITE_CITY_NYC' },
  { name: 'CHICAGO', spriteKey: 'SPRITE_CITY_CHI' },
  { name: 'LOS ANGELES', spriteKey: 'SPRITE_CITY_LAX' },
  { name: 'HOUSTON', spriteKey: 'SPRITE_CITY_HOU' },
  { name: 'WASHINGTON', spriteKey: 'SPRITE_CITY_DC' },
  { name: 'SEATTLE', spriteKey: 'SPRITE_CITY_SEA' },
];

export { CITY_CONFIGS };

export class City extends Phaser.GameObjects.Container {
  /** 0-based index matching CITY_X_POSITIONS row order. */
  readonly cityIndex: number;
  /** Human-readable name (e.g. "NEW YORK"). */
  readonly cityName: string;
  /** Current hit points; starts at CITY_HIT_POINTS. */
  hitPoints: number;
  /** True when hitPoints reaches 0. */
  destroyed: boolean;
  /** The texture key for this city's sprite. */
  private spriteKey: string;
  /** The city sprite display. */
  private citySprite: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    cityIndex: number,
    cityName: string,
    x: number,
    y: number,
  ) {
    super(scene, x, y);

    this.cityIndex = cityIndex;
    this.cityName = cityName;
    this.hitPoints = CITY_HIT_POINTS;
    this.destroyed = false;
    this.spriteKey = CITY_CONFIGS[cityIndex]?.spriteKey ?? 'SPRITE_CITY_NYC';

    // Create a placeholder rectangle for the city (will be replaced by sprites when loaded)
    this.citySprite = scene.add.rectangle(0, 0, 64, 56, COLOR_CITY_ACTIVE);
    this.add(this.citySprite);

    this.setSize(64, 56);
    this.setDepth(5);

    scene.add.existing(this);
  }

  /**
   * Apply one hit to this city.
   * Emits CITY_HIT. If hitPoints reaches 0, calls destroyCity().
   * @returns remaining hitPoints after the hit.
   */
  hit(): number {
    if (this.destroyed) return 0;

    this.hitPoints = Math.max(0, this.hitPoints - 1);

    const payload: CityHitPayload = {
      cityIndex: this.cityIndex,
      remainingHp: this.hitPoints,
    };
    this.scene.events.emit(GameEvents.CITY_HIT, payload);

    if (this.hitPoints <= 0) {
      this.destroyCity();
    }

    return this.hitPoints;
  }

  /**
   * Destroy this city: set destroyed = true, swap to destroyed tint.
   * Emits CITY_DESTROYED with { cityIndex, cityName }.
   */
  destroyCity(): void {
    if (this.destroyed) return;

    this.destroyed = true;
    this.hitPoints = 0;
    this.citySprite.setFillStyle(COLOR_CITY_DESTROYED);

    const payload: CityDestroyedPayload = {
      cityIndex: this.cityIndex,
      cityName: this.cityName,
    };
    this.scene.events.emit(GameEvents.CITY_DESTROYED, payload);
  }

  /**
   * Rebuild this city (called between levels).
   * Resets hitPoints, restores active sprite. Emits CITY_REBUILT when complete.
   */
  rebuild(): void {
    this.hitPoints = CITY_HIT_POINTS;
    this.destroyed = false;
    this.citySprite.setFillStyle(COLOR_CITY_ACTIVE);

    // Play rebuild animation if available, otherwise emit immediately
    this.scene.time.delayedCall(2000, () => {
      const payload: CityRebuiltPayload = {
        cityIndex: this.cityIndex,
        cityName: this.cityName,
      };
      this.scene.events.emit(GameEvents.CITY_REBUILT, payload);
    });
  }

  /**
   * Flash the city gold (city-save celebration).
   * Pulses COLOR_CITY_CELEBRATE tint: 2 pulses × 500 ms each.
   */
  celebrateSave(): void {
    if (this.destroyed) return;

    const originalColor = COLOR_CITY_ACTIVE;

    // Pulse 1
    this.citySprite.setFillStyle(COLOR_CITY_CELEBRATE);
    this.scene.time.delayedCall(500, () => {
      if (!this.destroyed) {
        this.citySprite.setFillStyle(originalColor);
      }
    });

    // Pulse 2
    this.scene.time.delayedCall(500, () => {
      if (!this.destroyed) {
        this.citySprite.setFillStyle(COLOR_CITY_CELEBRATE);
        this.scene.time.delayedCall(500, () => {
          if (!this.destroyed) {
            this.citySprite.setFillStyle(originalColor);
          }
        });
      }
    });
  }

  /** Returns the world-space center-top position for trajectory line targeting. */
  getTargetPoint(): { x: number; y: number } {
    return { x: this.x, y: this.y - this.height / 2 };
  }
}
