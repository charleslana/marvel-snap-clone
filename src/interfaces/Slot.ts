import Phaser from 'phaser';
import { CardData } from './Card';

export interface Slot {
  x: number;
  y: number;
  occupied: boolean;
  overlay?: Phaser.GameObjects.Rectangle;
  slotIndex?: number; // Nova propriedade para ordem sequencial
  power?: number;
  cardData?: CardData;
  permanentBonus?: number;
}
