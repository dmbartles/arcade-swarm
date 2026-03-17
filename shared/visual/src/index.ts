/**
 * @arcade-swarm/visual — Public API.
 *
 * Shared retro visual effects for Arcade Swarm games.
 * Includes: CRT scanlines, phosphor glow, screen shake, and flash effects.
 *
 * Zero game-engine dependencies — effects are applied via Phaser pipelines
 * and camera effects; this package exports configuration types and constants
 * that the engine agent's visual system consumes.
 */

/** CRT effect configuration. */
export interface ICRTConfig {
  /** Whether CRT scanline overlay is enabled (player-togglable). */
  enabled: boolean;
  /** Scanline opacity (0–1). Default: 0.15. */
  scanlineOpacity: number;
  /** Phosphor glow intensity (0–1). Default: 0.3. */
  glowIntensity: number;
  /** Vignette darkness at screen edges (0–1). Default: 0.4. */
  vignetteStrength: number;
}

/** Screen shake configuration. */
export interface IShakeConfig {
  /** Duration in milliseconds. */
  durationMs: number;
  /** Shake intensity in pixels. */
  intensity: number;
}

/** Default CRT configuration values. */
export const DEFAULT_CRT_CONFIG: ICRTConfig = {
  enabled: true,
  scanlineOpacity: 0.15,
  glowIntensity: 0.3,
  vignetteStrength: 0.4,
};

/** Screen shake presets for gameplay events. */
export const SHAKE_PRESETS = {
  /** City destroyed. */
  CITY_DESTROYED: { durationMs: 400, intensity: 8 },
  /** Explosion near launcher. */
  NEARBY_EXPLOSION: { durationMs: 200, intensity: 4 },
  /** Bomber drops payload. */
  BOMBER_DROP: { durationMs: 150, intensity: 3 },
} as const satisfies Record<string, IShakeConfig>;
