import { CardEffect } from '@/enums/CardEffect';
import { CardEffectType } from '@/enums/CardEffectType';
import { CardData } from '@/interfaces/Card';
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
  ): void {
    if (!card.effect) return;

    const lane = this.lanes[laneIndex];
    const isCosmoPresent = [...lane.playerSlots, ...lane.botSlots].some(
      (s) =>
        s.occupied && s.cardData?.effect?.some((e) => e.effect === CardEffect.CosmoBlockOnReveal)
    );

    if (isCosmoPresent) {
      console.log(`Cosmo bloqueou o efeito OnReveal de ${card.name} na lane ${laneIndex + 1}!`);
      return;
    }

    for (const e of card.effect) {
      if (e.type === CardEffectType.OnReveal) {
        switch (e.effect) {
          case CardEffect.MedusaCenterBuff:
            if (laneIndex === 1) {
              slot.power = (slot.power ?? 0) + 3;
              console.log(`Medusa ganhou +3 de poder na lane central.`);
            }
            break;

          case CardEffect.StarLordOpponentPlayedBuff: {
            const opponentName = isPlayerCard ? 'Bot' : 'Jogador';
            const opponentPlayedHere = revealQueue.some(
              (item) =>
                item.isPlayer !== isPlayerCard && // É do oponente
                item.laneIndex === laneIndex && // Na mesma lane
                item.turnPlayed === turnPlayed // No mesmo turno
            );

            if (opponentPlayedHere) {
              slot.power = (slot.power ?? 0) + 4;
              console.log(
                `Senhor das Estrelas ganhou +4 porque o ${opponentName} também jogou aqui!`
              );
            }
            break;
          }

          case CardEffect.SentinelAddToHand:
            console.log(`Efeito do Sentinela ativado, mas a lógica ainda não foi implementada.`);
            break;
        }
      }
    }
  }

  public recalcOngoingEffects(): void {
    for (const lane of this.lanes) {
      const allSlots = [...lane.playerSlots, ...lane.botSlots];
      for (const slot of allSlots) {
        if (
          slot.occupied &&
          slot.cardData?.effect?.some((e) => e.type === CardEffectType.Ongoing)
        ) {
          slot.power = slot.cardData.power;
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

    switch (effect) {
      case CardEffect.AntManBuff:
        if (friendlySlots.filter((s) => s.occupied).length >= 4) {
          targetSlot.power = (targetSlot.power ?? 0) + 3;
        }
        break;

      case CardEffect.PunisherEnemyBuff:
        const enemyCount = enemySlots.filter((s) => s.occupied).length;
        targetSlot.power = (targetSlot.power ?? 0) + enemyCount;
        break;
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
