/**
 * IEntity — Contracts for all game entities in Missile Command Math.
 *
 * These interfaces define the public API surface for each entity type.
 * Entities are `Phaser.GameObjects.Container` subclasses (implemented by coding-2)
 * and are consumed by systems and scenes (implemented by coding-1 and coding-3).
 *
 * @see docs/gdds/missile-command-math.md §5 (Entity List)
 */

import type { IMathProblem } from './IMathProblem';

// ── Base Threat ───────────────────────────────────────────────────────────

/** Common properties shared by all threat entities. */
export interface IThreat {
  /** Unique runtime ID for this threat instance. */
  readonly threatId: string;
  /** The math problem displayed on this threat (null for paratroopers). */
  readonly problem: IMathProblem | null;
  /** Index of the targeted city (0–5). */
  readonly targetCityIndex: number;
  /** Whether this threat has been destroyed. */
  readonly destroyed: boolean;
  /** Destroy the threat (trigger explosion and cleanup). */
  destroy(): void;
}

// ── Missiles ──────────────────────────────────────────────────────────────

/** Standard descending missile carrying a math problem. */
export interface IStandardMissile extends IThreat {
  /** Current descent speed in pixels per second. */
  readonly speed: number;
  /** Whether the trajectory line to the target city is visible. */
  trajectoryLineVisible: boolean;
}

/** Missile dropped by a strategic bomber. */
export interface IBomberMissile extends IStandardMissile {
  /** Reference ID of the parent bomber that dropped this missile. */
  readonly parentBomberId: string;
}

/** MIRV warhead that splits into children at a set altitude. */
export interface IMIRVMissile extends IStandardMissile {
  /** Altitude percentage (0–1) at which this MIRV splits. */
  readonly splitAltitudePercent: number;
  /** Number of child warheads spawned on split. */
  readonly childCount: number;
  /** Whether this MIRV has already split. */
  readonly hasSplit: boolean;
}

/** Child warhead spawned by a MIRV split. */
export interface IMIRVChild extends IStandardMissile {
  /** Reference ID of the parent MIRV. */
  readonly parentMirvId: string;
}

// ── Bomber ────────────────────────────────────────────────────────────────

/** Strategic bomber that flies horizontally and drops payload missiles. */
export interface IStrategicBomber extends IThreat {
  /** Bonus problem attached to the bomber itself. */
  readonly bonusProblem: IMathProblem;
  /** Number of payload missiles to drop. */
  readonly payloadCount: number;
  /** Horizontal flight speed in pixels per second. */
  readonly speed: number;
  /** Direction of horizontal flight: 1 = right, -1 = left. */
  readonly horizontalDir: 1 | -1;
  /** Whether the bomber has already dropped its payload. */
  readonly payloadDropped: boolean;
}

// ── Paratrooper ───────────────────────────────────────────────────────────

/** Transport plane that drops paratroopers. */
export interface IParatrooperPlane {
  /** Unique runtime ID. */
  readonly planeId: string;
  /** Horizontal flight speed in pixels per second. */
  readonly speed: number;
  /** Number of paratroopers to drop. */
  readonly dropCount: number;
  /** Direction of horizontal flight: 1 = right, -1 = left. */
  readonly horizontalDir: 1 | -1;
}

/** Paratrooper descending toward a city; neutralised only by blast radius. */
export interface IParatrooper {
  /** Unique runtime ID. */
  readonly paratrooperId: string;
  /** Descent speed in pixels per second. */
  readonly descentSpeed: number;
  /** Index of the targeted city (0–5). */
  readonly targetCityIndex: number;
  /** Whether this paratrooper has been neutralised by an explosion. */
  readonly neutralised: boolean;
  /** Whether this paratrooper has landed on its target city. */
  readonly landed: boolean;
}

// ── Launcher & Answer Queue ───────────────────────────────────────────────

/** The player's bottom-center launcher loaded with an answer queue. */
export interface ILauncher {
  /** The answer currently loaded and ready to fire. */
  readonly loadedAnswer: number | string | null;
  /** Whether the launcher is locked (cooldown after firing or wrong tap). */
  readonly locked: boolean;
  /** Lock duration in milliseconds after a wrong tap. */
  readonly lockDurationMs: number;
  /** Fire at a specific threat. Returns true if the answer matched. */
  fireAt(threatId: string): boolean;
}

/** Visual answer queue strip showing upcoming rounds. */
export interface IAnswerQueue {
  /** All remaining answer rounds, in order. */
  readonly rounds: ReadonlyArray<number | string>;
  /** Number of upcoming rounds visible to the player. */
  readonly visibleAheadCount: number;
  /** Whether the highlight assist feature is enabled. */
  highlightAssistEnabled: boolean;
  /** Advance to the next answer round (called on correct answer). */
  advance(): void;
  /** Get the currently loaded (first) answer. */
  getCurrentAnswer(): number | string | null;
}

// ── Explosion ─────────────────────────────────────────────────────────────

/** Explosion effect that can trigger chain reactions. */
export interface IExplosion {
  /** Blast radius in pixels for direct hit detection. */
  readonly radius: number;
  /** Chain reaction radius — threats within this range are also destroyed. */
  readonly chainRadius: number;
  /** Duration of the explosion animation in milliseconds. */
  readonly durationMs: number;
  /** World position of the explosion center. */
  readonly position: { readonly x: number; readonly y: number };
}

// ── City ──────────────────────────────────────────────────────────────────

/** A defended city at the bottom of the screen. */
export interface ICity {
  /** City slot index (0–5, left to right). */
  readonly cityIndex: number;
  /** Display name of the city. */
  readonly name: string;
  /** Current hit points remaining. */
  readonly hitPoints: number;
  /** Maximum hit points. */
  readonly maxHitPoints: number;
  /** Whether this city is fully destroyed (0 HP). */
  readonly destroyed: boolean;
  /** Apply damage to this city. */
  takeDamage(amount: number): void;
  /** Rebuild the city to full HP (between levels). */
  rebuild(): void;
}

// ── Trajectory Line ───────────────────────────────────────────────────────

/** Visual line from a missile to its target city. */
export interface ITrajectoryLine {
  /** The threat this line tracks. */
  readonly threatId: string;
  /** The target city index (0–5). */
  readonly targetCityIndex: number;
  /** Whether the line is currently visible. */
  visible: boolean;
}
