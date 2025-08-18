import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';

export class SlotHelper {
  static getAllSlots(lane: Lane): Slot[] {
    return [...lane.playerSlots, ...lane.opponentSlots];
  }

  static getFriendlySlots(lane: Lane, isPlayer: boolean): Slot[] {
    return isPlayer ? lane.playerSlots : lane.opponentSlots;
  }

  static getOpponentSlots(lane: Lane, isPlayer: boolean): Slot[] {
    return isPlayer ? lane.opponentSlots : lane.playerSlots;
  }
}
