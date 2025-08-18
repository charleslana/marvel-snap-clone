import { Slot } from '@/interfaces/Slot';

export class BonusHelper {
  static addPermanentBonus(slot: Slot, bonus: number): void {
    if (bonus <= 0) return;
    if (slot.permanentBonus === undefined) slot.permanentBonus = 0;
    slot.permanentBonus += bonus;
  }
}
