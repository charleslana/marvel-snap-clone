import { Lane } from '@/interfaces/Lane';
import { CardData } from '@/interfaces/Card';
import { BonusHelper } from '../helpers/BonusHelper';
import { LogHelper } from '../helpers/LogHelper';
import { CardEffectType } from '@/enums/CardEffectType';
import { CardEffect } from '@/enums/CardEffect';

export class AngelaHandler {
  static handle(lane: Lane, playedCard: CardData): void {
    [...lane.playerSlots, ...lane.opponentSlots].forEach((slot) => {
      if (!slot.occupied || !slot.cardData || slot.cardData === playedCard) {
        return;
      }

      slot.cardData.effects?.forEach((effect) => {
        if (
          effect.cardEffectType !== CardEffectType.OnCardPlayed ||
          effect.cardEffect !== CardEffect.AngelaBuff
        )
          return;

        const isAngelaPlayer = lane.playerSlots.includes(slot);
        const isPlayedCardPlayer = lane.playerSlots.some((slot) => slot.cardData === playedCard);

        if (isAngelaPlayer === isPlayedCardPlayer && effect.value) {
          BonusHelper.addPermanentBonus(slot, effect.value);
          LogHelper.emitLog(
            `Angela ganhou +${effect.value} de poder porque ${playedCard.name} foi jogada em sua lane.`
          );
        }
      });
    });
  }
}
