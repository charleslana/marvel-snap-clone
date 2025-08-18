import { Lane } from '@/interfaces/Lane';
import { CardData } from '@/interfaces/Card';
import { EffectAction } from '@/interfaces/EffectAction';
import { BonusHelper } from '../helpers/BonusHelper';
import { LogHelper } from '../helpers/LogHelper';
import { CardEffectType } from '@/enums/CardEffectType';
import { CardEffect } from '@/enums/CardEffect';

export class AngelaHandler {
  static handle(lane: Lane, playedCard: CardData): EffectAction[] {
    const actions: EffectAction[] = [];

    [...lane.playerSlots, ...lane.opponentSlots].forEach((slot) => {
      if (!slot.occupied || !slot.cardData || slot.cardData === playedCard) return;

      slot.cardData.effect?.forEach((e) => {
        if (e.type !== CardEffectType.OnCardPlayed || e.effect !== CardEffect.AngelaBuff) return;

        const isAngelaPlayer = lane.playerSlots.includes(slot);
        const isPlayedCardPlayer = lane.playerSlots.some((s) => s.cardData === playedCard);

        if (isAngelaPlayer === isPlayedCardPlayer && e.value) {
          BonusHelper.addPermanentBonus(slot, e.value);
          actions.push(
            LogHelper.createLog(
              `Angela ganhou +${e.value} de poder porque ${playedCard.name} foi jogada em sua lane.`
            )
          );
        }
      });
    });

    return actions;
  }
}
