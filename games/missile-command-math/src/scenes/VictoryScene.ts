/**
 * VictoryScene — INF Treaty victory celebration.
 *
 * Displays the final narrative with teletype reveal, full-screen fireworks,
 * final score summary, and high score persistence. Transitions to MenuScene.
 *
 * @see docs/gdds/missile-command-math.md §Scene List — VictoryScene
 */

import Phaser from 'phaser';
import {
  CANVAS_WIDTH, SAFE_MARGIN,
  TELETYPE_CHAR_DELAY_MS, TELETYPE_CURSOR_BLINK_MS,
  MIN_TOUCH_TARGET,
} from '../config/gameConfig';
import {
  COLOR_BG_INTERSTITIAL, COLOR_BUTTON_BG, COLOR_BUTTON_BORDER,
  TEXT_INTERSTITIAL_DATE, TEXT_HUD_SCORE, TEXT_BUTTON,
  TEXT_LEVEL_COMPLETE, FONT_FAMILY,
} from '../config/styleConfig';

interface VictorySceneData {
  finalScore: number;
}

/** localStorage key for high score (allowed per policy). */
const LS_KEY_HIGHSCORE = 'mcm_highscore';

export default class VictoryScene extends Phaser.Scene {
  private finalScore = 0;
  private teletypeTimer?: Phaser.Time.TimerEvent;
  private cursorTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data: VictorySceneData): void {
    this.finalScore = data.finalScore ?? 0;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLOR_BG_INTERSTITIAL);

    // Save high score
    this.saveHighScore();

    // Victory header
    this.add.text(CANVAS_WIDTH / 2, 60, 'VICTORY', {
      ...TEXT_LEVEL_COMPLETE,
      fontSize: '24px',
      align: 'center',
    }).setOrigin(0.5, 0);

    // INF Treaty narrative with teletype
    const narrativeText = this.add.text(
      SAFE_MARGIN + 24,
      130,
      '',
      { ...TEXT_INTERSTITIAL_DATE, wordWrap: { width: CANVAS_WIDTH - SAFE_MARGIN * 4 } },
    );

    const victoryNarrative =
      'DECEMBER 8, 1987 — INF TREATY SIGNED\n\n'
      + 'The Intermediate-Range Nuclear Forces Treaty is signed in Washington. '
      + 'President Reagan and General Secretary Gorbachev agree to eliminate '
      + 'all ground-launched ballistic and cruise missiles with ranges of '
      + '500 to 5,500 kilometers.\n\n'
      + 'Your defense of American cities was critical to reaching this moment. '
      + 'Mathematics proved mightier than missiles. The Cold War thaws.\n\n'
      + 'PEACE THROUGH KNOWLEDGE, COMMANDER.';

    this.startTeletypeReveal(victoryNarrative, narrativeText);

    // Final score
    this.add.text(CANVAS_WIDTH / 2, 520, `FINAL SCORE: ${this.finalScore}`, {
      ...TEXT_HUD_SCORE,
      align: 'center',
    }).setOrigin(0.5, 0);

    // High score display
    const highScore = this.getHighScore();
    this.add.text(CANVAS_WIDTH / 2, 560, `HIGH SCORE: ${highScore}`, {
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
      color: '#FFD700',
      align: 'center',
    }).setOrigin(0.5, 0);

    // Victory celebration fireworks
    this.playVictoryCelebration();

    // Main menu button
    this.renderMainMenuButton();
  }

  /** Teletype character-by-character reveal effect. */
  private startTeletypeReveal(text: string, targetObj: Phaser.GameObjects.Text): void {
    let charIndex = 0;

    const cursor = this.add.text(
      targetObj.x,
      targetObj.y,
      '\u2588',
      { ...TEXT_INTERSTITIAL_DATE },
    );

    this.cursorTimer = this.time.addEvent({
      delay: TELETYPE_CURSOR_BLINK_MS,
      callback: () => {
        cursor.setVisible(!cursor.visible);
      },
      loop: true,
    });

    this.teletypeTimer = this.time.addEvent({
      delay: TELETYPE_CHAR_DELAY_MS,
      callback: () => {
        if (charIndex < text.length) {
          targetObj.setText(text.substring(0, charIndex + 1));
          charIndex++;
          const bounds = targetObj.getBounds();
          cursor.setPosition(bounds.right + 2, bounds.bottom - cursor.height);
        } else {
          this.teletypeTimer?.destroy();
          cursor.destroy();
          this.cursorTimer?.destroy();
        }
      },
      loop: true,
    });
  }

  /** Play full-screen victory firework celebration. */
  private playVictoryCelebration(): void {
    const burstCount = 12;
    const colors = [0xffd700, 0xfff0a0, 0xc89bff, 0x98ffd0, 0xff88aa, 0x00ff88];

    for (let b = 0; b < burstCount; b++) {
      this.time.delayedCall(b * 400, () => {
        const cx = Phaser.Math.Between(60, CANVAS_WIDTH - 60);
        const cy = Phaser.Math.Between(100, 450);
        const particleCount = 16;

        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount;
          const speed = Phaser.Math.Between(50, 100);
          const color = colors[Phaser.Math.Between(0, colors.length - 1)];

          const particle = this.add.graphics();
          particle.fillStyle(color, 1);
          particle.fillCircle(0, 0, 2);
          particle.setPosition(cx, cy);
          particle.setDepth(50);

          this.tweens.add({
            targets: particle,
            x: cx + Math.cos(angle) * speed,
            y: cy + Math.sin(angle) * speed,
            alpha: 0,
            duration: 1200,
            ease: 'Cubic.easeOut',
            onComplete: () => particle.destroy(),
          });
        }
      });
    }
  }

  /** Render main menu button. */
  private renderMainMenuButton(): void {
    const btnX = CANVAS_WIDTH / 2;
    const btnY = 700;
    const btnW = 260;
    const btnH = Math.max(50, MIN_TOUCH_TARGET);

    const bg = this.add.graphics();
    bg.fillStyle(COLOR_BUTTON_BG, 1);
    bg.fillRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH);
    bg.lineStyle(2, COLOR_BUTTON_BORDER, 1);
    bg.strokeRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH);

    this.add.text(btnX, btnY, 'MAIN MENU', {
      ...TEXT_BUTTON,
      align: 'center',
    }).setOrigin(0.5, 0.5);

    this.add.zone(btnX, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.onMainMenu());
  }

  /** Save high score to localStorage. */
  private saveHighScore(): void {
    try {
      const current = parseInt(localStorage.getItem(LS_KEY_HIGHSCORE) ?? '0', 10);
      if (this.finalScore > current) {
        localStorage.setItem(LS_KEY_HIGHSCORE, String(this.finalScore));
      }
    } catch {
      // localStorage may be unavailable
    }
  }

  /** Get high score from localStorage. */
  private getHighScore(): number {
    try {
      return parseInt(localStorage.getItem(LS_KEY_HIGHSCORE) ?? '0', 10);
    } catch {
      return 0;
    }
  }

  /** Return to main menu. */
  private onMainMenu(): void {
    this.teletypeTimer?.destroy();
    this.cursorTimer?.destroy();
    this.scene.start('MenuScene');
  }
}
