import { LaneEffect } from '@/interfaces/LaneEffect';
import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';
import { ImageEnum } from '@/enums/ImageEnum';

// Efeito 1: Sistema de Esgoto
const SewerSystemEffect: LaneEffect = {
  id: 'sewer_system',
  name: 'Sistema de Esgoto',
  description: 'As cartas aqui têm -1 de Poder.',
  image: ImageEnum.LocationSewerSystem,
  applyPowerBonus: (slots: Slot[], _lane: Lane): number => {
    let totalPenalty = 0;
    for (const slot of slots) {
      if (slot.occupied) {
        totalPenalty -= 1;
      }
    }
    return totalPenalty;
  },
};

// Efeito 2: Nidavellir
const NidavellirEffect: LaneEffect = {
  id: 'nidavellir',
  name: 'Nidavellir',
  description: 'As cartas aqui têm +5 de Poder.',
  image: ImageEnum.LocationNidavellir,
  applyPowerBonus: (slots: Slot[], _lane: Lane): number => {
    let totalBonus = 0;
    for (const slot of slots) {
      if (slot.occupied) {
        totalBonus += 5;
      }
    }
    return totalBonus;
  },
};

// Efeito 3: Atlântida
const AtlantisEffect: LaneEffect = {
  id: 'atlantis',
  name: 'Atlântida',
  description: 'Se você tiver apenas uma carta aqui, ela terá +5 de Poder.',
  image: ImageEnum.LocationAtlantis,
  applyPowerBonus: (slots: Slot[], _lane: Lane): number => {
    // Conta quantas cartas o jogador tem nesta lane
    const cardCount = slots.filter((slot) => slot.occupied).length;

    // Aplica o bônus apenas se houver exatamente uma carta
    if (cardCount === 1) {
      return 5;
    }

    return 0;
  },
};

/**
 * Um registro central que contém todos os efeitos de lane possíveis no jogo.
 */
export class LaneEffectsRegistry {
  private static allEffects: LaneEffect[] = [
    SewerSystemEffect,
    NidavellirEffect,
    AtlantisEffect,
    // Adicione novos efeitos aqui no futuro
  ];

  /**
   * Retorna uma cópia da lista de todos os efeitos de lane disponíveis.
   */
  public static getAllEffects(): LaneEffect[] {
    return [...this.allEffects];
  }
}
