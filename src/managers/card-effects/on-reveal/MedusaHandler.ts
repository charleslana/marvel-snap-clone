import { EffectAction } from '@/interfaces/EffectAction';
import { Slot } from '@/interfaces/Slot';
import { BonusHelper } from '../helpers/BonusHelper';
import { LogHelper } from '../helpers/LogHelper';

export class MedusaHandler {
  static handle(slot: Slot, laneIndex: number, bonus: number): EffectAction[] {
    if (laneIndex !== 1 || bonus <= 0) return [];
    BonusHelper.addPermanentBonus(slot, bonus);
    return [LogHelper.createLog(`Medusa ganhou +${bonus} de poder na lane central.`)];
  }
}
