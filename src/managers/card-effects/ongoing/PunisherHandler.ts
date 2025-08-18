import { Slot } from '@/interfaces/Slot';
import { LogHelper } from '../helpers/LogHelper';

export class PunisherHandler {
  static handle(
    slot: Slot,
    opponentCount: number,
    bonusPerCard: number,
    effectMultiplier: number
  ): void {
    if (bonusPerCard <= 0) {
      return;
    }
    slot.power = (slot.power ?? 0) + opponentCount * bonusPerCard * effectMultiplier;

    if (effectMultiplier > 1) {
      LogHelper.emitLog('Massacre dobrou o efeito do Justiceiro!');
    }
  }
}
