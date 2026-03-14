/**
 * LevelCompleteScene — Star rating reveal, city status, and celebration.
 *
 * Shows the level results with staggered star reveals, city fireworks
 * for perfect waves, and a city rebuild animation. Transitions to
 * InterstitialScene for the next level or VictoryScene after level 10.
 *
 * @see docs/gdds/missile-command-math.md §Scene List — LevelCompleteScene
 */

import Phaser from 'phaser';
import {
  CANVAS_WIDTH, SAFE_MARGIN, TOTAL_CITIES, CITY_NAMES,
  MIN_TOUCH_TARGET,
} from '../config/gameConfig';
import {
  COLOR_BG, COLOR_BUTTON_BG, COLOR_BUTTON_BORDER,
  TEXT_LEVEL_COMPLETE, TEXT_HUD_SCORE, TEXT_BUTTON, FONT_FAMILY,
} from '../config/styleConfig';
import { GameEvents } from '../types/GameEvents';
import type { LevelCompletePayload, CityRebuiltPayload } from '../types/GameEvents';
import type { DifficultySetting } from '../types/IDifficultyConfig';

interface LevelCompleteSceneData extends LevelCompletePayload {
  difficulty: DifficultySetting;
}

export default class LevelCompleteScene extends Phaser.Scene {
  private level = 1;
  private stars = 0;
  private citiesSurviving = 0;
  private score = 0;
  private accuracy = 0;
  private perfectWave = false;
  private difficulty: DifficultySetting = 'normal';

  constructor() {
    super({ key: 'LevelCompleteScene' });
  }

  init(data: LevelCompleteSceneData): void {
    this.level = data.level ?? 1;
    this.stars = data.stars ?? 1;
    this.citiesSurviving = data.citiesSurviving ?? 0;
    this.score = data.score ?? 0;
    this.accuracy = data.accuracy ?? 0;
    this.perfectWave = data.perfectWave ?? false;
    this.difficulty = data.difficulty ?? 'normal';
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLOR_BG);

    // Header
    this.add.text(CANVAS_WIDTH / 2, 80, 'LEVEL COMPLETE', {
      ...TEXT_LEVEL_COMPLETE,
      align: 'center',
    }).setOrigin(0.5, 0);

    // Level number
    this.add.text(CANVAS_WIDTH / 2, 120, `LEVEL ${this.level}`, {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#E8F4E8',
      align: 'center',
    }).setOrigin(0.5, 0);

    // Star rating
    this.revealStars(this.stars);

    // Stats
    this.renderStats();

    // City status
    this.renderCityStatus();

    // Celebration effects
    this.playCelebration(this.citiesSurviving);

    // Rebuild animation for destroyed cities
    this.renderCityRebuildAnimation();

