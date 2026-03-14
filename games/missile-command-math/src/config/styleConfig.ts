/**
 * styleConfig — All colour tokens, typography specs, and visual constants
 * from the style guide.
 *
 * All colour values are numeric hex (Phaser-compatible). Text style presets
 * are Phaser TextStyle partials using CSS hex strings for the `color` property.
 *
 * @see docs/style-guides/missile-command-math.md
 */

// ── Color Tokens ────────────────────────────────────────────────────────
export const COLOR_BG = 0x0a0a0f;
export const COLOR_BG_HUD = 0x0d0d1a;
export const COLOR_BG_QUEUE = 0x0d1a0d;
export const COLOR_BG_INTERSTITIAL = 0x000814;
export const COLOR_PRIMARY = 0xe8f4e8;
export const COLOR_MATH_TEXT = 0xffffff;
export const COLOR_QUEUE_LOADED = 0xffd700;
export const COLOR_QUEUE_MATCH = 0x7fffb2;
export const COLOR_QUEUE_SPENT = 0x3a3a3a;
export const COLOR_QUEUE_PENDING = 0xb0c4b0;
/** CSS hex string for queue loaded slot colour (used in Text styles). */
export const COLOR_QUEUE_LOADED_STR = '#FFD700';
/** CSS hex string for queue pending slot colour (used in Text styles). */
export const COLOR_QUEUE_PENDING_STR = '#B0C4B0';
/** CSS hex string for queue match highlight colour (used in Text styles). */
export const COLOR_QUEUE_MATCH_STR = '#7FFFB2';

export const COLOR_MISSILE_BODY = 0xcc2200;
export const COLOR_MISSILE_TRAIL = 0xff6633;
export const COLOR_DEFENDER = 0x00aaff;
export const COLOR_TRAJECTORY = 0xff4422;
export const COLOR_EXPLOSION_CORE = 0xffffff;
export const COLOR_EXPLOSION_MID = 0xffd700;
export const COLOR_EXPLOSION_OUTER = 0xc89bff;
export const COLOR_EXPLOSION_ALT = 0x98ffd0;
export const COLOR_CITY_ACTIVE = 0xffd700;
export const COLOR_CITY_DESTROYED = 0x2a2a2a;
export const COLOR_CITY_CELEBRATE = 0xfff0a0;
export const COLOR_LAUNCHER = 0x00ff88;
export const COLOR_LAUNCHER_LOCK = 0xff3300;
export const COLOR_LAUNCHER_STREAK = 0xff7700;
export const COLOR_BOMBER = 0xaabbcc;
export const COLOR_PARATROOPER = 0xffcc44;
export const COLOR_MIRV_CHILD = 0xff88aa;
export const COLOR_SCORE_POP = 0xffd700;
export const COLOR_BADGE_TEXT = 0x0a0a0f;
export const COLOR_BADGE_BG = 0xffd700;
export const COLOR_STAR_FULL = 0xffd700;
export const COLOR_STAR_EMPTY = 0x3a3a3a;
export const COLOR_WARNING_RED = 0xff2200;
export const COLOR_SCANLINE = 0x000000;
export const COLOR_TELETYPE = 0x00ff88;
export const COLOR_BUTTON_BG = 0x1a3a1a;
export const COLOR_BUTTON_TEXT = 0x00ff88;
export const COLOR_BUTTON_BORDER = 0x00ff88;

// ── Trajectory Line ──────────────────────────────────────────────────────
/** Trajectory line alpha (40% per style guide). */
export const TRAJECTORY_ALPHA = 0.4;
/** Trajectory line stroke width in px. */
export const TRAJECTORY_STROKE = 1;
/** Trajectory dashes: [on px, off px]. */
export const TRAJECTORY_DASH: [number, number] = [6, 4];

// ── CRT Scanline ─────────────────────────────────────────────────────────
/** CRT scanline alpha (8% per style guide). Off by default. */
export const SCANLINE_ALPHA = 0.08;
/** Scanline row spacing in px. */
export const SCANLINE_SPACING = 4;

// ── Font ─────────────────────────────────────────────────────────────────
export const FONT_FAMILY = '"Press Start 2P", monospace';

// ── Text Style Presets ───────────────────────────────────────────────────
// Each is a Phaser-compatible TextStyle partial.
export const TEXT_HUD_SCORE = { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#E8F4E8' };
export const TEXT_HUD_STARS = { fontFamily: FONT_FAMILY, fontSize: '12px', color: '#FFD700' };
export const TEXT_MISSILE_PROBLEM = { fontFamily: FONT_FAMILY, fontSize: '18px', color: '#FFFFFF' };
export const TEXT_QUEUE_NUMBER = { fontFamily: FONT_FAMILY, fontSize: '16px', color: '#B0C4B0' };
export const TEXT_QUEUE_LOADED = { fontFamily: FONT_FAMILY, fontSize: '18px', color: '#FFD700' };
export const TEXT_SCORE_POP = { fontFamily: FONT_FAMILY, fontSize: '16px', color: '#FFD700' };
export const TEXT_BADGE = { fontFamily: FONT_FAMILY, fontSize: '13px', color: '#0A0A0F' };
export const TEXT_CITY_ONELINER = { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#FFF0A0' };
export const TEXT_INTERSTITIAL_DATE = { fontFamily: FONT_FAMILY, fontSize: '11px', color: '#00FF88' };
export const TEXT_INTERSTITIAL_BODY = { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#E8F4E8' };
export const TEXT_MECHANIC_LABEL = { fontFamily: FONT_FAMILY, fontSize: '10px', color: '#FFD700' };
export const TEXT_BUTTON = { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#00FF88' };
export const TEXT_TITLE = { fontFamily: FONT_FAMILY, fontSize: '22px', color: '#00FF88' };
export const TEXT_MENU_ITEM = { fontFamily: FONT_FAMILY, fontSize: '13px', color: '#E8F4E8' };
export const TEXT_LEVEL_COMPLETE = { fontFamily: FONT_FAMILY, fontSize: '18px', color: '#FFD700' };
export const TEXT_GAME_OVER = { fontFamily: FONT_FAMILY, fontSize: '20px', color: '#FF2200' };
export const TEXT_TRAINING_GUIDE = { fontFamily: FONT_FAMILY, fontSize: '12px', color: '#7FFFB2' };
export const TEXT_STREAK_LABEL = { fontFamily: FONT_FAMILY, fontSize: '14px', color: '#0A0A0F' };
