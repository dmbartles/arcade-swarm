/**
 * GameOverScene — All-cities-lost screen.
 *
 * Displays "GAME OVER" with historical flavour text, final score,
 * and options to retry or return to level select.
 *
 * @see docs/gdds/missile-command-math.md §Scene List — GameOverScene
 */

import Phaser from 'phaser';
import {
  CANVAS_WIDTH, SAFE_MARGIN, MIN_TOUCH_TARGET,
} from '../config/gameConfig';
import {
  COLOR_BG, COLOR_BUTTON_BG, COLOR_BUTTON_BORDER,
  TEXT_GAME_OVER, TEXT_HUD_SCORE, TEXT_INTERSTITIAL_BODY,
  TEXT_BUTTON, FONT_FAMILY,
} from '../config/styleConfig';
import type { GameOverPayload } from '../types/GameEvents';
import type { DifficultySetting } from '../types/IDifficultyConfig';

interface GameOverSceneData extends GameOverPayload {
  difficulty: DifficultySetting;
}

/** Historical flavour text per level. */
const GAME_OVER_FLAVOUR: Record<number, string> = {
  1: 'The early warning system failed. The defense grid was overwhelmed before it could be tested.',
  2: 'Soviet missiles broke through the perimeter. The Cold War grows colder.',
  3: 'New warhead types proved too complex. Intelligence must improve.',
  4: 'Full deployment exceeded our capacity. Regroup and try again.',
  5: 'Able Archer pushed us to the brink. We were not ready.',
  6: 'Strategic bombers slipped through unchallenged. Air defense must improve.',
  7: 'Paratroopers landed unopposed. Ground defense was insufficient.',
  8: 'MIRV technology overwhelmed our interceptors. We need a new strategy.',
  9: 'The combined assault was too much. All defenses have fallen.',
  10: 'So close to peace, yet so far. The final wave proved unstoppable.',
};

export default class GameOverScene extends Phaser.Scene {
  private level = 1;
  private finalScore = 0;
  private difficulty: DifficultySetting = 'normal';

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverSceneData): void {
    this.level = data.level ?? 1;
    this.finalScore = data.finalScore ?? 0;
    this.difficulty = data.difficulty ?? 'normal';
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLOR_BG);

    // "GAME OVER" header
    this.add.text(CANVAS_WIDTH / 2, 120, 'GAME OVER', {
      ...TEXT_GAME_OVER,
      align: 'center',
    }).setOrigin(0.5, 0);

    // Historical flavour text
    const flavourText = GAME_OVER_FLAVOUR[this.level] ?? GAME_OVER_FLAVOUR[1];
    this.add.text(CANVAS_WIDTH / 2, 200, flavourText, {
      ...TEXT_INTERSTITIAL_BODY,
      align: 'center',
      wordWrap: { width: CANVAS_WIDTH - SAFE_MARGIN * 4 },
    }).setOrigin(0.5, 0);

    // Final score
    this.add.text(CANVAS_WIDTH / 2, 340, `FINAL SCORE: ${this.finalScore}`, {
      ...TEXT_HUD_SCORE,
      align: 'center',
    }).setOrigin(0.5, 0);

    // Level indicator
    this.add.text(CANVAS_WIDTH / 2, 380, `LEVEL ${this.level}`, {
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
      color: '#E8F4E8',
      align: 'center',
    }).setOrigin(0.5, 0);

    // Buttons
    this.renderRetryButton();
    this.renderLevelSelectButton();
  }

  /** Render the retry button. */
  private renderRetryButton(): void {
    const btnX = CANVAS_WIDTH / 2;
    const btnY = 500;
    const btnW = 260;
    const btnH = Math.max(50, MIN_TOUCH_TARGET);

    const bg = this.add.graphics();
    bg.fillStyle(COLOR_BUTTON_BG, 1);
    bg.fillRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH);
    bg.lineStyle(2, COLOR_BUTTON_BORDER, 1);
    bg.strokeRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH);

    this.add.text(btnX, btnY, 'RETRY \u2192', {
      ...TEXT_BUTTON,
      align: 'center',
    }).setOrigin(0.5, 0.5);

    this.add.zone(btnX, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.onRetry());
  }

  /** Render the level select button. */
  private renderLevelSelectButton(): void {
    const btnX = CANVAS_WIDTH / 2;
    const btnY = 580;
    const btnW = 260;
    const btnH = Math.max(50, MIN_TOUCH_TARGET);

    const bg = this.add.graphics();
    bg.fillStyle(COLOR_BUTTON_BG, 1);
    bg.fillRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH);
    bg.lineStyle(2, COLOR_BUTTON_BORDER, 1);
    bg.strokeRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH);

    this.add.text(btnX, btnY, 'LEVEL SELECT', {
      ...TEXT_BUTTON,
      align: 'center',
    }).setOrigin(0.5, 0.5);

    this.add.zone(btnX, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.onLevelSelect());
  }

  /** Retry the current level. */
  private onRetry(): void {
    this.scene.start('InterstitialScene', {
      level: this.level,
      difficulty: this.difficulty,
      isRetry: true,
    });
  }

  /** Return to the menu / level select. */
  private onLevelSelect(): void {
    this.scene.start('MenuScene');
  }
}
