import Phaser from 'phaser';
import { Card } from '@/interfaces/Card';
import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';
import { GameEventManager } from './GameEventManager';
import { GameEvent } from '@/enums/GameEvent';
import { GameStateManager } from './GameStateManager';
import { HandManager } from './HandManager';

export class BotAIManager {
  private scene: Phaser.Scene;
  private gameState: GameStateManager;
  private handManager: HandManager;

  // CORREÇÃO: Construtor ajustado para 3 argumentos.
  constructor(scene: Phaser.Scene, gameState: GameStateManager, handManager: HandManager) {
    this.scene = scene;
    this.gameState = gameState;
    this.handManager = handManager;
  }

  public executeTurn(
    onCardPlayed: (slot: Slot, card: Card) => void,
    onLanePowersUpdated: () => void
  ): void {
    // CORREÇÃO: Obtém dados do bot diretamente dos managers de estado.
    const botHand = this.handManager.opponentHand;
    let botEnergy = this.gameState.opponentEnergy;

    const playableCards = botHand
      .filter((c) => c.cost <= botEnergy)
      .sort((a, b) => b.power - a.power);

    for (const card of playableCards) {
      if (card.cost > botEnergy) continue;

      const lanesByPriority = this.getLanesByPriority();

      const played = this.tryPlayCardOnPrioritizedLane(
        card,
        lanesByPriority,
        onCardPlayed,
        botEnergy
      );

      if (!played) {
        botEnergy = this.playCardOnAnyAvailableSlot(card, onCardPlayed, botEnergy);
      } else {
        botEnergy -= card.cost;
      }

      if (botEnergy <= 0) break;
    }

    GameEventManager.instance.emit(GameEvent.RenderOpponentHand, this.gameState.showOpponentHand);
    onLanePowersUpdated();
  }

  // CORREÇÃO: Funções de update removidas, pois o estado é lido na hora.
  // public updateBotEnergy(newEnergy: number): void { ... }
  // public updateBotHand(newHand: Card[]): void { ... }

  private getLanesByPriority(): Array<{
    lane: Lane;
    botPower: number;
    playerPower: number;
    difference: number;
  }> {
    return this.gameState.lanes
      .map((lane) => {
        const { botPower, playerPower } = this.calculateLanePower(lane);
        return { lane, botPower, playerPower, difference: botPower - playerPower };
      })
      .sort((a, b) => a.difference - b.difference);
  }

  private calculateLanePower(lane: Lane): { botPower: number; playerPower: number } {
    const botPower = lane.opponentSlots.reduce((sum, s) => sum + (s.power ?? 0), 0);
    const playerPower = lane.playerSlots.reduce((sum, s) => sum + (s.power ?? 0), 0);
    return { botPower, playerPower };
  }

  private tryPlayCardOnPrioritizedLane(
    card: Card,
    lanesByPriority: Array<{ lane: Lane; botPower: number; playerPower: number }>,
    onCardPlayed: (slot: Slot, card: Card) => void,
    currentEnergy: number
  ): boolean {
    if (card.cost > currentEnergy) return false;

    for (const laneItem of lanesByPriority) {
      const slot = laneItem.lane.opponentSlots.find((s) => !s.occupied);
      if (!slot) continue;

      const willOverpower =
        (laneItem.botPower <= laneItem.playerPower &&
          laneItem.botPower + card.power > laneItem.playerPower) ||
        laneItem.botPower > laneItem.playerPower;

      if (willOverpower) {
        this.playCardOnSlot(slot, card, onCardPlayed);
        return true;
      }
    }
    return false;
  }

  private playCardOnSlot(
    slot: Slot,
    card: Card,
    onCardPlayed: (slot: Slot, card: Card) => void
  ): void {
    onCardPlayed(slot, card);

    slot.occupied = true;
    slot.power = card.power;

    const index = this.handManager.opponentHand.indexOf(card);
    if (index >= 0) this.handManager.opponentHand.splice(index, 1);
  }

  private playCardOnAnyAvailableSlot(
    card: Card,
    onCardPlayed: (slot: Slot, card: Card) => void,
    currentEnergy: number
  ): number {
    if (card.cost > currentEnergy) return currentEnergy;

    for (const lane of this.gameState.lanes) {
      const slot = lane.opponentSlots.find((s) => !s.occupied);
      if (slot) {
        this.playCardOnSlot(slot, card, onCardPlayed);
        return currentEnergy - card.cost;
      }
    }
    return currentEnergy;
  }
}
