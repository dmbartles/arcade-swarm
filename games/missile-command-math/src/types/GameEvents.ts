/**
 * GameEvents — All Phaser event bus event name constants for Missile Command Math.
 *
 * Systems communicate exclusively through these events via the Phaser event bus.
 * No direct cross-system method calls are permitted.
 *
 * @see docs/gdds/missile-command-math.md §2 (Game Loop), §5 (Entity List), §6 (Scoring)
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
  /** Fired when an interceptor reaches its target and detonates. */
  INTERCEPTOR_DETONATED: 'interceptor-detonated',
  /** Fired when an explosion animation completes (cleanup trigger). */
  EXPLOSION_COMPLETE: 'explosion-complete',
  /** Fired when a MIRV splits into child warheads at the split altitude. */
  MIRV_SPLIT: 'mirv-split',
  /** Fired when a bomber drops its payload missiles. */
  BOMBER_PAYLOAD_DROPPED: 'bomber-payload-dropped',
  /** Fired when a paratrooper is caught in an explosion blast radius. */
  PARATROOPER_CAUGHT: 'paratrooper-caught',
  /** Fired when a paratrooper successfully lands on a city. */
  PARATROOPER_LANDED: 'paratrooper-landed',
  /** Fired when a paratrooper transport drops a paratrooper. */
  PARATROOPER_DROPPED: 'paratrooper-dropped',

  // ── City Events ─────────────────────────────────────────────────────────
  /** Fired when a city takes a hit (missile/paratrooper reaches it). */
  CITY_HIT: 'city-hit',
  /** Fired when a city is fully destroyed (all HP lost). */
  CITY_DESTROYED: 'city-destroyed',
  /** Fired when a city is saved (its targeting missile was intercepted). */
  CITY_SAVED: 'city-saved',
  /** Fired when a city is rebuilt between levels. */
  CITY_REBUILT: 'city-rebuilt',

  // ── Queue Events ────────────────────────────────────────────────────────
  /** Fired when the answer queue advances to the next loaded round. */
  QUEUE_ADVANCED: 'queue-advanced',
  /** Fired when a wrong-order tap is attempted (no match with loaded round). */
  WRONG_TAP: 'wrong-tap',

  // ── Score Events ────────────────────────────────────────────────────────
  /** Fired when the score changes. */
  SCORE_UPDATED: 'score-updated',
  /** Fired when a streak milestone is reached (3, 5, or 10). */
  STREAK_MILESTONE: 'streak-milestone',
  /** Fired when a chain reaction occurs (explosion catches nearby threats). */
  CHAIN_REACTION: 'chain-reaction',
  /** Fired when the live star rating projection changes during a wave. */
  STAR_RATING_UPDATED: 'star-rating-updated',
  /** Fired when a perfect wave is achieved (all 6 cities intact). */
  PERFECT_WAVE: 'perfect-wave',

  // ── Difficulty / Level Events ───────────────────────────────────────────
  /** Fired when difficulty configuration changes. */
  DIFFICULTY_CHANGED: 'difficulty-changed',
  /** Fired when a wave/level is complete (all threats resolved). */
  LEVEL_COMPLETE: 'level-complete',
  /** Fired when all cities are destroyed — game over. */
  GAME_OVER: 'game-over',
  /** Fired when the wave starts (after interstitial dismissed). */
  WAVE_STARTED: 'wave-started',

  /** Fired when all 20 levels are completed (session victory). */
  SESSION_VICTORY: 'session-victory',

  // ── Training Events ─────────────────────────────────────────────────────
  /** Fired when the training wave is completed successfully. */
  TRAINING_COMPLETE: 'training-complete',

  // ── UI / Scene Events ──────────────────────────────────────────────────
  /** Fired when the game is paused via the Pause button. */
  GAME_PAUSED: 'game-paused',
  /** Fired when the game is resumed from pause. */
  GAME_RESUMED: 'game-resumed',
  /** Fired when sound is toggled on/off. */
  SOUND_TOGGLED: 'sound-toggled',
  /** Fired when an interstitial card is dismissed ("TAP TO LAUNCH →"). */
  INTERSTITIAL_DISMISSED: 'interstitial-dismissed',
  /** Fired when the Queue Highlight Assist setting is toggled. */
  QUEUE_HIGHLIGHT_TOGGLED: 'queue-highlight-toggled',
  /** Fired when the CRT scanline visual effect is toggled. */
  CRT_EFFECT_TOGGLED: 'crt-effect-toggled',
} as const;

/** Union type of all game event string values. */
export type GameEvent = typeof GameEvents[keyof typeof GameEvents];

// ── Event Payload Types ─────────────────────────────────────────────────
// Typed payloads for event bus emissions. Using these ensures all listeners
// agree on the shape of data carried by each event.

import type { IMathProblem } from './IMathProblem';

