/**
 * Game configuration constants — stub file for compilation.
 *
 * Coding Agent 1 will overwrite this with correct values.
 * These are placeholder values that satisfy type contracts.
 *
 * @see docs/gdds/missile-command-math.md §5, §7
 */

/** Base interval (ms) between threat spawns in a wave. */
export const WAVE_SPAWN_INTERVAL_BASE_MS = 3000;

/** Player explosion blast radius in pixels (GDD §5.3). */
export const EXPLOSION_RADIUS_PLAYER = 80;

/** Chain reaction blast radius in pixels (GDD §5.3). */
export const CHAIN_REACTION_RADIUS = 60;

/** MIRV split altitude as a percentage of screen height (GDD §5.2). */
export const MIRV_SPLIT_ALTITUDE_PERCENT = 40;

/** Hit points per city (GDD §7.3). */
export const CITY_HIT_POINTS = 3;
