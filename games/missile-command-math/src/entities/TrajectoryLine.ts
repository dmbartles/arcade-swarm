/**
 * TrajectoryLine — Dashed line from a missile to its target city.
 *
 * Rendered via Phaser.GameObjects.Graphics since Phaser does not natively
 * support dashed lines. The line is redrawn each frame as the missile moves.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 * @see docs/style-guides/missile-command-math.md §Visual Effects
 */

import Phaser from 'phaser';
import { COLOR_TRAJECTORY, TRAJECTORY_ALPHA } from '../config/styleConfig';

/** Dash pattern: 6 px on, 4 px off. */
const DASH_ON = 6;
const DASH_OFF = 4;
const LINE_WIDTH = 1;

export class TrajectoryLine extends Phaser.GameObjects.Graphics {
  /** The missile this line tracks (needs getPosition()). */
  private missileRef: { getPosition(): { x: number; y: number } };
  /** Target city center point. */
  private targetPoint: { x: number; y: number };

  constructor(
    scene: Phaser.Scene,
    missileRef: { getPosition(): { x: number; y: number } },
    targetPoint: { x: number; y: number },
  ) {
    super(scene);
    this.missileRef = missileRef;
    this.targetPoint = targetPoint;

    scene.add.existing(this);
    this.setDepth(1);
  }

  /**
   * Redraws the dashed line from missile's current position to city's target point.
   * Uses COLOR_TRAJECTORY at TRAJECTORY_ALPHA, 1 px stroke, 6 on / 4 off dash.
   * Must be called each frame from missile's preUpdate().
   */
  redraw(): void {
    this.clear();

    const missilePos = this.missileRef.getPosition();
    const startX = missilePos.x;
    const startY = missilePos.y;
    const endX = this.targetPoint.x;
    const endY = this.targetPoint.y;

    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const unitX = dx / dist;
    const unitY = dy / dist;

    this.lineStyle(LINE_WIDTH, COLOR_TRAJECTORY, TRAJECTORY_ALPHA);

    let drawn = 0;
    let drawing = true;

    while (drawn < dist) {
      const segLen = drawing ? DASH_ON : DASH_OFF;
      const actualLen = Math.min(segLen, dist - drawn);

      if (drawing) {
        const sx = startX + unitX * drawn;
        const sy = startY + unitY * drawn;
        const ex = startX + unitX * (drawn + actualLen);
        const ey = startY + unitY * (drawn + actualLen);

        this.beginPath();
        this.moveTo(sx, sy);
        this.lineTo(ex, ey);
        this.strokePath();
      }

      drawn += actualLen;
      drawing = !drawing;
    }
  }

  /** Remove this line from the scene. Called by missile.intercept(). */
  remove(): void {
    this.clear();
    this.destroy();
  }
}
