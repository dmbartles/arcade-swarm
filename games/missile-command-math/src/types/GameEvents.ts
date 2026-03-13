/**
 * GameEvents — All Phaser event bus event name constants for Missile Command Math.
 *
 * Systems communicate exclusively through these events via the Phaser event bus.
 * No direct cross-system method calls are permitted.
 */

export const GameEvents = {
  // ── Math Engine Events ──────────────────────────────────────────────────
  /** Fired when a new math problem set is generated for a wave. */
  PROBLEM_GENERATED: 'problem-generated',
  /** Fired when a player's answer tap is validated (correct or incorrect). */
  ANSWER_VALIDATED: 'answer-validated',

  // ── Missile / Threat Events ─────────────────────────────────────────────
  /** Fired when a new threat (missile, bomber, MIRV, paratrooper) spawns. */
  THREAT_SPAWNED: 'threat-spawned',
  /** Fired when a threat is destroyed by interception or chain reaction. */
  THREAT_DESTROYED: 'threat-destroyed',
  /** Fired when an interceptor missile is launched from the player launcher. */
  INTERCEPTOR_FIRED: 'interceptor-fired',
  /** Fired when an interceptor reaches its target and explodes. */
  INTERCEPTOR_DETONATED: 'interceptor-detonated',
  /** Fired when a MIRV splits into child warheads. */
  MIRV_SPLIT: 'mirv-split',
  /** Fired when a bomber drops its payload missiles. */
  BOMBER_PAYLOAD_DROPPED: 'bomber-payload-dropped',

  // ── City Events ─────────────────────────────────────────────────────────
  /** Fired when a city takes a hit (missile/paratrooper reaches it). */
  CITY_HIT: 'city-hit',
  /** Fired when a city is fully destroyed (all HP lost). */
  CITY_DESTROYED: 'city-destroyed',
  /** Fired when a city is saved (its targeting missile was intercepted). */
  CITY_SAVED: 'city-saved',

  // ── Queue Events ────────────────────────────────────────────────────────
  /** Fired when the answer queue advances to the next loaded round. */
  QUEUE_ADVANCED: 'queue-advanced',
  /** Fired when a wrong-order tap is attempted (no match). */
  WRONG_TAP: 'wrong-tap',

  // ── Score Events ────────────────────────────────────────────────────────
  /** Fired when the score changes. */
  SCORE_UPDATED: 'score-updated',
  /** Fired when a streak milestone is reached (3, 5, or 10). */
  STREAK_MILESTONE: 'streak-milestone',
  /** Fired when a chain reaction occurs. */
  CHAIN_REACTION: 'chain-reaction',

  // ── Difficulty / Level Events ───────────────────────────────────────────
  /** Fired when difficulty configuration changes. */
  DIFFICULTY_CHANGED: 'difficulty-changed',
  /** Fired when a wave/level is complete (all threats resolved). */
  LEVEL_COMPLETE: 'level-complete',
  /** Fired when all cities are destroyed — game over. */
  GAME_OVER: 'game-over',
  /** Fired when the wave starts (after interstitial dismissed). */
  WAVE_STARTED: 'wave-started',

  // ── UI / Scene Events ──────────────────────────────────────────────────
  /** Fired when the game is paused. */
  GAME_PAUSED: 'game-paused',
  /** Fired when the game is resumed from pause. */
  GAME_RESUMED: 'game-resumed',
  /** Fired when sound is toggled on/off. */
  SOUND_TOGGLED: 'sound-toggled',
} as const;

/** Union type of all game event string values. */
export type GameEvent = typeof GameEvents[keyof typeof GameEvents];
