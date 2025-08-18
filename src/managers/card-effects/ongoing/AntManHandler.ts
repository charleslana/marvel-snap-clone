import { EffectAction } from '@/interfaces/EffectAction';
import { Slot } from '@/interfaces/Slot';
import { LogHelper } from '../helpers/LogHelper';

export class AntManHandler {
  static handle(
    slot: Slot,
    friendlyCount: number,
    bonus: number,
    effectMultiplier: number
  ): EffectAction[] {
    if (friendlyCount < 4 || bonus <= 0) return [];
    slot.power = (slot.power ?? 0) + bonus * effectMultiplier;

    return effectMultiplier > 1
      ? [LogHelper.createLog('Massacre dobrou o efeito do Homem-Formiga!')]
      : [];
  }
}
