/**
 * Launcher — The player's bottom-center launcher loaded with the answer queue.
 *
 * Handles touch/pointer input: on tap, finds the topmost missile at the
 * pointer location and checks if its answer matches the currently loaded round.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 * @see docs/style-guides/missile-command-math.md §Sprite Specifications
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import { INTERCEPTOR_SPEED } from '../config/gameConfig';
import {
  COLOR_LAUNCHER,
  COLOR_LAUNCHER_LOCK,
  COLOR_LAUNCHER_STREAK,
  COLOR_DEFENDER,
} from '../config/styleConfig';
import type { StandardMissile } from './StandardMissile';
import type { StrategicBomber } from './StrategicBomber';

/** Lock duration in ms after wrong tap. */
const DEFAULT_LOCK_DURATION_MS = 500;
/** Barrel rotation easing duration in ms. */
const BARREL_AIM_DURATION_MS = 150;

export class Launcher extends Phaser.GameObjects.Container {
  /** The currently loaded answer (top of queue). */
  loadedAnswer: number | string | null;
  /** True during lock-out period after wrong tap. */
  locked: boolean;
  /** Duration of wrong-tap lock in ms. */
  lockDurationMs: number;
  /** The launcher base visual. */
  private baseRect: Phaser.GameObjects.Rectangle;
  /** The launcher barrel visual. */
  private barrelRect: Phaser.GameObjects.Rectangle;
  /** Streak glow tween reference. */
  private streakTween: Phaser.Tweens.Tween | null;
  /** Whether streak glow is active. */
  private streakGlowActive: boolean;
  /** Active missiles to check on tap (set by WaveManager). */
  private activeMissiles: StandardMissile[];
  /** Active bombers to check on tap (set by WaveManager). */
  private activeBombers: StrategicBomber[];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
  ) {
    super(scene, x, y);

    this.loadedAnswer = null;
    this.locked = false;
    this.lockDurationMs = DEFAULT_LOCK_DURATION_MS;
    this.streakTween = null;
    this.streakGlowActive = false;
    this.activeMissiles = [];
    this.activeBombers = [];

    // Create launcher base visual
    this.baseRect = scene.add.rectangle(0, 0, 48, 36, COLOR_LAUNCHER);
    this.add(this.baseRect);

    // Create barrel
    this.barrelRect = scene.add.rectangle(0, -24, 12, 28, COLOR_LAUNCHER);
    this.barrelRect.setOrigin(0.5, 1);
    this.add(this.barrelRect);

    this.setSize(48, 36);
    this.setDepth(15);

    scene.add.existing(this);

    // Setup input handling - listen for pointer down on the scene
    this.setupInput();
  }

  /** Setup touch/pointer input handling. */
  private setupInput(): void {
    this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
      this.handlePointerDown(pointer);
    });
  }

  /**
   * Handle pointer down events. Find the topmost interactive missile
   * at the pointer location and try to fire at it.
   */
  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.locked || this.loadedAnswer === null) return;

    // Find interactive objects at the pointer position
    const hitObjects = this.scene.input.hitTestPointer(pointer);

    // Find the first missile or bomber in the hit results
    let targetMissile: StandardMissile | null = null;
    let targetBomber: StrategicBomber | null = null;

    for (const obj of hitObjects) {
      // Check if it's an active missile
      const missile = this.activeMissiles.find(
        (m) => !m.destroyed && (m === obj || m.list.includes(obj as Phaser.GameObjects.GameObject)),
      );
      if (missile) {
        targetMissile = missile;
        break;
      }

      // Check if it's an active bomber
      const bomber = this.activeBombers.find(
        (b) => !b.destroyed && (b === obj || b.list.includes(obj as Phaser.GameObjects.GameObject)),
      );
      if (bomber) {
        targetBomber = bomber;
        break;
      }
    }

    if (targetMissile) {
      this.tryFire(targetMissile);
    } else if (targetBomber) {
      this.tryFireBomber(targetBomber);
    }
  }

  /**
   * Called when player taps a missile.
   * Checks if missile.getAnswer() === this.loadedAnswer.
   * If correct: emits INTERCEPTOR_FIRED, fires visual projectile.
   * If incorrect: emits WRONG_TAP, triggers red flash lock.
   */
  tryFire(missile: StandardMissile): void {
    if (this.locked || this.loadedAnswer === null) return;

    const missileAnswer = missile.getAnswer();

    if (String(missileAnswer) === String(this.loadedAnswer)) {
      // Correct tap
      const missilePos = missile.getPosition();

      // Aim barrel at target
      this.aimAt(missilePos.x, missilePos.y);

      // Emit INTERCEPTOR_FIRED
      this.scene.events.emit(GameEvents.INTERCEPTOR_FIRED, {
        launcherX: this.x,
        launcherY: this.y,
        targetX: missilePos.x,
        targetY: missilePos.y,
        targetThreatId: missile.threatId,
        loadedAnswer: this.loadedAnswer,
      });

      // Fire visual defender missile
      this.fireDefenderMissile(missilePos.x, missilePos.y, missile.threatId);
    } else {
      // Wrong tap
      this.scene.events.emit(GameEvents.WRONG_TAP);
      this.playWrongTapFlash();
    }
  }

  /**
   * Try to fire at a bomber (same logic as missile but uses bomber's answer).
   */
  tryFireBomber(bomber: StrategicBomber): void {
    if (this.locked || this.loadedAnswer === null) return;

    const bomberAnswer = bomber.getAnswer();

    if (String(bomberAnswer) === String(this.loadedAnswer)) {
      const bomberPos = bomber.getPosition();

      this.aimAt(bomberPos.x, bomberPos.y);

      this.scene.events.emit(GameEvents.INTERCEPTOR_FIRED, {
        launcherX: this.x,
        launcherY: this.y,
        targetX: bomberPos.x,
        targetY: bomberPos.y,
        targetThreatId: bomber.threatId,
        loadedAnswer: this.loadedAnswer,
      });

      this.fireDefenderMissile(bomberPos.x, bomberPos.y, bomber.threatId);
    } else {
      this.scene.events.emit(GameEvents.WRONG_TAP);
      this.playWrongTapFlash();
    }
  }

  /**
   * Fire a visual defender missile (blue streak) from launcher to target.
   */
  private fireDefenderMissile(targetX: number, targetY: number, targetThreatId: string): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const travelTime = (dist / INTERCEPTOR_SPEED) * 1000;

    // Create the defender missile visual
    const defender = this.scene.add.rectangle(this.x, this.y, 8, 24, COLOR_DEFENDER);
    defender.setDepth(18);

    // Rotate to face target
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    defender.setRotation(angle);

    // Tween to target
    this.scene.tweens.add({
      targets: defender,
      x: targetX,
      y: targetY,
      duration: travelTime,
      ease: 'Linear',
      onComplete: () => {
        defender.destroy();

        // Emit INTERCEPTOR_DETONATED
        this.scene.events.emit(GameEvents.INTERCEPTOR_DETONATED, {
          targetThreatId,
          x: targetX,
          y: targetY,
        });
      },
    });
  }

  /**
   * Load the next answer from the queue into the launcher.
   * Called by AnswerQueue after queue advances.
   */
  loadAnswer(answer: number | string): void {
    this.loadedAnswer = answer;
  }

  /**
   * Rotate the launcher barrel to aim at the given world (x, y) with
   * Cubic.Out easing over 150 ms.
   */
  aimAt(targetX: number, targetY: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const angle = Math.atan2(dx, -dy); // atan2 with inverted Y for screen coords

    this.scene.tweens.add({
      targets: this.barrelRect,
      rotation: angle,
      duration: BARREL_AIM_DURATION_MS,
      ease: 'Cubic.Out',
    });
  }

  /** Play the wrong-tap flash (red flash lock). */
  private playWrongTapFlash(): void {
    this.locked = true;

    const originalColor = COLOR_LAUNCHER;
    this.baseRect.setFillStyle(COLOR_LAUNCHER_LOCK);

    this.scene.time.delayedCall(this.lockDurationMs, () => {
      this.locked = false;
      this.baseRect.setFillStyle(
        this.streakGlowActive ? COLOR_LAUNCHER_STREAK : originalColor,
      );
    });
  }

  /** Play streak glow when streak >= 5. */
  playStreakGlow(): void {
    if (this.streakGlowActive) return;
    this.streakGlowActive = true;

    this.streakTween = this.scene.tweens.add({
      targets: this.baseRect,
      fillColor: { from: COLOR_LAUNCHER, to: COLOR_LAUNCHER_STREAK },
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Linear',
    });
  }

  /** Stop streak glow when streak < 5. */
  stopStreakGlow(): void {
    if (!this.streakGlowActive) return;
    this.streakGlowActive = false;

    if (this.streakTween) {
      this.streakTween.stop();
      this.streakTween = null;
    }

    this.baseRect.setFillStyle(COLOR_LAUNCHER);
  }

  /**
   * Set active missiles for tap detection.
   * Called by WaveManager to keep the launcher aware of what can be tapped.
   */
  setActiveMissiles(missiles: StandardMissile[]): void {
    this.activeMissiles = missiles;
  }

  /**
   * Set active bombers for tap detection.
   * Called by WaveManager to keep the launcher aware of what can be tapped.
   */
  setActiveBombers(bombers: StrategicBomber[]): void {
    this.activeBombers = bombers;
  }

  preUpdate(_time: number, _delta: number): void {
    // No per-frame updates needed for the launcher base
  }
}
