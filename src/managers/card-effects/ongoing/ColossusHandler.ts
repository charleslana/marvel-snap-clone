import { Slot } from '@/interfaces/Slot';
import { LogHelper } from '../helpers/LogHelper';

export class ColossusHandler {
  static handle(slot: Slot): void {
    if (!slot.cardData) return;
    slot.cardData.immunities = {
      cannotBeDestroyed: true,
      cannotBeMoved: true,
      cannotHavePowerReduced: true,
    };
    LogHelper.createLog(`${slot.cardData.name} está com suas imunidades ativas.`);
  }
}
