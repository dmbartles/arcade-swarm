/**
 * Style configuration constants — stub file.
 * Coding Agent 1 will overwrite this with correct values.
 * These placeholders allow entities to compile.
 */

// ── Color tokens ──────────────────────────────────────────────────────────
export const COLOR_BG = 0x0A0A0F;
export const COLOR_BG_HUD = 0x0D0D1A;
export const COLOR_BG_QUEUE = 0x0D1A0D;
export const COLOR_BG_INTERSTITIAL = 0x000814;
export const COLOR_PRIMARY = 0xE8F4E8;
export const COLOR_MATH_TEXT = 0xFFFFFF;
export const COLOR_QUEUE_LOADED = 0xFFD700;
export const COLOR_QUEUE_MATCH = 0x7FFFB2;
export const COLOR_QUEUE_SPENT = 0x3A3A3A;
export const COLOR_QUEUE_PENDING = 0xB0C4B0;
export const COLOR_MISSILE_BODY = 0xCC2200;
export const COLOR_MISSILE_TRAIL = 0xFF6633;
export const COLOR_DEFENDER = 0x00AAFF;
export const COLOR_TRAJECTORY = 0xFF4422;
export const TRAJECTORY_ALPHA = 0.4;
export const COLOR_EXPLOSION_CORE = 0xFFFFFF;
export const COLOR_EXPLOSION_MID = 0xFFD700;
export const COLOR_EXPLOSION_OUTER = 0xC89BFF;
export const COLOR_EXPLOSION_ALT = 0x98FFD0;
export const COLOR_CITY_ACTIVE = 0xFFD700;
export const COLOR_CITY_DESTROYED = 0x2A2A2A;
export const COLOR_CITY_CELEBRATE = 0xFFF0A0;
export const COLOR_LAUNCHER = 0x00FF88;
export const COLOR_LAUNCHER_LOCK = 0xFF3300;
export const COLOR_LAUNCHER_STREAK = 0xFF7700;
export const COLOR_BOMBER = 0xAABBCC;
export const COLOR_PARATROOPER = 0xFFCC44;
export const COLOR_MIRV_CHILD = 0xFF88AA;
export const COLOR_SCORE_POP = 0xFFD700;
export const COLOR_BADGE_TEXT = 0x0A0A0F;
export const COLOR_BADGE_BG = 0xFFD700;
export const COLOR_STAR_FULL = 0xFFD700;
export const COLOR_STAR_EMPTY = 0x3A3A3A;
export const COLOR_WARNING_RED = 0xFF2200;

// ── Color tokens as CSS strings (for Phaser text) ─────────────────────────
export const COLOR_MATH_TEXT_STR = '#FFFFFF';
export const COLOR_QUEUE_LOADED_STR = '#FFD700';
export const COLOR_QUEUE_MATCH_STR = '#7FFFB2';
export const COLOR_QUEUE_SPENT_STR = '#3A3A3A';
export const COLOR_QUEUE_PENDING_STR = '#B0C4B0';
export const COLOR_SCORE_POP_STR = '#FFD700';
export const COLOR_WARNING_RED_STR = '#FF2200';
export const COLOR_LAUNCHER_STR = '#00FF88';

// ── Text style presets ────────────────────────────────────────────────────
const FONT_FAMILY = '"Press Start 2P", monospace';

export const TEXT_MISSILE_PROBLEM: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: FONT_FAMILY,
  fontSize: '18px',
  color: '#FFFFFF',
  align: 'center',
};

export const TEXT_QUEUE_NUMBER: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: FONT_FAMILY,
  fontSize: '16px',
  color: '#B0C4B0',
  align: 'center',
};

export const TEXT_QUEUE_LOADED: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: FONT_FAMILY,
  fontSize: '18px',
  color: '#FFD700',
  align: 'center',
};

export const TEXT_SCORE_POP: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: FONT_FAMILY,
  fontSize: '16px',
  color: '#FFD700',
  align: 'center',
};
