/**
 * Paratrooper — Descending paratrooper neutralised only by blast radius.
 *
 * Paratroopers carry no math problem and cannot be directly tapped.
 * They descend with horizontal sway toward a target city.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 * @see docs/style-guides/missile-command-math.md §Visual Effects
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import type {
  ThreatDestroyedPayload,
  ParatrooperLandedPayload,
} from '../types/GameEvents';
import { COLOR_PARATROOPER } from '../config/styleConfig';
import { SCORE_VALUES } from '../config/scoreConfig';
import type { City } from './City';

/** Sway amplitude in pixels (±6). */
const SWAY_AMPLITUDE = 6;
/** Sway cycle duration in ms. */
const SWAY_CYCLE_MS = 1200;

/** Counter for generating unique paratrooper IDs. */
let paraCounter = 0;

function generateParatrooperId(): string {
  paraCounter += 1;
  return `para-${Date.now()}-${paraCounter}`;
}

export class Paratrooper extends Phaser.GameObjects.Container {
  /** Unique runtime ID. */
  readonly threatId: string;
  /** Descent speed in px/s. */
  descentSpeed: number;
  /** Target city index. */
  targetCityIndex: number;
  /** Horizontal oscillation phase (radians). */
  private swayPhase: number;
  /** Base X for sway calculation. */
  private baseX: number;
  /** Whether this paratrooper has been destroyed/neutralised. */
  destroyed: boolean;
  /** Target city reference. */
  private targetCity: City;
  /** Whether reduced motion is preferred. */
  private reducedMotion: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    descentSpeed: number,
    targetCityIndex: number,
    cities: City[],
  ) {
    super(scene, x, y);

    this.threatId = generateParatrooperId();
    this.descentSpeed = descentSpeed;
    this.targetCityIndex = targetCityIndex;
    this.destroyed = false;
    this.swayPhase = 0;
    this.baseX = x;
    this.targetCity = cities[targetCityIndex];

    // Check reduced motion preference
    this.reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Create paratrooper visual (rectangle placeholder)
    const body = scene.add.rectangle(0, 0, 14, 28, COLOR_PARATROOPER);
    this.add(body);

    // Canopy visual (small circle above body)
    const canopy = scene.add.circle(0, -20, 10, COLOR_PARATROOPER, 0.5);
    this.add(canopy);

    this.setSize(14, 28);
    this.setDepth(10);

    scene.add.existing(this);
  }

  /** Descend toward target city with horizontal sway. */
  preUpdate(time: number, delta: number): void {
    if (this.destroyed) return;

    // Move downward
    this.y += (this.descentSpeed * delta) / 1000;

    // Horizontal sway (unless reduced motion)
    if (!this.reducedMotion) {
      this.swayPhase += (Math.PI * 2 * delta) / SWAY_CYCLE_MS;
      this.x = this.baseX + Math.sin(this.swayPhase) * SWAY_AMPLITUDE;
    }

    // Check if reached target city
    const targetPoint = this.targetCity.getTargetPoint();
    if (this.y >= targetPoint.y) {
      this.onLandOnCity();
    }
  }

  /**
   * Caught in a blast radius. Plays neutralised animation.
   * Emits PARATROOPER_CAUGHT and THREAT_DESTROYED.
   */
  neutralise(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    // Emit PARATROOPER_CAUGHT
    this.scene.events.emit(GameEvents.PARATROOPER_CAUGHT, {
      paratrooperId: this.threatId,
    });

    // Emit THREAT_DESTROYED with position
    const payload: ThreatDestroyedPayload & { x: number; y: number } = {
      threatId: this.threatId,
      threatType: 'paratrooper',
      points: SCORE_VALUES.paratrooper,
      chainReaction: true,
      x: this.x,
      y: this.y,
    };
    this.scene.events.emit(GameEvents.THREAT_DESTROYED, payload);

    // Float up and fade animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 40,
      alpha: 0,
      duration: 400,
      ease: 'Linear',
      onComplete: () => {
        this.destroy();
      },
    });
  }

  /**
   * Reached the city. Calls city.hit(). Emits PARATROOPER_LANDED.
   * Does NOT emit THREAT_DESTROYED.
   */
  private onLandOnCity(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    this.targetCity.hit();

    const payload: ParatrooperLandedPayload = {
      paratrooperId: this.threatId,
      cityIndex: this.targetCityIndex,
    };
    this.scene.events.emit(GameEvents.PARATROOPER_LANDED, payload);

    this.destroy();
  }

  /** Returns world position as { x, y }. */
  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
