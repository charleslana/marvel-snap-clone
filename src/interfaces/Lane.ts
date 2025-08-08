import Phaser from 'phaser';
import { Slot } from './Slot';

export interface Lane {
  x: number;
  y: number;
  playerSlots: Slot[];
  botSlots: Slot[];
  worldText?: Phaser.GameObjects.Text;
  playerPowerText?: Phaser.GameObjects.Text;
  enemyPowerText?: Phaser.GameObjects.Text;
  worldContainer?: Phaser.GameObjects.Container;
}
