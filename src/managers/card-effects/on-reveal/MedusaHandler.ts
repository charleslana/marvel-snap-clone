import { Slot } from '@/interfaces/Slot';
import { BonusHelper } from '../helpers/BonusHelper';
import { LogHelper } from '../helpers/LogHelper';

export class MedusaHandler {
  static handle(slot: Slot, laneIndex: number, bonus: number): void {
    if (laneIndex !== 1 || bonus <= 0) {
      return;
    }
    BonusHelper.addPermanentBonus(slot, bonus);
    LogHelper.emitLog(`Medusa ganhou +${bonus} de poder na lane central.`);
  }
}
