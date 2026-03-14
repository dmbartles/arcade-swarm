/**
 * Explosion — Visual explosion effect with chain reaction detection.
 *
 * Represents a single explosion at a world position. Checks for chain reactions
 * by finding active threats within the chain radius.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 * @see docs/style-guides/missile-command-math.md §Visual Effects
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import {
  EXPLOSION_RADIUS_PLAYER,
  CHAIN_REACTION_RADIUS,
} from '../config/gameConfig';
import {
  COLOR_EXPLOSION_CORE,
  COLOR_EXPLOSION_MID,
  COLOR_EXPLOSION_OUTER,
  COLOR_EXPLOSION_ALT,
  COLOR_WARNING_RED,
} from '../config/styleConfig';
import type { StandardMissile } from './StandardMissile';
import type { Paratrooper } from './Paratrooper';

/** Duration in ms per explosion type. */
const EXPLOSION_DURATIONS: Record<string, number> = {
  player: 640,
  chain: 560,
  city: 600,
};

export class Explosion extends Phaser.GameObjects.Container {
  /** World position of this explosion center. */
  readonly cx: number;
  readonly cy: number;
  /** Blast radius in px — used for chain reaction detection. */
  radius: number;
  /** Chain radius in px. */
  chainRadius: number;
  /** Duration in ms before emitting EXPLOSION_COMPLETE. */
  durationMs: number;
  /** Type determines which animation sprite to play. */
  type: 'player' | 'chain' | 'city';

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: 'player' | 'chain' | 'city',
    radius?: number,
    chainRadius?: number,
  ) {
    super(scene, x, y);

    this.cx = x;
    this.cy = y;
    this.type = type;
    this.radius = radius ?? EXPLOSION_RADIUS_PLAYER;
    this.chainRadius = chainRadius ?? CHAIN_REACTION_RADIUS;
    this.durationMs = EXPLOSION_DURATIONS[type] ?? 640;

    this.setDepth(20);
    scene.add.existing(this);

    // Create explosion visual (animated circles for now)
    this.playAnimation();
  }

  /** Play the explosion animation using circles and tweens. */
  private playAnimation(): void {
    const colorMap: Record<string, { core: number; mid: number; outer: number }> = {
      player: {
        core: COLOR_EXPLOSION_CORE,
        mid: COLOR_EXPLOSION_MID,
        outer: COLOR_EXPLOSION_OUTER,
      },
      chain: {
        core: COLOR_EXPLOSION_CORE,
        mid: COLOR_EXPLOSION_MID,
        outer: COLOR_EXPLOSION_ALT,
      },
      city: {
        core: COLOR_WARNING_RED,
        mid: COLOR_WARNING_RED,
        outer: COLOR_WARNING_RED,
      },
    };

    const colors = colorMap[this.type] ?? colorMap.player;
    const maxRadius = this.type === 'player' ? 96 : this.type === 'chain' ? 80 : 64;

    // Outer ring
    const outer = this.scene.add.circle(0, 0, 4, colors.outer, 0.8);
    this.add(outer);

    // Mid ring
    const mid = this.scene.add.circle(0, 0, 4, colors.mid, 0.9);
    this.add(mid);

    // Core
    const core = this.scene.add.circle(0, 0, 4, colors.core, 1.0);
    this.add(core);

    // Animate outward expansion
    this.scene.tweens.add({
      targets: outer,
      radius: maxRadius,
      alpha: 0,
      duration: this.durationMs,
      ease: 'Linear',
    });

    this.scene.tweens.add({
      targets: mid,
      radius: maxRadius * 0.5,
      alpha: 0,
      duration: this.durationMs * 0.8,
      ease: 'Linear',
    });

    this.scene.tweens.add({
      targets: core,
      radius: maxRadius * 0.16,
      alpha: 0,
      duration: this.durationMs * 0.6,
      ease: 'Linear',
      onComplete: () => {
        this.onAnimationComplete();
      },
    });
  }

  /**
   * Check for chain reaction: find all active threats within chainRadius.
   * For each found: call intercept()/neutralise() on missiles/paratroopers.
   * Returns array of threat IDs caught in chain.
   */
  checkChainReaction(
    activeMissiles: StandardMissile[],
    activeParatroopers: Paratrooper[],
  ): string[] {
    const caughtIds: string[] = [];
    const radiusSq = this.chainRadius * this.chainRadius;

    // Check missiles
    for (const missile of activeMissiles) {
      if (missile.destroyed) continue;
      const pos = missile.getPosition();
      const dx = pos.x - this.cx;
      const dy = pos.y - this.cy;
      const distSq = dx * dx + dy * dy;

      if (distSq <= radiusSq) {
        caughtIds.push(missile.threatId);
        missile.intercept(true, 0); // Points will be awarded by WaveManager
      }
    }

    // Check paratroopers
    for (const para of activeParatroopers) {
      if (para.destroyed) continue;
      const pos = para.getPosition();
      const dx = pos.x - this.cx;
      const dy = pos.y - this.cy;
      const distSq = dx * dx + dy * dy;

      if (distSq <= radiusSq) {
        caughtIds.push(para.threatId);
        para.neutralise();
      }
    }

    return caughtIds;
  }

  /** Emit EXPLOSION_COMPLETE when animation finishes. */
  private onAnimationComplete(): void {
    this.scene.events.emit(GameEvents.EXPLOSION_COMPLETE, {
      x: this.cx,
      y: this.cy,
      type: this.type,
    });
    this.destroy();
  }
}
