/**
 * MIRVMissile — MIRV warhead that splits into child warheads at a set altitude.
 *
 * Descends like a standard missile until reaching splitY, then splits into
 * childCount MIRVChild entities aimed at different cities.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import Phaser from 'phaser';
import type { IMathProblem } from '../types/IMathProblem';
import { GameEvents } from '../types/GameEvents';
import type { MirvSplitPayload } from '../types/GameEvents';
import { StandardMissile } from './StandardMissile';
import { MIRVChild } from './MIRVChild';
import type { City } from './City';
import { PLAY_FIELD_TOP } from '../config/gameConfig';

export class MIRVMissile extends StandardMissile {
  /** Y altitude (world Y) at which this MIRV splits. */
  splitY: number;
  /** Number of children to spawn on split. */
  childCount: number;
  /** True after the split has occurred. */
  hasSplit: boolean;
  /** Child problems assigned for MIRV children. */
  private childProblems: IMathProblem[];
  /** Reference to cities for child spawning. */
  private cities: City[];

  constructor(
    scene: Phaser.Scene,
    x: number,
    problem: IMathProblem,
    targetCityIndex: number,
    speed: number,
    cities: City[],
    splitAltitudePercent: number,
    childCount: number,
    childProblems: IMathProblem[] = [],
  ) {
    super(scene, x, problem, targetCityIndex, speed, cities);

    this.cities = cities;
    this.childCount = childCount;
    this.hasSplit = false;
    this.childProblems = childProblems;

    // Override threat type
    this._threatType = 'mirv';

    // Compute splitY: percentage from top of play field
    const playFieldHeight = scene.scale.height - PLAY_FIELD_TOP;
    this.splitY = PLAY_FIELD_TOP + (playFieldHeight * splitAltitudePercent) / 100;
  }

  /** Overrides to check for splitY threshold before normal movement. */
  preUpdate(time: number, delta: number): void {
    if (this.destroyed) return;

    // Check if we've reached the split altitude
    if (!this.hasSplit && this.y >= this.splitY) {
      this.split();
      return;
    }

    super.preUpdate(time, delta);
  }

  /**
   * Execute the MIRV split: spawn childCount MIRVChild entities,
   * emit MIRV_SPLIT, then destroy self (not a scoring event).
   */
  private split(): void {
    if (this.hasSplit) return;
    this.hasSplit = true;

    const childThreatIds: string[] = [];

    // Choose targets for children (spread across non-destroyed cities)
    const aliveCities = this.cities
      .map((c, i) => ({ city: c, index: i }))
      .filter((entry) => !entry.city.destroyed);

    for (let i = 0; i < this.childCount; i++) {
      const problem = this.childProblems[i] ?? this.problem;
      const targetEntry = aliveCities[i % aliveCities.length] ?? { index: this.targetCityIndex };
      const spreadX = this.x + (i - (this.childCount - 1) / 2) * 30;

      const child = new MIRVChild(
        this.scene,
        spreadX,
        this.y,
        problem,
        targetEntry.index,
        this.speed * 1.2,
        this.cities,
        this.threatId,
      );

      childThreatIds.push(child.threatId);
    }

    // Emit MIRV_SPLIT
    const payload: MirvSplitPayload = {
      parentThreatId: this.threatId,
      childThreatIds,
    };
    this.scene.events.emit(GameEvents.MIRV_SPLIT, payload);

    // Destroy self (no points - this is a split, not an interception)
    this.destroyed = true;
    this.destroy();
  }
}
