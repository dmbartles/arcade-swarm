/**
 * StrategicBomber — Flies horizontally and drops payload missiles.
 *
 * Has a bonus math problem that awards extra points if intercepted
 * before payload drop. Drops BomberMissile entities at screen center.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import Phaser from 'phaser';
import type { IMathProblem } from '../types/IMathProblem';
import { GameEvents } from '../types/GameEvents';
import type {
  ThreatDestroyedPayload,
  ThreatSpawnedPayload,
  BomberPayloadDroppedPayload,
} from '../types/GameEvents';
import { CANVAS_WIDTH } from '../config/gameConfig';
import { COLOR_BOMBER } from '../config/styleConfig';
import { TEXT_MISSILE_PROBLEM } from '../config/styleConfig';
import { SCORE_VALUES } from '../config/scoreConfig';
import { BomberMissile } from './BomberMissile';
import type { City } from './City';

/** Y position for bomber flight path. */
const BOMBER_Y = 120;
/** Minimum interactive hit area for accessibility (60×60). */
const MIN_TAP_SIZE = 60;

/** Counter for generating unique bomber IDs. */
let bomberCounter = 0;

function generateBomberId(): string {
  bomberCounter += 1;
  return `bomber-${Date.now()}-${bomberCounter}`;
}

export class StrategicBomber extends Phaser.GameObjects.Container {
  /** Unique runtime ID. */
  readonly threatId: string;
  /** The bonus math problem attached to this bomber. */
  bonusProblem: IMathProblem;
  /** Problems for payload missiles. */
  private payloadProblems: IMathProblem[];
  /** Number of payload missiles this bomber will drop. */
  payloadCount: number;
  /** Horizontal direction: 1 = left→right, -1 = right→left. */
  horizontalDir: 1 | -1;
  /** Speed in px/s. */
  speed: number;
  /** True once payload has been dropped. */
  hasDroppedPayload: boolean;
  /** Whether this bomber has been destroyed. */
  destroyed: boolean;
  /** Target city index (for interface compliance). */
  targetCityIndex: number;
  /** Reference to cities. */
  private cities: City[];
  /** Problem text display. */
  private problemText: Phaser.GameObjects.Text;
  /** Whether the drop zone has been reached. */
  private dropZoneReached: boolean;
  /** The math problem reference (for the IThreat interface). */
  problem: IMathProblem;

