/**
 * Level configuration — stub file.
 * Coding Agent 1 will overwrite this with correct values.
 * Placeholder for type compilation.
 */

import type { ILevelConfig } from '../types/IDifficultyConfig';

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
];
