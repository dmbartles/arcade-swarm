/**
 * main.ts — Phaser.Game bootstrap for Missile Command Math.
 *
 * Configures the Phaser game instance with canvas size, physics, scene list,
 * and scale mode. All scenes are registered here in the correct order.
 *
 * @see docs/gdds/missile-command-math.md
 */

import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TARGET_FPS } from './config/gameConfig';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import InterstitialScene from './scenes/InterstitialScene';
import TrainingScene from './scenes/TrainingScene';
import GameScene from './scenes/GameScene';
import LevelCompleteScene from './scenes/LevelCompleteScene';
import GameOverScene from './scenes/GameOverScene';
import VictoryScene from './scenes/VictoryScene';

/** Phaser game configuration. */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: '#0A0A0F',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    MenuScene,
    InterstitialScene,
    TrainingScene,
    GameScene,
    LevelCompleteScene,
    GameOverScene,
    VictoryScene,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  fps: {
    target: TARGET_FPS,
    forceSetTimeOut: false,
  },
};

/** The Phaser game instance. */
const game = new Phaser.Game(config);

export default game;
