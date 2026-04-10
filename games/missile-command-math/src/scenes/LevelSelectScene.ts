/**
 * LevelSelectScene — 20-level grid with star ratings.
 *
 * Displays a 5×4 grid of level cells (levels 1–20). Each cell shows the
 * level number, up to 3 stars, and is greyed-out if locked.
 * Level 0 (training) is not shown here — accessible from the menu.
 *
 * localStorage keys read:
 *   'mcm_stars'         — JSON number[] (indices 1–20 used)
 *   'mcm_highest_level' — number: highest unlocked level
 *
 * @see docs/build-plans/missile-command-math-engine.md §2.16
 */

import Phaser from 'phaser';
import { SPRITE_KEYS } from '../assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig';
import { LEVEL_CONFIGS } from '../config/difficultyConfig';
import { SOUND_EVENTS } from '../config/audioConfig';

/** Grid layout constants. */
const GRID_COLS     = 5;
const GRID_ROWS     = 4;
const CELL_W        = 120;
const CELL_H        = 80;
const GRID_START_X  = 60;   // (800 - 5*120 - 4*20) / 2 = 60, centers the 680px grid
const GRID_START_Y  = 100;
const CELL_PAD_X    = 20;
const CELL_PAD_Y    = 16;

const CELL_NUM_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '22px',
  fontStyle: 'bold',
  color: '#C8952A',
  align: 'center',
};

const CELL_STAR_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Georgia, serif',
  fontSize: '14px',
  color: '#F0C030',
  align: 'center',
};

const TITLE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '28px',
  fontStyle: 'bold',
  color: '#C8952A',
  align: 'center',
};

const BUTTON_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '18px',
  fontStyle: 'bold',
  color: '#C8952A',
  align: 'center',
};

export class LevelSelectScene extends Phaser.Scene {
  private stars: number[]        = new Array(21).fill(0);
  private highestUnlocked        = 1;

  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create(): void {
    this.loadProgress();
    this.buildBackground();
    this.buildGrid();
    this.buildBackButton();
  }

  // ── Private ────────────────────────────────────────────────────────────────

  /** Load star ratings and highest level from Phaser registry (set by BootScene). */
  private loadProgress(): void {
    const regStars = this.registry.get('levelStars') as number[] | undefined;
    if (regStars && Array.isArray(regStars)) {
      this.stars = regStars;
    }

    const highest = this.registry.get('highestUnlockedLevel') as number | undefined;
    this.highestUnlocked = typeof highest === 'number' ? highest : 1;
  }

  private buildBackground(): void {
    const cx = CANVAS_WIDTH / 2;
    this.add.rectangle(cx, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0xC8B8DC);
    this.add.rectangle(400, 260, 772, 492, 0xE8E0F0);
    this.add.image(0, 0, SPRITE_KEYS.CRT_FRAME).setOrigin(0, 0);
    this.add.image(0, 600, SPRITE_KEYS.HUD_BAR).setOrigin(0, 0);

    this.add.text(cx, 60, 'SELECT LEVEL', TITLE_STYLE).setOrigin(0.5, 0.5);
  }

  /** Build the 5×4 grid of level cells. */
  private buildGrid(): void {
    for (let i = 0; i < GRID_ROWS; i++) {
      for (let j = 0; j < GRID_COLS; j++) {
        const levelNum = i * GRID_COLS + j + 1; // levels 1–20
        if (levelNum > 20) continue;

        const cx = GRID_START_X + j * (CELL_W + CELL_PAD_X) + CELL_W / 2;
        const cy = GRID_START_Y + i * (CELL_H + CELL_PAD_Y) + CELL_H / 2;

        this.buildCell(cx, cy, levelNum);
      }
    }
  }

  /** Build a single level cell at (cx, cy). */
  private buildCell(cx: number, cy: number, levelNum: number): void {
    const isLocked  = levelNum > this.highestUnlocked;
    const levelCfg  = LEVEL_CONFIGS[levelNum];
    const earnedStars = this.stars[levelNum] ?? 0;

    // Cell background
    const bgAlpha   = isLocked ? 0.08 : 0.18;
    const bgColor   = isLocked ? 0x666666 : 0xC8952A;
    const textColor = isLocked ? '#777777' : '#C8952A';

    const bg = this.add.rectangle(cx, cy, CELL_W, CELL_H, bgColor, bgAlpha)
      .setStrokeStyle(1.5, isLocked ? 0x666666 : 0xC8952A, isLocked ? 0.3 : 0.6);

    // Level number
    this.add.text(cx, cy - 12, `${levelNum}`, { ...CELL_NUM_STYLE, color: textColor })
      .setOrigin(0.5, 0.5);

    // Star rating
    const starStr = '★'.repeat(earnedStars) + '☆'.repeat(3 - earnedStars);
    this.add.text(cx, cy + 16, starStr, {
      ...CELL_STAR_STYLE,
      color: isLocked ? '#555555' : '#F0C030',
    }).setOrigin(0.5, 0.5);

    // Difficulty label (small)
    if (!isLocked && levelCfg) {
      this.add.text(cx, cy + 30, levelCfg.difficulty.toUpperCase(), {
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '9px',
        color: '#7A5A1A',
      }).setOrigin(0.5, 0.5);
    }

    // Lock icon
    if (isLocked) {
      this.add.text(cx, cy + 12, '🔒', {
        fontSize: '18px',
      }).setOrigin(0.5, 0.5);
    }

    // Interaction (only for unlocked levels)
    if (!isLocked) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => bg.setFillStyle(bgColor, 0.35));
      bg.on('pointerout',  () => bg.setFillStyle(bgColor, bgAlpha));
      bg.on('pointerdown', () => this.onLevelSelected(levelNum));
    }
  }

  /** Route to the correct scene for the selected level. */
  private onLevelSelected(level: number): void {
    (this.game.registry.get('audioManager') as { playSFX(s: string): void } | undefined)
      ?.playSFX(SOUND_EVENTS.MENU_BUTTON_CLICK);
    const levelCfg = LEVEL_CONFIGS[level];
    const needsBriefing = levelCfg?.specialRule?.toLowerCase().includes('new-op') ?? false;

    if (needsBriefing) {
      this.scene.start('BriefingScene', { level });
    } else {
      this.scene.start('LevelReadyScene', { level });
    }
  }

  private buildBackButton(): void {
    const cx = CANVAS_WIDTH / 2;
    const btn = this.add.rectangle(cx, 560, 200, 48, 0xC8952A, 0.15)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xC8952A, 0.6);

    this.add.text(cx, 560, '← BACK', BUTTON_STYLE).setOrigin(0.5, 0.5);

    btn.on('pointerover', () => btn.setFillStyle(0xC8952A, 0.30));
    btn.on('pointerout',  () => btn.setFillStyle(0xC8952A, 0.15));
    btn.on('pointerdown', () => this.onBack());
  }

  private onBack(): void {
    (this.game.registry.get('audioManager') as { playSFX(s: string): void } | undefined)
      ?.playSFX(SOUND_EVENTS.MENU_BUTTON_CLICK);
    this.scene.start('MenuScene');
  }
}
