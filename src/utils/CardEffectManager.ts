import { CardEffect } from '@/enums/CardEffect';
import { CardEffectType } from '@/enums/CardEffectType';
import { ImageEnum } from '@/enums/ImageEnum';
import { Card, CardData } from '@/interfaces/Card';
import { AddToHandAction, EffectAction } from '@/interfaces/EffectAction';
import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';

export class CardEffectManager {
  constructor(private lanes: Lane[]) {}

  public applyOnRevealEffect(
    card: CardData,
    laneIndex: number,
    slot: Slot,
    isPlayerCard: boolean,
    turnPlayed: number,
    revealQueue: readonly {
      card: CardData;
      laneIndex: number;
      turnPlayed: number;
      isPlayer: boolean;
    }[]
  ): EffectAction[] {
    const actions: EffectAction[] = [];
    if (!card.effect) return actions;

    const lane = this.lanes[laneIndex];

    const cosmoCard = [...lane.playerSlots, ...lane.botSlots].find(
      (s) =>
        s.occupied && s.cardData?.effect?.some((e) => e.effect === CardEffect.CosmoBlockOnReveal)
    )?.cardData;

    if (cosmoCard && cosmoCard.isRevealed) {
      if (card.name === 'Cosmo') {
      } else {
        console.log(`Cosmo bloqueou o efeito OnReveal de ${card.name} na lane ${laneIndex + 1}!`);
        return actions;
      }
    }

    for (const e of card.effect) {
      if (e.type === CardEffectType.OnReveal) {
        switch (e.effect) {
          case CardEffect.MedusaCenterBuff: {
            const bonus = typeof e.value === 'number' ? e.value : 0;
            if (laneIndex === 1 && bonus > 0) {
              slot.power = (slot.power ?? 0) + bonus;
              console.log(`Medusa ganhou +${bonus} de poder na lane central.`);
            }
            break;
          }

          case CardEffect.StarLordOpponentPlayedBuff: {
            const opponentName = isPlayerCard ? 'Bot' : 'Jogador';
            const opponentPlayedHere = revealQueue.some(
              (item) =>
                item.isPlayer !== isPlayerCard &&
                item.laneIndex === laneIndex &&
                item.turnPlayed === turnPlayed
            );

            const bonus = typeof e.value === 'number' ? e.value : 0;
            if (opponentPlayedHere && bonus > 0) {
              slot.power = (slot.power ?? 0) + bonus;
              console.log(
                `Senhor das Estrelas ganhou +${bonus} porque o ${opponentName} também jogou aqui!`
              );
            }
            break;
          }

          case CardEffect.WolfsbaneBuff: {
            const friendlySlots = isPlayerCard ? lane.playerSlots : lane.botSlots;
            const sideIdentifier = isPlayerCard ? 'Jogador' : 'Bot';

            const otherCardsCount = friendlySlots.filter((s) => s.occupied && s !== slot).length;

            const bonusPerCard = typeof e.value === 'number' ? e.value : 0;

            const totalBonus = otherCardsCount * bonusPerCard;
            if (totalBonus > 0) {
              slot.power = (slot.power ?? 0) + totalBonus;
              console.log(
                `Loba Venenosa (${sideIdentifier}) ganhou +${totalBonus} de poder por encontrar ${otherCardsCount} outra(s) carta(s) aliada(s).`
              );
            }
            break;
          }

          case CardEffect.SentinelAddToHand: {
            const sentinelCardToAdd: Omit<Card, 'index'> = {
              name: 'Sentinela',
              cost: 2,
              power: 3,
              description: 'Ao revelar: adiciona outro Sentinela à sua mão.',
              effect: [{ type: CardEffectType.OnReveal, effect: CardEffect.SentinelAddToHand }],
              image: ImageEnum.CardSentinel,
            };

            const action: AddToHandAction = {
              type: 'ADD_TO_HAND',
              payload: {
                card: sentinelCardToAdd,
                isPlayer: isPlayerCard,
              },
            };

            actions.push(action);
            console.log(
              `Ação criada: Adicionar Sentinela à mão de ${isPlayerCard ? 'Jogador' : 'Bot'}.`
            );
            break;
          }

          case CardEffect.SpectrumBuffOngoing: {
            const bonus = typeof e.value === 'number' ? e.value : 0;
            if (bonus === 0) break;

            const sideIdentifier = isPlayerCard ? 'Jogador' : 'Bot';
            console.log(`Espectro (${sideIdentifier}) ativou seu efeito!`);

            this.lanes.forEach((targetLane) => {
              const friendlySlots = isPlayerCard ? targetLane.playerSlots : targetLane.botSlots;
              for (const targetSlot of friendlySlots) {
                if (
                  targetSlot.occupied &&
                  targetSlot.cardData &&
                  targetSlot.cardData.effect?.some((eff) => eff.type === CardEffectType.Ongoing)
                ) {
                  if (targetSlot.permanentBonus === undefined) {
                    targetSlot.permanentBonus = 0;
                  }
                  targetSlot.permanentBonus += bonus;
                  console.log(`  -> ${targetSlot.cardData.name} recebeu +${bonus} de poder.`);
                }
              }
            });
            break;
          }
        }
      }
    }
    return actions;
  }

