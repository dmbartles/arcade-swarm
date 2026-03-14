/**
 * BootScene — Asset preload scene.
 *
 * Loads all sprites, spritesheets, fonts, and audio assets.
 * Shows a simple progress bar during loading. Transitions to MenuScene on complete.
 *
 * @see docs/style-guides/missile-command-math.md §Sprite Specifications
 */

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/gameConfig';
import { COLOR_BG, COLOR_LAUNCHER } from '../config/styleConfig';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  /** Load all sprites, spritesheets, fonts, and audio. */
  preload(): void {
    this.cameras.main.setBackgroundColor(COLOR_BG);

    // ── Progress bar ─────────────────────────────────────────────────────
    const barWidth = 280;
    const barHeight = 20;
    const barX = (CANVAS_WIDTH - barWidth) / 2;
    const barY = (CANVAS_HEIGHT - barHeight) / 2;

    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x222222, 1);
    progressBg.fillRect(barX, barY, barWidth, barHeight);

    const progressFill = this.add.graphics();

    this.load.on('progress', (value: number) => {
      progressFill.clear();
      progressFill.fillStyle(COLOR_LAUNCHER, 1);
      progressFill.fillRect(barX, barY, barWidth * value, barHeight);
    });

    this.load.on('complete', () => {
      progressBg.destroy();
      progressFill.destroy();
    });

    // ── Font loading ─────────────────────────────────────────────────────
    // "Press Start 2P" is loaded via a Google Fonts CSS link in index.html.
    // We create a temporary text object to force the browser to rasterise the font
    // before scenes that depend on it are created.
    this.add.text(0, 0, '', { fontFamily: '"Press Start 2P", monospace', fontSize: '1px' })
      .setVisible(false);

    // ── Placeholder assets ───────────────────────────────────────────────
    // Generate programmatic placeholder textures for all sprite assets.
    // These will be replaced with real sprite art when assets are produced.
    this.createPlaceholderTextures();
  }

  /** Register animations and transition to MenuScene. */
  create(): void {
    this.registerAnimations();
    this.scene.start('MenuScene');
  }

  /** Generate solid-colour placeholder textures for every sprite asset. */
  private createPlaceholderTextures(): void {
    const placeholders: Array<{ key: string; w: number; h: number; color: number; frames?: number }> = [
      { key: 'SPRITE_MISSILE_STANDARD', w: 16, h: 40, color: 0xcc2200, frames: 2 },
      { key: 'SPRITE_MISSILE_MIRV_PARENT', w: 20, h: 48, color: 0xcc2200, frames: 2 },
      { key: 'SPRITE_MISSILE_MIRV_CHILD', w: 12, h: 28, color: 0xff88aa, frames: 2 },
      { key: 'SPRITE_MISSILE_DEFENDER', w: 8, h: 24, color: 0x00aaff, frames: 2 },
      { key: 'SPRITE_BOMBER', w: 80, h: 28, color: 0xaabbcc, frames: 4 },
      { key: 'SPRITE_BOMBER_MISSILE', w: 10, h: 28, color: 0xcc2200, frames: 2 },
      { key: 'SPRITE_PARATROOPER_PLANE', w: 64, h: 22, color: 0xaabbcc, frames: 3 },
      { key: 'SPRITE_PARATROOPER', w: 14, h: 28, color: 0xffcc44, frames: 4 },
      { key: 'SPRITE_PARATROOPER_EXIT', w: 14, h: 28, color: 0xffcc44 },
      { key: 'SPRITE_LAUNCHER_BASE', w: 48, h: 36, color: 0x00ff88 },
      { key: 'SPRITE_LAUNCHER_BARREL', w: 12, h: 28, color: 0x00ff88 },
      { key: 'SPRITE_LAUNCHER_FLASH', w: 48, h: 36, color: 0xff3300, frames: 3 },
      { key: 'SPRITE_LAUNCHER_STREAK', w: 48, h: 36, color: 0xff7700, frames: 4 },
      { key: 'SPRITE_EXPLOSION_PLAYER', w: 96, h: 96, color: 0xffd700, frames: 8 },
      { key: 'SPRITE_EXPLOSION_CITY', w: 64, h: 64, color: 0xff2200, frames: 6 },
      { key: 'SPRITE_EXPLOSION_CHAIN', w: 80, h: 80, color: 0x98ffd0, frames: 8 },
      { key: 'SPRITE_CITY_NYC', w: 64, h: 56, color: 0xffd700 },
      { key: 'SPRITE_CITY_CHI', w: 60, h: 52, color: 0xffd700 },
      { key: 'SPRITE_CITY_LAX', w: 58, h: 48, color: 0xffd700 },
      { key: 'SPRITE_CITY_HOU', w: 56, h: 46, color: 0xffd700 },
      { key: 'SPRITE_CITY_DC', w: 62, h: 54, color: 0xffd700 },
      { key: 'SPRITE_CITY_SEA', w: 56, h: 60, color: 0xffd700 },
      { key: 'SPRITE_CITY_CELEBRATE', w: 64, h: 64, color: 0xfff0a0, frames: 6 },
      { key: 'SPRITE_CITY_DESTROYED', w: 64, h: 40, color: 0x2a2a2a },
      { key: 'SPRITE_CITY_REBUILD', w: 64, h: 56, color: 0xffd700, frames: 8 },
      { key: 'SPRITE_FIREWORK_SMALL', w: 32, h: 32, color: 0xffd700, frames: 6 },
      { key: 'SPRITE_QUEUE_SLOT', w: 60, h: 60, color: 0x0d1a0d },
      { key: 'SPRITE_QUEUE_LOADED_RING', w: 60, h: 60, color: 0xffd700, frames: 4 },
      { key: 'SPRITE_STAR_FULL', w: 24, h: 24, color: 0xffd700 },
      { key: 'SPRITE_STAR_EMPTY', w: 24, h: 24, color: 0x3a3a3a },
      { key: 'SPRITE_PAUSE_ICON', w: 32, h: 32, color: 0xe8f4e8 },
      { key: 'SPRITE_SOUND_ICON', w: 32, h: 32, color: 0xe8f4e8, frames: 2 },
      { key: 'SPRITE_TRAINING_ARROW', w: 24, h: 32, color: 0x7fffb2, frames: 4 },
    ];

    for (const p of placeholders) {
      const frameCount = p.frames ?? 1;
      const totalWidth = p.w * frameCount;
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      for (let i = 0; i < frameCount; i++) {
        // Slightly vary brightness per frame for visual distinction
        const brightness = 1.0 - i * 0.05;
        const r = ((p.color >> 16) & 0xff) * brightness;
        const g = ((p.color >> 8) & 0xff) * brightness;
        const b = (p.color & 0xff) * brightness;
        const frameColor = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
        graphics.fillStyle(frameColor, 1);
        graphics.fillRect(i * p.w, 0, p.w, p.h);
      }
      graphics.generateTexture(p.key, totalWidth, p.h);
      graphics.destroy();

      // If this is a spritesheet, add frame data
      if (frameCount > 1) {
        const texture = this.textures.get(p.key);
        // Remove the default frame and add per-frame data
        for (let i = 0; i < frameCount; i++) {
          texture.add(i, 0, i * p.w, 0, p.w, p.h);
        }
      }
    }
  }

  /** Register sprite animations for all multi-frame assets. */
  private registerAnimations(): void {
    const animDefs: Array<{ key: string; textureKey: string; frames: number; frameRate: number; repeat: number }> = [
      { key: 'ANIM_MISSILE_STANDARD', textureKey: 'SPRITE_MISSILE_STANDARD', frames: 2, frameRate: 5, repeat: -1 },
      { key: 'ANIM_MISSILE_MIRV_PARENT', textureKey: 'SPRITE_MISSILE_MIRV_PARENT', frames: 2, frameRate: 5, repeat: -1 },
      { key: 'ANIM_MISSILE_MIRV_CHILD', textureKey: 'SPRITE_MISSILE_MIRV_CHILD', frames: 2, frameRate: 7, repeat: -1 },
      { key: 'ANIM_MISSILE_DEFENDER', textureKey: 'SPRITE_MISSILE_DEFENDER', frames: 2, frameRate: 10, repeat: -1 },
      { key: 'ANIM_BOMBER', textureKey: 'SPRITE_BOMBER', frames: 4, frameRate: 8, repeat: -1 },
      { key: 'ANIM_BOMBER_MISSILE', textureKey: 'SPRITE_BOMBER_MISSILE', frames: 2, frameRate: 5, repeat: -1 },
      { key: 'ANIM_PARATROOPER_PLANE', textureKey: 'SPRITE_PARATROOPER_PLANE', frames: 3, frameRate: 7, repeat: -1 },
      { key: 'ANIM_PARATROOPER', textureKey: 'SPRITE_PARATROOPER', frames: 4, frameRate: 5, repeat: -1 },
      { key: 'ANIM_LAUNCHER_FLASH', textureKey: 'SPRITE_LAUNCHER_FLASH', frames: 3, frameRate: 12, repeat: 0 },
      { key: 'ANIM_LAUNCHER_STREAK', textureKey: 'SPRITE_LAUNCHER_STREAK', frames: 4, frameRate: 10, repeat: -1 },
      { key: 'ANIM_EXPLOSION_PLAYER', textureKey: 'SPRITE_EXPLOSION_PLAYER', frames: 8, frameRate: 12, repeat: 0 },
      { key: 'ANIM_EXPLOSION_CITY', textureKey: 'SPRITE_EXPLOSION_CITY', frames: 6, frameRate: 10, repeat: 0 },
      { key: 'ANIM_EXPLOSION_CHAIN', textureKey: 'SPRITE_EXPLOSION_CHAIN', frames: 8, frameRate: 14, repeat: 0 },
      { key: 'ANIM_CITY_CELEBRATE', textureKey: 'SPRITE_CITY_CELEBRATE', frames: 6, frameRate: 10, repeat: 0 },
      { key: 'ANIM_CITY_REBUILD', textureKey: 'SPRITE_CITY_REBUILD', frames: 8, frameRate: 4, repeat: 0 },
      { key: 'ANIM_FIREWORK_SMALL', textureKey: 'SPRITE_FIREWORK_SMALL', frames: 6, frameRate: 12, repeat: 0 },
      { key: 'ANIM_QUEUE_LOADED_RING', textureKey: 'SPRITE_QUEUE_LOADED_RING', frames: 4, frameRate: 7, repeat: -1 },
      { key: 'ANIM_TRAINING_ARROW', textureKey: 'SPRITE_TRAINING_ARROW', frames: 4, frameRate: 5, repeat: -1 },
    ];

    for (const def of animDefs) {
      if (this.anims.exists(def.key)) continue;
      this.anims.create({
        key: def.key,
        frames: this.anims.generateFrameNumbers(def.textureKey, {
          start: 0,
          end: def.frames - 1,
        }),
        frameRate: def.frameRate,
        repeat: def.repeat,
      });
    }
  }
}
