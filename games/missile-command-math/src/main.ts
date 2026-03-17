/**
 * main.ts — Phaser Game bootstrap for Missile Command Math.
 *
 * Registers all scenes and initialises Phaser with the 800×640 canvas.
 * Scale mode FIT + CENTER_BOTH ensures the canvas fills any viewport while
 * maintaining the 800×640 aspect ratio (mobile + desktop).
 *
 * @see docs/build-plans/missile-command-math-engine.md §2.19
 */

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config/gameConfig';

// ── Scene imports ─────────────────────────────────────────────────────────────
import { BootScene }           from './scenes/BootScene';
import { MenuScene }           from './scenes/MenuScene';
import { TrainingBriefScene }  from './scenes/TrainingBriefScene';
import { BriefingScene }       from './scenes/BriefingScene';
import { LevelReadyScene }     from './scenes/LevelReadyScene';
import { GameScene }           from './scenes/GameScene';
import { LevelCompleteScene }  from './scenes/LevelCompleteScene';
import { GameOverScene }       from './scenes/GameOverScene';
import { VictoryScene }        from './scenes/VictoryScene';
import { LevelSelectScene }    from './scenes/LevelSelectScene';
import { SettingsScene }       from './scenes/SettingsScene';
import { PauseScene }          from './scenes/PauseScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width:  CANVAS_WIDTH,   // 800
  height: CANVAS_HEIGHT,  // 640
  parent: 'game-container',
  backgroundColor: '#C8B8DC',
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug:   false,
    },
  },
  scene: [
    BootScene,
    MenuScene,
    TrainingBriefScene,
    BriefingScene,
    LevelReadyScene,
    GameScene,
    LevelCompleteScene,
    GameOverScene,
    VictoryScene,
    LevelSelectScene,
    SettingsScene,
    PauseScene,
  ],
};

export default new Phaser.Game(config);
