import { Lane } from '@/interfaces/Lane';
import { CardData } from '@/interfaces/Card';
import { EffectAction } from '@/interfaces/EffectAction';
import { LogHelper } from '../helpers/LogHelper';
import { CardEffect } from '@/enums/CardEffect';

export class CosmoGuard {
  static handleBlock(lanes: Lane[], laneIndex: number, card: CardData): EffectAction[] | null {
    const lane = lanes[laneIndex];

    const cosmoCard = [...lane.playerSlots, ...lane.opponentSlots].find(
      (s) =>
        s.occupied && s.cardData?.effect?.some((e) => e.effect === CardEffect.CosmoBlockOnReveal)
    )?.cardData;

    if (!cosmoCard || !cosmoCard.isRevealed) return null;

    if (card.effect?.some((e) => e.effect === CardEffect.CosmoBlockOnReveal)) return null;

    return [
      LogHelper.createLog(
        `Cosmo bloqueou o efeito ao revelar de ${card.name} na lane ${laneIndex + 1}!`
      ),
    ];
  }
}
