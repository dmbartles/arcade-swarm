/**
 * gameConfig — All tunable gameplay constants derived from the GDD.
 *
 * Every other agent imports from here. No magic numbers in scene or entity files.
 *
 * @see docs/gdds/missile-command-math.md
 * @see docs/style-guides/missile-command-math.md §UI Layout
 */

/** Canvas dimensions (portrait primary). */
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 854;
export const SAFE_MARGIN = 12;

// ── HUD Dimensions ───────────────────────────────────────────────────────
export const HUD_HEIGHT = 48;
/** Y where the play field starts (below HUD bar). */
export const PLAY_FIELD_TOP = 48;
/** Y where the city row bottom ends. */
export const PLAY_FIELD_BOTTOM = 708;
/** Y origin of the answer queue strip. */
export const QUEUE_STRIP_Y = 782;
/** Height of the answer queue strip. */
export const QUEUE_STRIP_HEIGHT = 72;

// ── Launcher Position ────────────────────────────────────────────────────
/** Center-bottom anchor X for the launcher. */
export const LAUNCHER_X = 240;
/** Y position for the launcher. */
export const LAUNCHER_Y = 730;

// ── City Layout — Single Row at Ground Level ────────────────────────────
/** Y position for all cities (ground level, flush with play field bottom). */
export const CITY_ROW_Y = 708;
/** X positions for 6 cities: 3 left of launcher, 3 right. */
export const CITY_X_POSITIONS = [40, 120, 200, 280, 360, 440] as const;

// ── Queue Slot Layout ────────────────────────────────────────────────────
/** X center of the loaded (first) queue slot. */
export const QUEUE_SLOT_0_X = 30;
/** Pixels between slot centers. */
export const QUEUE_SLOT_SPACING = 76;
/** Y center of all queue slots. */
export const QUEUE_SLOT_Y = 787;
/** Width & height of each queue slot (WCAG 2.5.8 touch target). */
export const QUEUE_SLOT_SIZE = 60;

// ── Touch Target Sizes ──────────────────────────────────────────────────
/** Minimum touch target size in pixels per WCAG 2.5.8. */
export const MIN_TOUCH_TARGET = 60;

// ── Explosion Radii (px) ─────────────────────────────────────────────────
/** Player explosion blast radius. */
export const EXPLOSION_RADIUS_PLAYER = 80;
/** Chain reaction explosion radius. */
export const EXPLOSION_RADIUS_CHAIN = 60;
/** City-hit explosion radius. */
export const EXPLOSION_RADIUS_CITY = 64;

// ── Chain Reaction ───────────────────────────────────────────────────────
/** Radius within which chain reactions propagate. */
export const CHAIN_REACTION_RADIUS = 60;

// ── MIRV ─────────────────────────────────────────────────────────────────
/** Percentage of play field height at which MIRVs split. */
export const MIRV_SPLIT_ALTITUDE_PERCENT = 40;

// ── City ─────────────────────────────────────────────────────────────────
/** Default hit points per city. */
export const CITY_HIT_POINTS = 3;

// ── Missile Speed ────────────────────────────────────────────────────────
/** Base missile descent speed in px/s (before multipliers). */
export const BASE_MISSILE_SPEED = 35;
/** Interceptor (defender) missile speed in px/s. */
export const INTERCEPTOR_SPEED = 600;

// ── Wave Timing ──────────────────────────────────────────────────────────
/** Milliseconds between spawns at Level 1 Normal difficulty. */
export const WAVE_SPAWN_INTERVAL_BASE_MS = 3000;

// ── Score Pop ────────────────────────────────────────────────────────────
/** Pixels the score pop-up floats upward. */
export const SCORE_POP_RISE_PX = 60;
/** Duration in ms of the score pop-up animation. */
export const SCORE_POP_DURATION_MS = 800;

// ── Queue Animation ──────────────────────────────────────────────────────
/** Duration in ms for queue advance slide animation. */
export const QUEUE_ADVANCE_DURATION_MS = 120;

// ── Training ─────────────────────────────────────────────────────────────
/** Speed multiplier for the training missile (very slow). */
export const TRAINING_MISSILE_SPEED_MULTIPLIER = 0.3;

// ── Badge Display ────────────────────────────────────────────────────────
/** Milliseconds the badge holds on screen. */
export const BADGE_HOLD_MS = 400;
/** Milliseconds for badge intro scale animation. */
export const BADGE_INTRO_MS = 300;

// ── City One-Liner ───────────────────────────────────────────────────────
/** Duration in ms before city one-liner fades. */
export const CITY_ONELINER_DURATION_MS = 2000;

// ── Teletype ─────────────────────────────────────────────────────────────
/** Milliseconds between each character reveal in teletype effect. */
export const TELETYPE_CHAR_DELAY_MS = 40;
/** Cursor blink interval in ms. */
export const TELETYPE_CURSOR_BLINK_MS = 500;

// ── Interstitial Button ──────────────────────────────────────────────────
/** X position of the TAP TO LAUNCH button. */
export const TAP_TO_LAUNCH_BUTTON_X = 90;
/** Y position of the TAP TO LAUNCH button. */
export const TAP_TO_LAUNCH_BUTTON_Y = 720;
/** Width of the TAP TO LAUNCH button. */
export const TAP_TO_LAUNCH_BUTTON_W = 300;
/** Height of the TAP TO LAUNCH button. */
export const TAP_TO_LAUNCH_BUTTON_H = 60;

// ── Phaser Game Config ───────────────────────────────────────────────────
/** Target frames per second. */
export const TARGET_FPS = 60;

// ── City Names ───────────────────────────────────────────────────────────
/** City names ordered by index 0–5. Top row: 0,1,2 — Bottom row: 3,4,5. */
export const CITY_NAMES = [
  'NEW YORK',
  'CHICAGO',
  'LOS ANGELES',
  'HOUSTON',
  'WASHINGTON DC',
  'SEATTLE',
] as const;

/** Total number of cities. */
export const TOTAL_CITIES = 6;
