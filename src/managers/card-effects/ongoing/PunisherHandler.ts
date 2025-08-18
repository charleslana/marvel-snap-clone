import { Slot } from '@/interfaces/Slot';
import { EffectAction } from '@/interfaces/EffectAction';
import { LogHelper } from '../helpers/LogHelper';

export class PunisherHandler {
  static handle(
    slot: Slot,
    opponentCount: number,
    bonusPerCard: number,
    effectMultiplier: number
  ): EffectAction[] {
    if (bonusPerCard <= 0) return [];
    slot.power = (slot.power ?? 0) + opponentCount * bonusPerCard * effectMultiplier;

    return effectMultiplier > 1
      ? [LogHelper.createLog('Massacre dobrou o efeito do Justiceiro!')]
      : [];
  }
}
