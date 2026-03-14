/**
 * EffectsSystem — Handles all visual-only effects.
 *
 * Owns no game state. Receives calls from GameScene event handlers and
 * listens to events on the Phaser event bus for autonomous effects
 * (explosions at destroyed threat positions, city flashes, wrong-tap flash).
 *
 * @see docs/style-guides/missile-command-math.md §Visual Effects
 */

import Phaser from 'phaser';
import {
  SCORE_POP_RISE_PX, SCORE_POP_DURATION_MS,
  BADGE_HOLD_MS, BADGE_INTRO_MS,
  CANVAS_WIDTH, CANVAS_HEIGHT,
} from '../config/gameConfig';
import {
  COLOR_EXPLOSION_CORE, COLOR_EXPLOSION_MID, COLOR_EXPLOSION_OUTER,
  COLOR_EXPLOSION_ALT, COLOR_WARNING_RED, COLOR_CITY_CELEBRATE,
  COLOR_LAUNCHER_LOCK, COLOR_BADGE_BG,
  COLOR_SCANLINE, SCANLINE_ALPHA, SCANLINE_SPACING,
  TEXT_SCORE_POP, TEXT_BADGE,
} from '../config/styleConfig';
import { GameEvents } from '../types/GameEvents';
import type { ThreatDestroyedPayload, ChainReactionPayload } from '../types/GameEvents';

/** Extended payload that includes world position (see build plan §3 note). */
interface ThreatDestroyedWithPosition extends ThreatDestroyedPayload {
  x: number;
  y: number;
}

