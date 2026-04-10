/**
 * BriefingScene — Per-level math operation briefing card.
 *
 * Shown for levels that introduce a new math operation (specialRule contains
 * 'new-op' or 'New-op'). Displays the operation name, a worked example,
 * and a "TAP TO LAUNCH →" dismiss button.
 *
 * No auto-advance timer (WCAG 2.2.1).
 *
 * @see docs/build-plans/missile-command-math-engine.md §2.10
 */

import Phaser from 'phaser';
import { SPRITE_KEYS } from '../assets';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig';
import { LEVEL_CONFIGS } from '../config/difficultyConfig';
import { GameEvents } from '../types/GameEvents';
import { SOUND_EVENTS, MUSIC_TRACKS } from '../config/audioConfig';

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
  fontSize: '26px',
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

const LABEL_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '13px',
  color: '#7A5A1A',
  align: 'center',
};

export class BriefingScene extends Phaser.Scene {
  private level = 1;

  constructor() {
    super({ key: 'BriefingScene' });
  }

  /** Receive level number from launching scene. */
  init(data: { level: number }): void {
    this.level = data.level ?? 1;
  }

  create(): void {
    this.buildCard();
  }

  // ── Private ────────────────────────────────────────────────────────────────

  /** Build the briefing card based on the level's math skill type. */
  private buildCard(): void {
    const cx = CANVAS_WIDTH / 2;
    const cy = 260;

    // Background
    this.add.rectangle(cx, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT, 0xC8B8DC);
    this.add.rectangle(400, 260, 772, 492, 0xE8E0F0);
    this.add.image(0, 0, SPRITE_KEYS.CRT_FRAME).setOrigin(0, 0);
    this.add.image(0, 600, SPRITE_KEYS.HUD_BAR).setOrigin(0, 0);

    // Card panel
    this.add.rectangle(cx, cy, 680, 400, 0xFAF0E0, 0.95)
      .setStrokeStyle(3, 0xC8952A);

    const levelCfg = LEVEL_CONFIGS[this.level];
    const operationName = levelCfg?.skillType ?? 'Math Challenge';

    // Level label
    this.add.text(cx, cy - 170, `LEVEL ${this.level}`, LABEL_STYLE).setOrigin(0.5, 0.5);

    // Operation header
    this.add.text(cx, cy - 140, 'NEW OPERATION', HEADER_STYLE).setOrigin(0.5, 0.5);

    // Skill type name
    this.add.text(cx, cy - 90, operationName, {
      ...BODY_STYLE,
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#4A2808',
    }).setOrigin(0.5, 0.5);

    // CCSS alignment
    if (levelCfg?.ccssStandards.length) {
      this.add.text(
        cx, cy - 55,
        `Common Core: ${levelCfg.ccssStandards.join(', ')}`,
        LABEL_STYLE
      ).setOrigin(0.5, 0.5);
    }

    // Worked example for this operation type
    const example = this.getWorkedExample(levelCfg?.mathTypes ?? []);
    this.add.text(cx, cy - 10, 'Worked Example:', BODY_STYLE).setOrigin(0.5, 0.5);
    this.add.text(cx, cy + 40, example.problem, EXAMPLE_STYLE).setOrigin(0.5, 0.5);
    this.add.text(cx, cy + 80, `Answer: ${example.answer}`, BODY_STYLE).setOrigin(0.5, 0.5);

    // Tip
    this.add.text(cx, cy + 130, example.tip, { ...BODY_STYLE, fontSize: '16px' })
      .setOrigin(0.5, 0.5);

    // Dismiss button
    const btnY = cy + 178;
    const btnZone = this.add.rectangle(cx, btnY, 260, 52, 0xC8952A, 0.15)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xC8952A, 0.7);

    this.add.text(cx, btnY, 'TAP TO LAUNCH →', BUTTON_STYLE).setOrigin(0.5, 0.5);

    btnZone.on('pointerover', () => btnZone.setFillStyle(0xC8952A, 0.3));
    btnZone.on('pointerout',  () => btnZone.setFillStyle(0xC8952A, 0.15));
    btnZone.on('pointerdown', () => this.onDismiss());

    // Play briefing enter sound and music
    const _am = this.game.registry.get('audioManager') as
      { playSFX(s: string): void; playMusic(s: string): void } | undefined;
    _am?.playMusic(MUSIC_TRACKS.BRIEFING);
    _am?.playSFX(SOUND_EVENTS.BRIEFING_ENTER);
  }

  /** Return a worked example appropriate for the given math types. */
  private getWorkedExample(mathTypes: string[]): { problem: string; answer: string; tip: string } {
    if (mathTypes.includes('square-roots')) {
      return { problem: '√64 = ?', answer: '8', tip: 'Find the number that multiplies by itself to give 64.' };
    }
    if (mathTypes.includes('multi-step')) {
      return { problem: '(3 × 4) + 5 = ?', answer: '17', tip: 'Solve inside the brackets first, then add.' };
    }
    if (mathTypes.includes('equivalent-fractions')) {
      return { problem: '1/2 of 16 = ?', answer: '8', tip: 'Multiply the number by the top, divide by the bottom.' };
    }
    if (mathTypes.includes('unit-fractions')) {
      return { problem: '1/4 of 12 = ?', answer: '3', tip: 'Divide the number by the bottom of the fraction.' };
    }
    if (mathTypes.includes('division-with-remainders')) {
      return { problem: '17 ÷ 5 = ?', answer: '3 R2', tip: 'How many times does 5 fit into 17? What is left over?' };
    }
    if (mathTypes.includes('division')) {
      return { problem: '42 ÷ 6 = ?', answer: '7', tip: 'Division is the reverse of multiplication.' };
    }
    if (mathTypes.includes('multiplication')) {
      return { problem: '7 × 8 = ?', answer: '56', tip: 'Times tables — practice them to get faster!' };
    }
    if (mathTypes.includes('three-digit-subtraction')) {
      return { problem: '342 − 157 = ?', answer: '185', tip: 'Borrow from the next column when needed.' };
    }
    if (mathTypes.includes('three-digit-addition')) {
      return { problem: '245 + 378 = ?', answer: '623', tip: 'Add column by column and carry when over 9.' };
    }
    if (mathTypes.includes('two-digit-subtraction')) {
      return { problem: '73 − 48 = ?', answer: '25', tip: 'Subtract ones first, then tens.' };
    }
    if (mathTypes.includes('two-digit-addition')) {
      return { problem: '47 + 36 = ?', answer: '83', tip: 'Add the ones column first, then the tens.' };
    }
    if (mathTypes.includes('subtraction')) {
      return { problem: '9 − 4 = ?', answer: '5', tip: 'Count back from the larger number.' };
    }
    // Default: addition
    return { problem: '6 + 7 = ?', answer: '13', tip: 'Count on from the larger number.' };
  }

  /** Emit INTERSTITIAL_DISMISSED and start GameScene for this level. */
  private onDismiss(): void {
    (this.game.registry.get('audioManager') as { playSFX(s: string): void } | undefined)
      ?.playSFX(SOUND_EVENTS.BRIEFING_DISMISS);
    this.events.emit(GameEvents.INTERSTITIAL_DISMISSED);
    this.scene.start('GameScene', { level: this.level });
  }
}
