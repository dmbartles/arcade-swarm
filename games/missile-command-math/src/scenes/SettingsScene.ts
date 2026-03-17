/**
 * SettingsScene — Sound toggle and difficulty selector.
 *
 * Persists settings to localStorage. Emits SOUND_TOGGLED and DIFFICULTY_CHANGED
 * on the Phaser event bus so AudioManager and DifficultyManager can react.
 *
 * @see docs/build-plans/missile-command-math-engine.md §2.17
 */

import Phaser from 'phaser';
import { SPRITE_KEYS } from '../assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig';
import { SOUND_ENABLED_KEY } from '../config/audioConfig';
import { GameEvents } from '../types/GameEvents';
import type { DifficultySetting } from '../types/IDifficultyConfig';

/** localStorage key for the selected difficulty preset. */
const DIFFICULTY_KEY = 'mcm_difficulty';

const TITLE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '32px',
  fontStyle: 'bold',
  color: '#C8952A',
  align: 'center',
};

const LABEL_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '18px',
  fontStyle: 'bold',
  color: '#C8952A',
  align: 'left',
};

const BUTTON_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '16px',
  fontStyle: 'bold',
  color: '#C8952A',
  align: 'center',
};

const BACK_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '18px',
  fontStyle: 'bold',
  color: '#C8952A',
  align: 'center',
};

export class SettingsScene extends Phaser.Scene {
  private soundEnabled   = true;
  private difficulty: DifficultySetting = 'normal';

  /** References to update visuals after state changes. */
  private soundToggleBg!: Phaser.GameObjects.Rectangle;
  private soundToggleText!: Phaser.GameObjects.Text;
  private diffBtns: Map<DifficultySetting, Phaser.GameObjects.Rectangle> = new Map();

  constructor() {
    super({ key: 'SettingsScene' });
  }

  create(): void {
    // Load current settings from registry
    this.soundEnabled = (this.registry.get('soundEnabled') as boolean) ?? true;
    this.difficulty   = (this.registry.get('difficulty') as DifficultySetting) ?? 'normal';

    this.buildUI();
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private buildUI(): void {
    const cx = CANVAS_WIDTH / 2;

    // Background
    this.add.rectangle(cx, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0xC8B8DC);
    this.add.rectangle(400, 280, 760, 480, 0xE8E0F0);
    this.add.image(20, 20, SPRITE_KEYS.CRT_FRAME).setOrigin(0, 0);
    this.add.image(0, 600, SPRITE_KEYS.HUD_BAR).setOrigin(0, 0);

    // Title
    this.add.text(cx, 80, 'SETTINGS', TITLE_STYLE).setOrigin(0.5, 0.5);

    // ── Sound toggle ──
    this.add.text(130, 160, 'SOUND:', LABEL_STYLE).setOrigin(0, 0.5);
    this.buildSoundToggle(cx);

    // ── Difficulty ──
    this.add.text(130, 270, 'DIFFICULTY:', LABEL_STYLE).setOrigin(0, 0.5);
    this.buildDifficultyButtons(cx);

    // Difficulty descriptions
    const descriptions: Record<DifficultySetting, string> = {
      easy:   'EASY   — 0.7× speed  (Grade 3)',
      normal: 'NORMAL — 1.0× speed  (Grade 4)',
      hard:   'HARD   — 1.3× speed  (Grade 5)',
    };
    const diffLabels: DifficultySetting[] = ['easy', 'normal', 'hard'];
    diffLabels.forEach((d, i) => {
      this.add.text(cx, 350 + i * 28, descriptions[d], {
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: '13px',
        color: this.difficulty === d ? '#C8952A' : '#7A5A1A',
      }).setOrigin(0.5, 0.5);
    });

    // Back button
    this.buildBackButton(cx);
  }

  private buildSoundToggle(cx: number): void {
    const btnY = 200;
    const btnW = 160;

    this.soundToggleBg = this.add.rectangle(cx, btnY, btnW, 48, 0xC8952A, this.soundEnabled ? 0.35 : 0.1)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xC8952A, 0.7);

    this.soundToggleText = this.add.text(
      cx, btnY,
      this.soundEnabled ? '🔊  ON' : '🔇  OFF',
      BUTTON_STYLE
    ).setOrigin(0.5, 0.5);

    this.soundToggleBg.on('pointerdown', () => this.onSoundToggle());
  }

  private buildDifficultyButtons(cx: number): void {
    const presets: DifficultySetting[] = ['easy', 'normal', 'hard'];
    const labels  = ['EASY', 'NORMAL', 'HARD'];
    const spacing = 140;
    const startX  = cx - spacing;
    const btnY    = 310;

    presets.forEach((preset, i) => {
      const isActive = preset === this.difficulty;
      const bg = this.add.rectangle(
        startX + i * spacing, btnY,
        120, 44,
        0xC8952A,
        isActive ? 0.4 : 0.1
      )
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0xC8952A, isActive ? 1.0 : 0.4);

      this.add.text(startX + i * spacing, btnY, labels[i], BUTTON_STYLE)
        .setOrigin(0.5, 0.5);

      bg.on('pointerover', () => { if (preset !== this.difficulty) bg.setFillStyle(0xC8952A, 0.2); });
      bg.on('pointerout',  () => { if (preset !== this.difficulty) bg.setFillStyle(0xC8952A, 0.1); });
      bg.on('pointerdown', () => this.onDifficultySelect(preset));

      this.diffBtns.set(preset, bg);
    });
  }

  private buildBackButton(cx: number): void {
    const btn = this.add.rectangle(cx, 490, 200, 48, 0xC8952A, 0.15)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xC8952A, 0.6);

    this.add.text(cx, 490, '← BACK', BACK_STYLE).setOrigin(0.5, 0.5);

    btn.on('pointerover', () => btn.setFillStyle(0xC8952A, 0.3));
    btn.on('pointerout',  () => btn.setFillStyle(0xC8952A, 0.15));
    btn.on('pointerdown', () => this.onBack());
  }

  /** Toggle sound, persist to localStorage, update registry, emit event. */
  private onSoundToggle(): void {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem(SOUND_ENABLED_KEY, String(this.soundEnabled));
    this.registry.set('soundEnabled', this.soundEnabled);

    // Update visual
    this.soundToggleBg.setFillStyle(0xC8952A, this.soundEnabled ? 0.35 : 0.1);
    this.soundToggleText.setText(this.soundEnabled ? '🔊  ON' : '🔇  OFF');

    // Emit so AudioManager can react (if active)
    this.events.emit(GameEvents.SOUND_TOGGLED, { enabled: this.soundEnabled });
  }

  /** Select a difficulty preset, persist, update registry, emit event. */
  private onDifficultySelect(setting: DifficultySetting): void {
    this.difficulty = setting;
    localStorage.setItem(DIFFICULTY_KEY, setting);
    this.registry.set('difficulty', setting);

    // Update button visuals
    this.diffBtns.forEach((bg, preset) => {
      const isActive = preset === setting;
      bg.setFillStyle(0xC8952A, isActive ? 0.4 : 0.1);
      bg.setStrokeStyle(2, 0xC8952A, isActive ? 1.0 : 0.4);
    });

    // Emit so DifficultyManager can react
    this.events.emit(GameEvents.DIFFICULTY_CHANGED, { setting });
  }

  private onBack(): void {
    this.scene.start('MenuScene');
  }
}
