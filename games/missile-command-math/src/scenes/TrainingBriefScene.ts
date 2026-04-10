/**
 * TrainingBriefScene — One-time illustrated training briefing (Level 0).
 *
 * Shows instructions and a worked example, then lets the player tap
 * "TAP TO LAUNCH →" to begin the training wave. No auto-advance timer
 * (WCAG 2.2.1 — control over timing).
 *
 * @see docs/build-plans/missile-command-math-engine.md §2.9
 */

import Phaser from 'phaser';
import { SPRITE_KEYS } from '../assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig';
import { GameEvents } from '../types/GameEvents';
import { SOUND_EVENTS, MUSIC_TRACKS } from '../config/audioConfig';

/** localStorage key to mark that training has been seen. */
const HAS_SEEN_TRAINING_KEY = 'mcm_has_seen_training';

const CARD_X  = 400;
const CARD_Y  = 260;
const CARD_W  = 680;
const CARD_H  = 420;

const HEADER_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '32px',
  fontStyle: 'bold',
  color: '#C8952A',
  align: 'center',
};

const BODY_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '20px',
  color: '#5A3A1A',
  align: 'center',
  wordWrap: { width: 600 },
};

const EXAMPLE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '28px',
  fontStyle: 'bold',
  color: '#E8701A',
  align: 'center',
};

const BUTTON_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '20px',
  fontStyle: 'bold',
  color: '#C8952A',
  align: 'center',
};

export class TrainingBriefScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TrainingBriefScene' });
  }

  create(): void {
    this.buildCard();
  }

  // ── Private ────────────────────────────────────────────────────────────────

  /** Render the illustrated training card. */
  private buildCard(): void {
    // Background
    this.add.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0xC8B8DC);

    // Playfield interior
    this.add.rectangle(400, 260, 772, 492, 0xE8E0F0);

    // CRT frame
    this.add.image(0, 0, SPRITE_KEYS.CRT_FRAME).setOrigin(0, 0);

    // HUD bar
    this.add.image(0, 600, SPRITE_KEYS.HUD_BAR).setOrigin(0, 0);

    // Card panel
    this.add.rectangle(CARD_X, CARD_Y, CARD_W, CARD_H, 0xFAF0E0, 0.95)
      .setStrokeStyle(3, 0xC8952A);

    // Header
    this.add.text(CARD_X, CARD_Y - 160, 'TRAINING BRIEFING', HEADER_STYLE).setOrigin(0.5, 0.5);

    // Instructions
    this.add.text(
      CARD_X,
      CARD_Y - 100,
      'Math problems fall from the sky on bombs.\nEach launcher holds the answer to one problem.',
      BODY_STYLE
    ).setOrigin(0.5, 0.5);

    // Step list
    const steps = [
      '1. Read the problem on the falling bomb.',
      '2. Tap the bomb to fire the matching launcher.',
      '3. Protect your cities! Don\'t let any bombs land.',
    ];
    steps.forEach((step, i) => {
      this.add.text(CARD_X, CARD_Y - 30 + i * 36, step, BODY_STYLE).setOrigin(0.5, 0.5);
    });

    // Worked example
    this.add.text(CARD_X, CARD_Y + 100, 'Example:', BODY_STYLE).setOrigin(0.5, 0.5);
    this.add.text(CARD_X, CARD_Y + 136, 'Bomb shows: 3 + 4\nFire the launcher with: 7', EXAMPLE_STYLE)
      .setOrigin(0.5, 0.5);

    // Dismiss button
    const btnY = CARD_Y + 190;
    const btnZone = this.add.rectangle(CARD_X, btnY, 260, 52, 0xC8952A, 0.15)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xC8952A, 0.7);

    this.add.text(CARD_X, btnY, 'TAP TO LAUNCH →', BUTTON_STYLE).setOrigin(0.5, 0.5);

    btnZone.on('pointerover', () => btnZone.setFillStyle(0xC8952A, 0.3));
    btnZone.on('pointerout',  () => btnZone.setFillStyle(0xC8952A, 0.15));
    btnZone.on('pointerdown', () => this.onDismiss());

    // Play briefing enter sound and music
    const _am = this.game.registry.get('audioManager') as
      { playSFX(s: string): void; playMusic(s: string): void } | undefined;
    _am?.playMusic(MUSIC_TRACKS.BRIEFING);
    _am?.playSFX(SOUND_EVENTS.BRIEFING_ENTER);
  }

  /** On dismiss: mark training seen, emit event, start training GameScene. */
  private onDismiss(): void {
    (this.game.registry.get('audioManager') as { playSFX(s: string): void } | undefined)
      ?.playSFX(SOUND_EVENTS.BRIEFING_DISMISS);

    localStorage.setItem(HAS_SEEN_TRAINING_KEY, 'true');
    this.registry.set('hasSeenTraining', true);

    this.events.emit(GameEvents.INTERSTITIAL_DISMISSED);
    this.scene.start('GameScene', { level: 0, isTraining: true });
  }
}
