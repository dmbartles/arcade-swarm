/**
 * StandardMissile — Base missile class carrying a math problem.
 *
 * All other missile types extend this. Descends toward a target city
 * at a configured speed, displaying its math problem text.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 * @see docs/style-guides/missile-command-math.md §Sprite Specifications
 */

import Phaser from 'phaser';
import type { IMathProblem } from '../types/IMathProblem';
import { GameEvents } from '../types/GameEvents';
import type { ThreatDestroyedPayload, ThreatSpawnedPayload } from '../types/GameEvents';
import { COLOR_MISSILE_BODY } from '../config/styleConfig';
import { TEXT_MISSILE_PROBLEM } from '../config/styleConfig';
import { TrajectoryLine } from './TrajectoryLine';
import type { City } from './City';

/** Minimum interactive hit area for accessibility (60×60). */
const MIN_TAP_SIZE = 60;

/** Counter for generating unique threat IDs. */
let threatCounter = 0;

/**
 * Generate a unique threat ID.
 * @returns A unique string ID for this threat instance.
 */
function generateThreatId(): string {
  threatCounter += 1;
  return `threat-${Date.now()}-${threatCounter}`;
}

export class StandardMissile extends Phaser.GameObjects.Container {
  /** Unique ID for this threat instance. */
  readonly threatId: string;
  /** Math problem displayed on this missile's body. */
  problem: IMathProblem;
  /** Index of the target city (0–5). */
  targetCityIndex: number;
  /** Speed in px/s. */
  speed: number;
  /** Whether this missile has already been destroyed. */
  destroyed: boolean;
  /** Reference to the attached TrajectoryLine. */
  private trajectoryLine: TrajectoryLine;
  /** Reference to the math problem text object. */
  private problemText: Phaser.GameObjects.Text;
  /** The missile body visual. */
  private missileBody: Phaser.GameObjects.Rectangle;
  /** Target city reference for trajectory computation. */
  private targetCity: City;
  /** Whether the spawn tween has been played. */
  private spawnTweenPlayed: boolean;
  /** The threat type for event payloads (protected for subclass override, public getter below). */
  protected _threatType: string = 'standard-missile';

  constructor(
    scene: Phaser.Scene,
    x: number,
    problem: IMathProblem,
    targetCityIndex: number,
    speed: number,
    cities: City[],
  ) {
    super(scene, x, 0);

    this.threatId = generateThreatId();
    this.problem = problem;
    this.targetCityIndex = targetCityIndex;
    this.speed = speed;
    this.destroyed = false;
    this.spawnTweenPlayed = false;
    this.targetCity = cities[targetCityIndex];

    // Create missile body (rectangle placeholder for sprite)
    this.missileBody = scene.add.rectangle(0, 0, 16, 40, COLOR_MISSILE_BODY);
    this.add(this.missileBody);

    // Create math problem text
    this.problemText = scene.add.text(0, 0, problem.question, TEXT_MISSILE_PROBLEM);
    this.problemText.setOrigin(0.5, 0.5);
    this.add(this.problemText);

    // Set container size and make interactive with 60×60 minimum tap target
    this.setSize(MIN_TAP_SIZE, MIN_TAP_SIZE);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-MIN_TAP_SIZE / 2, -MIN_TAP_SIZE / 2, MIN_TAP_SIZE, MIN_TAP_SIZE),
      Phaser.Geom.Rectangle.Contains,
    );

    // Create trajectory line to target city
    const targetPoint = this.targetCity.getTargetPoint();
    this.trajectoryLine = new TrajectoryLine(scene, this, targetPoint);

    this.setDepth(10);
    scene.add.existing(this);

    // Spawn tween: scale 0 → 1 over 80 ms using Back.Out
    this.setScale(0);
    scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 80,
      ease: 'Back.Out',
      onComplete: () => {
        this.spawnTweenPlayed = true;
      },
    });

    // Emit THREAT_SPAWNED
    const spawnPayload: ThreatSpawnedPayload = {
      threatId: this.threatId,
      threatType: 'standard-missile',
      problem: this.problem,
      targetCityIndex: this.targetCityIndex,
    };
    this.scene.events.emit(GameEvents.THREAT_SPAWNED, spawnPayload);
  }

  /** Called each frame by Phaser update loop. Moves missile toward target city. */
  preUpdate(time: number, delta: number): void {
    if (this.destroyed) return;

    const targetPoint = this.targetCity.getTargetPoint();
    const dx = targetPoint.x - this.x;
    const dy = targetPoint.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      this.onReachCity();
      return;
    }

    const moveAmount = (this.speed * delta) / 1000;
    const unitX = dx / dist;
    const unitY = dy / dist;

    this.x += unitX * moveAmount;
    this.y += unitY * moveAmount;

    // Redraw trajectory line each frame
    this.trajectoryLine.redraw();
  }

  /**
   * Destroy this missile (intercepted or chain reaction).
   * Emits THREAT_DESTROYED, removes trajectory line, removes self from scene.
   * @param chainReaction - true if destroyed by chain reaction (not direct tap).
   * @param points - points to award.
   */
  intercept(chainReaction: boolean, points: number): void {
    if (this.destroyed) return;
    this.destroyed = true;

    const payload: ThreatDestroyedPayload & { x: number; y: number } = {
      threatId: this.threatId,
      threatType: this._threatType as ThreatDestroyedPayload['threatType'],
      points,
      chainReaction,
      x: this.x,
      y: this.y,
    };
    this.scene.events.emit(GameEvents.THREAT_DESTROYED, payload);

    // Remove trajectory line
    this.trajectoryLine.remove();

    // Remove from scene
    this.disableInteractive();
    this.destroy();
  }

  /**
   * Called when this missile reaches its target city.
   * Calls city.hit(). Does NOT emit THREAT_DESTROYED.
   */
  private onReachCity(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    this.targetCity.hit();

    // Remove trajectory line
    this.trajectoryLine.remove();

    // Remove from scene
    this.disableInteractive();
    this.destroy();
  }

  /** Returns world position as { x, y } for explosion origin. */
  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /** Returns the math question string for display. */
  getQuestion(): string {
    return this.problem.question;
  }

  /** Returns the correct answer for this missile's problem. */
  getAnswer(): number | string {
    return this.problem.correctAnswer;
  }

  /** Returns the threat type string for event payloads. */
  get threatType(): string {
    return this._threatType;
  }
}