/** Payload for PROBLEM_GENERATED — an entire wave's problem set. */
export interface ProblemGeneratedPayload {
  /** All problems for this wave, in order. */
  problems: IMathProblem[];
  /** Shuffled answer queue (correct answers in playable order). */
  answerQueue: Array<number | string>;
}

/** Payload for ANSWER_VALIDATED — result of a player tap. */
export interface AnswerValidatedPayload {
  /** The problem that was targeted. */
  problem: IMathProblem;
  /** Whether the tap matched the loaded answer round. */
  correct: boolean;
  /** The answer the player attempted. */
  attemptedAnswer: number | string;
}

/** Threat type discriminator for spawn/destroy events. */
export type ThreatType =
  | 'standard-missile'
  | 'bomber'
  | 'bomber-missile'
  | 'paratrooper-transport'
  | 'paratrooper'
  | 'mirv'
  | 'mirv-child';

/** Payload for THREAT_SPAWNED. */
export interface ThreatSpawnedPayload {
  /** Unique ID for this threat instance. */
  threatId: string;
  /** Discriminated threat type. */
  threatType: ThreatType;
  /** The math problem attached to this threat (null for paratroopers). */
  problem: IMathProblem | null;
  /** Index of the targeted city (0–5), if applicable. */
  targetCityIndex?: number;
}

/** Payload for THREAT_DESTROYED. */
export interface ThreatDestroyedPayload {
  /** Unique ID of the destroyed threat. */
  threatId: string;
  /** Discriminated threat type. */
  threatType: ThreatType;
  /** Points awarded for this destruction. */
  points: number;
  /** Whether this was destroyed by chain reaction (vs. direct hit). */
  chainReaction: boolean;
}

/** Payload for CITY_HIT. */
export interface CityHitPayload {
  /** Index of the city that was hit (0–5). */
  cityIndex: number;
  /** Remaining hit points for this city after the hit. */
  remainingHp: number;
}

/** Payload for CITY_DESTROYED. */
export interface CityDestroyedPayload {
  /** Index of the destroyed city (0–5). */
  cityIndex: number;
  /** Name of the destroyed city. */
  cityName: string;
}

/** Payload for CITY_SAVED. */
export interface CitySavedPayload {
  /** Index of the saved city (0–5). */
  cityIndex: number;
  /** Name of the saved city. */
  cityName: string;
}

/** Payload for CHAIN_REACTION. */
export interface ChainReactionPayload {
  /** Number of links in this chain (1 = first chain hit, 2 = second, etc.). */
  chainLength: number;
  /** Bonus points from this chain link (+20 per link after first, GDD §6). */
  bonusPoints: number;
}

/** Payload for STAR_RATING_UPDATED. */
export interface StarRatingUpdatedPayload {
  /** Projected star count (1–3). */
  stars: number;
}

/** Payload for LEVEL_COMPLETE. */
export interface LevelCompletePayload {
  /** The level that was completed (1–20). */
  level: number;
  /** Final star rating (1–3). */
  stars: number;
  /** Cities surviving at end of wave (0–6). */
  citiesSurviving: number;
  /** Final score for this wave. */
  score: number;
  /** Accuracy ratio (0–1). */
  accuracy: number;
  /** Total chain reactions triggered. */
  chainReactions: number;
  /** Whether this was a perfect wave (all cities intact). */
  perfectWave: boolean;
}

/** Payload for GAME_OVER. */
export interface GameOverPayload {
  /** The level on which the game ended. */
  level: number;
  /** Final score at time of game over. */
  finalScore: number;
}

/** Payload for WAVE_STARTED. */
export interface WaveStartedPayload {
  /** The level number for this wave (0–20). */
  level: number;
  /** Total threats in this wave. */
  totalThreats: number;
}

/** Payload for MIRV_SPLIT. */
export interface MirvSplitPayload {
  /** ID of the parent MIRV that split. */
  parentThreatId: string;
  /** IDs of the newly spawned child warheads. */
  childThreatIds: string[];
}

/** Payload for BOMBER_PAYLOAD_DROPPED. */
export interface BomberPayloadDroppedPayload {
  /** ID of the bomber that dropped payload. */
  bomberThreatId: string;
  /** IDs of the dropped missile threats. */
  droppedMissileIds: string[];
}

/** Payload for PARATROOPER_DROPPED. */
export interface ParatrooperDroppedPayload {
  /** ID of the transport plane that dropped the paratrooper. */
  transportId: string;
  /** ID of the newly spawned paratrooper. */
  paratrooperId: string;
  /** Index of the targeted city (0–5). */
  targetCityIndex: number;
}

/** Payload for PARATROOPER_LANDED. */
export interface ParatrooperLandedPayload {
  /** ID of the paratrooper that landed. */
  paratrooperId: string;
  /** Index of the city the paratrooper landed on (0–5). */
  cityIndex: number;
}

/** Payload for CITY_REBUILT. */
export interface CityRebuiltPayload {
  /** Index of the rebuilt city (0–5). */
  cityIndex: number;
  /** Name of the rebuilt city. */
  cityName: string;
}
