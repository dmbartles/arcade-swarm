/**
 * audioConfig.ts — Sound event IDs, music track IDs, and volume hierarchy.
 *
 * These are the exact event IDs used with Tone.js triggers.
 * AudioManager (Gameplay agent) imports from here.
 * All values match docs/sound-guides/missile-command-math.md exactly.
 *
 * @see docs/sound-guides/missile-command-math.md
 */

/** All sound effect and UI event IDs. */
export const SOUND_EVENTS = {
  BOMB_INTERCEPT_LAUNCH:  'BOMB_INTERCEPT_LAUNCH',
  BOMB_INTERCEPT_HIT:     'BOMB_INTERCEPT_HIT',
  BOMB_WRONG_TAP:         'BOMB_WRONG_TAP',
  LAUNCHER_RELOAD:        'LAUNCHER_RELOAD',
  BOMB_REACHES_BUILDING:  'BOMB_REACHES_BUILDING',
  BUILDING_DESTROYED:     'BUILDING_DESTROYED',
  CITY_SAVE_CHIME:        'CITY_SAVE_CHIME',
  STREAK_3:               'STREAK_3',
  STREAK_5:               'STREAK_5',
  STREAK_10:              'STREAK_10',
  STREAK_RESET:           'STREAK_RESET',
  BOMBER_ALERT:           'BOMBER_ALERT',
  BOMBER_INTERCEPT:       'BOMBER_INTERCEPT',
  BOMBER_ESCAPED:         'BOMBER_ESCAPED',
  BOMB_DROP_FROM_BOMBER:  'BOMB_DROP_FROM_BOMBER',
  SCORE_POP_TICK:         'SCORE_POP_TICK',
  LEVEL_COMPLETE_FANFARE: 'LEVEL_COMPLETE_FANFARE',
  STAR_REVEAL:            'STAR_REVEAL',
  FIREWORK_POP:           'FIREWORK_POP',
  WAVE_START:             'WAVE_START',
  LEVEL_READY_BEEP:       'LEVEL_READY_BEEP',
  BRIEFING_ENTER:         'BRIEFING_ENTER',
  BRIEFING_DISMISS:       'BRIEFING_DISMISS',
  TRAINING_SUCCESS:       'TRAINING_SUCCESS',
  TRAINING_MISS:          'TRAINING_MISS',
  CITY_REBUILD_TICK:      'CITY_REBUILD_TICK',
  GAME_OVER_STING:        'GAME_OVER_STING',
  VICTORY_FANFARE:        'VICTORY_FANFARE',
  MENU_BUTTON_CLICK:      'MENU_BUTTON_CLICK',
  PAUSE_IN:               'PAUSE_IN',
  PAUSE_OUT:              'PAUSE_OUT',
  SOUND_TOGGLE:           'SOUND_TOGGLE',
} as const;

/** Music track IDs used with AudioManager's music player. */
export const MUSIC_TRACKS = {
  MENU:           'MUSIC_MENU',
  GAMEPLAY_EARLY: 'MUSIC_GAMEPLAY_EARLY',
  GAMEPLAY_MID:   'MUSIC_GAMEPLAY_MID',
  GAMEPLAY_LATE:  'MUSIC_GAMEPLAY_LATE',
  BRIEFING:       'MUSIC_BRIEFING',
  LEVEL_COMPLETE: 'MUSIC_LEVEL_COMPLETE',
  GAME_OVER:      'MUSIC_GAME_OVER',
  VICTORY:        'MUSIC_VICTORY',
} as const;

/** Default volume levels for each audio channel (0–1). */
export const VOLUME_HIERARCHY = {
  master: 1.0,
  music:  0.45,
  sfx:    0.8,
  ui:     0.6,
} as const;

/** Duration (ms) for music crossfade between tracks. */
export const MUSIC_CROSSFADE_MS    = 600;

/** Music volume during critical SFX ducking. */
export const MUSIC_DUCK_VOLUME     = 0.2;

/** Time (ms) to fade music down to duck volume. */
export const MUSIC_DUCK_DOWN_MS    = 80;

/** Time (ms) to restore music from duck volume. */
export const MUSIC_DUCK_RESTORE_MS = 400;

/** localStorage key for the sound enabled/disabled state. */
export const SOUND_ENABLED_KEY = 'mcm_sound_enabled';