    // Continue button
    this.renderContinueButton();
  }

  /** Animate star rating reveal with stagger. */
  private revealStars(stars: number): void {
    const starY = 170;
    const starSpacing = 40;
    const startX = CANVAS_WIDTH / 2 - starSpacing;

    for (let i = 0; i < 3; i++) {
      const isFilled = i < stars;
      const starChar = isFilled ? '\u2605' : '\u2606';
      const starColor = isFilled ? '#FFD700' : '#3A3A3A';

      const starText = this.add.text(
        startX + i * starSpacing,
        starY,
        starChar,
        { fontFamily: FONT_FAMILY, fontSize: '24px', color: starColor, align: 'center' },
      ).setOrigin(0.5, 0.5).setAlpha(0).setScale(0.5);

      // Staggered reveal
      this.tweens.add({
        targets: starText,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut',
        delay: 300 + i * 300,
      });
    }
  }

  /** Render score and accuracy stats. */
  private renderStats(): void {
    const statsY = 220;
    this.add.text(SAFE_MARGIN + 20, statsY, `SCORE: ${this.score}`, {
      ...TEXT_HUD_SCORE,
    });
    this.add.text(SAFE_MARGIN + 20, statsY + 30, `ACCURACY: ${Math.round(this.accuracy * 100)}%`, {
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
      color: '#E8F4E8',
    });
    this.add.text(SAFE_MARGIN + 20, statsY + 55, `CITIES SAVED: ${this.citiesSurviving}/${TOTAL_CITIES}`, {
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
      color: '#E8F4E8',
    });
  }

  /** Render city status grid. */
  private renderCityStatus(): void {
    const startY = 340;
    const cols = 3;
    const cellW = 140;
    const startX = (CANVAS_WIDTH - cols * cellW) / 2 + cellW / 2;

    for (let i = 0; i < TOTAL_CITIES; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cellW;
      const y = startY + row * 50;

      const survived = i < this.citiesSurviving;
      const color = survived ? '#FFD700' : '#3A3A3A';
      const statusChar = survived ? '\u2713' : '\u2717';

      this.add.text(x, y, `${statusChar} ${CITY_NAMES[i]}`, {
        fontFamily: FONT_FAMILY,
        fontSize: '8px',
        color,
        align: 'center',
      }).setOrigin(0.5, 0.5);
    }
  }

  /** Play celebration effects based on performance. */
  private playCelebration(citiesSurviving: number): void {
    if (!this.perfectWave) return;

    // Full firework display for perfect wave
    const fireworkPositions = [
      { x: 80, y: 500 },
      { x: 160, y: 480 },
      { x: 240, y: 490 },
      { x: 320, y: 480 },
      { x: 400, y: 500 },
      { x: 240, y: 460 },
    ];

    const maxFireworks = Math.min(citiesSurviving, fireworkPositions.length);
    for (let i = 0; i < maxFireworks; i++) {
      const pos = fireworkPositions[i];
      this.time.delayedCall(i * 200, () => {
        this.createFireworkEffect(pos.x, pos.y);
      });
    }
  }

  /** Create a simple firework particle effect. */
  private createFireworkEffect(x: number, y: number): void {
    const colors = [0xffd700, 0xfff0a0, 0xc89bff, 0x98ffd0, 0xff88aa];
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 80;
      const color = colors[i % colors.length];

      const particle = this.add.graphics();
      particle.fillStyle(color, 1);
      particle.fillCircle(0, 0, 3);
      particle.setPosition(x, y);
      particle.setDepth(50);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        duration: 900,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  /** Play rebuild animation on destroyed city slots. */
  private renderCityRebuildAnimation(): void {
    const destroyedCount = TOTAL_CITIES - this.citiesSurviving;
    if (destroyedCount <= 0) return;

    // Emit CITY_REBUILT for each destroyed city after animation
    for (let i = this.citiesSurviving; i < TOTAL_CITIES; i++) {
      this.time.delayedCall(1500 + (i - this.citiesSurviving) * 500, () => {
        const payload: CityRebuiltPayload = {
          cityIndex: i,
          cityName: CITY_NAMES[i],
        };
        this.events.emit(GameEvents.CITY_REBUILT, payload);
      });
    }
  }

  /** Render the continue button. */
  private renderContinueButton(): void {
    const btnX = CANVAS_WIDTH / 2;
    const btnY = 700;
    const btnW = 260;
    const btnH = Math.max(50, MIN_TOUCH_TARGET);

    const isVictory = this.level >= 10;
    const btnLabel = isVictory ? 'VICTORY \u2192' : 'CONTINUE \u2192';

    const bg = this.add.graphics();
    bg.fillStyle(COLOR_BUTTON_BG, 1);
    bg.fillRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH);
    bg.lineStyle(2, COLOR_BUTTON_BORDER, 1);
    bg.strokeRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH);

    this.add.text(btnX, btnY, btnLabel, {
      ...TEXT_BUTTON,
      align: 'center',
    }).setOrigin(0.5, 0.5);

    this.add.zone(btnX, btnY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.onContinue());
  }

  /** Handle continue button tap. */
  private onContinue(): void {
    if (this.level >= 10) {
      this.scene.start('VictoryScene', { finalScore: this.score });
    } else {
      this.scene.start('InterstitialScene', {
        level: this.level + 1,
        difficulty: this.difficulty,
        isRetry: false,
      });
    }
  }
}
