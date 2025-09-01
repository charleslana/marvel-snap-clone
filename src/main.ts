import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import { BootScene } from './scenes/BootScene';
import { PreloaderScene } from './scenes/PreloaderScene';
import { LoginScene } from './scenes/LoginScene';
import { RegisterScene } from './scenes/RegisterScene';
import { HomeScene } from './scenes/HomeScene';
import { DeckScene } from './scenes/DeckScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: '#1d1d1d',
  dom: {
    createContainer: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
    },
  },
  banner: false,
  audio: {
    disableWebAudio: true,
  },
  pixelArt: true,
  parent: 'game-container',
  scene: [BootScene, PreloaderScene, LoginScene, RegisterScene, HomeScene, DeckScene, GameScene],
};

new Phaser.Game(config);
