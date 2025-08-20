import { Lane } from '@/interfaces/Lane';
import { CardData } from '@/interfaces/Card';
import { AngelaHandler } from './AngelaHandler';
import { CardEffect } from '@/enums/CardEffect';
import { CardEffectType } from '@/enums/CardEffectType';

const onCardPlayedHandlers: Partial<
  Record<CardEffect, (lane: Lane, playedCard: CardData) => void>
> = {
  [CardEffect.AngelaBuff]: AngelaHandler.handle,
  // futuramente
};

export class OnCardPlayedHandler {
  static handle(lane: Lane, playedCard: CardData): void {
    [...lane.playerSlots, ...lane.opponentSlots].forEach((slot) => {
      if (!slot.occupied || !slot.cardData) return;

      slot.cardData.effects?.forEach((effect) => {
        if (effect.cardEffectType !== CardEffectType.OnCardPlayed) return;

        const handler = onCardPlayedHandlers[effect.cardEffect];
        if (handler) {
          handler(lane, playedCard);
        }
      });
    });
  }
}
