/**
 * IEntity — Structural contracts for all Phaser GameObjects in the game.
 *
 * These interfaces define the *shape* that gameplay, engine, and math agents
 * must conform to when implementing entities. They are the merge-time contract
 * that prevents incompatible APIs between agents working in parallel worktrees.
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import type { IMathProblem } from './IMathProblem';
import type { ThreatType } from './GameEvents';

// ── Threat Entities ──────────────────────────────────────────────────────────

/**
 * Base interface for all threat types (missiles, bombers, paratroopers, MIRVs).
 * Every threat has a unique ID, a type discriminator, and an optional math problem.
 */
export interface IThreat {
  /** Unique runtime ID for this threat instance. */
  readonly threatId: string;
  /** Discriminated union type. */
  readonly threatType: ThreatType;
  /** Math problem attached to this threat (null for paratroopers). */
  problem: IMathProblem | null;
  /** Whether this threat is still active (not destroyed or escaped). */
  isActive: boolean;
  /** Destroy this threat (triggers THREAT_DESTROYED event). */
  destroy(): void;
}

/** Standard descending missile — the primary threat. */
export interface IStandardMissile extends IThreat {
  readonly threatType: 'standard-missile';
  /** Current descent speed in pixels/second. */
  speed: number;
  /** Index of the city this missile is targeting (0–5). */
  targetCityIndex: number;
  /** Whether this missile was intercepted (vs. hitting a city). */
  wasIntercepted: boolean;
}

/** Missile dropped from a strategic bomber. */
export interface IBomberMissile extends IThreat {
  readonly threatType: 'bomber-missile';
  /** The bomber that spawned this missile. */
  parentBomberId: string;
  speed: number;
  targetCityIndex: number;
  wasIntercepted: boolean;
}

/** Multi-independently-targeted re-entry vehicle — splits at altitude. */
export interface IMIRVMissile extends IThreat {
  readonly threatType: 'mirv';
  speed: number;
  /** Screen-height percentage at which this MIRV splits. */
  splitAltitudePercent: number;
  /** Whether this MIRV has already split into children. */
  hasSplit: boolean;
}

/** Child warhead spawned when a MIRV splits. */
export interface IMIRVChild extends IThreat {
  readonly threatType: 'mirv-child';
  /** ID of the parent MIRV that spawned this child. */
  parentMirvId: string;
  speed: number;
  targetCityIndex: number;
  wasIntercepted: boolean;
}

/** Strategic bomber that traverses horizontally and drops payload missiles. */
export interface IStrategicBomber extends IThreat {
  readonly threatType: 'bomber';
  /** Horizontal traversal speed in pixels/second. */
  speed: number;
  /** Number of missiles still to be dropped (0 = payload exhausted). */
  dropsRemaining: number;
  /** Whether the bomber escaped off-screen without being destroyed. */
  escaped: boolean;
}

/** Paratrooper transport plane — drops paratroopers onto cities. */
export interface IParatrooperPlane extends IThreat {
  readonly threatType: 'paratrooper-transport';
  speed: number;
  /** Number of paratroopers still to be dropped. */
  dropsRemaining: number;
  escaped: boolean;
}

/** Individual paratrooper descending toward a city. */
export interface IParatrooper extends IThreat {
  readonly threatType: 'paratrooper';
  /** ID of the transport plane that dropped this paratrooper. */
  parentTransportId: string;
  /** Descent speed in pixels/second. */
  descentSpeed: number;
  /** Index of the city being targeted (0–5). */
  targetCityIndex: number;
  /** Whether this paratrooper landed successfully (vs. intercepted). */
  landed: boolean;
}

// ── Launcher Entity ──────────────────────────────────────────────────────────

/**
 * Player launcher — fires interceptors toward tapped threats.
 * One of three launchers: left, center, or right.
 */
export interface ILauncher {
  /** Launcher position on the HUD bar. */
  readonly position: 'left' | 'center' | 'right';
  /** Current answer loaded (shown on launcher face). */
  loadedAnswer: number | string | null;
  /** Whether the launcher is currently reloading. */
  isReloading: boolean;
  /** Fire an interceptor toward the given world-space target. */
  fire(targetX: number, targetY: number): void;
  /** Load a new answer onto this launcher face. */
  loadAnswer(answer: number | string): void;
}

// ── Answer Queue Entity ──────────────────────────────────────────────────────

/**
 * The scrolling answer queue (HUD element showing upcoming correct answers).
 * Provides the contract between the MathEngine's wave problem set and
 * the launcher loading system.
 */
export interface IAnswerQueue {
  /** Full ordered queue of correct answers for the current wave. */
  readonly queue: ReadonlyArray<number | string>;
  /** Index of the currently active (front-of-queue) answer. */
  readonly currentIndex: number;
  /** The answer currently at the front of the queue (loaded on launcher). */
  readonly currentAnswer: number | string | null;
  /** Advance the queue by one position. */
  advance(): void;
  /** Whether the queue is exhausted (all problems answered). */
  readonly isExhausted: boolean;
}

// ── Explosion Entity ──────────────────────────────────────────────────────────

/** Expanding starburst explosion spawned on interceptor detonation. */
export interface IExplosion {
  /** World-space X position of explosion centre. */
  readonly x: number;
  /** World-space Y position of explosion centre. */
  readonly y: number;
  /** Maximum blast radius in pixels. */
  readonly radius: number;
  /** Total animation duration in milliseconds. */
  readonly durationMs: number;
  /** The equation that was solved (shown in the explosion burst). */
  readonly solvedEquation: string | null;
  /** Whether this is a chain reaction explosion (smaller, no equation label). */
  readonly isChainReaction: boolean;
}

// ── City Entity ───────────────────────────────────────────────────────────────

/** A city that the player must protect. Six cities total (two clusters of three). */
export interface ICity {
  /** City index (0–5). 0–2 = left cluster, 3–5 = right cluster. */
  readonly cityIndex: number;
  /** Display name of this city. */
  readonly cityName: string;
  /** Which cluster this city belongs to. */
  readonly cluster: 'left' | 'right';
  /** Remaining hit points (0 = destroyed). */
  hitPoints: number;
  /** Whether this city is fully destroyed. */
  readonly isDestroyed: boolean;
  /** Apply damage to this city. */
  hit(): void;
  /** Rebuild this city (called between levels). */
  rebuild(): void;
}

// ── Trajectory Line Entity ─────────────────────────────────────────────────

/** Dotted trajectory trail showing a missile's descent path to its target city. */
export interface ITrajectoryLine {
  /** The threat this trajectory belongs to. */
  readonly threatId: string;
  /** Whether the trail is currently visible. */
  visible: boolean;
  /** Update the trail to follow the threat's current position. */
  update(currentX: number, currentY: number): void;
  /** Destroy the trail graphic. */
  destroy(): void;
}
