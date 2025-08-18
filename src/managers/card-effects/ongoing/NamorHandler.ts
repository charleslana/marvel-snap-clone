import { Slot } from '@/interfaces/Slot';

export class NamorHandler {
  static handle(slot: Slot, friendlyCount: number, bonus: number): void {
    if (friendlyCount === 1 && bonus > 0) {
      slot.power = (slot.power ?? 0) + bonus;
    }
  }
}
