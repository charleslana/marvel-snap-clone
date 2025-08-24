import { CardData } from './Card';
import { Slot } from './Slot';

export interface RevealQueueItem {
  card: CardData;
  laneIndex: number;
  slot: Slot;
  isPlayer: boolean;
  turnPlayed: number;
}
