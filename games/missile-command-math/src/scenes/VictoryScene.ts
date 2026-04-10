/**
 * VictoryScene — All 20 levels completed; full celebration and score summary.
 *
 * Emits SESSION_VICTORY on creation. Shows final score and a return-to-menu
 * button. Plays VICTORY_FANFARE (wired via AudioManager by Gameplay agent).
 *
 * @see docs/build-plans/missile-command-math-engine.md §2.15
 */

import Phaser from 'phaser';
import { SPRITE_KEYS } from '../assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig';
import { GameEvents } from '../types/GameEvents';
import { SOUND_EVENTS, MUSIC_TRACKS } from '../config/audioConfig';

const TITLE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '48px',
  fontStyle: 'bold',
  color: '#F0C030',
  align: 'center',
};

const SUBTITLE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '16px',
  color: '#C8952A',
  align: 'center',
};

const SCORE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '24px',
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

export class VictoryScene extends Phaser.Scene {
  private finalScore = 0;

  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data: { finalScore: number }): void {
    this.finalScore = data?.finalScore ?? 0;
  }

  create(): void {
    // Emit session victory for AudioManager etc.
    this.events.emit(GameEvents.SESSION_VICTORY);

    // Play victory music and fanfare
    const _am = this.game.registry.get('audioManager') as
      { playSFX(s: string): void; playMusic(s: string): void; stopMusic(): void } | undefined;
    _am?.stopMusic();
    _am?.playMusic(MUSIC_TRACKS.VICTORY);
    _am?.playSFX(SOUND_EVENTS.VICTORY_FANFARE);

    const cx = CANVAS_WIDTH / 2;

    // Background layers
    this.add.rectangle(cx, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0xC8B8DC);
    this.add.rectangle(400, 260, 772, 492, 0xE8E0F0);
    this.add.image(0, 0, SPRITE_KEYS.CRT_FRAME).setOrigin(0, 0);
    this.add.image(0, 600, SPRITE_KEYS.HUD_BAR).setOrigin(0, 0);

    // Gold star banner
    this.add.text(cx, 130, '★ ★ ★ ★ ★', {
      fontFamily: 'Georgia, serif',
      fontSize: '36px',
      color: '#F0C030',
    }).setOrigin(0.5, 0.5);

    // Title
    this.add.text(cx, 190, 'MISSION\nACCOMPLISHED!', TITLE_STYLE).setOrigin(0.5, 0.5);

    // Subtitle
    this.add.text(cx, 270, 'ALL 20 LEVELS CLEARED — CITIES SAVED!', SUBTITLE_STYLE)
      .setOrigin(0.5, 0.5);

    // Final score summary
    this.showScoreSummary(cx);

    // Return to menu
    this.createButton(cx, 470, '▶  PLAY AGAIN', () => this.onMenu());
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private showScoreSummary(cx: number): void {
    this.add.text(cx, 330, 'FINAL SCORE', {
      ...SUBTITLE_STYLE,
      fontSize: '14px',
    }).setOrigin(0.5, 0.5);

    this.add.text(cx, 365, this.finalScore.toLocaleString(), SCORE_STYLE)
      .setOrigin(0.5, 0.5);

    // Congratulations line
    this.add.text(cx, 410, 'You are a MATH GENIUS!', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '18px',
      color: '#4A2808',
    }).setOrigin(0.5, 0.5);
  }

  private createButton(x: number, y: number, label: string, callback: () => void): void {
    const bg = this.add.rectangle(x, y, 280, 52, 0xC8952A, 0.15)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xC8952A, 0.6);

    this.add.text(x, y, label, BUTTON_STYLE).setOrigin(0.5, 0.5);

    bg.on('pointerover', () => bg.setFillStyle(0xC8952A, 0.3));
    bg.on('pointerout',  () => bg.setFillStyle(0xC8952A, 0.15));
    bg.on('pointerdown', () => {
      (this.game.registry.get('audioManager') as { playSFX(s: string): void } | undefined)
        ?.playSFX(SOUND_EVENTS.MENU_BUTTON_CLICK);
      callback();
    });
  }

  private onMenu(): void {
    this.scene.start('MenuScene');
  }
}
