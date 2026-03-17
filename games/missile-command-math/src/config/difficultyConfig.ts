/**
 * difficultyConfig.ts — Per-level ILevelConfig table and difficulty preset multipliers.
 *
 * Implements the GDD Level Progression table (levels 0–20).
 * Gameplay and Math agents import LEVEL_CONFIGS and DIFFICULTY_SPEED_MAP from here.
 *
 * @see docs/gdds/missile-command-math.md §Level Progression, §Difficulty Scaling
 */

import type { ILevelConfig, IDifficultySpeedMap } from '../types/IDifficultyConfig';

/** Global difficulty preset multipliers applied on top of per-level base values. */
export const DIFFICULTY_SPEED_MAP: IDifficultySpeedMap = {
  easy:   0.7,
  normal: 1.0,
  hard:   1.3,
};

/** Launcher reload delay by preset (ms). Higher difficulty = faster reload. */
export const LAUNCHER_RELOAD_DELAY_MS: Record<string, number> = {
  easy:   800,
  normal: 600,
  hard:   400,
};

/** Base bomber speed multiplier (applied before difficulty preset multiplier). */
export const BOMBER_BASE_SPEED_MULTIPLIER = 1.2;

/**
 * Per-level configuration table (indices 0–20).
 * Index 0 = training level (cannot fail, unlimited time).
 */
