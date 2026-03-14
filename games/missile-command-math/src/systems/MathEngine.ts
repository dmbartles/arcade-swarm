/**
 * MathEngine — Phaser-aware wrapper around the shared MathEngineCore.
 *
 * Implements IMathEngine. Listens for WAVE_STARTED events and emits
 * PROBLEM_GENERATED with the full wave problem set and answer queue.
 *
 * @see docs/gdds/missile-command-math.md §8 (Curriculum Alignment)
 */

import Phaser from 'phaser';
import { MathEngineCore } from '@arcade-swarm/math-engine';
import type { IMathEngine } from '../types/IMathEngine';
import type { IMathProblem } from '../types/IMathProblem';
import { GameEvents } from '../types/GameEvents';
import type {
  WaveStartedPayload,
  ProblemGeneratedPayload,
} from '../types/GameEvents';
import type { IDifficultyConfig, MathSkillType } from '../types/IDifficultyConfig';

/**
 * Map from MathSkillType (broad category in IDifficultyConfig) to
 * curriculum-map skillType strings (exact strings used by generators).
 */
const MATH_TYPE_TO_SKILL_TYPES: Record<string, string[]> = {
  'addition': [
    'single-digit-addition',
    'two-digit-addition-no-regroup',
    'two-digit-addition-regroup',
    'three-digit-addition',
    'four-digit-addition',
  ],
  'subtraction': [
    'single-digit-subtraction',
    'two-digit-subtraction',
    'three-digit-subtraction',
    'four-digit-subtraction',
  ],
  'two-digit-addition': [
    'two-digit-addition-no-regroup',
    'two-digit-addition-regroup',
  ],
  'two-digit-subtraction': [
    'two-digit-subtraction',
  ],
  'three-digit-addition': [
    'three-digit-addition',
  ],
  'three-digit-subtraction': [
    'three-digit-subtraction',
  ],
  'four-digit-addition': [
    'four-digit-addition',
  ],
  'four-digit-subtraction': [
    'four-digit-subtraction',
  ],
  'multiplication': [
    'multiplication-partial',
    'multiplication-full',
  ],
  'division': [
    'division-basic',
    'division-with-remainder',
  ],
  'division-with-remainders': [
    'division-with-remainder',
  ],
  'unit-fractions': [
    'unit-fraction-of-whole',
  ],
  'equivalent-fractions': [
    'fraction-of-whole',
  ],
  'multi-step': [
    'multi-step-expression',
  ],
  'square-roots': [
    'perfect-square-root',
  ],
  'mixed-operations': [
    'mixed-operations',
  ],
};

/**
 * Grade requirement for each skillType.
 * Skills are only included in a wave if gradeLevel >= this value.
 */
const SKILL_GRADE_REQUIREMENT: Record<string, number> = {
  'single-digit-addition': 3,
  'two-digit-addition-no-regroup': 3,
  'two-digit-addition-regroup': 3,
  'two-digit-subtraction': 3,
  'single-digit-subtraction': 3,
  'multiplication-partial': 3,
  'multiplication-full': 4,
  'division-basic': 4,
  'three-digit-addition': 4,
  'three-digit-subtraction': 4,
  'division-with-remainder': 4,
  'unit-fraction-of-whole': 4,
  'fraction-of-whole': 4,
  'four-digit-addition': 4,
  'four-digit-subtraction': 4,
  'multi-step-expression': 4,
  'perfect-square-root': 5,
  'mixed-operations': 5,
};

/**
 * Map level number to grade level.
 * Levels 1–5: grade 3; levels 6–7: grade 4; levels 8–10: grade 5.
 */
function levelToGrade(level: number): number {
  if (level <= 5) return 3;
  if (level <= 7) return 4;
  return 5;
}

/**
 * Map difficulty setting to numeric difficulty level for MathEngineCore.
 */
function difficultySettingToLevel(setting: string): number {
  switch (setting) {
    case 'easy':
      return 1;
    case 'normal':
      return 2;
    case 'hard':
      return 3;
    default:
      return 2;
  }
}

export class MathEngine implements IMathEngine {
  private scene: Phaser.Scene;
  private core: MathEngineCore;
  private cachedConfig: IDifficultyConfig | null = null;

  /**
   * Create a MathEngine.
   *
   * @param scene - The Phaser scene this engine belongs to.
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.core = new MathEngineCore();
    this.setupEventListeners();
  }

  /**
   * Generate a single problem. Implements IMathEngine.
   * Converts MathProblem (library type) to IMathProblem (game type).
   *
   * @param gradeLevel - Target grade level (3–5).
   * @param skillType  - The math skill to test.
   * @returns A fully formed math problem.
   */
  generateProblem(gradeLevel: number, skillType: string): IMathProblem {
    const difficultyLevel = this.cachedConfig
      ? difficultySettingToLevel(this.cachedConfig.difficultySetting)
      : 2;
    const problem = this.core.generateProblem(gradeLevel, skillType, difficultyLevel);
    return problem as IMathProblem;
  }

