/**
 * MenuScene — Title screen with Play / Level Select / Settings buttons.
 *
 * Renders the CRT bezel, game title, and three interactive menu buttons.
 * Determines whether to route the player to training, briefing, or direct play.
 *
 * @see docs/build-plans/missile-command-math-engine.md §2.8
 */

import Phaser from 'phaser';
import { SPRITE_KEYS } from '../assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig';
import { LEVEL_CONFIGS } from '../config/difficultyConfig';
import { SOUND_EVENTS } from '../config/audioConfig';

/** Y offset for the title text within the playfield. */
const TITLE_Y = 160;

/** Y of the first button. */
const BUTTON_START_Y = 300;

/** Vertical gap between buttons. */
const BUTTON_GAP = 70;

/** Button hit-zone dimensions. */
const BUTTON_WIDTH  = 300;
const BUTTON_HEIGHT = 52;

/** Text styles */
const TITLE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '48px',
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

const SUBTITLE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '14px',
  color: '#7A5A1A',
  align: 'center',
};

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Resume AudioContext on first user gesture (browser policy requires user interaction)
    this.input.once('pointerdown', () => {
      (this.game.registry.get('audioManager') as { resume(): Promise<void> } | undefined)
        ?.resume();
    });
    this.buildUI();
  }

  // ── Private ────────────────────────────────────────────────────────────────

  /** Render the CRT bezel, title text, subtitle, and three menu buttons. */
  private buildUI(): void {
    const cx = CANVAS_WIDTH / 2;

    // Playfield background
    this.add.rectangle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      0xC8B8DC
    );

    // Playfield interior — fills the bezel interior (bezel inner edge at ~14px inset)
    this.add.rectangle(400, 260, 772, 492, 0xE8E0F0);

    // CRT frame bezel — 800×520, must sit at (0,0) or it overflows the canvas
    this.add.image(0, 0, SPRITE_KEYS.CRT_FRAME).setOrigin(0, 0);

    // Game title
    this.add.text(cx, TITLE_Y, 'MISSILE\nCOMMAND MATH', TITLE_STYLE)
      .setOrigin(0.5, 0.5);

    // Subtitle / grade range
    this.add.text(cx, TITLE_Y + 80, 'GRADES 3–5  |  DEFEND YOUR CITIES!', SUBTITLE_STYLE)
      .setOrigin(0.5, 0.5);

    // ── Buttons ──
    this.createButton(cx, BUTTON_START_Y,            '▶  PLAY',          () => this.onPlay());
    this.createButton(cx, BUTTON_START_Y + BUTTON_GAP, '☰  LEVEL SELECT', () => this.onLevelSelect());
    this.createButton(cx, BUTTON_START_Y + BUTTON_GAP * 2, '⚙  SETTINGS',  () => this.onSettings());

    // Version stamp
    this.add.text(CANVAS_WIDTH - 12, CANVAS_HEIGHT - 8, 'v0.1', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '11px',
      color: '#7A5A1A',
    }).setOrigin(1, 1);
  }

  /**
   * Create a styled interactive button centered at (x, y).
   * The button is a hit-zone rectangle behind a text label.
   */
  private createButton(x: number, y: number, label: string, callback: () => void): void {
    // Invisible hit zone (ensures minimum 60px touch target vertically)
    const zone = this.add.rectangle(x, y, BUTTON_WIDTH, BUTTON_HEIGHT, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    // Button background (subtle)
    const bg = this.add.rectangle(x, y, BUTTON_WIDTH, BUTTON_HEIGHT, 0xC8952A, 0.12)
      .setStrokeStyle(1.5, 0xC8952A, 0.5);

    // Label text
    this.add.text(x, y, label, BUTTON_STYLE).setOrigin(0.5, 0.5);

    // Hover / press feedback
    zone.on('pointerover', () => { bg.setFillStyle(0xC8952A, 0.25); });
    zone.on('pointerout',  () => { bg.setFillStyle(0xC8952A, 0.12); });
    zone.on('pointerdown', () => {
      bg.setFillStyle(0xC8952A, 0.4);
      this.playButtonSound();
      callback();
    });
  }

  /**
   * Play button — route to the appropriate first scene.
   *
   * - If the player has never seen training → TrainingBriefScene
   * - Otherwise start at level 1; check if BriefingScene needed
   */
  private onPlay(): void {
    const hasSeenTraining = this.registry.get('hasSeenTraining') as boolean;

    if (!hasSeenTraining) {
      this.scene.start('TrainingBriefScene');
      return;
    }

    // Start at level 1 (the lowest non-training level)
    const targetLevel = 1;
    const levelCfg = LEVEL_CONFIGS[targetLevel];
    const needsBriefing = levelCfg.specialRule?.includes('new-op') ?? false;

    if (needsBriefing) {
      this.scene.start('BriefingScene', { level: targetLevel });
    } else {
      this.scene.start('LevelReadyScene', { level: targetLevel });
    }
  }

  /** Open the level select grid. */
  private onLevelSelect(): void {
    this.scene.start('LevelSelectScene');
  }

  /** Open settings (sound toggle, difficulty). */
  private onSettings(): void {
    this.scene.start('SettingsScene');
  }

  /** Play button click sound via AudioManager. */
  private playButtonSound(): void {
    (this.game.registry.get('audioManager') as { playSFX(s: string): void } | undefined)
      ?.playSFX(SOUND_EVENTS.MENU_BUTTON_CLICK);
  }
}
