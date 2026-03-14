/**
 * AnswerQueue — Visual answer queue strip showing upcoming rounds.
 *
 * Displays the shuffled answer queue at the bottom of the screen.
 * The loaded answer (slot 0) has a pulsing glow ring. Match highlighting
 * can show which queue items correspond to visible incoming problems.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 * @see docs/style-guides/missile-command-math.md §UI Layout
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import {
  QUEUE_SLOT_0_X,
  QUEUE_SLOT_SPACING,
  QUEUE_SLOT_SIZE,
  QUEUE_ADVANCE_DURATION_MS,
} from '../config/gameConfig';
import {
  COLOR_BG_QUEUE,
  COLOR_QUEUE_LOADED,
  COLOR_QUEUE_MATCH,
  COLOR_QUEUE_PENDING,
  COLOR_QUEUE_LOADED_STR,
  COLOR_QUEUE_PENDING_STR,
  COLOR_QUEUE_MATCH_STR,
} from '../config/styleConfig';
import { TEXT_QUEUE_LOADED, TEXT_QUEUE_NUMBER } from '../config/styleConfig';
import type { Launcher } from './Launcher';
import type { StandardMissile } from './StandardMissile';

/** Maximum visible queue slots. */
const MAX_VISIBLE_SLOTS = 6;
/** Strip height. */
const STRIP_HEIGHT = 72;
/** Strip width. */
const STRIP_WIDTH = 480;

