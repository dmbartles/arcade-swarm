/**
 * TrainingScene — Zero-stakes tutorial wave.
 *
 * Launches a single slow missile with a simple addition problem.
 * Shows guided instruction and a blinking arrow. Loops until the player
 * taps correctly, then transitions to GameScene.
 *
 * @see docs/gdds/missile-command-math.md §Scene List — TrainingScene
 */

import Phaser from 'phaser';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  LAUNCHER_X, LAUNCHER_Y,
  TRAINING_MISSILE_SPEED_MULTIPLIER,
} from '../config/gameConfig';
import {
  COLOR_BG, COLOR_MISSILE_BODY, COLOR_DEFENDER,
  TEXT_TRAINING_GUIDE, TEXT_MISSILE_PROBLEM, TEXT_QUEUE_LOADED,
  FONT_FAMILY,
} from '../config/styleConfig';
import { GameEvents } from '../types/GameEvents';
import type { DifficultySetting } from '../types/IDifficultyConfig';

interface TrainingSceneData {
  level: number;
  difficulty: DifficultySetting;
}

export default class TrainingScene extends Phaser.Scene {
  private level = 1;
  private difficulty: DifficultySetting = 'normal';
  private trainingMissile?: Phaser.GameObjects.Container;
  private guidanceArrow?: Phaser.GameObjects.Text;
  private instructionText?: Phaser.GameObjects.Text;
  private missileY = 0;
  private trainingComplete = false;
  private trainingAnswer = 0;
  private trainingQuestion = '';

  constructor() {
    super({ key: 'TrainingScene' });
  }

  init(data: TrainingSceneData): void {
    this.level = data.level ?? 1;
    this.difficulty = data.difficulty ?? 'normal';
    this.trainingComplete = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLOR_BG);

    // Generate a simple training problem
    const a = Phaser.Math.Between(2, 5);
    const b = Phaser.Math.Between(1, 4);
    this.trainingAnswer = a + b;
    this.trainingQuestion = `${a} + ${b}`;

    // Show instruction
    this.instructionText = this.add.text(
      CANVAS_WIDTH / 2,
      200,
      'TAP THE MISSILE\nTHAT MATCHES YOUR\nLOADED ANSWER',
      { ...TEXT_TRAINING_GUIDE, align: 'center' },
    ).setOrigin(0.5, 0.5).setDepth(20);

    // Show the loaded answer
    this.add.text(
      CANVAS_WIDTH / 2,
      LAUNCHER_Y + 50,
      `LOADED: ${this.trainingAnswer}`,
      { ...TEXT_QUEUE_LOADED, align: 'center' },
    ).setOrigin(0.5, 0.5).setDepth(20);

    // Draw launcher placeholder
    const launcherG = this.add.graphics();
    launcherG.fillStyle(COLOR_DEFENDER, 1);
    launcherG.fillRect(LAUNCHER_X - 24, LAUNCHER_Y, 48, 36);
    launcherG.setDepth(5);

    // Spawn training missile
    this.spawnTrainingMissile();

    // Show guidance arrow
    this.showGuidanceArrow();

    // Listen for correct tap
    this.events.on(GameEvents.THREAT_DESTROYED, () => {
      if (!this.trainingComplete) {
        this.onTrainingSuccess();
      }
    });

    // Clean up on shutdown
    this.events.once('shutdown', () => {
      this.events.off(GameEvents.THREAT_DESTROYED);
    });
  }

  update(_time: number, delta: number): void {
    if (this.trainingComplete) return;

    // Move the training missile downward
    if (this.trainingMissile && this.trainingMissile.active) {
      const speed = 40 * TRAINING_MISSILE_SPEED_MULTIPLIER; // px per second
      this.missileY += speed * (delta / 1000);
      this.trainingMissile.setY(this.missileY);

      // Update arrow position
      if (this.guidanceArrow) {
        this.guidanceArrow.setY(this.missileY - 50);
      }

      // If missile goes off screen, respawn
      if (this.missileY > CANVAS_HEIGHT + 50) {
        this.trainingMissile.destroy();
        this.spawnTrainingMissile();
      }
    }
  }

  /** Spawn a single slow training missile. */
  private spawnTrainingMissile(): void {
    const startX = CANVAS_WIDTH / 2;
    const startY = 80;
    this.missileY = startY;

    this.trainingMissile = this.add.container(startX, startY).setDepth(10);

    // Missile body
    const body = this.add.graphics();
    body.fillStyle(COLOR_MISSILE_BODY, 1);
    body.fillRect(-8, -20, 16, 40);
    this.trainingMissile.add(body);

    // Problem text on missile
    const problemText = this.add.text(0, 0, this.trainingQuestion, {
      ...TEXT_MISSILE_PROBLEM,
      align: 'center',
    }).setOrigin(0.5, 0.5);
    this.trainingMissile.add(problemText);

    // Make missile interactive (tap to answer)
    const hitZone = this.add.zone(startX, startY, 60, 60)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.onMissileTapped());
    this.trainingMissile.add(hitZone);

    // We need to keep hitZone updating with missile position
    this.trainingMissile.setSize(60, 60);
    this.trainingMissile.setInteractive(
      new Phaser.Geom.Rectangle(-30, -30, 60, 60),
      Phaser.Geom.Rectangle.Contains,
    );
    this.trainingMissile.on('pointerdown', () => this.onMissileTapped());

    // Remove the standalone hit zone since container handles it
    hitZone.destroy();
  }

  /** Handle missile tap. */
  private onMissileTapped(): void {
    if (this.trainingComplete) return;

    // In training, the loaded answer always matches — simulate correct tap
    this.events.emit(GameEvents.THREAT_DESTROYED, {
      threatId: 'training-missile',
      threatType: 'standard-missile',
      points: 10,
      chainReaction: false,
      x: this.trainingMissile?.x ?? CANVAS_WIDTH / 2,
      y: this.missileY,
    });
  }

  /** Show the blinking guidance arrow pointing at the missile. */
  private showGuidanceArrow(): void {
    this.guidanceArrow = this.add.text(
      CANVAS_WIDTH / 2,
      30,
      '\u2193 TAP HERE \u2193',
      {
        fontFamily: FONT_FAMILY,
        fontSize: '10px',
        color: '#7FFFB2',
        align: 'center',
      },
    ).setOrigin(0.5, 0.5).setDepth(20);

    // Blinking effect
    this.tweens.add({
      targets: this.guidanceArrow,
      alpha: { from: 1, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  /** Handle successful training completion. */
  private onTrainingSuccess(): void {
    this.trainingComplete = true;

    // Destroy missile
    if (this.trainingMissile) {
      this.trainingMissile.destroy();
    }
    if (this.guidanceArrow) {
      this.guidanceArrow.destroy();
    }

    // Show success message
    const successText = this.add.text(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      'GREAT WORK!\nLAUNCHING MISSION...',
      {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: '#FFD700',
        align: 'center',
      },
    ).setOrigin(0.5, 0.5).setDepth(30);

    this.events.emit(GameEvents.TRAINING_COMPLETE);

    // Transition after brief delay
    this.time.delayedCall(1500, () => {
      successText.destroy();
      this.scene.start('GameScene', {
        level: this.level,
        difficulty: this.difficulty,
      });
    });
  }
}
