import Phaser from 'phaser';
import { CardData, Card } from '@/interfaces/Card';
import { Slot } from '@/interfaces/Slot';
import { CardContainer } from '@/components/CardContainer';
import { GameStateManager } from './GameStateManager';
import { GameEventManager } from './GameEventManager';
import { GameEvent } from '@/enums/GameEvent';
import { HandManager } from './HandManager';
import { LaneManager } from './LaneManager';
import { RevealQueueItem } from '@/interfaces/RevealQueueItem';

export class CardPlacementManager {
  private scene: Phaser.Scene;
  private gameState: GameStateManager;
  private handManager: HandManager;
  private laneManager: LaneManager;

  constructor(
    scene: Phaser.Scene,
    gameState: GameStateManager,
    handManager: HandManager,
    laneManager: LaneManager
  ) {
    this.scene = scene;
    this.gameState = gameState;
    this.handManager = handManager;
    this.laneManager = laneManager;
  }

  /**
   * Coloca uma carta do jogador em um slot
   */
  public placePlayerCard(slot: Slot, cardData: CardData): boolean {
    if (!this.canPlaceCard(slot, cardData, true)) {
      return false;
    }

    const cardContainer = this.createCardContainer(slot, cardData, 0x0088ff, true);
    this.setupCardContainer(cardContainer, slot, cardData, true);

    // Atualiza estado
    this.gameState.modifyPlayerEnergy(-cardData.cost);
    this.addToRevealQueue(cardData, slot, true);

    // Eventos
    GameEventManager.instance.emit(GameEvent.UpdateEnergy);

    return true;
  }

  /**
   * Coloca uma carta do oponente em um slot
   */
  public placeOpponentCard(slot: Slot, card: Card): boolean {
    const cardData: CardData = { ...card, index: -1 };

    if (!this.canPlaceCard(slot, cardData, false)) {
      return false;
    }

    const cardContainer = this.createCardContainer(slot, cardData, 0xff0000, false);
    this.setupCardContainer(cardContainer, slot, cardData, false);

    // Atualiza estado
    this.gameState.modifyOpponentEnergy(-cardData.cost);

    // Remove da mão do oponente
    const indexInHand = this.handManager.opponentHand.indexOf(card);
    if (indexInHand >= 0) {
      this.handManager.opponentHand.splice(indexInHand, 1);
    }

    this.addToRevealQueue(cardData, slot, false);

    return true;
  }

  /**
   * Remove uma carta colocada (apenas jogador pode fazer isso)
   */
  public removePlayerCard(container: CardContainer): boolean {
    const turnPlayed = container.turnPlayed as number;

    // Só pode remover cartas jogadas no turno atual
    if (turnPlayed !== this.gameState.currentTurn) {
      console.log('Carta jogada em turno anterior. Não pode voltar.');
      return false;
    }

    const slot = container.slot as Slot;
    const cardData = container.cardData as Card;

    // Refund da energia
    this.gameState.modifyPlayerEnergy(container.cardData.cost);

    // Remove da fila de revelação
    this.removeFromRevealQueue(cardData, slot);

    // Limpa o slot
    this.clearSlot(slot);

    // Retorna carta para a mão
    this.returnCardToHand(container, cardData);

    // Remove container
    this.gameState.removePlacedCardContainer(container);
    container.destroy();

    // Updates
    this.laneManager.updateLanePowers();
    this.handManager.renderPlayerHand(this.gameState.playerEnergy);

    // UI Updates
    GameEventManager.instance.emit(GameEvent.UpdateEnergy);

    return true;
  }

  /**
   * Verifica se uma carta pode ser colocada em um slot
   */
  public canPlaceCard(slot: Slot, card: CardData, isPlayer: boolean): boolean {
    if (slot.occupied) return false;

    const energy = isPlayer ? this.gameState.playerEnergy : this.gameState.opponentEnergy;
    return card.cost <= energy;
  }

  /**
   * Obtém todas as cartas colocadas
   */
  public getPlacedCards(): CardContainer[] {
    return this.gameState.placedCardContainers;
  }

  /**
   * Atualiza a UI de todas as cartas colocadas
   */
  public updatePlacedCardsUI(): void {
    this.gameState.placedCardContainers.forEach((container) => {
      const slot = container.slot;
      if (slot && slot.occupied && slot.power !== undefined) {
        container.updatePower(slot.power);
      }
    });
  }

  private createCardContainer(
    slot: Slot,
    cardData: CardData,
    color: number,
    isPlayer: boolean
  ): CardContainer {
    const cardContainer = new CardContainer(
      this.scene,
      slot.x,
      slot.y,
      80,
      110,
      color,
      cardData,
      isPlayer ? -1 : cardData.index
    );

    cardContainer.setInteractivity('hover');
    this.scene.add.existing(cardContainer);

    return cardContainer;
  }

  private setupCardContainer(
    cardContainer: CardContainer,
    slot: Slot,
    cardData: CardData,
    isPlayer: boolean
  ): void {
    // Configurações do container
    cardContainer.placed = true;
    cardContainer.slot = slot;
    cardContainer.cardData = cardData;
    cardContainer.turnPlayed = this.gameState.currentTurn;

    // Configurações do slot
    slot.occupied = true;
    slot.power = cardData.power;
    slot.cardData = cardData;
    slot.permanentBonus = 0;

    // Adiciona interatividade apenas para cartas do jogador
    if (isPlayer) {
      cardContainer.setInteractive({ useHandCursor: true });
      cardContainer.on('pointerdown', () => this.removePlayerCard(cardContainer));
    }

    // Adiciona ao gerenciador de estado
    this.gameState.addPlacedCardContainer(cardContainer);
  }

  private addToRevealQueue(cardData: CardData, slot: Slot, isPlayer: boolean): void {
    const laneIndex = this.findLaneIndex(slot, isPlayer);

    if (laneIndex !== -1) {
      const revealItem: RevealQueueItem = {
        card: cardData,
        laneIndex,
        slot,
        isPlayer,
        turnPlayed: this.gameState.currentTurn,
      };

      this.gameState.addToRevealQueue(revealItem);
    }
  }

  private removeFromRevealQueue(cardData: Card, slot: Slot): void {
    const queueItem = this.gameState.revealQueue.find(
      (item) => item.card === cardData && item.slot === slot
    );

    if (queueItem) {
      this.gameState.removeFromRevealQueue(queueItem);
      console.log(`Carta ${cardData.name} removida da fila de revelação.`);
    }
  }

  private findLaneIndex(slot: Slot, isPlayer: boolean): number {
    return this.gameState.lanes.findIndex((lane) => {
      const slots = isPlayer ? lane.playerSlots : lane.opponentSlots;
      return slots.includes(slot);
    });
  }

  private clearSlot(slot: Slot): void {
    slot.occupied = false;
    delete slot.power;
    delete slot.cardData;
    delete slot.permanentBonus;
  }

  private returnCardToHand(container: CardContainer, cardData: Card): void {
    const originalIndex = container.cardData.index;

    const cardToReturn: Card = {
      id: cardData.id,
      name: cardData.name,
      cost: cardData.cost,
      power: cardData.power,
      description: cardData.description,
      effects: cardData.effects,
      image: cardData.image,
    };

    if (originalIndex !== undefined && originalIndex >= 0) {
      this.handManager.playerHand.splice(originalIndex, 0, cardToReturn);
    } else {
      this.handManager.playerHand.push(cardToReturn);
    }
  }
}
