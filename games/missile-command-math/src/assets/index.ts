/**
 * Asset barrel export for Missile Command Math.
 *
 * Build agents: import from here, never from SpriteFactory directly.
 *
 * Usage:
 *   import { SpriteFactory, SPRITE_KEYS, ANIM_KEYS } from '../assets';
 *
 *   // In preload():
 *   SpriteFactory.preload(this);
 *
 *   // In create():
 *   SpriteFactory.registerAnimations(this);
 *
 *   // Referencing sprites and animations — always use the consts, never raw strings:
 *   this.add.image(x, y, SPRITE_KEYS.BOMB_ORANGE);
 *   sprite.play(ANIM_KEYS.EXPLOSION_BURST);
 */
export { SpriteFactory } from './SpriteFactory';
export {
  SPRITE_KEYS,
  ANIM_KEYS,
} from './SpriteFactory';
export type { SpriteKey, AnimKey } from './SpriteFactory';