export default class EffectsSystem {
  private scene: Phaser.Scene;
  private scanlineGraphics?: Phaser.GameObjects.Graphics;
  private crtEnabled = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupEventListeners();
  }

  /** Wire up event listeners for autonomous effects. */
  private setupEventListeners(): void {
    this.scene.events.on(GameEvents.THREAT_DESTROYED, (payload: ThreatDestroyedWithPosition) => {
      if (payload.x !== undefined && payload.y !== undefined) {
        if (payload.chainReaction) {
          this.playChainExplosion(payload.x, payload.y);
        } else {
          this.playPlayerExplosion(payload.x, payload.y);
        }
      }
    });

    this.scene.events.on(GameEvents.CITY_SAVED, (payload: { cityIndex: number }) => {
      this.flashCitySaved(payload.cityIndex);
    });

    this.scene.events.on(GameEvents.WRONG_TAP, () => {
      this.flashLauncherWrongTap();
    });

    this.scene.events.on(GameEvents.CRT_EFFECT_TOGGLED, () => {
      this.setCRTEnabled(!this.crtEnabled);
    });

    this.scene.events.on(GameEvents.CHAIN_REACTION, (payload: ChainReactionPayload) => {
      this.showChainBadge(payload.chainLength);
    });

    // Clean up on shutdown
    this.scene.events.once('shutdown', () => this.destroy());
  }

  /** Play the player explosion burst at world position (x, y). */
  playPlayerExplosion(x: number, y: number): void {
    this.playExplosionEffect(x, y, [
      { radius: 16, color: COLOR_EXPLOSION_CORE, alpha: 1.0 },
      { radius: 48, color: COLOR_EXPLOSION_MID, alpha: 0.8 },
      { radius: 80, color: COLOR_EXPLOSION_OUTER, alpha: 0.5 },
    ], 640);
  }

  /** Play a chain explosion burst at world position (x, y). */
  playChainExplosion(x: number, y: number): void {
    this.playExplosionEffect(x, y, [
      { radius: 16, color: COLOR_EXPLOSION_CORE, alpha: 1.0 },
      { radius: 40, color: COLOR_EXPLOSION_MID, alpha: 0.8 },
      { radius: 64, color: COLOR_EXPLOSION_ALT, alpha: 0.6 },
    ], 560);
  }

  /** Play a city-hit explosion at (x, y). */
  playCityExplosion(x: number, y: number): void {
    this.playExplosionEffect(x, y, [
      { radius: 12, color: COLOR_EXPLOSION_CORE, alpha: 1.0 },
      { radius: 32, color: COLOR_WARNING_RED, alpha: 0.8 },
      { radius: 52, color: COLOR_WARNING_RED, alpha: 0.4 },
    ], 600);
  }

  /** Float a score pop-up text at (x, y) with the given label (e.g. "+10"). */
  showScorePop(x: number, y: number, label: string): void {
    const popText = this.scene.add.text(x, y, label, {
      ...TEXT_SCORE_POP,
      align: 'center',
    }).setOrigin(0.5, 0.5).setDepth(120);

    this.scene.tweens.add({
      targets: popText,
      y: y - SCORE_POP_RISE_PX,
      alpha: { from: 1, to: 0 },
      duration: SCORE_POP_DURATION_MS,
      ease: 'Linear',
      onComplete: () => {
        popText.destroy();
      },
    });
  }

  /** Flash the full canvas with a colour at given alpha for durationMs. */
  flashCanvas(color: number, alpha: number, durationMs: number): void {
    const flash = this.scene.add.graphics().setDepth(180);
    flash.fillStyle(color, alpha);
    flash.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: durationMs,
      ease: 'Linear',
      onComplete: () => {
        flash.destroy();
      },
    });
  }

  /** Flash the launcher red on wrong tap. */
  flashLauncherWrongTap(): void {
    // Full-screen flash at 15% alpha, 400ms
    this.flashCanvas(COLOR_LAUNCHER_LOCK, 0.15, 400);
  }

  /** Show the CHAIN badge at center-screen. */
  showChainBadge(chainLength: number): void {
    this.showBadge(`CHAIN x${chainLength}`);
  }

  /** Show a streak badge at center-screen. */
  showStreakBadge(label: string): void {
    if (!label) return;
    this.showBadge(label);
  }

  /** Flash a city gold on city-save event. */
  flashCitySaved(_cityIndex: number): void {
    // Emit a brief golden flash at the city's approximate position
    // The actual city object position is managed by Coding Agent 2;
    // here we apply a generic screen-level celebration pulse
    this.flashCanvas(COLOR_CITY_CELEBRATE, 0.1, 500);
  }

  /** Toggle the CRT scanline overlay. */
  setCRTEnabled(enabled: boolean): void {
    this.crtEnabled = enabled;

    if (enabled && !this.scanlineGraphics) {
      this.scanlineGraphics = this.scene.add.graphics().setDepth(999);
      this.scanlineGraphics.fillStyle(COLOR_SCANLINE, SCANLINE_ALPHA);
      for (let y = 0; y < CANVAS_HEIGHT; y += SCANLINE_SPACING) {
        this.scanlineGraphics.fillRect(0, y, CANVAS_WIDTH, 1);
      }
    } else if (!enabled && this.scanlineGraphics) {
      this.scanlineGraphics.destroy();
      this.scanlineGraphics = undefined;
    }
  }

  /** Must be called each frame from GameScene.update(). */
  update(): void {
    // Reserved for future per-frame effect updates (e.g. particle systems)
  }

  /** Internal: play a multi-ring explosion effect. */
  private playExplosionEffect(
    x: number,
    y: number,
    rings: Array<{ radius: number; color: number; alpha: number }>,
    durationMs: number,
  ): void {
    const container = this.scene.add.container(x, y).setDepth(110);

    for (const ring of rings) {
      const circle = this.scene.add.graphics();
      circle.fillStyle(ring.color, ring.alpha);
      circle.fillCircle(0, 0, 4); // Start small
      container.add(circle);

      // Expand to full radius and fade
      this.scene.tweens.add({
        targets: circle,
        scaleX: ring.radius / 4,
        scaleY: ring.radius / 4,
        alpha: 0,
        duration: durationMs,
        ease: 'Cubic.easeOut',
      });
    }

    this.scene.time.delayedCall(durationMs + 50, () => {
      container.destroy();
    });
  }

  /** Internal: show a badge at center-screen. */
  private showBadge(label: string): void {
    const badgeW = 200;
    const badgeH = 48;

    const container = this.scene.add.container(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 - 40,
    ).setDepth(150);

    const bg = this.scene.add.graphics();
    bg.fillStyle(COLOR_BADGE_BG, 1);
    bg.fillRoundedRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 4);
    container.add(bg);

    const text = this.scene.add.text(0, 0, label, {
      ...TEXT_BADGE,
      align: 'center',
    }).setOrigin(0.5, 0.5);
    container.add(text);

    // Scale-in with Back.Out easing
    container.setScale(0.5);
    this.scene.tweens.add({
      targets: container,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: BADGE_INTRO_MS,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
          ease: 'Linear',
          onComplete: () => {
            this.scene.time.delayedCall(BADGE_HOLD_MS, () => {
              container.destroy();
            });
          },
        });
      },
    });
  }

  /** Clean up event listeners. */
  private destroy(): void {
    this.scene.events.off(GameEvents.THREAT_DESTROYED);
    this.scene.events.off(GameEvents.CITY_SAVED);
    this.scene.events.off(GameEvents.WRONG_TAP);
    this.scene.events.off(GameEvents.CRT_EFFECT_TOGGLED);
    this.scene.events.off(GameEvents.CHAIN_REACTION);
    if (this.scanlineGraphics) {
      this.scanlineGraphics.destroy();
    }
  }
}