  public recalcOngoingEffects(): void {
    for (const lane of this.lanes) {
      const allSlots = [...lane.playerSlots, ...lane.botSlots];
      for (const slot of allSlots) {
        if (
          slot.occupied &&
          slot.cardData?.effect?.some((e) => e.type === CardEffectType.Ongoing)
        ) {
          slot.power = slot.cardData.power + (slot.permanentBonus ?? 0);
        }
      }
    }

    for (let laneIndex = 0; laneIndex < this.lanes.length; laneIndex++) {
      const lane = this.lanes[laneIndex];
      const allSlots = [...lane.playerSlots, ...lane.botSlots];

      for (const slot of allSlots) {
        if (
          slot.occupied &&
          slot.cardData?.effect?.some((e) => e.type === CardEffectType.Ongoing)
        ) {
          const isPlayerCard = lane.playerSlots.includes(slot);
          for (const e of slot.cardData.effect) {
            if (e.type === CardEffectType.Ongoing) {
              this.applyOngoingEffect(e.effect, slot, laneIndex, isPlayerCard);
            }
          }
        }
      }
    }
  }

  private applyOngoingEffect(
    effect: CardEffect,
    targetSlot: Slot,
    laneIndex: number,
    isPlayer: boolean
  ): void {
    const lane = this.lanes[laneIndex];
    const friendlySlots = isPlayer ? lane.playerSlots : lane.botSlots;
    const enemySlots = isPlayer ? lane.botSlots : lane.playerSlots;

    const onslaughtCount = friendlySlots.filter(
      (s) =>
        s.occupied &&
        s.cardData?.effect?.some((e) => e.effect === CardEffect.OnslaughtDoubleOngoing)
    ).length;
    const effectMultiplier = Math.pow(2, onslaughtCount);

    switch (effect) {
      case CardEffect.AntManBuff: {
        const bonus =
          typeof targetSlot.cardData?.effect?.find((e) => e.effect === CardEffect.AntManBuff)
            ?.value === 'number'
            ? (targetSlot.cardData.effect.find((e) => e.effect === CardEffect.AntManBuff)!
                .value as number)
            : 0;

        if (friendlySlots.filter((s) => s.occupied).length >= 4) {
          targetSlot.power = (targetSlot.power ?? 0) + bonus * effectMultiplier;
          if (effectMultiplier > 1) console.log(`Onslaught dobrou o efeito do Homem-Formiga!`);
        }
        break;
      }

      case CardEffect.PunisherEnemyBuff: {
        const bonusPerCard =
          typeof targetSlot.cardData?.effect?.find((e) => e.effect === CardEffect.PunisherEnemyBuff)
            ?.value === 'number'
            ? (targetSlot.cardData.effect.find((e) => e.effect === CardEffect.PunisherEnemyBuff)!
                .value as number)
            : 0;
        const enemyCount = enemySlots.filter((s) => s.occupied).length;
        targetSlot.power = (targetSlot.power ?? 0) + enemyCount * bonusPerCard * effectMultiplier;
        if (effectMultiplier > 1) console.log(`Onslaught dobrou o efeito do Justiceiro!`);
        break;
      }

      case CardEffect.NamorBuff: {
        if (friendlySlots.filter((s) => s.occupied).length === 1) {
          const bonus =
            typeof targetSlot.cardData?.effect?.find((e) => e.effect === CardEffect.NamorBuff)
              ?.value === 'number'
              ? (targetSlot.cardData.effect.find((e) => e.effect === CardEffect.NamorBuff)!
                  .value as number)
              : 0;

          targetSlot.power = (targetSlot.power ?? 0) + bonus;
        }
        break;
      }

      case CardEffect.ColossusImmune: {
        if (!targetSlot.cardData!.immunities) {
          targetSlot.cardData!.immunities = {};
        }
        targetSlot.cardData!.immunities.cannotBeDestroyed = true;
        targetSlot.cardData!.immunities.cannotBeMoved = true;
        targetSlot.cardData!.immunities.cannotHavePowerReduced = true;

        console.log(`${targetSlot.cardData!.name} está com suas imunidades ativas.`);
        break;
      }
    }
  }

  public applyEndOfTurnEffects(): void {
    for (const lane of this.lanes) {
      const allSlots = [...lane.playerSlots, ...lane.botSlots];
      for (const slot of allSlots) {
        if (!slot.occupied || !slot.cardData?.effect) continue;

        for (const e of slot.cardData.effect) {
          if (e.type === CardEffectType.EndOfTurn) {
            this.applyEndOfTurnEffect(e.effect, slot, lane);
          }
        }
      }
    }
  }

  public triggerOnCardPlayedEffects(playedCard: CardData, laneIndex: number): void {
    const lane = this.lanes[laneIndex];
    const allSlotsInLane = [...lane.playerSlots, ...lane.botSlots];
    for (const slot of allSlotsInLane) {
      if (!slot.occupied || !slot.cardData || slot.cardData === playedCard) {
        continue;
      }
      if (slot.cardData.effect?.some((e) => e.type === CardEffectType.OnCardPlayed)) {
        for (const e of slot.cardData.effect) {
          if (e.type === CardEffectType.OnCardPlayed) {
            switch (e.effect) {
              case CardEffect.AngelaBuff:
                const isAngelaPlayer = lane.playerSlots.includes(slot);
                const isPlayedCardPlayer = lane.playerSlots.some((s) => s.cardData === playedCard);

                if (isAngelaPlayer === isPlayedCardPlayer) {
                  slot.power = (slot.power ?? 0) + 1;
                  console.log(
                    `Angela ganhou +1 de poder porque ${playedCard.name} foi jogada na sua lane.`
                  );
                }
                break;
            }
          }
        }
      }
    }
  }

  private applyEndOfTurnEffect(effect: CardEffect, slot: Slot, lane: Lane): void {
    switch (effect) {
      case CardEffect.HawkeyeNextTurnBuff:
        (slot as any).hawkeyeBuffNextTurn = true;
        console.log(`Hawkeye em ${lane.index} está pronto para o buff no próximo turno.`);
        break;
    }
  }
}
