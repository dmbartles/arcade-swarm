/**
 * InterstitialScene — Historical narrative card + mechanic briefing.
 *
 * Displays a teletype-revealed Cold War narrative for the current level year,
 * introduces any new threats or math skills, and gates entry to the game
 * with a "TAP TO LAUNCH →" button. Never auto-dismisses.
 *
 * @see docs/gdds/missile-command-math.md §Scene List, §Interstitial
 */

import Phaser from 'phaser';
import {
  SAFE_MARGIN,
  TELETYPE_CHAR_DELAY_MS, TELETYPE_CURSOR_BLINK_MS,
  TAP_TO_LAUNCH_BUTTON_X, TAP_TO_LAUNCH_BUTTON_Y,
  TAP_TO_LAUNCH_BUTTON_W, TAP_TO_LAUNCH_BUTTON_H,
  MIN_TOUCH_TARGET,
} from '../config/gameConfig';
import { LEVEL_CONFIGS } from '../config/levelConfig';
import {
  COLOR_BG_INTERSTITIAL, COLOR_BG_HUD, COLOR_BUTTON_BG,
  COLOR_BUTTON_BORDER,
  TEXT_INTERSTITIAL_DATE, TEXT_INTERSTITIAL_BODY,
  TEXT_MECHANIC_LABEL, TEXT_BUTTON,
} from '../config/styleConfig';
import { GameEvents } from '../types/GameEvents';
import type { DifficultySetting } from '../types/IDifficultyConfig';

interface InterstitialSceneData {
  level: number;
  difficulty: DifficultySetting;
  isRetry: boolean;
}

/** Static historical narrative strings per level. */
const LEVEL_NARRATIVES: Record<number, {
  headline: string;
  body: string;
  newThreat?: string;
  newMath?: string;
}> = {
  1: {
    headline: 'JANUARY 1981 — REAGAN TAKES OFFICE',
    body: 'Soviet missile deployments accelerate across Eastern Europe. '
      + 'NORAD activates a new defense grid. Your cities depend on you, Commander.',
    newMath: 'ADDITION & SUBTRACTION — Match answers to incoming threats!',
  },
  2: {
    headline: 'MARCH 1982 — COLD WAR INTENSIFIES',
    body: 'Intelligence reports show increased missile production. '
      + 'Threat volume rises. Study your answer queue carefully.',
    newMath: 'QUEUE SCANNING — Watch your loaded answer and plan ahead!',
  },
  3: {
    headline: 'OCTOBER 1982 — NEW WARHEAD TYPES',
    body: 'Soviet engineers deploy warheads with multiplication encodings. '
      + 'Your math training expands to meet the threat.',
    newMath: 'MULTIPLICATION — ×2, ×5, and ×10 tables now active!',
  },
  4: {
    headline: 'JUNE 1983 — FULL DEPLOYMENT',
    body: 'All multiplication tables are now in enemy warhead codes. '
      + 'The full ×12 table is active. Stay sharp, Commander.',
    newMath: 'FULL MULTIPLICATION — All times tables through ×12!',
  },
  5: {
    headline: 'NOVEMBER 1983 — ABLE ARCHER',
    body: 'NATO exercise "Able Archer 83" nearly triggers Soviet launch. '
      + 'New warheads carry division-encoded targeting systems.',
    newMath: 'DIVISION — Enemy codes now include division problems!',
  },
  6: {
    headline: 'APRIL 1984 — BOMBER THREAT',
    body: 'Soviet strategic bombers are now crossing the Arctic circle. '
      + 'They carry bonus warheads — intercept them before they drop!',
    newThreat: 'STRATEGIC BOMBER — Flies across screen; destroy before payload drop for bonus!',
    newMath: 'FRACTIONS — Unit fraction problems appear on warheads!',
  },
  7: {
    headline: 'MARCH 1985 — PARATROOPERS',
    body: 'Enemy transports are dropping paratroopers on your cities. '
      + 'They cannot be shot directly — catch them in blast radius!',
    newThreat: 'PARATROOPERS — Neutralise with explosion blast radius only!',
    newMath: 'MULTI-STEP PROBLEMS — Complex expressions require careful solving!',
  },
  8: {
    headline: 'APRIL 1986 — MIRV TECHNOLOGY',
    body: 'Multiple Independently-targetable Reentry Vehicles detected. '
      + 'One warhead splits into many — destroy before split altitude!',
    newThreat: 'MIRV WARHEAD — Splits into multiple child warheads at altitude!',
    newMath: 'SQUARE ROOTS — √ problems now encoded in warhead systems!',
  },
  9: {
    headline: 'FEBRUARY 1987 — ALL THREATS ACTIVE',
    body: 'Full Soviet arsenal deployed: missiles, bombers, MIRVs, paratroopers. '
      + 'Every math skill is needed. The defense grid is at maximum alert.',
    newMath: 'EQUIVALENT FRACTIONS — Advanced fraction matching required!',
  },
  10: {
    headline: 'DECEMBER 1987 — THE FINAL WAVE',
    body: 'INF Treaty negotiations are underway, but hardliners launch a final '
      + 'massive strike. Defend all cities to secure the treaty and win the peace!',
    newMath: 'MIXED OPERATIONS — All math types combined in final assault!',
  },
};