export class AnswerQueue extends Phaser.GameObjects.Container {
  /** All answers for this wave (shuffled). Index 0 = currently loaded. */
  private rounds: Array<number | string>;
  /** Index into rounds of the currently loaded answer. */
  private currentIndex: number;
  /** Whether highlight assist is enabled. */
  highlightAssistEnabled: boolean;
  /** Array of visible missile references for match highlighting. */
  private visibleMissiles: StandardMissile[];
  /** Visual slot containers. */
  private slots: Phaser.GameObjects.Container[];
  /** Slot text objects. */
  private slotTexts: Phaser.GameObjects.Text[];
  /** Slot background rects. */
  private slotBgs: Phaser.GameObjects.Rectangle[];
  /** Background strip. */
  private bgStrip: Phaser.GameObjects.Rectangle;
  /** Loaded pulse tween. */
  private loadedPulseTween: Phaser.Tweens.Tween | null;
  /** Reference to launcher for answer loading. */
  private launcherRef: Launcher | null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y);

    this.rounds = [];
    this.currentIndex = 0;
    this.highlightAssistEnabled = true;
    this.visibleMissiles = [];
    this.slots = [];
    this.slotTexts = [];
    this.slotBgs = [];
    this.loadedPulseTween = null;
    this.launcherRef = null;

    // Create background strip
    this.bgStrip = scene.add.rectangle(STRIP_WIDTH / 2, STRIP_HEIGHT / 2, STRIP_WIDTH, STRIP_HEIGHT, COLOR_BG_QUEUE);
    this.add(this.bgStrip);

    this.setDepth(25);
    scene.add.existing(this);
  }

  /**
   * Initialize the queue with a full wave answer array.
   * Called by WaveManager after PROBLEM_GENERATED fires.
   * Resets currentIndex to 0. Renders all visible slots.
   * Notifies Launcher of the first loaded answer.
   */
  initialize(answerQueue: Array<number | string>, launcher: Launcher): void {
    this.rounds = [...answerQueue];
    this.currentIndex = 0;
    this.launcherRef = launcher;

    // Clear existing slot visuals
    this.clearSlots();

    // Render visible slots
    this.renderSlots();

    // Load first answer into launcher
    if (this.rounds.length > 0) {
      launcher.loadAnswer(this.rounds[0]);
    }
  }

  /** Clear all slot visual objects. */
  private clearSlots(): void {
    if (this.loadedPulseTween) {
      this.loadedPulseTween.stop();
      this.loadedPulseTween = null;
    }

    for (const slot of this.slots) {
      slot.destroy();
    }
    this.slots = [];
    this.slotTexts = [];
    this.slotBgs = [];
  }

  /** Render the visible queue slots. */
  private renderSlots(): void {
    const visibleCount = Math.min(MAX_VISIBLE_SLOTS, this.rounds.length - this.currentIndex);

    for (let i = 0; i < visibleCount; i++) {
      const roundIndex = this.currentIndex + i;
      const answer = this.rounds[roundIndex];
      const isLoaded = i === 0;

      // Calculate slot position
      const slotX = isLoaded ? QUEUE_SLOT_0_X : QUEUE_SLOT_0_X + QUEUE_SLOT_SPACING * i;
      const slotY = STRIP_HEIGHT / 2;

      // Create slot container
      const slot = this.scene.add.container(slotX, slotY);

      // Create slot background
      const bg = this.scene.add.rectangle(
        0, 0,
        QUEUE_SLOT_SIZE, QUEUE_SLOT_SIZE,
        isLoaded ? COLOR_QUEUE_LOADED : COLOR_QUEUE_PENDING,
        isLoaded ? 0.3 : 0.15,
      );
      slot.add(bg);

      // Create text
      const style = isLoaded ? { ...TEXT_QUEUE_LOADED } : { ...TEXT_QUEUE_NUMBER };
      const text = this.scene.add.text(0, 0, String(answer), style);
      text.setOrigin(0.5, 0.5);
      slot.add(text);

      this.add(slot);
      this.slots.push(slot);
      this.slotTexts.push(text);
      this.slotBgs.push(bg);
    }

    // Start loaded pulse animation
    this.startLoadedPulse();
  }

  /** Start the pulsing glow on the loaded slot. */
  private startLoadedPulse(): void {
    if (this.slots.length === 0) return;

    const loadedSlot = this.slots[0];
    this.loadedPulseTween = this.scene.tweens.add({
      targets: loadedSlot,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  /**
   * Advance the queue by one position.
   * Plays slide-left animation over QUEUE_ADVANCE_DURATION_MS.
   * Emits QUEUE_ADVANCED with { loadedAnswer }.
   * Notifies Launcher of the new loaded answer.
   */
  advance(launcher: Launcher): void {
    if (this.currentIndex >= this.rounds.length - 1) return;

    this.currentIndex += 1;

    // Re-render slots with animation
    this.clearSlots();

    // Short delay for the slide animation effect
    this.scene.time.delayedCall(QUEUE_ADVANCE_DURATION_MS, () => {
      this.renderSlots();

      const loadedAnswer = this.getLoadedAnswer();

      // Notify launcher
      if (loadedAnswer !== null) {
        launcher.loadAnswer(loadedAnswer);
      }

      // Emit QUEUE_ADVANCED
      this.scene.events.emit(GameEvents.QUEUE_ADVANCED, {
        loadedAnswer,
      });
    });
  }

  /**
   * Register active missiles so match highlighting can compare
   * incoming problem answers against queue slots.
   */
  setVisibleMissiles(missiles: StandardMissile[]): void {
    this.visibleMissiles = missiles;
  }

  /**
   * Called each frame; updates match highlight state.
   * For each visible slot: if any active missile's correctAnswer matches
   * the slot's value, apply COLOR_QUEUE_MATCH tint.
   */
  updateHighlights(): void {
    if (!this.highlightAssistEnabled) return;

    const activeMissileAnswers = new Set(
      this.visibleMissiles
        .filter((m) => !m.destroyed)
        .map((m) => String(m.getAnswer())),
    );

    for (let i = 0; i < this.slotTexts.length; i++) {
      const roundIndex = this.currentIndex + i;
      if (roundIndex >= this.rounds.length) break;

      const answer = String(this.rounds[roundIndex]);
      const isLoaded = i === 0;

      if (isLoaded) {
        // Loaded slot keeps its own style
        this.slotTexts[i].setColor(COLOR_QUEUE_LOADED_STR);
      } else if (activeMissileAnswers.has(answer)) {
        // Match highlight
        this.slotTexts[i].setColor(COLOR_QUEUE_MATCH_STR);
        this.slotBgs[i].setFillStyle(COLOR_QUEUE_MATCH, 0.2);
      } else {
        // Default pending style
        this.slotTexts[i].setColor(COLOR_QUEUE_PENDING_STR);
        this.slotBgs[i].setFillStyle(COLOR_QUEUE_PENDING, 0.15);
      }
    }
  }

  /** Return the currently loaded answer. */
  getLoadedAnswer(): number | string | null {
    if (this.currentIndex < this.rounds.length) {
      return this.rounds[this.currentIndex];
    }
    return null;
  }

  preUpdate(_time: number, _delta: number): void {
    this.updateHighlights();
  }
}
