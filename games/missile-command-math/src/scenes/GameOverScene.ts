/**
 * GameOverScene — Failure state screen.
 *
 * All buildings destroyed. Shows final score and offers Retry / Level Select.
 *
 * @see docs/build-plans/missile-command-math-engine.md §2.14
 */

import Phaser from 'phaser';
import { SPRITE_KEYS } from '../assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig';
import type { GameOverPayload } from '../types/GameEvents';

const TITLE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '44px',
  fontStyle: 'bold',
  color: '#E03030',
  align: 'center',
};

const SCORE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '22px',
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

const SUB_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '16px',
  color: '#7A5A1A',
  align: 'center',
};

export class GameOverScene extends Phaser.Scene {
  private payload: GameOverPayload = { level: 1, finalScore: 0 };

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverPayload): void {
    this.payload = data ?? { level: 1, finalScore: 0 };
  }

  create(): void {
    const cx = CANVAS_WIDTH / 2;

    // Background layers
    this.add.rectangle(cx, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0xC8B8DC);
    this.add.rectangle(400, 280, 760, 480, 0xE8E0F0);
    this.add.image(20, 20, SPRITE_KEYS.CRT_FRAME).setOrigin(0, 0);
    this.add.image(0, 600, SPRITE_KEYS.HUD_BAR).setOrigin(0, 0);

    // Title
    this.add.text(cx, 160, 'GAME OVER', TITLE_STYLE).setOrigin(0.5, 0.5);

    // Subtitle
    this.add.text(cx, 215, 'All cities destroyed', SUB_STYLE).setOrigin(0.5, 0.5);

    // Score / level info
    this.add.text(cx, 270, `LEVEL: ${this.payload.level}`, SCORE_STYLE).setOrigin(0.5, 0.5);
    this.add.text(
      cx, 310,
      `FINAL SCORE: ${this.payload.finalScore.toLocaleString()}`,
      SCORE_STYLE
    ).setOrigin(0.5, 0.5);

    // Retry button
    this.createButton(cx, 390, '↺  RETRY LEVEL', () => this.onRetry());

    // Level select button
    this.createButton(cx, 455, '☰  LEVEL SELECT', () => this.onMenu());
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private createButton(x: number, y: number, label: string, callback: () => void): void {
    const bg = this.add.rectangle(x, y, 280, 52, 0xC8952A, 0.15)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xC8952A, 0.6);

    this.add.text(x, y, label, BUTTON_STYLE).setOrigin(0.5, 0.5);

    bg.on('pointerover', () => bg.setFillStyle(0xC8952A, 0.3));
    bg.on('pointerout',  () => bg.setFillStyle(0xC8952A, 0.15));
    bg.on('pointerdown', () => callback());
  }

  /** Retry the same level. */
  private onRetry(): void {
    this.scene.start('GameScene', { level: this.payload.level });
  }

  /** Return to menu / level select. */
  private onMenu(): void {
    this.scene.start('MenuScene');
  }
}
