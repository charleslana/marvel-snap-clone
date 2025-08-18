import { CardData } from '@/interfaces/Card';
import { Slot } from '@/interfaces/Slot';
import { MedusaHandler } from './MedusaHandler';
import { StarLordHandler } from './StarLordHandler';
import { WolfsbaneHandler } from './WolfsbaneHandler';
import { SentinelHandler } from './SentinelHandler';
import { SpectrumHandler } from './SpectrumHandler';
import { HawkeyeHandler } from './HawkeyeHandler';
import { Lane } from '@/interfaces/Lane';
import { CardEffect } from '@/enums/CardEffect';
import { CardEffectType } from '@/enums/CardEffectType';
import { CosmoGuard } from './CosmoGuard';

export class OnRevealHandler {
  static handle(
    lanes: Lane[],
    card: CardData,
    laneIndex: number,
    slot: Slot,
    isPlayer: boolean,
    turnPlayed: number,
    revealQueue: readonly {
      card: CardData;
      laneIndex: number;
      turnPlayed: number;
      isPlayer: boolean;
    }[]
  ): void {
    if (!card.effects) {
      return;
    }

    const hasOnReveal = card.effects?.some(
      (effect) => effect.cardEffectType === CardEffectType.OnReveal
    );
    if (!hasOnReveal) {
      return;
    }

    const cosmoBlock = CosmoGuard.handleBlock(lanes, laneIndex, card);
    if (cosmoBlock) {
      return;
    }

    for (const effect of card.effects) {
      if (effect.cardEffectType !== CardEffectType.OnReveal) {
        continue;
      }

      switch (effect.cardEffect) {
        case CardEffect.MedusaCenterBuff:
          if (effect.value === undefined) {
            return;
          }
          MedusaHandler.handle(slot, laneIndex, effect.value);
          break;
        case CardEffect.StarLordOpponentPlayedBuff:
          if (effect.value === undefined) {
            return;
          }
          StarLordHandler.handle(slot, laneIndex, effect.value, isPlayer, turnPlayed, revealQueue);
          break;
        case CardEffect.WolfsbaneBuff:
          if (effect.value === undefined) {
            return;
          }
          WolfsbaneHandler.handle(slot, effect.value, isPlayer, lanes[laneIndex]);
          break;
        case CardEffect.SentinelAddToHand:
          // TODO colocar a sentinel na mão pela função handle
          SentinelHandler.handle(isPlayer);
          break;
        case CardEffect.SpectrumBuffOngoing:
          if (effect.value === undefined) {
            return;
          }
          SpectrumHandler.handle(lanes, effect.value, isPlayer);
          break;
        case CardEffect.HawkeyeNextTurnBuff:
          if (effect.value === undefined) {
            return;
          }
          HawkeyeHandler.handle(slot, laneIndex, turnPlayed, effect.value);
          break;
      }
    }
  }
}
