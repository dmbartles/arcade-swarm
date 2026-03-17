/**
 * LevelReadyScene — "LEVEL X — READY?" interstitial prompt.
 *
 * Shown before practice levels (levels that do not introduce a new operation).
 * Player taps anywhere or the "READY!" button to begin.
 *
 * @see docs/build-plans/missile-command-math-engine.md §2.11
 */

import Phaser from 'phaser';
import { SPRITE_KEYS } from '../assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig';
import { LEVEL_CONFIGS } from '../config/difficultyConfig';
import { GameEvents } from '../types/GameEvents';

const LEVEL_READY_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '28px',
  fontStyle: 'bold',
  color: '#C8952A',
  align: 'center',
};

const SUBTITLE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '16px',
  color: '#7A5A1A',
  align: 'center',
};

const BUTTON_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '20px',
  fontStyle: 'bold',
  color: '#C8952A',
  align: 'center',
};

export class LevelReadyScene extends Phaser.Scene {
  private level = 1;

  constructor() {
    super({ key: 'LevelReadyScene' });
  }

  init(data: { level: number }): void {
    this.level = data.level ?? 1;
  }

  create(): void {
    this.buildPrompt();
  }

  // ── Private ────────────────────────────────────────────────────────────────

  /** Render the "LEVEL X — READY?" prompt. */
  private buildPrompt(): void {
    const cx = CANVAS_WIDTH / 2;

    // Background
    this.add.rectangle(cx, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0xC8B8DC);
    this.add.rectangle(400, 280, 760, 480, 0xE8E0F0);
    this.add.image(20, 20, SPRITE_KEYS.CRT_FRAME).setOrigin(0, 0);
    this.add.image(0, 600, SPRITE_KEYS.HUD_BAR).setOrigin(0, 0);

    // Level ready text
    this.add.text(cx, 220, `LEVEL ${this.level} — READY?`, LEVEL_READY_STYLE)
      .setOrigin(0.5, 0.5);

    // Skill info
    const levelCfg = LEVEL_CONFIGS[this.level];
    if (levelCfg) {
      this.add.text(cx, 270, levelCfg.skillType, SUBTITLE_STYLE).setOrigin(0.5, 0.5);
      this.add.text(
        cx, 300,
        `${levelCfg.enemyCount} waves  |  Max ${levelCfg.maxSimultaneous} simultaneous`,
        SUBTITLE_STYLE
      ).setOrigin(0.5, 0.5);
    }

    // Difficulty indicator
    this.add.text(cx, 340, `DIFFICULTY: ${levelCfg?.difficulty ?? 'NORMAL'}`, {
      ...SUBTITLE_STYLE,
      color: '#4A2808',
    }).setOrigin(0.5, 0.5);

    // Ready button
    const btnY = 420;
    const btnZone = this.add.rectangle(cx, btnY, 240, 52, 0xC8952A, 0.15)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xC8952A, 0.7);

    this.add.text(cx, btnY, 'READY!', BUTTON_STYLE).setOrigin(0.5, 0.5);

    btnZone.on('pointerover', () => btnZone.setFillStyle(0xC8952A, 0.3));
    btnZone.on('pointerout',  () => btnZone.setFillStyle(0xC8952A, 0.15));
    btnZone.on('pointerdown', () => this.onReady());

    // Also allow tap anywhere on the playfield to dismiss
    this.input.on('pointerdown', () => this.onReady());
  }

  /** Emit INTERSTITIAL_DISMISSED and launch GameScene. */
  private onReady(): void {
    this.events.emit(GameEvents.INTERSTITIAL_DISMISSED);
    this.scene.start('GameScene', { level: this.level });
  }
}
