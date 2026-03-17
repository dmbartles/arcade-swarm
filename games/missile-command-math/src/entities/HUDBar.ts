/**
 * HUDBar.ts — HUD display container for Missile Command Math.
 *
 * The HUD bar at y=600. Listens for events and updates text display.
 * Does not emit events.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import Phaser from 'phaser';
import { SPRITE_KEYS } from '../assets/index';
import type { IScoreManager } from '../types/IScoreManager';

export class HUDBar extends Phaser.GameObjects.Container {
  /** Score manager reference for direct score reads. */
  private scoreManager: IScoreManager;

  /** HUD text elements. */
  private populationText: Phaser.GameObjects.Text | null = null;
  private missilesText: Phaser.GameObjects.Text | null = null;
  private levelText: Phaser.GameObjects.Text | null = null;

  /**
   * @param scene          - Parent scene.
   * @param scoreManager   - Reference to the ScoreManager instance.
   */
  constructor(scene: Phaser.Scene, scoreManager: IScoreManager) {
    super(scene, 0, 600);

    this.scoreManager = scoreManager;

    this.buildVisual();
    scene.add.existing(this);
  }

  /** Update population text. */
  updatePopulation(value: string): void {
    if (this.populationText) {
      this.populationText.setText(`POPULATION REMAINING ${value}`);
    }
  }

  /** Update missiles remaining text. */
  updateMissiles(count: number): void {
    if (this.missilesText) {
      this.missilesText.setText(`MISSILES REMAINING ${count}`);
    }
  }

  /** Update level text. */
  updateLevel(level: number): void {
    if (this.levelText) {
      this.levelText.setText(`LEVEL ${level}`);
    }
  }

  // ── Private Methods ──────────────────────────────────────────────────────

  /**
   * Build visual: add HUD bar sprite, create three Text objects.
   * Text style: Courier New monospace, 18px bold, #C8952A.
   * Positions from style guide UI layout table.
   */
  private buildVisual(): void {
    // Background bar
    const bar = this.scene.add.image(400, 20, SPRITE_KEYS.HUD_BAR);
    bar.setOrigin(0.5, 0.5);
    this.add(bar);

    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#C8952A',
    };

    // Population text (x=20, y=10 relative to HUD bar at y=600 → absolute y=610 → relative y=10)
    this.populationText = this.scene.add.text(20, 10, 'POPULATION REMAINING 255,706', textStyle);
    this.populationText.setOrigin(0, 0.5);
    this.add(this.populationText);

    // Separator 1 at x=305
    const sep1 = this.scene.add.text(305, 10, '|', textStyle);
    sep1.setOrigin(0.5, 0.5);
    this.add(sep1);

    // Missiles text at x=320
    this.missilesText = this.scene.add.text(320, 10, 'MISSILES REMAINING 3', textStyle);
    this.missilesText.setOrigin(0, 0.5);
    this.add(this.missilesText);

    // Separator 2 at x=525
    const sep2 = this.scene.add.text(525, 10, '|', textStyle);
    sep2.setOrigin(0.5, 0.5);
    this.add(sep2);

    // Level text at x=540
    this.levelText = this.scene.add.text(540, 10, 'LEVEL 1', textStyle);
    this.levelText.setOrigin(0, 0.5);
    this.add(this.levelText);

    // Score display is managed externally (GameScene wires SCORE_UPDATED)
    // Ignoring scoreManager read here — score is displayed elsewhere in GameScene
    void this.scoreManager;
  }
}
