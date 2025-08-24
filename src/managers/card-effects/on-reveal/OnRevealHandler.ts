import { CardData } from '@/interfaces/Card';
import { Slot } from '@/interfaces/Slot';
import { Lane } from '@/interfaces/Lane';
import { CardEffect } from '@/enums/CardEffect';
import { CardEffectType } from '@/enums/CardEffectType';
import { CosmoGuard } from './CosmoGuard';

// Importe todos os handlers específicos
import { MedusaHandler } from './MedusaHandler';
import { StarLordHandler } from './StarLordHandler';
import { WolfsbaneHandler } from './WolfsbaneHandler';
import { SentinelHandler } from './SentinelHandler';
import { SpectrumHandler } from './SpectrumHandler';
import { HawkeyeHandler } from './HawkeyeHandler';

// Tipo para os argumentos dos handlers, para manter a consistência
type OnRevealHandlerArgs = {
  lanes: Lane[];
  card: CardData;
  laneIndex: number;
  slot: Slot;
  isPlayer: boolean;
  turnPlayed: number;
  revealQueue: readonly {
    card: CardData;
    laneIndex: number;
    turnPlayed: number;
    isPlayer: boolean;
  }[];
};

// O "Mapa de Estratégias"
const onRevealEffectMap: Partial<Record<CardEffect, (args: OnRevealHandlerArgs) => void>> = {
  [CardEffect.MedusaCenterBuff]: ({ slot, laneIndex, card }) =>
    MedusaHandler.handle(
      slot,
      laneIndex,
      card.effects?.find((e) => e.cardEffect === CardEffect.MedusaCenterBuff)?.value ?? 0
    ),
  [CardEffect.StarLordOpponentPlayedBuff]: ({
    slot,
    laneIndex,
    card,
    isPlayer,
    turnPlayed,
    revealQueue,
  }) =>
    StarLordHandler.handle(
      slot,
      laneIndex,
      card.effects?.find((e) => e.cardEffect === CardEffect.StarLordOpponentPlayedBuff)?.value ?? 0,
      isPlayer,
      turnPlayed,
      revealQueue
    ),
  [CardEffect.WolfsbaneBuff]: ({ slot, card, isPlayer, lanes, laneIndex }) =>
    WolfsbaneHandler.handle(
      slot,
      card.effects?.find((e) => e.cardEffect === CardEffect.WolfsbaneBuff)?.value ?? 0,
      isPlayer,
      lanes[laneIndex]
    ),
  [CardEffect.SentinelAddToHand]: ({ isPlayer }) => SentinelHandler.handle(isPlayer),
  [CardEffect.SpectrumBuffOngoing]: ({ lanes, card, isPlayer }) =>
    SpectrumHandler.handle(
      lanes,
      card.effects?.find((e) => e.cardEffect === CardEffect.SpectrumBuffOngoing)?.value ?? 0,
      isPlayer
    ),
  [CardEffect.HawkeyeNextTurnBuff]: ({ slot, laneIndex, turnPlayed, card }) =>
    HawkeyeHandler.handle(
      slot,
      laneIndex,
      turnPlayed,
      card.effects?.find((e) => e.cardEffect === CardEffect.HawkeyeNextTurnBuff)?.value ?? 0
    ),
};

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
    const onRevealEffects = card.effects?.filter(
      (effect) => effect.cardEffectType === CardEffectType.OnReveal
    );

    if (!onRevealEffects || onRevealEffects.length === 0) {
      return;
    }

    if (CosmoGuard.handleBlock(lanes, laneIndex, card)) {
      return;
    }

    const handlerArgs: OnRevealHandlerArgs = {
      lanes,
      card,
      laneIndex,
      slot,
      isPlayer,
      turnPlayed,
      revealQueue,
    };

    for (const effect of onRevealEffects) {
      const handler = onRevealEffectMap[effect.cardEffect];
      if (handler) {
        // Chama a função diretamente do mapa
        handler(handlerArgs);
      }
    }
  }
}
