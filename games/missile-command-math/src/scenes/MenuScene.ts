/**
 * MenuScene — Title screen with difficulty select and level select.
 *
 * Reads last-used difficulty and level from localStorage (allowed per policy).
 * Transitions to InterstitialScene when the player starts a game.
 *
 * @see docs/gdds/missile-command-math.md §Scene List
 */

import Phaser from 'phaser';
import { CANVAS_WIDTH, SAFE_MARGIN, MIN_TOUCH_TARGET } from '../config/gameConfig';
import {
  COLOR_BG, COLOR_BUTTON_BG, COLOR_BUTTON_BORDER,
  TEXT_TITLE, TEXT_MENU_ITEM, TEXT_BUTTON, FONT_FAMILY,
} from '../config/styleConfig';
import type { DifficultySetting } from '../types/IDifficultyConfig';

/** localStorage keys for persisted preferences (allowed per policy). */
const LS_KEY_DIFFICULTY = 'mcm_difficulty';
const LS_KEY_LEVEL = 'mcm_level';

/** Valid difficulty settings for type guard. */
const VALID_DIFFICULTIES: DifficultySetting[] = ['easy', 'normal', 'hard'];

export default class MenuScene extends Phaser.Scene {
  private selectedDifficulty: DifficultySetting = 'normal';
  private selectedLevel = 1;
  private difficultyButtons: Phaser.GameObjects.Text[] = [];
  private levelButtons: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLOR_BG);
    this.restorePreferences();
    this.renderTitle();
    this.renderDifficultySelector();
    this.renderLevelSelect();
    this.renderStartButton();
  }

  /** Restore last-used difficulty and level from localStorage. */
  private restorePreferences(): void {
    try {
      const storedDiff = localStorage.getItem(LS_KEY_DIFFICULTY);
      if (storedDiff && VALID_DIFFICULTIES.includes(storedDiff as DifficultySetting)) {
        this.selectedDifficulty = storedDiff as DifficultySetting;
      }
      const storedLevel = localStorage.getItem(LS_KEY_LEVEL);
      if (storedLevel) {
        const parsed = parseInt(storedLevel, 10);
        if (parsed >= 1 && parsed <= 10) {
          this.selectedLevel = parsed;
        }
      }
    } catch {
      // localStorage may be unavailable — use defaults
    }
  }

  /** Render the game title. */
  private renderTitle(): void {
    this.add.text(CANVAS_WIDTH / 2, 80, 'MISSILE\nCOMMAND\nMATH', {
      ...TEXT_TITLE,
      align: 'center',
    }).setOrigin(0.5, 0);
  }

  /** Render difficulty selector buttons (Easy / Normal / Hard). */
  private renderDifficultySelector(): void {
    const diffLabel = this.add.text(CANVAS_WIDTH / 2, 240, 'DIFFICULTY', {
      ...TEXT_MENU_ITEM,
      align: 'center',
    }).setOrigin(0.5, 0);
    diffLabel.setAlpha(0.7);

    const options: DifficultySetting[] = ['easy', 'normal', 'hard'];
    const startX = CANVAS_WIDTH / 2 - 140;
    const spacing = 140;

    this.difficultyButtons = options.map((setting, i) => {
      const btn = this.add.text(startX + i * spacing, 280, setting.toUpperCase(), {
        fontFamily: FONT_FAMILY,
        fontSize: '12px',
        color: this.selectedDifficulty === setting ? '#FFD700' : '#E8F4E8',
        align: 'center',
      }).setOrigin(0.5, 0);

      btn.setInteractive({ useHandCursor: true })
        .setPadding(SAFE_MARGIN)
        .on('pointerdown', () => this.onDifficultySelected(setting));

      // Ensure minimum touch target
      const hitArea = new Phaser.Geom.Rectangle(
        -MIN_TOUCH_TARGET / 2, -MIN_TOUCH_TARGET / 2,
        MIN_TOUCH_TARGET, MIN_TOUCH_TARGET,
      );
      btn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

      return btn;
    });
  }

  /** Render the level select grid (1–10). */
  private renderLevelSelect(): void {
    const levelLabel = this.add.text(CANVAS_WIDTH / 2, 340, 'LEVEL SELECT', {
      ...TEXT_MENU_ITEM,
      align: 'center',
    }).setOrigin(0.5, 0);
    levelLabel.setAlpha(0.7);

    const cols = 5;
    const cellW = 70;
    const cellH = 60;
    const gridWidth = cols * cellW;
    const startX = (CANVAS_WIDTH - gridWidth) / 2 + cellW / 2;
    const startY = 390;

    this.levelButtons = [];

    for (let i = 0; i < 10; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;
      const levelNum = i + 1;

      const btn = this.add.text(x, y, `${levelNum}`, {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: this.selectedLevel === levelNum ? '#FFD700' : '#E8F4E8',
        align: 'center',
      }).setOrigin(0.5, 0.5);

      const hitArea = new Phaser.Geom.Rectangle(
        -MIN_TOUCH_TARGET / 2, -MIN_TOUCH_TARGET / 2,
        MIN_TOUCH_TARGET, MIN_TOUCH_TARGET,
      );
      btn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
      btn.on('pointerdown', () => this.onLevelSelected(levelNum));

      this.levelButtons.push(btn);
    }
  }

  /** Render the start/launch button. */
  private renderStartButton(): void {
    const btnX = CANVAS_WIDTH / 2;
    const btnY = 570;
    const btnW = 300;
    const btnH = 60;

    const btnBg = this.add.graphics();
    btnBg.fillStyle(COLOR_BUTTON_BG, 1);
    btnBg.fillRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH);
    btnBg.lineStyle(2, COLOR_BUTTON_BORDER, 1);
    btnBg.strokeRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH);

    const btnText = this.add.text(btnX, btnY, 'TAP TO LAUNCH \u2192', {
      ...TEXT_BUTTON,
      align: 'center',
    }).setOrigin(0.5, 0.5);

    const hitZone = this.add.zone(btnX, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.startGame(this.selectedLevel, this.selectedDifficulty));

    // Hover/press feedback
    hitZone.on('pointerover', () => btnText.setAlpha(0.8));
    hitZone.on('pointerout', () => btnText.setAlpha(1));
  }

  /** Handle difficulty selection. */
  private onDifficultySelected(setting: DifficultySetting): void {
    this.selectedDifficulty = setting;
    this.difficultyButtons.forEach((btn, i) => {
      const options: DifficultySetting[] = ['easy', 'normal', 'hard'];
      btn.setColor(options[i] === setting ? '#FFD700' : '#E8F4E8');
    });
    try {
      localStorage.setItem(LS_KEY_DIFFICULTY, setting);
    } catch {
      // localStorage may be unavailable
    }
  }

  /** Handle level selection. */
  private onLevelSelected(level: number): void {
    this.selectedLevel = level;
    this.levelButtons.forEach((btn, i) => {
      btn.setColor(i + 1 === level ? '#FFD700' : '#E8F4E8');
    });
    try {
      localStorage.setItem(LS_KEY_LEVEL, String(level));
    } catch {
      // localStorage may be unavailable
    }
  }

  /** Transition to InterstitialScene with selected settings. */
  private startGame(level: number, difficulty: DifficultySetting): void {
    this.scene.start('InterstitialScene', {
      level,
      difficulty,
      isRetry: false,
    });
  }
}
