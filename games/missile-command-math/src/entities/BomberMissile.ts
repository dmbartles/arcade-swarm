/**
 * BomberMissile — Missile dropped by a Strategic Bomber.
 *
 * Descends vertically from the bomber's drop position toward a target city.
 * Extends StandardMissile with a reference to the parent bomber.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import Phaser from 'phaser';
import type { IMathProblem } from '../types/IMathProblem';
import { StandardMissile } from './StandardMissile';
import type { City } from './City';

export class BomberMissile extends StandardMissile {
  /** Reference ID of the parent bomber that dropped this missile. */
  readonly parentBomberId: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    problem: IMathProblem,
    targetCityIndex: number,
    speed: number,
    cities: City[],
    parentBomberId: string,
  ) {
    super(scene, x, problem, targetCityIndex, speed, cities);

    // Override starting Y position (drops from bomber's Y)
    this.y = y;
    this.parentBomberId = parentBomberId;

    // Override threat type for payload events
    this._threatType = 'bomber-missile';
  }

  /** Descends vertically from drop Y toward target city. */
  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
  }
}
