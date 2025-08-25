import { LaneDisplay } from '@/components/LaneDisplay';
import { CardEffect } from '@/enums/CardEffect';
import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';
import { LogHelper } from './card-effects/helpers/LogHelper';
import { GameStateManager } from './GameStateManager';
import Phaser from 'phaser'; // Importe o Phaser para acessar a Scene
import { LaneEffectManager } from './LaneEffectManager';

export class LaneManager {
  private gameState: GameStateManager;
  private laneDisplay: LaneDisplay;
  private scene: Phaser.Scene; // Adicionamos uma referência à cena para usar o tween manager
  private effectManager: LaneEffectManager;

  constructor(
    gameState: GameStateManager,
    laneDisplay: LaneDisplay,
    effectManager: LaneEffectManager
  ) {
    this.gameState = gameState;
    this.laneDisplay = laneDisplay;
    this.scene = laneDisplay['scene']; // Acessa a cena a partir do LaneDisplay
    this.effectManager = effectManager;
  }

  public calculateLanePower(lane: Lane): { opponentPower: number; playerPower: number } {
    const playerPower = this.calculateSideTotalPower(lane.playerSlots, lane.index);
    const opponentPower = this.calculateSideTotalPower(lane.opponentSlots, lane.index);
    return { opponentPower, playerPower };
  }

  public updateLaneProperties(): void {
    for (const lane of this.gameState.lanes) {
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
    for (const lane of this.gameState.lanes) {
      const { opponentPower, playerPower } = this.calculateLanePower(lane);

      // Verifica se o poder mudou antes de atualizar e animar
      const playerPowerChanged = lane.playerPowerText?.text !== playerPower.toString();
      const opponentPowerChanged = lane.opponentPowerText?.text !== opponentPower.toString();

      if (playerPowerChanged) {
        lane.playerPowerText?.setText(playerPower.toString());
      }
      if (opponentPowerChanged) {
        lane.opponentPowerText?.setText(opponentPower.toString());
      }

      // --- CORREÇÃO ADICIONADA AQUI ---
      // Se qualquer um dos poderes da lane mudou, aplica a animação.
      if ((playerPowerChanged || opponentPowerChanged) && lane.worldContainer) {
        this.animateWorldContainer(lane.worldContainer);
      }
    }
  }

  // --- NOVO MÉTODO PARA A ANIMAÇÃO ---
  private animateWorldContainer(container: Phaser.GameObjects.Container): void {
    // Animação de "pulso" - a mesma lógica do botão de turno
    this.scene.tweens.add({
      targets: container,
      scaleX: 1.05, // Um pouco maior na largura
      scaleY: 1.05, // Um pouco maior na altura
      alpha: 0.8, // Levemente transparente
      duration: 150, // Duração curta para um efeito de "pop"
      yoyo: true, // Faz a animação voltar ao estado original
      ease: 'Quad.easeInOut', // Curva de animação suave
    });
  }

  public getLeadingPlayer(): 0 | 1 {
    let playerWins = 0;
    let opponentWins = 0;
    let playerDiff = 0;
    let opponentDiff = 0;

    for (const lane of this.gameState.lanes) {
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
    for (const lane of this.gameState.lanes) {
      const { opponentPower, playerPower } = this.calculateLanePower(lane);
      this.laneDisplay.updateLanePowerColors(lane, playerPower, opponentPower);
    }
  }

  public getLanes(): Lane[] {
    return this.gameState.lanes;
  }

  private calculateSideTotalPower(slots: Slot[], laneIndex: number): number {
    const lane = this.gameState.lanes[laneIndex];
    let totalPower = slots.reduce((sum, slot) => sum + (slot.power ?? 0), 0);

    // --- INTEGRAÇÃO AQUI ---
    // 1. Aplica o bônus do efeito da lane
    totalPower += this.effectManager.getPowerBonusForLane(slots, lane);

    // 2. Aplica outros bônus (adjacentes, etc.)
    totalPower += this.getAdjacentLaneBonus(slots, laneIndex);
    totalPower = this.applyMultiplicativeEffects(totalPower, slots, laneIndex);

    return totalPower;
  }

  private getAdjacentLaneBonus(currentLaneSlots: Slot[], currentLaneIndex: number): number {
    let totalBonus = 0;
    const isPlayerSide = this.gameState.lanes[currentLaneIndex].playerSlots === currentLaneSlots;

    totalBonus += this.checkNeighboringLaneForBonus(
      this.gameState.lanes[currentLaneIndex - 1],
      isPlayerSide,
      [CardEffect.MisterFantasticBuff, CardEffect.KlawRightBuff],
      currentLaneIndex
    );

    totalBonus += this.checkNeighboringLaneForBonus(
      this.gameState.lanes[currentLaneIndex + 1],
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
              `Lane ${receivingLaneIndex + 1} (${sideIdentifier}) recebeu +${finalBonus} de ${
                slot.cardData.name
              } da lane ${neighborLane.index + 1}.`
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
