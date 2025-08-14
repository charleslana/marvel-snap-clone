import { CardEffect } from '@/enums/CardEffect';
import { CardEffectType } from '@/enums/CardEffectType';
import { CardData } from '@/interfaces/Card';
import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';

export class CardEffectManager {
  constructor(private lanes: Lane[]) {}

  // --- INÍCIO DA ADIÇÃO ---

  /**
   * Aplica os efeitos "Ao Revelar" (OnReveal) de uma carta específica.
   * Esta função deve ser chamada no momento em que a carta é jogada e revelada.
   * @param card A carta que foi jogada.
   * @param laneIndex O índice da lane onde a carta foi jogada.
   * @param slot O slot específico onde a carta foi colocada.
   */
  public applyOnRevealEffect(card: CardData, laneIndex: number, slot: Slot): void {
    if (!card.effect) return; // Sai se a carta não tiver efeitos

    const lane = this.lanes[laneIndex];

    // Verifica se a lane está bloqueada por um Cosmo
    const isCosmoPresent = [...lane.playerSlots, ...lane.botSlots].some(
      (s) =>
        s.occupied && s.cardData?.effect?.some((e) => e.effect === CardEffect.CosmoBlockOnReveal)
    );

    if (isCosmoPresent) {
      console.log(`Cosmo bloqueou o efeito OnReveal de ${card.name} na lane ${laneIndex + 1}!`);
      return; // Bloqueia a execução do efeito
    }

    for (const e of card.effect) {
      if (e.type === CardEffectType.OnReveal) {
        switch (e.effect) {
          case CardEffect.MedusaCenterBuff:
            // A Medusa ganha poder se estiver na lane do meio (índice 1)
            if (laneIndex === 1) {
              slot.power = (slot.power ?? 0) + 3;
              console.log(`Medusa ganhou +3 de poder na lane central.`);
            }
            break;

          case CardEffect.StarLordOpponentPlayedBuff:
            // Verifica se o oponente jogou uma carta na mesma lane neste turno.
            const opponentPlayedHere = lane.botSlots.some(
              (s) => s.occupied && (s.cardData as any).turnPlayed === (card as any).turnPlayed
            );
            if (opponentPlayedHere) {
              slot.power = (slot.power ?? 0) + 4;
              console.log(`Senhor das Estrelas ganhou +4 de poder!`);
            }
            break;

          // Adicione outros casos de efeitos 'OnReveal' aqui...
        }
      }
    }
  }

  // --- FIM DA ADIÇÃO ---

  public recalcOngoingEffects(): void {
    // 1. Reseta o poder APENAS das cartas que TÊM um efeito Ongoing.
    // Cartas como a Angela serão ignoradas por este passo, preservando seu poder.
    for (const lane of this.lanes) {
      const allSlots = [...lane.playerSlots, ...lane.botSlots];
      for (const slot of allSlots) {
        if (
          slot.occupied &&
          slot.cardData?.effect?.some((e) => e.type === CardEffectType.Ongoing)
        ) {
          // Esta carta tem um efeito Ongoing, então resetamos seu poder para o base
          // para evitar acumular o bônus Ongoing várias vezes.
          slot.power = slot.cardData.power;
        }
      }
    }

    // 2. AGORA, reaplica todos os efeitos constantes (Ongoing) sobre os poderes já existentes.
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
              // Esta função agora deve ADICIONAR o bônus, não definir o poder.
              this.applyOngoingEffect(e.effect, slot, laneIndex, isPlayerCard);
            }
          }
        }
      }
    }
  }

  // Modifique applyOngoingEffect para ADICIONAR poder
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
        // O efeito é no próprio Homem-Formiga (targetSlot)
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

  /**
   * Aplica efeitos de Fim de Turno.
   * (Sua lógica atual para Hawkeye parece correta, marcando para o próximo turno)
   */
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

  /**
   * Aciona efeitos que respondem a uma carta sendo jogada.
   * @param playedCard A carta que acabou de ser jogada.
   * @param laneIndex O índice da lane onde a carta foi jogada.
   */
  public triggerOnCardPlayedEffects(playedCard: CardData, laneIndex: number): void {
    const lane = this.lanes[laneIndex];
    const allSlotsInLane = [...lane.playerSlots, ...lane.botSlots];

    // Itera por TODAS as cartas na mesma lane para ver se alguma delas reage.
    for (const slot of allSlotsInLane) {
      // Ignora slots vazios ou a própria carta que acabou de ser jogada.
      if (!slot.occupied || !slot.cardData || slot.cardData === playedCard) {
        continue;
      }

      // Verifica se a carta no slot tem um efeito do tipo OnCardPlayed.
      if (slot.cardData.effect?.some((e) => e.type === CardEffectType.OnCardPlayed)) {
        // Se tiver, aplica o efeito específico.
        for (const e of slot.cardData.effect) {
          if (e.type === CardEffectType.OnCardPlayed) {
            switch (e.effect) {
              case CardEffect.AngelaBuff:
                // A Angela (que está no 'slot') ganha poder porque a 'playedCard' foi jogada aqui.
                // Apenas se a carta jogada for do mesmo jogador que a Angela.
                const isAngelaPlayer = lane.playerSlots.includes(slot);
                const isPlayedCardPlayer = lane.playerSlots.some((s) => s.cardData === playedCard);

                if (isAngelaPlayer === isPlayedCardPlayer) {
                  slot.power = (slot.power ?? 0) + 1;
                  console.log(
                    `Angela ganhou +1 de poder porque ${playedCard.name} foi jogada na sua lane.`
                  );
                }
                break;

              // Adicione outros efeitos 'OnCardPlayed' aqui no futuro.
            }
          }
        }
      }
    }
  }

  private applyEndOfTurnEffect(effect: CardEffect, slot: Slot, lane: Lane): void {
    switch (effect) {
      case CardEffect.HawkeyeNextTurnBuff:
        // A lógica de marcar a carta para receber o buff no próximo turno está conceitualmente correta.
        // Você precisará de uma lógica no início do turno para verificar essa flag e aplicar o poder.
        (slot as any).hawkeyeBuffNextTurn = true;
        console.log(`Hawkeye em ${lane.index} está pronto para o buff no próximo turno.`);
        break;

      // Adicione outros casos de efeitos 'EndOfTurn' aqui...
    }
  }

  // Mantenha suas funções de OnReveal como estão, pois parecem ser chamadas no momento certo (quando a carta é jogada).
}
