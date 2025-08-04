import Phaser from "phaser";
import { CardData } from "../interfaces/Card";
import { Lane } from "../interfaces/Lane";
import { Slot } from "../interfaces/Slot";
import { CardContainer } from "../components/CardContainer";

export class DragAndDropManager {
  private scene: Phaser.Scene;
  private lanes: Lane[];
  private playerEnergy: number;
  private isPlayerTurn: boolean;
  private onCardPlaced: (slot: Slot, cardData: CardData) => void;
  private onCardRemovedFromHand: (index: number) => void;
  private onEnergyUpdated: () => void;
  private onLanePowersUpdated: () => void;
  private onAnimateCardReturn: (
    container: CardContainer,
    onComplete?: () => void
  ) => void;
  private onRenderPlayerHand: () => void;

  constructor(
    scene: Phaser.Scene,
    lanes: Lane[],
    playerEnergy: number,
    isPlayerTurn: boolean,
    onCardPlaced: (slot: Slot, cardData: CardData) => void,
    onCardRemovedFromHand: (index: number) => void,
    onEnergyUpdated: () => void,
    onLanePowersUpdated: () => void,
    onAnimateCardReturn: (
      container: CardContainer,
      onComplete?: () => void
    ) => void,
    onRenderPlayerHand: () => void
  ) {
    this.scene = scene;
    this.lanes = lanes;
    this.playerEnergy = playerEnergy;
    this.isPlayerTurn = isPlayerTurn;
    this.onCardPlaced = onCardPlaced;
    this.onCardRemovedFromHand = onCardRemovedFromHand;
    this.onEnergyUpdated = onEnergyUpdated;
    this.onLanePowersUpdated = onLanePowersUpdated;
    this.onAnimateCardReturn = onAnimateCardReturn;
    this.onRenderPlayerHand = onRenderPlayerHand;

    this.setupDragEvents();
  }

  private setupDragEvents(): void {
    this.scene.input.on(
      "dragstart",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        this.handleDragStart(gameObject as CardContainer);
      }
    );

    this.scene.input.on(
      "drag",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dragX: number,
        dragY: number
      ) => {
        this.handleDrag(gameObject as CardContainer, dragX, dragY);
      }
    );

    this.scene.input.on(
      "dragend",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        this.handleDragEnd(gameObject as CardContainer);
      }
    );
  }

  private handleDragStart(container: CardContainer): void {
    container.startX = container.x;
    container.startY = container.y;
    container.setScale(0.8);

    for (const lane of this.lanes) {
      for (const slot of lane.playerSlots) {
        if (!slot.occupied && slot.overlay) {
          slot.overlay.setVisible(true);
        }
      }
    }
  }

  private handleDrag(
    container: CardContainer,
    dragX: number,
    dragY: number
  ): void {
    container.x = dragX;
    container.y = dragY;
  }

  private handleDragEnd(container: CardContainer): void {
    const { x, y } = container;
    const { index, cost } = container.cardData;

    let cardPlaced = false;

    for (const lane of this.lanes) {
      if (!this.isPlayerTurn || cost > this.playerEnergy) {
        console.log(
          `O custo é menor ou não é a vez do jogador, custo ${cost}, energia ${this.playerEnergy}`
        );
        continue;
      }

      for (const slot of lane.playerSlots) {
        if (
          !slot.occupied &&
          Phaser.Math.Distance.Between(x, y, slot.x, slot.y) < 60
        ) {
          this.onCardPlaced(slot, container.cardData);
          this.onCardRemovedFromHand(index);

          this.playerEnergy -= cost;
          this.onEnergyUpdated();
          this.onLanePowersUpdated();

          cardPlaced = true;
          break;
        }
      }
      if (cardPlaced) break;
    }

    if (!cardPlaced) {
      this.onAnimateCardReturn(container);
    }

    this.hideSlotOverlays();

    if (cardPlaced) {
      this.onRenderPlayerHand();
    }
  }

  private hideSlotOverlays(): void {
    for (const lane of this.lanes) {
      for (const slot of lane.playerSlots) {
        slot.overlay?.setVisible(false);
      }
    }
  }

  // Método para atualizar a energia do jogador (chamado de fora)
  public updatePlayerEnergy(newEnergy: number): void {
    this.playerEnergy = newEnergy;
  }

  // Método para atualizar o estado do turno do jogador (chamado de fora)
  public updatePlayerTurnStatus(isPlayerTurn: boolean): void {
    this.isPlayerTurn = isPlayerTurn;
  }
}
