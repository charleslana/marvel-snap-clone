import { CardData } from '@/interfaces/Card';
import { Slot } from '@/interfaces/Slot';
import { EffectAction } from '@/interfaces/EffectAction';
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
  ): EffectAction[] {
    if (!card.effect) return [];

    const actions: EffectAction[] = [];

    const hasOnReveal = card.effect?.some((e) => e.type === CardEffectType.OnReveal);
    if (!hasOnReveal) return actions;

    const cosmoBlock = CosmoGuard.handleBlock(lanes, laneIndex, card);
    if (cosmoBlock) return cosmoBlock;

    for (const e of card.effect) {
      if (e.type !== CardEffectType.OnReveal) continue;

      switch (e.effect) {
        case CardEffect.MedusaCenterBuff:
          actions.push(...MedusaHandler.handle(slot, laneIndex, e.value as number));
          break;
        case CardEffect.StarLordOpponentPlayedBuff:
          actions.push(
            ...StarLordHandler.handle(
              slot,
              laneIndex,
              e.value as number,
              isPlayer,
              turnPlayed,
              revealQueue
            )
          );
          break;
        case CardEffect.WolfsbaneBuff:
          actions.push(
            ...WolfsbaneHandler.handle(slot, e.value as number, isPlayer, lanes[laneIndex])
          );
          break;
        case CardEffect.SentinelAddToHand:
          actions.push(...SentinelHandler.handle(isPlayer));
          break;
        case CardEffect.SpectrumBuffOngoing:
          actions.push(...SpectrumHandler.handle(lanes, e.value as number, isPlayer));
          break;
        case CardEffect.HawkeyeNextTurnBuff:
          actions.push(...HawkeyeHandler.handle(slot, laneIndex, turnPlayed, e.value as number));
          break;
      }
    }
    return actions;
  }
}
