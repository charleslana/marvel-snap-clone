// ===== 2. NOVA CLASSE SlotManager.ts =====

import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';

export class SlotManager {
  /**
   * Encontra o próximo slot disponível em sequência (0, 1, 2, 3)
   */
  public static getNextAvailableSlot(lane: Lane, isPlayer: boolean = true): Slot | null {
    const slots = isPlayer ? lane.playerSlots : lane.opponentSlots;

    // Ordena os slots por índice e encontra o primeiro disponível
    const sortedSlots = [...slots].sort((a, b) => (a.slotIndex || 0) - (b.slotIndex || 0));

    return sortedSlots.find((slot) => !slot.occupied) || null;
  }

  /**
   * Conta quantos slots estão ocupados em uma lane
   */
  public static getOccupiedSlotsCount(lane: Lane, isPlayer: boolean = true): number {
    const slots = isPlayer ? lane.playerSlots : lane.opponentSlots;
    return slots.filter((slot) => slot.occupied).length;
  }

  /**
   * Verifica se uma lane está cheia
   */
  public static isLaneFull(lane: Lane, isPlayer: boolean = true): boolean {
    const slots = isPlayer ? lane.playerSlots : lane.opponentSlots;
    return slots.every((slot) => slot.occupied);
  }

  /**
   * Coloca uma carta no próximo slot disponível de uma lane
   */
  public static placeCardInNextSlot(
    lane: Lane,
    cardData: any,
    power: number,
    isPlayer: boolean = true
  ): Slot | null {
    const nextSlot = this.getNextAvailableSlot(lane, isPlayer);

    if (nextSlot) {
      nextSlot.occupied = true;
      nextSlot.cardData = cardData;
      nextSlot.power = power;

      console.log(
        `Carta "${cardData.name}" colocada no slot ${nextSlot.slotIndex} da lane ${lane.index + 1}`
      );

      return nextSlot;
    }

    console.log(`Lane ${lane.index + 1} está cheia!`);
    return null;
  }

  /**
   * Remove uma carta de um slot
   */
  public static removeCardFromSlot(slot: Slot): void {
    slot.occupied = false;
    delete slot.cardData;
    delete slot.power;
    delete slot.permanentBonus;
  }
}
