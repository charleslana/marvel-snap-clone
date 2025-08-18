import Phaser from 'phaser';

export class GameEventManager extends Phaser.Events.EventEmitter {
  private static _instance: GameEventManager;

  private constructor() {
    super();
  }

  static get instance(): GameEventManager {
    if (!this._instance) {
      this._instance = new GameEventManager();
    }
    return this._instance;
  }
}
