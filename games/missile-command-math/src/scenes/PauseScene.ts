/**
 * PauseScene — Overlay pause scene launched on top of GameScene.
 *
 * Launched via scene.launch() so GameScene remains mounted in background.
 * Provides Resume and Quit buttons. Resume emits GAME_RESUMED.
 *
 * @see docs/build-plans/missile-command-math-engine.md §2.18
 */

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig';
import { GameEvents } from '../types/GameEvents';

const TITLE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '32px',
  fontStyle: 'bold',
  color: '#C8952A',
  align: 'center',
};

const BUTTON_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '20px',
  fontStyle: 'bold',
  color: '#C8952A',
  align: 'center',
};

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create(): void {
    this.buildOverlay();
  }

  // ── Private ────────────────────────────────────────────────────────────────

  /** Render the semi-transparent overlay with Resume and Quit buttons. */
  private buildOverlay(): void {
    const cx = CANVAS_WIDTH / 2;

    // Semi-transparent dark overlay covering the full canvas
    this.add.rectangle(cx, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.6);

    // Pause panel
    this.add.rectangle(cx, 280, 400, 260, 0x1A0A00, 0.92)
      .setStrokeStyle(3, 0xC8952A, 1);

    // Title
    this.add.text(cx, 190, '— PAUSED —', TITLE_STYLE).setOrigin(0.5, 0.5);

    // Resume button
    this.createButton(cx, 270, '▶  RESUME', () => this.onResume());

    // Quit button
    this.createButton(cx, 340, '✕  QUIT TO MENU', () => this.onQuit());
  }

  /** Create an interactive button. */
  private createButton(x: number, y: number, label: string, callback: () => void): void {
    const bg = this.add.rectangle(x, y, 280, 52, 0xC8952A, 0.15)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xC8952A, 0.6);

    this.add.text(x, y, label, BUTTON_STYLE).setOrigin(0.5, 0.5);

    bg.on('pointerover', () => bg.setFillStyle(0xC8952A, 0.3));
    bg.on('pointerout',  () => bg.setFillStyle(0xC8952A, 0.15));
    bg.on('pointerdown', () => callback());
  }

  /**
   * Resume: emit GAME_RESUMED (GameScene listens) then stop this overlay.
   */
  private onResume(): void {
    // Emit on the global event emitter so GameScene receives it
    this.game.events.emit(GameEvents.GAME_RESUMED);
    this.scene.stop('PauseScene');
  }

  /**
   * Quit: stop both PauseScene and GameScene, then start MenuScene.
   */
  private onQuit(): void {
    this.scene.stop('PauseScene');
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }
}
