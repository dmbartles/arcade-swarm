/**
 * MIRVChild — Child warhead spawned by a MIRV split.
 *
 * Extends StandardMissile with a reference to the parent MIRV.
 * Uses COLOR_MIRV_CHILD tint and moves slightly faster than the parent.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import Phaser from 'phaser';
import type { IMathProblem } from '../types/IMathProblem';
import { StandardMissile } from './StandardMissile';
import type { City } from './City';
import { COLOR_MIRV_CHILD } from '../config/styleConfig';

export class MIRVChild extends StandardMissile {
  /** Reference ID of the parent MIRV that spawned this child. */
  readonly parentMIRVId: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    problem: IMathProblem,
    targetCityIndex: number,
    speed: number,
    cities: City[],
    parentMIRVId: string,
  ) {
    super(scene, x, problem, targetCityIndex, speed, cities);

    // Override starting Y position (spawn at parent's split position)
    this.y = y;
    this.parentMIRVId = parentMIRVId;

    // Override threat type for payload events
    this._threatType = 'mirv-child';

    // Apply MIRV child color tint
    this.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Rectangle) {
        (child as Phaser.GameObjects.Rectangle).setFillStyle(COLOR_MIRV_CHILD);
      }
    });
  }
}
