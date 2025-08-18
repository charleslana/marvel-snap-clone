import { Slot } from '@/interfaces/Slot';
import { LogHelper } from '../helpers/LogHelper';

export class AntManHandler {
  static handle(slot: Slot, friendlyCount: number, bonus: number, effectMultiplier: number): void {
    if (friendlyCount < 4 || bonus <= 0) {
      return;
    }
    slot.power = (slot.power ?? 0) + bonus * effectMultiplier;

    if (effectMultiplier > 1) {
      LogHelper.emitLog('Massacre dobrou o efeito do Homem-Formiga!');
    }
  }
}
