import { LaneDisplay } from '@/components/LaneDisplay';
import { CardEffect } from '@/enums/CardEffect';
import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';
import { LogHelper } from './card-effects/helpers/LogHelper';

export class LaneManager {
  private lanes: Lane[];
  private laneDisplay!: LaneDisplay;

  constructor(lanes: Lane[], laneDisplay: LaneDisplay) {
    this.lanes = lanes;
    this.laneDisplay = laneDisplay;
  }

  public calculateLanePower(lane: Lane): { opponentPower: number; playerPower: number } {
    const playerPower = this.calculateSideTotalPower(lane.playerSlots, lane.index);
    const opponentPower = this.calculateSideTotalPower(lane.opponentSlots, lane.index);
    return { opponentPower, playerPower };
  }

  public updateLaneProperties(): void {
    for (const lane of this.lanes) {
      if (!lane.properties) lane.properties = {};
      lane.properties.cardsCannotBeDestroyed = false;

      const isArmorPresent = [...lane.playerSlots, ...lane.opponentSlots].some(
        (s) =>
          s.occupied &&
          s.cardData?.effects?.some((e) => e.cardEffect === CardEffect.ArmorPreventDestroy)
      );
      if (isArmorPresent) {
        lane.properties.cardsCannotBeDestroyed = true;
        LogHelper.emitLog(`Lane ${lane.index + 1} está protegida pela Armor!`);
      }
    }
  }

  public updateLanePowers(): void {
    for (const lane of this.lanes) {
      const { opponentPower, playerPower } = this.calculateLanePower(lane);
      lane.opponentPowerText?.setText(opponentPower.toString());
      lane.playerPowerText?.setText(playerPower.toString());
    }
  }

  public getLeadingPlayer(): 0 | 1 {
    let playerWins = 0;
    let opponentWins = 0;
    let playerDiff = 0;
    let opponentDiff = 0;

    for (const lane of this.lanes) {
      const { playerPower, opponentPower } = this.calculateLanePower(lane);
      if (playerPower > opponentPower) {
        playerWins++;
        playerDiff += playerPower - opponentPower;
      } else if (opponentPower > playerPower) {
        opponentWins++;
        opponentDiff += opponentPower - playerPower;
      }
    }

    if (playerWins > opponentWins) return 0;
    if (opponentWins > playerWins) return 1;
    if (playerDiff > opponentDiff) return 0;
    if (opponentDiff > playerDiff) return 1;
    return Phaser.Math.Between(0, 1) as 0 | 1;
  }

  public updateLaneColors(): void {
    for (const lane of this.lanes) {
      const { opponentPower, playerPower } = this.calculateLanePower(lane);
      this.laneDisplay.updateLanePowerColors(lane, playerPower, opponentPower);
    }
  }

  private calculateSideTotalPower(slots: Slot[], laneIndex: number): number {
    let totalPower = slots.reduce((sum, slot) => sum + (slot.power ?? 0), 0);
    totalPower += this.getAdjacentLaneBonus(slots, laneIndex);
    totalPower = this.applyMultiplicativeEffects(totalPower, slots, laneIndex);

    return totalPower;
  }

  private getAdjacentLaneBonus(currentLaneSlots: Slot[], currentLaneIndex: number): number {
    let totalBonus = 0;
    const isPlayerSide = this.lanes[currentLaneIndex].playerSlots === currentLaneSlots;

    totalBonus += this.checkNeighboringLaneForBonus(
      this.lanes[currentLaneIndex - 1],
      isPlayerSide,
      [CardEffect.MisterFantasticBuff, CardEffect.KlawRightBuff],
      currentLaneIndex
    );

    totalBonus += this.checkNeighboringLaneForBonus(
      this.lanes[currentLaneIndex + 1],
      isPlayerSide,
      [CardEffect.MisterFantasticBuff],
      currentLaneIndex
    );

    return totalBonus;
  }

  private checkNeighboringLaneForBonus(
    neighborLane: Lane | undefined,
    isCheckingPlayerSide: boolean,
    effectsToLookFor: CardEffect[],
    receivingLaneIndex: number
  ): number {
    if (!neighborLane) return 0;

    let bonusFromThisLane = 0;
    const neighborSlots = isCheckingPlayerSide
      ? neighborLane.playerSlots
      : neighborLane.opponentSlots;
    const sideIdentifier = isCheckingPlayerSide ? 'Jogador' : 'Oponente';

    const onslaughtCount = neighborSlots.filter(
      (slot) =>
        slot.occupied &&
        slot.cardData?.effects?.some(
          (effect) => effect.cardEffect === CardEffect.OnslaughtDoubleOngoing
        )
    ).length;
    const effectMultiplier = Math.pow(2, onslaughtCount);

    for (const slot of neighborSlots) {
      if (slot.occupied && slot.cardData?.effects) {
        for (const effect of slot.cardData.effects) {
          if (effectsToLookFor.includes(effect.cardEffect)) {
            const value = typeof effect.value === 'number' ? effect.value : 0;

            const finalBonus = value * effectMultiplier;
            bonusFromThisLane += finalBonus;

            LogHelper.emitLog(
              `Lane ${receivingLaneIndex + 1} (${sideIdentifier}) recebeu +${finalBonus} de ${slot.cardData.name} da lane ${neighborLane.index + 1}.`
            );
            if (effectMultiplier > 1) {
              LogHelper.emitLog(`(Efeito dobrado por Massacre na lane ${neighborLane.index + 1}!)`);
            }
          }
        }
      }
    }
    return bonusFromThisLane;
  }

  private applyMultiplicativeEffects(
    currentPower: number,
    slots: Slot[],
    laneIndex: number
  ): number {
    const ironManCards = slots.filter(
      (slot) =>
        slot.occupied &&
        slot.cardData?.effects?.some(
          (effect) => effect.cardEffect === CardEffect.IronManDoublePower
        )
    );

    const onslaughtCards = slots.filter(
      (slot) =>
        slot.occupied &&
        slot.cardData?.effects?.some(
          (effect) => effect.cardEffect === CardEffect.OnslaughtDoubleOngoing
        )
    );

    if (ironManCards.length === 0) {
      return currentPower;
    }

    const ironManEffectApplications = Math.pow(2, onslaughtCards.length);
    const finalMultiplier = Math.pow(2, ironManCards.length * ironManEffectApplications);

    if (finalMultiplier > 1) {
      const sources: string[] = [];
      if (ironManCards.length > 0) {
        sources.push(`Homem de Ferro x${ironManCards.length}`);
      }
      if (onslaughtCards.length > 0) {
        sources.push(`Massacre x${onslaughtCards.length}`);
      }

      const sourcesText = sources.join(' e ');

      LogHelper.emitLog(
        `Poder da lane ${laneIndex + 1} multiplicado por ${finalMultiplier}x devido a ${sourcesText}!`
      );

      return currentPower * finalMultiplier;
    }

    return currentPower;
  }
}
