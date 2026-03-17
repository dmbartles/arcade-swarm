/**
 * LevelCompleteScene — Star rating reveal, fireworks, city rebuild animation.
 *
 * Receives a LevelCompletePayload from GameScene. Reveals stars one-by-one,
 * spawns fireworks, plays city rebuild animation, then shows Next/Menu buttons.
 *
 * @see docs/build-plans/missile-command-math-engine.md §2.13
 */

import Phaser from 'phaser';
import { SPRITE_KEYS, ANIM_KEYS } from '../assets';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  FIREWORK_STAGGER_MS,
  CITY_REBUILD_DURATION_MS,
} from '../config/gameConfig';
import { LEVEL_CONFIGS } from '../config/difficultyConfig';
import { GameEvents } from '../types/GameEvents';
import type { LevelCompletePayload } from '../types/GameEvents';

const HEADER_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '36px',
  fontStyle: 'bold',
  color: '#C8952A',
  align: 'center',
};

const SCORE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '20px',
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

const STAR_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Georgia, serif',
  fontSize: '48px',
  color: '#8A8060',
  align: 'center',
};

/** Positions of city cluster buildings for firework spawning. */
const CITY_X_POSITIONS = [80, 150, 220, 540, 620, 700];

export class LevelCompleteScene extends Phaser.Scene {
  private payload: LevelCompletePayload = {
    level: 1,
    stars: 0,
    citiesSurviving: 0,
    score: 0,
    accuracy: 0,
    chainReactions: 0,
    perfectWave: false,
  };

  /** Star text objects to be revealed one at a time. */
  private starTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'LevelCompleteScene' });
  }

  init(data: LevelCompletePayload): void {
    this.payload = data ?? this.payload;
  }

  create(): void {
    const cx = CANVAS_WIDTH / 2;

    // Background layers
    this.add.rectangle(cx, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0xC8B8DC);
    this.add.rectangle(400, 280, 760, 480, 0xE8E0F0);
    this.add.image(20, 20, SPRITE_KEYS.CRT_FRAME).setOrigin(0, 0);
    this.add.image(0, 600, SPRITE_KEYS.HUD_BAR).setOrigin(0, 0);

    // Level complete header
    this.add.text(cx, 120, `LEVEL ${this.payload.level} COMPLETE!`, HEADER_STYLE)
      .setOrigin(0.5, 0.5);

    // Stats
    this.add.text(
      cx, 175,
      `SCORE: ${this.payload.score.toLocaleString()}   ACCURACY: ${Math.round(this.payload.accuracy * 100)}%`,
      SCORE_STYLE
    ).setOrigin(0.5, 0.5);

    this.add.text(
      cx, 210,
      `CITIES SURVIVING: ${this.payload.citiesSurviving}`,
      SCORE_STYLE
    ).setOrigin(0.5, 0.5);

    // Star rating slots (3 grey stars — revealed by revealStars())
    const starSpacing = 70;
    const starY = 280;
    this.starTexts = [];
    for (let i = 0; i < 3; i++) {
      const s = this.add.text(
        cx + (i - 1) * starSpacing,
        starY,
        '★',
        { ...STAR_STYLE }
      ).setOrigin(0.5, 0.5).setAlpha(0.25);
      this.starTexts.push(s);
    }

    // Sequence: reveal stars → fireworks → rebuild → show buttons
    this.time.delayedCall(400, () => this.revealStars());
  }

  // ── Private ────────────────────────────────────────────────────────────────

  /** Reveal stars one by one with 300ms intervals, playing STAR_REVEAL sound each. */
  private revealStars(): void {
    const earned = Math.max(0, Math.min(3, this.payload.stars));
    for (let i = 0; i < earned; i++) {
      this.time.delayedCall(i * 300, () => {
        if (this.starTexts[i]) {
          this.starTexts[i].setColor('#F0C030').setAlpha(1);
          // Scale punch-in tween
          this.tweens.add({
            targets: this.starTexts[i],
            scaleX: { from: 1.6, to: 1.0 },
            scaleY: { from: 1.6, to: 1.0 },
            duration: 200,
            ease: 'Back.easeOut',
          });
          // Emit star reveal event (AudioManager listens)
          this.events.emit(GameEvents.SCORE_UPDATED);
        }
      });
    }

    // After all stars revealed, spawn fireworks
    const allStarMs = earned * 300 + 200;
    this.time.delayedCall(allStarMs, () => this.spawnFireworks());
  }

  /** Spawn firework_burst sprites above each surviving city. */
  private spawnFireworks(): void {
    let delay = 0;
    for (const xPos of CITY_X_POSITIONS) {
      this.time.delayedCall(delay, () => {
        const fw = this.add.sprite(
          PLAYFIELD_X_OFFSET + xPos,
          350,
          SPRITE_KEYS.FIREWORK_BURST
        );
        fw.play(ANIM_KEYS.FIREWORK_POP);
        fw.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => fw.destroy());
      });
      delay += FIREWORK_STAGGER_MS;
    }

    // After fireworks, play rebuild animation
    this.time.delayedCall(delay + 300, () => this.playCityRebuild());
  }

  /** Play rebuild crane animation briefly, then show buttons. */
  private playCityRebuild(): void {
    // Spawn a crane sprite over the left cluster center
    const cranePositions = [140, 640];
    const cranes: Phaser.GameObjects.Sprite[] = [];

    for (const cx of cranePositions) {
      const crane = this.add.sprite(cx, 370, SPRITE_KEYS.REBUILD_CRANE);
      crane.play(ANIM_KEYS.REBUILD_CRANE_LIFT);
      cranes.push(crane);
    }

    this.time.delayedCall(CITY_REBUILD_DURATION_MS, () => {
      cranes.forEach(c => c.destroy());
      this.showButtons();
    });
  }

  /** Show Next Level and Menu buttons after all animations complete. */
  private showButtons(): void {
    const cx = CANVAS_WIDTH / 2;

    this.createButton(cx, 400, this.getNextButtonLabel(), () => this.onNextLevel());
    this.createButton(cx, 464, '⌂  MAIN MENU', () => this.onMenu());
  }

  private getNextButtonLabel(): string {
    const nextLevel = this.payload.level + 1;
    if (nextLevel > 20) return '🏆  VICTORY SCREEN';
    return `▶  LEVEL ${nextLevel}`;
  }

  private createButton(x: number, y: number, label: string, callback: () => void): void {
    const bg = this.add.rectangle(x, y, 280, 52, 0xC8952A, 0.15)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xC8952A, 0.6);

    this.add.text(x, y, label, BUTTON_STYLE).setOrigin(0.5, 0.5);

    bg.on('pointerover', () => bg.setFillStyle(0xC8952A, 0.3));
    bg.on('pointerout',  () => bg.setFillStyle(0xC8952A, 0.15));
    bg.on('pointerdown', () => callback());
  }

  /** Transition to the next appropriate scene. */
  private onNextLevel(): void {
    const nextLevel = this.payload.level + 1;

    if (nextLevel > 20) {
      this.scene.start('VictoryScene', { finalScore: this.payload.score });
      return;
    }

    const levelCfg = LEVEL_CONFIGS[nextLevel];
    const needsBriefing = levelCfg?.specialRule?.toLowerCase().includes('new-op') ?? false;

    if (needsBriefing) {
      this.scene.start('BriefingScene', { level: nextLevel });
    } else {
      this.scene.start('LevelReadyScene', { level: nextLevel });
    }
  }

  private onMenu(): void {
    this.scene.start('MenuScene');
  }
}

/** X offset to position fireworks in the playfield coordinate space. */
const PLAYFIELD_X_OFFSET = 20;