export default class InterstitialScene extends Phaser.Scene {
  private level = 1;
  private difficulty: DifficultySetting = 'normal';
  private isRetry = false;
  private teletypeTimer?: Phaser.Time.TimerEvent;
  private cursorTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'InterstitialScene' });
  }

  init(data: InterstitialSceneData): void {
    this.level = data.level ?? 1;
    this.difficulty = data.difficulty ?? 'normal';
    this.isRetry = data.isRetry ?? false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLOR_BG_INTERSTITIAL);
    this.renderCard();
    this.renderLaunchButton();
  }

  /** Render the interstitial card with teletype text reveal. */
  private renderCard(): void {
    // Card background
    const cardX = 24;
    const cardY = 120;
    const cardW = 432;
    const cardH = 560;

    const cardBg = this.add.graphics();
    cardBg.fillStyle(COLOR_BG_HUD, 1);
    cardBg.fillRect(cardX, cardY, cardW, cardH);
    cardBg.lineStyle(2, 0x00ff88, 1);
    cardBg.strokeRect(cardX, cardY, cardW, cardH);

    const narrative = LEVEL_NARRATIVES[this.level] ?? LEVEL_NARRATIVES[1];
    const levelConfig = LEVEL_CONFIGS[this.level - 1];

    // Level indicator
    this.add.text(cardX + SAFE_MARGIN, cardY + 16, `LEVEL ${this.level} — ${levelConfig?.year ?? 1981}`, {
      ...TEXT_INTERSTITIAL_DATE,
    });

    // Headline with teletype reveal
    const headlineText = this.add.text(
      cardX + SAFE_MARGIN,
      cardY + 50,
      '',
      { ...TEXT_INTERSTITIAL_DATE, wordWrap: { width: cardW - SAFE_MARGIN * 2 } },
    );
    this.startTeletypeReveal(narrative.headline, headlineText, () => {
      // After headline reveals, show body
      this.revealBodyText(cardX, cardY, cardW, narrative);
    });
  }

  /** Reveal body text and optional new threat/math labels. */
  private revealBodyText(
    cardX: number,
    cardY: number,
    cardW: number,
    narrative: { body: string; newThreat?: string; newMath?: string },
  ): void {
    const bodyText = this.add.text(
      cardX + SAFE_MARGIN,
      cardY + 120,
      '',
      { ...TEXT_INTERSTITIAL_BODY, wordWrap: { width: cardW - SAFE_MARGIN * 2 } },
    );
    this.startTeletypeReveal(narrative.body, bodyText, () => {
      let nextY = cardY + 260;

      // New threat label
      if (narrative.newThreat && this.level > 1) {
        this.add.text(cardX + SAFE_MARGIN, nextY, 'NEW THREAT:', {
          ...TEXT_MECHANIC_LABEL,
        });
        nextY += 24;
        this.add.text(cardX + SAFE_MARGIN, nextY, narrative.newThreat, {
          ...TEXT_INTERSTITIAL_BODY,
          wordWrap: { width: cardW - SAFE_MARGIN * 2 },
        });
        nextY += 60;
      }

      // New math label
      if (narrative.newMath) {
        this.add.text(cardX + SAFE_MARGIN, nextY, 'NEW MATH:', {
          ...TEXT_MECHANIC_LABEL,
        });
        nextY += 24;
        this.add.text(cardX + SAFE_MARGIN, nextY, narrative.newMath, {
          ...TEXT_INTERSTITIAL_BODY,
          wordWrap: { width: cardW - SAFE_MARGIN * 2 },
        });
      }
    });
  }

  /** Teletype character-by-character reveal effect. */
  private startTeletypeReveal(
    text: string,
    targetObj: Phaser.GameObjects.Text,
    onComplete?: () => void,
  ): void {
    let charIndex = 0;

    // Cursor blink
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

          // Move cursor to end of text
          const bounds = targetObj.getBounds();
          cursor.setPosition(bounds.right + 2, bounds.bottom - cursor.height);
        } else {
          // Reveal complete
          this.teletypeTimer?.destroy();
          cursor.destroy();
          this.cursorTimer?.destroy();
          if (onComplete) onComplete();
        }
      },
      loop: true,
    });
  }

  /** Render the "TAP TO LAUNCH →" button. */
  private renderLaunchButton(): void {
    const btnX = TAP_TO_LAUNCH_BUTTON_X;
    const btnY = TAP_TO_LAUNCH_BUTTON_Y;
    const btnW = TAP_TO_LAUNCH_BUTTON_W;
    const btnH = Math.max(TAP_TO_LAUNCH_BUTTON_H, MIN_TOUCH_TARGET);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(COLOR_BUTTON_BG, 1);
    btnBg.fillRect(btnX, btnY, btnW, btnH);
    btnBg.lineStyle(2, COLOR_BUTTON_BORDER, 1);
    btnBg.strokeRect(btnX, btnY, btnW, btnH);

    const btnText = this.add.text(
      btnX + btnW / 2,
      btnY + btnH / 2,
      'TAP TO LAUNCH \u2192',
      { ...TEXT_BUTTON, align: 'center' },
    ).setOrigin(0.5, 0.5);

    const hitZone = this.add.zone(
      btnX + btnW / 2,
      btnY + btnH / 2,
      btnW,
      btnH,
    ).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.onLaunchTapped());

    // Press feedback
    hitZone.on('pointerover', () => btnText.setAlpha(0.8));
    hitZone.on('pointerout', () => btnText.setAlpha(1));
  }

  /** Handle tap on the launch button. */
  private onLaunchTapped(): void {
    // Clean up timers
    this.teletypeTimer?.destroy();
    this.cursorTimer?.destroy();

    this.events.emit(GameEvents.INTERSTITIAL_DISMISSED);

    if (this.level === 1 && !this.isRetry) {
      this.scene.start('TrainingScene', {
        level: this.level,
        difficulty: this.difficulty,
      });
    } else {
      this.scene.start('GameScene', {
        level: this.level,
        difficulty: this.difficulty,
      });
    }
  }
}
