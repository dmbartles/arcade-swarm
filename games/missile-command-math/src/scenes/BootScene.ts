/**
 * BootScene — Asset preload and application settings rehydration.
 *
 * Runs once at application start. Calls SpriteFactory to generate all
 * canvas-drawn sprites, registers Phaser animations, reads localStorage
 * settings into the Phaser registry, then transitions to MenuScene.
 *
 * @see docs/build-plans/missile-command-math-engine.md §2.7
 */

import Phaser from 'phaser';
import { SpriteFactory, ANIM_KEYS, SPRITE_KEYS } from '../assets';
import { SOUND_ENABLED_KEY } from '../config/audioConfig';

/** localStorage key for the saved difficulty preset. */
const DIFFICULTY_KEY = 'mcm_difficulty';

/** localStorage key for the highest unlocked level. */
const HIGHEST_LEVEL_KEY = 'mcm_highest_level';

/** localStorage key for per-level star ratings (JSON number[]). */
const STARS_KEY = 'mcm_stars';

/** localStorage key for whether the player has seen the training briefing. */
const HAS_SEEN_TRAINING_KEY = 'mcm_has_seen_training';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  /** Preload: generate all sprites and read localStorage settings. */
  preload(): void {
    SpriteFactory.preload(this);
    this.rehydrateSettings();
  }

  /**
   * Create: register all Phaser animations, then start MenuScene.
   */
  create(): void {
    this.registerAnimations();
    this.scene.start('MenuScene');
  }

  // ── Private ────────────────────────────────────────────────────────────────

  /**
   * Register all animations from the style guide Animations table.
   * All key and sprite references come from ANIM_KEYS / SPRITE_KEYS consts.
   */
  private registerAnimations(): void {
    // LAUNCHER_WRONG_FLASH — 2 frames, 12 fps, repeat 2, no yoyo
    this.anims.create({
      key: ANIM_KEYS.LAUNCHER_WRONG_FLASH,
      frames: this.anims.generateFrameNumbers(SPRITE_KEYS.LAUNCHER_FLASH, { start: 0, end: 1 }),
      frameRate: 12,
      repeat: 2,
      yoyo: false,
    });

    // EXPLOSION_BURST — 6 frames, 12 fps, play once
    this.anims.create({
      key: ANIM_KEYS.EXPLOSION_BURST,
      frames: this.anims.generateFrameNumbers(SPRITE_KEYS.EXPLOSION, { start: 0, end: 5 }),
      frameRate: 12,
      repeat: 0,
      yoyo: false,
    });

    // BUILDING_HIT — 3 frames, 8 fps, play once
    this.anims.create({
      key: ANIM_KEYS.BUILDING_HIT,
      frames: this.anims.generateFrameNumbers(SPRITE_KEYS.BUILDING_DAMAGED, { start: 0, end: 2 }),
      frameRate: 8,
      repeat: 0,
      yoyo: false,
    });

    // BOMBER_FLY — 4 frames, 8 fps, loop
    this.anims.create({
      key: ANIM_KEYS.BOMBER_FLY,
      frames: this.anims.generateFrameNumbers(SPRITE_KEYS.BOMBER, { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
      yoyo: false,
    });

    // FIREWORK_POP — 5 frames, 16 fps, play once
    this.anims.create({
      key: ANIM_KEYS.FIREWORK_POP,
      frames: this.anims.generateFrameNumbers(SPRITE_KEYS.FIREWORK_BURST, { start: 0, end: 4 }),
      frameRate: 16,
      repeat: 0,
      yoyo: false,
    });

    // REBUILD_CRANE_LIFT — 4 frames, 5 fps, loop with yoyo
    this.anims.create({
      key: ANIM_KEYS.REBUILD_CRANE_LIFT,
      frames: this.anims.generateFrameNumbers(SPRITE_KEYS.REBUILD_CRANE, { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1,
      yoyo: true,
    });
  }

  /**
   * Read persisted settings from localStorage and store on Phaser registry
   * so all scenes can access them without re-reading localStorage.
   */
  private rehydrateSettings(): void {
    // Sound enabled (default: true)
    const soundRaw = localStorage.getItem(SOUND_ENABLED_KEY);
    const soundEnabled = soundRaw === null ? true : soundRaw === 'true';
    this.registry.set('soundEnabled', soundEnabled);

    // Difficulty preset (default: 'normal')
    const difficulty = localStorage.getItem(DIFFICULTY_KEY) ?? 'normal';
    this.registry.set('difficulty', difficulty);

    // Highest unlocked level (default: 1)
    const highestRaw = localStorage.getItem(HIGHEST_LEVEL_KEY);
    const highestLevel = highestRaw ? parseInt(highestRaw, 10) : 1;
    this.registry.set('highestUnlockedLevel', isNaN(highestLevel) ? 1 : highestLevel);

    // Per-level star ratings (default: all zeros, 21 entries for levels 0–20)
    const starsRaw = localStorage.getItem(STARS_KEY);
    let stars: number[] = new Array(21).fill(0);
    if (starsRaw) {
      try {
        const parsed = JSON.parse(starsRaw) as unknown;
        if (Array.isArray(parsed)) {
          stars = parsed as number[];
        }
      } catch {
        // Invalid JSON — use defaults
      }
    }
    this.registry.set('levelStars', stars);

    // Has seen training briefing (default: false)
    const hasSeenTraining = localStorage.getItem(HAS_SEEN_TRAINING_KEY) === 'true';
    this.registry.set('hasSeenTraining', hasSeenTraining);
  }
}
