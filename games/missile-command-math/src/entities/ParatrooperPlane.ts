/**
 * ParatrooperPlane — Transport plane that drops paratroopers.
 *
 * Flies horizontally across the screen, dropping paratroopers at intervals.
 * Cannot be directly targeted by the player.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import type { ParatrooperDroppedPayload } from '../types/GameEvents';
import { CANVAS_WIDTH } from '../config/gameConfig';
import { COLOR_BOMBER } from '../config/styleConfig';
import { Paratrooper } from './Paratrooper';
import type { City } from './City';

/** Y position for the plane. */
const PLANE_Y = 80;
/** Interval between drops in ms. */
const DROP_INTERVAL_MS = 1500;

/** Counter for generating unique plane IDs. */
let planeCounter = 0;

function generatePlaneId(): string {
  planeCounter += 1;
  return `plane-${Date.now()}-${planeCounter}`;
}

export class ParatrooperPlane extends Phaser.GameObjects.Container {
  /** Unique runtime ID. */
  readonly threatId: string;
  /** Horizontal flight speed in px/s. */
  speed: number;
  /** Number of paratroopers to drop. */
  dropCount: number;
  /** Direction of horizontal flight: 1 = left→right, -1 = right→left. */
  horizontalDir: 1 | -1;
  /** Whether this plane has been removed. */
  destroyed: boolean;
  /** Number of paratroopers already dropped. */
  private droppedCount: number;
  /** Reference to cities array. */
  private cities: City[];
  /** Timer for drop intervals. */
  private dropTimer: Phaser.Time.TimerEvent | null;
  /** Whether first drop has been triggered. */
  private dropStarted: boolean;
  /** Screen width threshold for exit. */
  private exitThreshold: number;

  constructor(
    scene: Phaser.Scene,
    speed: number,
    dropCount: number,
    horizontalDir: 1 | -1,
    cities: City[],
  ) {
    const startX = horizontalDir === 1 ? -80 : CANVAS_WIDTH + 80;
    super(scene, startX, PLANE_Y);

    this.threatId = generatePlaneId();
    this.speed = speed;
    this.dropCount = dropCount;
    this.horizontalDir = horizontalDir;
    this.destroyed = false;
    this.droppedCount = 0;
    this.cities = cities;
    this.dropTimer = null;
    this.dropStarted = false;
    this.exitThreshold = horizontalDir === 1 ? CANVAS_WIDTH + 80 : -80;

    // Create plane visual (rectangle placeholder for sprite)
    const body = scene.add.rectangle(0, 0, 64, 22, COLOR_BOMBER);
    this.add(body);

    // Flip if going right to left
    if (horizontalDir === -1) {
      this.setScale(-1, 1);
    }

    this.setSize(64, 22);
    this.setDepth(12);

    scene.add.existing(this);
  }

  /** Move horizontally and trigger drops. */
  preUpdate(_time: number, delta: number): void {
    if (this.destroyed) return;

    // Move horizontally
    this.x += this.horizontalDir * (this.speed * delta) / 1000;

    // Start dropping once on screen
    if (!this.dropStarted && this.isOnScreen()) {
      this.dropStarted = true;
      this.startDropping();
    }

    // Check exit
    if (this.horizontalDir === 1 && this.x > this.exitThreshold) {
      this.removePlane();
    } else if (this.horizontalDir === -1 && this.x < this.exitThreshold) {
      this.removePlane();
    }
  }

  /** Check if the plane is on the visible screen. */
  private isOnScreen(): boolean {
    return this.x > 0 && this.x < CANVAS_WIDTH;
  }

  /** Start the drop timer. */
  private startDropping(): void {
    this.dropTimer = this.scene.time.addEvent({
      delay: DROP_INTERVAL_MS,
      callback: () => this.dropParatrooper(),
      callbackScope: this,
      repeat: this.dropCount - 1,
    });
  }

  /**
   * Drop a single Paratrooper at the plane's current X position.
   * Picks a random non-destroyed city as target. Emits PARATROOPER_DROPPED.
   */
  dropParatrooper(): void {
    if (this.destroyed || this.droppedCount >= this.dropCount) return;

    // Pick a random non-destroyed city
    const aliveCities = this.cities
      .map((c, i) => ({ city: c, index: i }))
      .filter((entry) => !entry.city.destroyed);

    if (aliveCities.length === 0) return;

    const targetEntry = aliveCities[Math.floor(Math.random() * aliveCities.length)];

    const paratrooper = new Paratrooper(
      this.scene,
      this.x,
      this.y + 20,
      this.speed * 0.4,
      targetEntry.index,
      this.cities,
    );

    this.droppedCount += 1;

    const payload: ParatrooperDroppedPayload = {
      transportId: this.threatId,
      paratrooperId: paratrooper.threatId,
      targetCityIndex: targetEntry.index,
    };
    this.scene.events.emit(GameEvents.PARATROOPER_DROPPED, payload);
  }

  /** Remove the plane from the scene. */
  private removePlane(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    if (this.dropTimer) {
      this.dropTimer.destroy();
      this.dropTimer = null;
    }

    this.destroy();
  }
}