  /**
   * Generate a full wave problem set. Implements IMathEngine.
   * Converts results and returns IMathProblem[].
   *
   * @param gradeLevel  - Target grade level (3–5).
   * @param skillTypes  - Array of active skill types for the current level.
   * @param count       - Number of problems to generate for the wave.
   * @returns Array of math problems for the entire wave.
   */
  generateWaveProblems(
    gradeLevel: number,
    skillTypes: string[],
    count: number,
  ): IMathProblem[] {
    const difficultyLevel = this.cachedConfig
      ? difficultySettingToLevel(this.cachedConfig.difficultySetting)
      : 2;
    const result = this.core.generateWaveProblems(gradeLevel, skillTypes, count, difficultyLevel);
    return result.problems as IMathProblem[];
  }

  /**
   * Validate an answer. Implements IMathEngine.
   * Delegates to MathEngineCore.
   *
   * @param problem - The math problem being answered.
   * @param answer  - The player's submitted answer.
   * @returns true if the answer matches.
   */
  validateAnswer(problem: IMathProblem, answer: number | string): boolean {
    return this.core.validateAnswer(problem, answer);
  }

  /**
   * Listen for WAVE_STARTED and DIFFICULTY_CHANGED events.
   * Called automatically in constructor.
   */
  private setupEventListeners(): void {
    this.scene.events.on(
      GameEvents.DIFFICULTY_CHANGED,
      (config: IDifficultyConfig) => {
        this.cachedConfig = config;
      },
    );

    this.scene.events.on(
      GameEvents.WAVE_STARTED,
      (payload: WaveStartedPayload) => {
        this.onWaveStarted(payload);
      },
    );
  }

  /**
   * Handler for WAVE_STARTED event.
   * Generates the full wave problem set and emits PROBLEM_GENERATED.
   *
   * @param payload - Wave started payload with level and threat count.
   */
  private onWaveStarted(payload: WaveStartedPayload): void {
    const config = this.cachedConfig;
    if (!config) {
      // Fallback: generate with defaults if no config received
      const gradeLevel = levelToGrade(payload.level);
      const result = this.core.generateWaveProblems(
        gradeLevel,
        ['single-digit-addition'],
        payload.totalThreats,
        2,
      );
      const emitPayload: ProblemGeneratedPayload = {
        problems: result.problems as IMathProblem[],
        answerQueue: result.answerQueue,
      };
      this.scene.events.emit(GameEvents.PROBLEM_GENERATED, emitPayload);
      return;
    }

    const gradeLevel = levelToGrade(payload.level);
    const difficultyLevel = difficultySettingToLevel(config.difficultySetting);

    // Expand activeMathTypes to curriculum skillType strings
    const expandedSkillTypes = this.expandMathTypes(config.activeMathTypes, gradeLevel);

    // Ensure we have at least one skill type
    const skillTypes = expandedSkillTypes.length > 0
      ? expandedSkillTypes
      : ['single-digit-addition'];

    const result = this.core.generateWaveProblems(
      gradeLevel,
      skillTypes,
      payload.totalThreats,
      difficultyLevel,
    );

    const emitPayload: ProblemGeneratedPayload = {
      problems: result.problems as IMathProblem[],
      answerQueue: result.answerQueue,
    };

    this.scene.events.emit(GameEvents.PROBLEM_GENERATED, emitPayload);
  }

  /**
   * Expand MathSkillType categories to individual curriculum skillType strings,
   * filtering by grade level requirement.
   *
   * @param mathTypes  - Active math type categories from difficulty config.
   * @param gradeLevel - Current grade level (3–5).
   * @returns Flat array of curriculum skillType strings.
   */
  private expandMathTypes(mathTypes: MathSkillType[], gradeLevel: number): string[] {
    const result: string[] = [];
    const seen = new Set<string>();

    for (const mathType of mathTypes) {
      const skillTypes = MATH_TYPE_TO_SKILL_TYPES[mathType];
      if (!skillTypes) continue;

      for (const skillType of skillTypes) {
        const requiredGrade = SKILL_GRADE_REQUIREMENT[skillType] ?? 3;
        if (gradeLevel >= requiredGrade && !seen.has(skillType)) {
          seen.add(skillType);
          result.push(skillType);
        }
      }
    }

    return result;
  }
}