  constructor(
    scene: Phaser.Scene,
    bonusProblem: IMathProblem,
    payloadProblems: IMathProblem[],
    cities: City[],
    speed: number,
    payloadCount: number,
    horizontalDir: 1 | -1,
  ) {
    const startX = horizontalDir === 1 ? -80 : CANVAS_WIDTH + 80;
    super(scene, startX, BOMBER_Y);

    this.threatId = generateBomberId();
    this.bonusProblem = bonusProblem;
    this.problem = bonusProblem;
    this.payloadProblems = payloadProblems;
    this.cities = cities;
    this.speed = speed;
    this.payloadCount = payloadCount;
    this.horizontalDir = horizontalDir;
    this.hasDroppedPayload = false;
    this.destroyed = false;
    this.targetCityIndex = 0; // Bombers don't target a specific city
    this.dropZoneReached = false;

    // Create bomber visual (rectangle placeholder for sprite)
    const body = scene.add.rectangle(0, 0, 80, 28, COLOR_BOMBER);
    this.add(body);

    // Create bonus problem text
    this.problemText = scene.add.text(0, -20, bonusProblem.question, TEXT_MISSILE_PROBLEM);
    this.problemText.setOrigin(0.5, 0.5);
    this.add(this.problemText);

    // Flip if going right to left
    if (horizontalDir === -1) {
      body.setScale(-1, 1);
    }

    // Set interactive with 60×60 minimum tap target
    this.setSize(80, MIN_TAP_SIZE);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-40, -MIN_TAP_SIZE / 2, 80, MIN_TAP_SIZE),
      Phaser.Geom.Rectangle.Contains,
    );

    this.setDepth(12);
    scene.add.existing(this);

    // Emit THREAT_SPAWNED
    const spawnPayload: ThreatSpawnedPayload = {
      threatId: this.threatId,
      threatType: 'bomber',
      problem: this.bonusProblem,
    };
    this.scene.events.emit(GameEvents.THREAT_SPAWNED, spawnPayload);
  }

  /** Move horizontally, drop payload at screen center. */
  preUpdate(_time: number, delta: number): void {
    if (this.destroyed) return;

    // Move horizontally
    this.x += this.horizontalDir * (this.speed * delta) / 1000;

    // Check if reached drop zone (center of screen)
    const dropZoneX = CANVAS_WIDTH / 2;
    if (!this.dropZoneReached && !this.hasDroppedPayload) {
      if (
        (this.horizontalDir === 1 && this.x >= dropZoneX) ||
        (this.horizontalDir === -1 && this.x <= dropZoneX)
      ) {
        this.dropZoneReached = true;
        this.dropPayload();
      }
    }

    // Check exit
    if (this.horizontalDir === 1 && this.x > CANVAS_WIDTH + 100) {
      this.removeBomber();
    } else if (this.horizontalDir === -1 && this.x < -100) {
      this.removeBomber();
    }
  }

  /**
   * Drop the payload: spawn BomberMissile entities,
   * emit BOMBER_PAYLOAD_DROPPED, set hasDroppedPayload = true.
   */
  dropPayload(): void {
    if (this.hasDroppedPayload || this.destroyed) return;
    this.hasDroppedPayload = true;

    const droppedMissileIds: string[] = [];

    // Pick target cities for payload missiles
    const aliveCities = this.cities
      .map((c, i) => ({ city: c, index: i }))
      .filter((entry) => !entry.city.destroyed);

    for (let i = 0; i < this.payloadCount; i++) {
      const problem = this.payloadProblems[i] ?? this.bonusProblem;
      const targetEntry = aliveCities[i % aliveCities.length] ?? { index: 0 };
      const spreadX = this.x + (i - (this.payloadCount - 1) / 2) * 20;

      const missile = new BomberMissile(
        this.scene,
        spreadX,
        this.y,
        problem,
        targetEntry.index,
        this.speed * 0.5,
        this.cities,
        this.threatId,
      );

      droppedMissileIds.push(missile.threatId);
    }

    const payload: BomberPayloadDroppedPayload = {
      bomberThreatId: this.threatId,
      droppedMissileIds,
    };
    this.scene.events.emit(GameEvents.BOMBER_PAYLOAD_DROPPED, payload);
  }

  /**
   * Intercept this bomber (player taps correct answer before payload drop).
   * Points: SCORE_VALUES.bomberBeforeDrop (+100).
   */
  intercept(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    const points = this.hasDroppedPayload
      ? SCORE_VALUES.bomberAfterDrop
      : SCORE_VALUES.bomberBeforeDrop;

    const payload: ThreatDestroyedPayload & { x: number; y: number } = {
      threatId: this.threatId,
      threatType: 'bomber',
      points,
      chainReaction: false,
      x: this.x,
      y: this.y,
    };
    this.scene.events.emit(GameEvents.THREAT_DESTROYED, payload);

    this.disableInteractive();
    this.destroy();
  }

  /**
   * Destroy after payload drop.
   * Points: SCORE_VALUES.bomberAfterDrop (+40).
   */
  destroyAfterDrop(): void {
    this.intercept();
  }

  /** Returns the correct answer for the bomber's bonus problem. */
  getAnswer(): number | string {
    return this.bonusProblem.correctAnswer;
  }

  /** Returns world position as { x, y }. */
  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /** Clean up bomber when it exits the screen. */
  private removeBomber(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.disableInteractive();
    this.destroy();
  }
}
