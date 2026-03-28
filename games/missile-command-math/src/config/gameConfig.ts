/**
 * gameConfig.ts — Core canvas, physics, and scene constants for Missile Command Math.
 *
 * All tunable values live here. No magic numbers in scene or entity files.
 * @see docs/gdds/missile-command-math.md
 * @see docs/style-guides/missile-command-math.md
 */

// ── Canvas ───────────────────────────────────────────────────────────────────
export const CANVAS_WIDTH  = 800;
export const CANVAS_HEIGHT = 640;

// ── Playfield (inside CRT bezel) ─────────────────────────────────────────────
export const PLAYFIELD_X      = 20;
export const PLAYFIELD_Y      = 20;
export const PLAYFIELD_WIDTH  = 760;
export const PLAYFIELD_HEIGHT = 480;

// ── Ground line ───────────────────────────────────────────────────────────────
/** Y position of the ground line inside the playfield. */
export const GROUND_LINE_Y = 476;

// ── CRT bezel ─────────────────────────────────────────────────────────────────
export const CRT_BEZEL_STROKE        = 14;
export const CRT_BEZEL_CORNER_RADIUS = 40;

// ── HUD bar ───────────────────────────────────────────────────────────────────
export const HUD_BAR_Y      = 600;
export const HUD_BAR_HEIGHT = 40;

// ── Launcher positions (center-x, bottom-y anchor) ───────────────────────────
export const LAUNCHER_LEFT_X   = 100;
export const LAUNCHER_CENTER_X = 400;
export const LAUNCHER_RIGHT_X  = 700;
/** Y position for all launcher center-bottom anchors. */
export const LAUNCHER_Y        = 460;

// ── Building clusters ─────────────────────────────────────────────────────────
export const LEFT_CLUSTER_X      = 30;
export const LEFT_CLUSTER_Y      = 340;
export const LEFT_CLUSTER_WIDTH  = 240;
export const LEFT_CLUSTER_HEIGHT = 140;
export const RIGHT_CLUSTER_X      = 510;
export const RIGHT_CLUSTER_Y      = 340;
export const RIGHT_CLUSTER_WIDTH  = 270;
export const RIGHT_CLUSTER_HEIGHT = 140;

// ── Pause / Sound toggle buttons ──────────────────────────────────────────────
export const PAUSE_BUTTON_X  = 760;
export const PAUSE_BUTTON_Y  = 560;
export const SOUND_BUTTON_X  = 720;
export const SOUND_BUTTON_Y  = 560;

// ── Bomb trajectory trail ─────────────────────────────────────────────────────
export const TRAIL_SPAWN_INTERVAL_MS = 120;
export const TRAIL_DOT_LIFETIME_MS   = 600;
export const TRAIL_MAX_DOTS_PER_BOMB = 8;

// ── Touch target minimum (WCAG 2.5.5) ────────────────────────────────────────
export const MIN_TOUCH_TARGET_PX = 60;

// ── Interceptor blast radius ──────────────────────────────────────────────────
/** Any bomb whose center is within this distance of the detonation point is hit. */
export const BLAST_RADIUS_PX = 60;

// ── Explosion ─────────────────────────────────────────────────────────────────
export const EXPLOSION_DURATION_MS      = 480;
export const EXPLOSION_EQUATION_FADE_MS = 400;
export const EXPLOSION_SCALE_END        = 1.4;

// ── Score pop ─────────────────────────────────────────────────────────────────
export const SCORE_POP_DURATION_MS   = 700;
export const SCORE_POP_RISE_PX       = 60;
export const SCORE_POP_FADE_START_MS = 400;

// ── Streak badge ──────────────────────────────────────────────────────────────
export const STREAK_BADGE_SLIDE_IN_MS  = 300;
export const STREAK_BADGE_HOLD_MS      = 900;
export const STREAK_BADGE_SLIDE_OUT_MS = 300;

// ── City rebuild ──────────────────────────────────────────────────────────────
export const CITY_REBUILD_DURATION_MS = 3000;

// ── Bomber traversal ──────────────────────────────────────────────────────────
/** Duration in ms for bomber to traverse the full canvas width at Normal difficulty. */
export const BOMBER_TRAVERSAL_MS = 4000;

// ── Level complete fireworks ──────────────────────────────────────────────────
export const FIREWORK_STAGGER_MS = 150;
export const FIREWORK_REPEATS    = 2;

// ── Launcher reload visual (nozzle punch-down tween) ─────────────────────────
export const LAUNCHER_NOZZLE_TWEEN_MS = 300;

// ── Speed bonus threshold ─────────────────────────────────────────────────────
/** Fraction of descent time remaining required to earn speed bonus. */
export const SPEED_BONUS_TIME_FRACTION = 0.5;

// ── Bomber alert gap before first drop ───────────────────────────────────────
export const BOMBER_ALERT_GAP_MS = 400;

// ── Color tokens (from style guide) ──────────────────────────────────────────
export const COLOR_BG             = 0xC8B8DC;
export const COLOR_PLAYFIELD      = 0xE8E0F0;
export const COLOR_CRT_BEZEL      = 0xC8952A;
export const COLOR_GROUND_LINE    = 0x4A8A9A;
export const COLOR_HUD_TEXT       = '#C8952A';
export const COLOR_HUD_BG         = 0xC8B8DC;
export const COLOR_EXPLOSION_OUTER = '#F0A000';
export const COLOR_WRONG_FLASH    = 0xE03030;
export const COLOR_CITY_CELEBRATE = 0xF0C030;
export const COLOR_LAUNCHER_NUMBER = '#C8A040';

// ── Population cosmetic formula ───────────────────────────────────────────────
/** Cosmetic residents-per-building multiplier for the population HUD counter. */
export const POPULATION_PER_BUILDING = 50_000;

// ── Total cities in game ──────────────────────────────────────────────────────
export const TOTAL_CITIES = 6;
