import Phaser from 'phaser';

export interface Slot {
  x: number;
  y: number;
  occupied: boolean;
  overlay?: Phaser.GameObjects.Rectangle;
  power?: number;
}
