import { Lane } from '@/interfaces/Lane';
import { CardData } from '@/interfaces/Card';
import { LogHelper } from '../helpers/LogHelper';
import { CardEffect } from '@/enums/CardEffect';

export class CosmoGuard {
  static handleBlock(lanes: Lane[], laneIndex: number, card: CardData): boolean {
    const lane = lanes[laneIndex];

    const cosmoCard = [...lane.playerSlots, ...lane.opponentSlots].find(
      (slot) =>
        slot.occupied &&
        slot.cardData?.effects?.some(
          (effect) => effect.cardEffect === CardEffect.CosmoBlockOnReveal
        )
    )?.cardData;

    if (!cosmoCard || !cosmoCard.isRevealed) {
      return false;
    }

    if (card.effects?.some((effect) => effect.cardEffect === CardEffect.CosmoBlockOnReveal)) {
      return false;
    }

    LogHelper.emitLog(
      `Cosmo bloqueou o efeito ao revelar de ${card.name} na lane ${laneIndex + 1}!`
    );
    return true;
  }
}
