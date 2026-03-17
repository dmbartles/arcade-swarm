/**
 * @arcade-swarm/audio — Public API.
 *
 * Shared retro audio effects and sound management.
 * Zero game-engine dependencies — consumed by Phaser scenes via the event bus.
 *
 * Sound events, IDs, and volume hierarchy are specified in:
 * docs/sound-guides/missile-command-math.md
 *
 * Build agents must not make audio decisions not specified in the sound guide.
 */

/** Volume hierarchy levels (0–1). Matches the sound guide's mixer model. */
export interface IVolumeHierarchy {
  /** Master volume (0–1). Persisted in localStorage. */
  master: number;
  /** Music bus volume (0–1). */
  music: number;
  /** SFX bus volume (0–1). */
  sfx: number;
  /** Voice/UI bus volume (0–1). */
  ui: number;
}

/** Stub — implementation owned by the engine agent. */
export const DEFAULT_VOLUME_HIERARCHY: IVolumeHierarchy = {
  master: 0.8,
  music: 0.5,
  sfx: 0.9,
  ui: 1.0,
};
