import Phaser from 'phaser';
import { Slot } from './Slot';
import { LaneEffect } from './LaneEffect';

export interface Lane {
  index: number;
  x: number;
  y: number;
  playerSlots: Slot[];
  opponentSlots: Slot[];
  worldText?: Phaser.GameObjects.Text;
  worldImage?: Phaser.GameObjects.Image;
  playerPowerText?: Phaser.GameObjects.Text;
  opponentPowerText?: Phaser.GameObjects.Text;
  worldContainer?: Phaser.GameObjects.Container;
  properties?: {
    cardsCannotBeDestroyed?: boolean;
  };
  effect?: LaneEffect | null;
  isRevealed?: boolean;
}
