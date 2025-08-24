import Phaser from 'phaser';
import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';
import { CardContainer } from '@/components/CardContainer';
import { CardEffect } from '@/enums/CardEffect';
import { GameEventManager } from './GameEventManager';
import { GameEvent } from '@/enums/GameEvent';

export class DragAndDropManager {
  private scene: Phaser.Scene;
  private lanes: Lane[];
  private playerEnergy: number;
  private isPlayerTurn: boolean;
  private enabled: boolean = true;
  private draggedFromSlot: Slot | null = null;

  private onCardRemovedFromHand: (index: number) => void;
  private onEnergyUpdated: () => void;
  private onLanePowersUpdated: () => void;
  private onAnimateCardReturn: (container: CardContainer, onComplete?: () => void) => void;

  constructor(
    scene: Phaser.Scene,
    lanes: Lane[],
    playerEnergy: number,
    isPlayerTurn: boolean,
    onCardRemovedFromHand: (index: number) => void,
    onEnergyUpdated: () => void,
    onLanePowersUpdated: () => void,
    onAnimateCardReturn: (container: CardContainer, onComplete?: () => void) => void
  ) {
    this.scene = scene;
    this.lanes = lanes;
    this.playerEnergy = playerEnergy;
    this.isPlayerTurn = isPlayerTurn;
    this.onCardRemovedFromHand = onCardRemovedFromHand;
    this.onEnergyUpdated = onEnergyUpdated;
    this.onLanePowersUpdated = onLanePowersUpdated;
    this.onAnimateCardReturn = onAnimateCardReturn;

    this.setupDragEvents();
  }

  public enableDrag(): void {
    this.enabled = true;
  }

  public disableDrag(): void {
    this.enabled = false;
  }

  public updatePlayerEnergy(newEnergy: number): void {
    this.playerEnergy = newEnergy;
  }

  public updatePlayerTurnStatus(isPlayerTurn: boolean): void {
    this.isPlayerTurn = isPlayerTurn;
  }

  private setupDragEvents(): void {
    const input = this.scene.input;

    input.on(
      'gameobjectover',
      (_pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) =>
        this.handlePointerOver(obj)
    );
    input.on(
      'gameobjectout',
      (_pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) =>
        this.handlePointerOut(obj)
    );
    input.on('dragstart', (_pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) =>
      this.handleDragStart(obj as CardContainer)
    );
    input.on(
      'drag',
      (_pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject, x: number, y: number) =>
        this.handleDrag(obj as CardContainer, x, y)
    );
    input.on('dragend', (_pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) =>
      this.handleDragEnd(obj as CardContainer)
    );
  }

  private handlePointerOver(obj: Phaser.GameObjects.GameObject): void {
    if (!(obj instanceof CardContainer)) return;
    const cursor =
      this.isPlayerTurn && this.playerEnergy >= obj.cardData.cost ? 'grabbing' : 'default';
    this.scene.input.setDefaultCursor(cursor);
  }

  private handlePointerOut(obj: Phaser.GameObjects.GameObject): void {
    if (obj instanceof CardContainer) this.scene.input.setDefaultCursor('default');
  }

  private handleDragStart(container: CardContainer): void {
    if (!this.enabled) return;

    container.setDepth(2);

    const { cardData } = container;
    const isMovable =
      cardData.effects?.some((e) => e.cardEffect === CardEffect.NightcrawlerMove) &&
      !cardData.hasMoved &&
      (container as any).slot;

    if (isMovable) {
      this.draggedFromSlot = (container as any).slot;
      container.startX = container.x;
      container.startY = container.y;
      this.scene.children.bringToTop(container);
      this.toggleSlotOverlays(true, this.draggedFromSlot);
      return;
    }

    container.startX = container.x;
    container.startY = container.y;
    container.setScale(0.8);

    this.toggleSlotOverlays(true);
  }

  private handleDrag(container: CardContainer, dragX: number, dragY: number): void {
    if (!this.enabled) return;
    container.x = dragX;
    container.y = dragY;
  }

  private handleDragEnd(container: CardContainer): void {
    if (!this.enabled) return;

    container.setDepth(0);

    if (this.draggedFromSlot) {
      const toSlot = this.findValidMoveSlot(container);
      if (toSlot && toSlot !== this.draggedFromSlot) {
        this.scene.events.emit('moveCardRequest', {
          cardContainer: container,
          fromSlot: this.draggedFromSlot,
          toSlot: toSlot,
        });
      } else {
        container.x = container.startX;
        container.y = container.startY;
      }
      this.draggedFromSlot = null;
      this.toggleSlotOverlays(false);
      return;
    }

    const { cardData } = container;
    const { cost } = cardData;
    let cardPlaced = false;

    if (this.isPlayerTurn && cost <= this.playerEnergy) {
      cardPlaced = this.tryPlaceCard(container);
    }

    if (!cardPlaced) {
      this.onAnimateCardReturn(container);
    } else {
      GameEventManager.instance.emit(GameEvent.RenderPlayerHand, this.playerEnergy);
    }

    this.toggleSlotOverlays(false);
  }

  private tryPlaceCard(container: CardContainer): boolean {
    const { x, y, cardData } = container;
    for (const lane of this.lanes) {
      for (const slot of lane.playerSlots) {
        if (!slot.occupied && Phaser.Math.Distance.Between(x, y, slot.x, slot.y) < 60) {
          GameEventManager.instance.emit(GameEvent.PlaceCardOnSlot, { slot, cardData });
          this.onCardRemovedFromHand(cardData.index);

          this.playerEnergy -= cardData.cost;
          this.onEnergyUpdated();
          this.onLanePowersUpdated();

          return true;
        }
      }
    }
    return false;
  }

  private toggleSlotOverlays(visible: boolean, ignoreSlot: Slot | null = null): void {
    for (const lane of this.lanes) {
      for (const slot of lane.playerSlots) {
        if (slot !== ignoreSlot) {
          slot.overlay?.setVisible(visible && !slot.occupied);
        }
      }
    }
  }

  private findValidMoveSlot(container: CardContainer): Slot | null {
    const { x, y } = container;
    for (const lane of this.lanes) {
      for (const slot of lane.playerSlots) {
        if (!slot.occupied && Phaser.Math.Distance.Between(x, y, slot.x, slot.y) < 60) {
          return slot;
        }
      }
    }
    return null;
  }
}