export const LEVEL_CONFIGS: readonly ILevelConfig[] = [
  // Level 0 — Training
  {
    level: 0,
    skillType: 'Addition only (training)',
    ccssStandards: [],
    mathTypes: ['addition'],
    difficulty: 'Tutorial',
    maxSimultaneous: 1,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.3,
    enemyCount: 1,
    timeLimitSeconds: Infinity,
    specialRule: 'Cannot fail; loops until 1 success; no score',
  },
  // Level 1
  {
    level: 1,
    skillType: 'Addition (single-digit)',
    ccssStandards: ['2.OA.B.2'],
    mathTypes: ['addition'],
    difficulty: 'Intro',
    maxSimultaneous: 2,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.4,
    enemyCount: 8,
    timeLimitSeconds: 90,
  },
  // Level 2
  {
    level: 2,
    skillType: 'Subtraction (single-digit)',
    ccssStandards: ['2.OA.B.2'],
    mathTypes: ['subtraction'],
    difficulty: 'Intro',
    maxSimultaneous: 2,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.4,
    enemyCount: 8,
    timeLimitSeconds: 90,
  },
  // Level 3
  {
    level: 3,
    skillType: 'Mixed add + subtract',
    ccssStandards: ['2.OA.B.2'],
    mathTypes: ['addition', 'subtraction'],
    difficulty: 'Easy',
    maxSimultaneous: 2,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.5,
    enemyCount: 10,
    timeLimitSeconds: 100,
  },
  // Level 4
  {
    level: 4,
    skillType: 'Mixed add + subtract (practice)',
    ccssStandards: ['2.OA.B.2'],
    mathTypes: ['addition', 'subtraction'],
    difficulty: 'Easy',
    maxSimultaneous: 3,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.5,
    enemyCount: 10,
    timeLimitSeconds: 100,
    specialRule: 'Mild speed ramp',
  },
  // Level 5
  {
    level: 5,
    skillType: 'Two-digit add (no regroup)',
    ccssStandards: ['2.NBT.B.5'],
    mathTypes: ['two-digit-addition'],
    difficulty: 'Easy',
    maxSimultaneous: 3,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.5,
    enemyCount: 10,
    timeLimitSeconds: 110,
    specialRule: 'New-op pacing',
  },
  // Level 6
  {
    level: 6,
    skillType: 'Two-digit subtract (no regroup)',
    ccssStandards: ['2.NBT.B.5'],
    mathTypes: ['two-digit-addition', 'two-digit-subtraction'],
    difficulty: 'Easy',
    maxSimultaneous: 3,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.6,
    enemyCount: 12,
    timeLimitSeconds: 110,
  },
  // Level 7
  {
    level: 7,
    skillType: 'Two-digit add (regroup)',
    ccssStandards: ['3.NBT.A.2'],
    mathTypes: ['two-digit-addition'],
    difficulty: 'Medium',
    maxSimultaneous: 3,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.6,
    enemyCount: 12,
    timeLimitSeconds: 110,
  },
  // Level 8
  {
    level: 8,
    skillType: 'Two-digit subtract (regroup)',
    ccssStandards: ['3.NBT.A.2'],
    mathTypes: ['two-digit-addition', 'two-digit-subtraction'],
    difficulty: 'Medium',
    maxSimultaneous: 3,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.6,
    enemyCount: 12,
    timeLimitSeconds: 110,
  },
  // Level 9
  {
    level: 9,
    skillType: 'Above + Multiply ×2 ×5 ×10',
    ccssStandards: ['3.OA.C.7'],
    mathTypes: ['two-digit-addition', 'two-digit-subtraction', 'multiplication'],
    difficulty: 'Medium',
    maxSimultaneous: 3,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.7,
    enemyCount: 12,
    timeLimitSeconds: 120,
    specialRule: 'New-op pacing',
  },
  // Level 10
  {
    level: 10,
    skillType: 'Above + Multiply ×3 ×4 ×6',
    ccssStandards: ['3.OA.C.7'],
    mathTypes: ['two-digit-addition', 'two-digit-subtraction', 'multiplication'],
    difficulty: 'Medium',
    maxSimultaneous: 3,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.7,
    enemyCount: 14,
    timeLimitSeconds: 120,
  },
  // Level 11
  {
    level: 11,
    skillType: 'Full multiplication (12×12)',
    ccssStandards: ['3.OA.C.7'],
    mathTypes: ['two-digit-addition', 'two-digit-subtraction', 'multiplication'],
    difficulty: 'Medium',
    maxSimultaneous: 4,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.8,
    enemyCount: 14,
    timeLimitSeconds: 120,
  },
  // Level 12
  {
    level: 12,
    skillType: 'Above + Three-digit add',
    ccssStandards: ['4.NBT.B.4'],
    mathTypes: ['two-digit-addition', 'two-digit-subtraction', 'multiplication', 'three-digit-addition'],
    difficulty: 'Hard',
    maxSimultaneous: 4,
    bomberEnabled: false,
    baseSpeedMultiplier: 0.8,
    enemyCount: 14,
    timeLimitSeconds: 130,
  },
  // Level 13
  {
    level: 13,
    skillType: 'Above + Three-digit subtract',
    ccssStandards: ['4.NBT.B.4'],
    mathTypes: ['two-digit-addition', 'two-digit-subtraction', 'multiplication', 'three-digit-addition', 'three-digit-subtraction'],
    difficulty: 'Hard',
    maxSimultaneous: 4,
    bomberEnabled: true,
    baseSpeedMultiplier: 0.9,
    enemyCount: 16,
    timeLimitSeconds: 130,
    specialRule: 'Bombers introduced',
  },
  // Level 14
  {
    level: 14,
    skillType: 'Above + Division (basic)',
    ccssStandards: ['3.OA.C.7'],
    mathTypes: ['multiplication', 'three-digit-addition', 'three-digit-subtraction', 'division'],
    difficulty: 'Hard',
    maxSimultaneous: 4,
    bomberEnabled: true,
    baseSpeedMultiplier: 0.9,
    enemyCount: 16,
    timeLimitSeconds: 130,
  },
  // Level 15
  {
    level: 15,
    skillType: 'Above + Division w/ remainders',
    ccssStandards: ['4.OA.A.3'],
    mathTypes: ['multiplication', 'three-digit-addition', 'three-digit-subtraction', 'division', 'division-with-remainders'],
    difficulty: 'Hard',
    maxSimultaneous: 4,
    bomberEnabled: true,
    baseSpeedMultiplier: 1.0,
    enemyCount: 16,
    timeLimitSeconds: 140,
  },
  // Level 16
  {
    level: 16,
    skillType: 'Above + Unit fractions',
    ccssStandards: ['3.NF.A.1'],
    mathTypes: ['multiplication', 'division', 'division-with-remainders', 'unit-fractions'],
    difficulty: 'Hard',
    maxSimultaneous: 4,
    bomberEnabled: true,
    baseSpeedMultiplier: 1.0,
    enemyCount: 16,
    timeLimitSeconds: 140,
    specialRule: 'New-op pacing',
  },
  // Level 17
  {
    level: 17,
    skillType: 'Above + Fraction of a number',
    ccssStandards: ['4.NF.A.1'],
    mathTypes: ['multiplication', 'division', 'unit-fractions', 'equivalent-fractions'],
    difficulty: 'Expert',
    maxSimultaneous: 5,
    bomberEnabled: true,
    baseSpeedMultiplier: 1.0,
    enemyCount: 18,
    timeLimitSeconds: 140,
  },
  // Level 18
  {
    level: 18,
    skillType: 'Above + Multi-step',
    ccssStandards: ['4.OA.A.3'],
    mathTypes: ['multiplication', 'division', 'equivalent-fractions', 'multi-step'],
    difficulty: 'Expert',
    maxSimultaneous: 5,
    bomberEnabled: true,
    baseSpeedMultiplier: 1.1,
    enemyCount: 18,
    timeLimitSeconds: 150,
  },
  // Level 19
  {
    level: 19,
    skillType: 'Above + Square roots',
    ccssStandards: ['5.NBT.A.2'],
    mathTypes: ['multiplication', 'division', 'multi-step', 'square-roots'],
    difficulty: 'Expert',
    maxSimultaneous: 5,
    bomberEnabled: true,
    baseSpeedMultiplier: 1.1,
    enemyCount: 20,
    timeLimitSeconds: 150,
  },
  // Level 20
  {
    level: 20,
    skillType: 'All types — mixed',
    ccssStandards: ['5.OA.A.1'],
    mathTypes: ['addition', 'subtraction', 'multiplication', 'division', 'division-with-remainders', 'unit-fractions', 'equivalent-fractions', 'multi-step', 'square-roots', 'mixed-operations'],
    difficulty: 'Expert',
    maxSimultaneous: 6,
    bomberEnabled: true,
    baseSpeedMultiplier: 1.2,
    enemyCount: 24,
    timeLimitSeconds: 150,
    specialRule: 'All bombers',
  },
];

/** Base spawn interval at Normal difficulty (ms between threat spawns). */
export const BASE_SPAWN_INTERVAL_MS = 3000;

/** Spawn interval decreases by this amount per level. */
export const SPAWN_INTERVAL_DECREMENT_MS = 80;

/** Minimum spawn interval (ms); never goes below this. */
export const SPAWN_INTERVAL_MIN_MS = 800;
