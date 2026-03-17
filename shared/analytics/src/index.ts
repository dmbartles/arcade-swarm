/**
 * @arcade-swarm/analytics — Public API.
 *
 * Local-only progress tracking and analytics for Arcade Swarm games.
 *
 * CRITICAL RULES (CLAUDE.md):
 * - NO external network calls. All data stays on device.
 * - NO personally identifiable information.
 * - NO mid-gameplay localStorage writes.
 * - Events are well-typed and versioned for future sync-layer compatibility.
 *
 * localStorage Policy:
 * - ALLOWED: high score persistence, user settings, accessibility preferences.
 * - NOT ALLOWED: mid-game state, PII, cross-session behavior tracking.
 */

/**
 * Versioned analytics event envelope.
 * The `version` field ensures a future sync layer can handle schema migrations.
 */
export interface IAnalyticsEvent<TPayload = unknown> {
  /** Event name identifier. */
  event: string;
  /** Schema version — increment when payload shape changes. */
  version: number;
  /** Event-specific payload. */
  payload: TPayload;
  /** Client-side timestamp (Date.now()). */
  timestamp: number;
}

/** High score entry (arcade-style: 3-letter initials). */
export interface IHighScoreEntry {
  /** 3-letter initials (e.g. "AAA"). */
  initials: string;
  /** Score value. */
  score: number;
  /** Level reached. */
  level: number;
  /** ISO date string when the score was recorded. */
  date: string;
}

/** User settings persisted in localStorage. */
export interface IUserSettings {
  /** Master volume (0–1). */
  masterVolume: number;
  /** SFX volume (0–1). */
  sfxVolume: number;
  /** Music volume (0–1). */
  musicVolume: number;
  /** Whether reduced motion is preferred (WCAG 2.2 AA 2.3.3). */
  reducedMotion: boolean;
  /** Whether high-contrast mode is active. */
  highContrast: boolean;
  /** Player's chosen difficulty preset. */
  difficulty: 'easy' | 'normal' | 'hard';
  /** Whether CRT scanline effect is enabled. */
  crtEnabled: boolean;
}

/** Default user settings. */
export const DEFAULT_USER_SETTINGS: IUserSettings = {
  masterVolume: 0.8,
  sfxVolume: 0.9,
  musicVolume: 0.5,
  reducedMotion: false,
  highContrast: false,
  difficulty: 'normal',
  crtEnabled: true,
};

/** localStorage key constants — centralised to prevent typos. */
export const STORAGE_KEYS = {
  HIGH_SCORES: 'arcade-swarm:mcm:high-scores',
  USER_SETTINGS: 'arcade-swarm:mcm:settings',
  LEVEL_STARS: 'arcade-swarm:mcm:level-stars',
} as const;
