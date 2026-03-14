/**
 * levelConfig — Per-level configuration and difficulty scaling maps.
 *
 * Implements data from the GDD §7 Level Progression table. Coding Agent 3's
 * DifficultyManager imports LEVEL_CONFIGS and the difficulty multiplier maps.
 *
 * @see docs/gdds/missile-command-math.md §7 (Level Progression)
 */

import type { ILevelConfig } from '../types/IDifficultyConfig';

/** Complete per-level configuration for all 10 levels. Index 0 = Level 1. */
export const LEVEL_CONFIGS: ILevelConfig[] = [
  {
    level: 1,
    year: 1981,
    mathTypes: ['addition', 'subtraction'],
    maxSimultaneousThreats: 2,
    bomberEnabled: false,
    paratrooperEnabled: false,
    mirvEnabled: false,
    baseSpeedMultiplier: 0.5,
    problemsInWave: 10,
    timeLimitSeconds: 120,
  },
  {
    level: 2,
    year: 1982,
    mathTypes: ['addition', 'subtraction'],
    maxSimultaneousThreats: 3,
    bomberEnabled: false,
    paratrooperEnabled: false,
    mirvEnabled: false,
    baseSpeedMultiplier: 0.6,
    problemsInWave: 12,
    timeLimitSeconds: 120,
  },
  {
    level: 3,
    year: 1982,
    mathTypes: ['addition', 'subtraction', 'multiplication'],
    maxSimultaneousThreats: 3,
    bomberEnabled: false,
    paratrooperEnabled: false,
    mirvEnabled: false,
    baseSpeedMultiplier: 0.7,
    problemsInWave: 14,
    timeLimitSeconds: 130,
  },
  {
    level: 4,
    year: 1983,
    mathTypes: ['addition', 'subtraction', 'multiplication'],
    maxSimultaneousThreats: 4,
    bomberEnabled: false,
    paratrooperEnabled: false,
    mirvEnabled: false,
    baseSpeedMultiplier: 0.8,
    problemsInWave: 16,
    timeLimitSeconds: 140,
  },
  {
    level: 5,
    year: 1983,
    mathTypes: ['addition', 'subtraction', 'multiplication', 'division'],
    maxSimultaneousThreats: 4,
    bomberEnabled: false,
    paratrooperEnabled: false,
    mirvEnabled: false,
    baseSpeedMultiplier: 0.9,
    problemsInWave: 18,
    timeLimitSeconds: 150,
  },
  {
    level: 6,
    year: 1984,
    mathTypes: ['addition', 'subtraction', 'multiplication', 'division', 'unit-fractions'],
    maxSimultaneousThreats: 4,
    bomberEnabled: true,
    paratrooperEnabled: false,
    mirvEnabled: false,
    baseSpeedMultiplier: 1.0,
    problemsInWave: 20,
    timeLimitSeconds: 160,
  },
  {
    level: 7,
    year: 1985,
    mathTypes: ['addition', 'subtraction', 'multiplication', 'division', 'unit-fractions', 'multi-step'],
    maxSimultaneousThreats: 5,
    bomberEnabled: true,
    paratrooperEnabled: true,
    mirvEnabled: false,
    baseSpeedMultiplier: 1.1,
    problemsInWave: 22,
    timeLimitSeconds: 170,
  },
  {
    level: 8,
    year: 1986,
    mathTypes: [
      'addition', 'subtraction', 'multiplication', 'division',
      'unit-fractions', 'multi-step', 'square-roots',
    ],
    maxSimultaneousThreats: 5,
    bomberEnabled: true,
    paratrooperEnabled: true,
    mirvEnabled: true,
    baseSpeedMultiplier: 1.2,
    problemsInWave: 24,
    timeLimitSeconds: 180,
  },
  {
    level: 9,
    year: 1987,
    mathTypes: [
      'addition', 'subtraction', 'multiplication', 'division',
      'unit-fractions', 'equivalent-fractions', 'multi-step', 'square-roots',
    ],
    maxSimultaneousThreats: 6,
    bomberEnabled: true,
    paratrooperEnabled: true,
    mirvEnabled: true,
    baseSpeedMultiplier: 1.3,
    problemsInWave: 26,
    timeLimitSeconds: 190,
  },
  {
    level: 10,
    year: 1987,
    mathTypes: [
      'addition', 'subtraction', 'multiplication', 'division',
      'unit-fractions', 'equivalent-fractions', 'multi-step',
      'square-roots', 'mixed-operations',
    ],
    maxSimultaneousThreats: 6,
    bomberEnabled: true,
    paratrooperEnabled: true,
    mirvEnabled: true,
    baseSpeedMultiplier: 1.5,
    problemsInWave: 28,
    timeLimitSeconds: 210,
  },
];

/** Speed multiplier for each global difficulty setting. */
export const DIFFICULTY_SPEED_MAP = {
  easy: 0.7,
  normal: 1.0,
  hard: 1.3,
} as const;

/** Spawn interval scaling factor per difficulty (divisor applied to base interval). */
export const DIFFICULTY_SPAWN_SCALE = {
  easy: 0.8,
  normal: 1.0,
  hard: 1.25,
} as const;
