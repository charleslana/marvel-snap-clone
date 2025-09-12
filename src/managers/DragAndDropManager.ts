// ===== 3. MODIFICAÇÕES NO DragAndDropManager.ts =====

import Phaser from 'phaser';
import { Slot } from '@/interfaces/Slot';
import { CardContainer } from '@/components/CardContainer';
import { CardEffect } from '@/enums/CardEffect';
import { GameEventManager } from './GameEventManager';
import { GameEvent } from '@/enums/GameEvent';
import { LaneManager } from './LaneManager';
import { GameStateManager } from './GameStateManager';
import { Lane } from '@/interfaces/Lane';
import { SlotManager } from './SlotManager'; // Nova importação
import { LaneDisplay } from '@/components/LaneDisplay'; // Nova importação

export class DragAndDropManager {
  private scene: Phaser.Scene;
  private gameState: GameStateManager;
  private laneManager: LaneManager;
  private laneDisplay: LaneDisplay; // Nova propriedade
  private enabled: boolean = true;
  private draggedFromSlot: Slot | null | undefined = null;

  // CONSTRUTOR MODIFICADO: Adiciona LaneDisplay
  constructor(
    scene: Phaser.Scene,
    gameState: GameStateManager,
    laneManager: LaneManager,
    laneDisplay: LaneDisplay
  ) {
    this.scene = scene;
    this.gameState = gameState;
    this.laneManager = laneManager;
    this.laneDisplay = laneDisplay;
    this.setupDragEvents();
  }

  public enableDrag(): void {
    this.enabled = true;
  }

  public disableDrag(): void {
    this.enabled = false;
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
      this.gameState.isPlayerTurn && this.gameState.playerEnergy >= obj.cardData.cost
        ? 'grabbing'
        : 'default';
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
      container.slot;

    if (isMovable) {
      this.draggedFromSlot = container.slot;
      container.startX = container.x;
      container.startY = container.y;
      this.scene.children.bringToTop(container);
      this.toggleSlotOverlays(true, this.draggedFromSlot);
      return;
    }

    container.startX = container.x;
    container.startY = container.y;
    container.setScale(0.8);

    // NOVA IMPLEMENTAÇÃO: Mostra as zonas de drop das lanes
    this.showAvailableLaneDropZones();
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

    if (this.gameState.isPlayerTurn && cost <= this.gameState.playerEnergy) {
      // NOVA IMPLEMENTAÇÃO: Usa o sistema de lane drop zones
      cardPlaced = this.tryPlaceCardInLane(container);
    }

    if (!cardPlaced) {
      this.animateCardReturn(container);
    } else {
      GameEventManager.instance.emit(GameEvent.RenderPlayerHand, this.gameState.playerEnergy);
    }

    // NOVA IMPLEMENTAÇÃO: Esconde as zonas de drop das lanes
    this.hideAllLaneDropZones();
  }

  // NOVA FUNÇÃO: Mostra as zonas de drop das lanes disponíveis
  private showAvailableLaneDropZones(): void {
    for (const lane of this.laneManager.getLanes()) {
      if (!SlotManager.isLaneFull(lane, true)) {
        this.laneDisplay.showLaneDropZone(lane, true);
      }
    }
  }

  // NOVA FUNÇÃO: Esconde todas as zonas de drop das lanes
  private hideAllLaneDropZones(): void {
    for (const lane of this.laneManager.getLanes()) {
      this.laneDisplay.hideLaneDropZone(lane, true);
    }
  }

  // NOVA FUNÇÃO: Tenta colocar a carta em uma lane usando o sistema de zona única
  private tryPlaceCardInLane(container: CardContainer): boolean {
    const { x, y, cardData } = container;

    const targetLane = this.getLaneUnderPointer(x, y);

    if (targetLane) {
      const availableSlot = SlotManager.getNextAvailableSlot(targetLane, true);

      if (availableSlot) {
        GameEventManager.instance.emit(GameEvent.PlaceCardOnSlot, {
          slot: availableSlot,
          cardData,
        });
        GameEventManager.instance.emit(GameEvent.RemoveCardFromPlayerHand, cardData.index);
        GameEventManager.instance.emit(GameEvent.UpdateEnergy);
        this.laneManager.updateLanePowers();

        return true;
      }
    }

    return false;
  }

  // NOVA FUNÇÃO: Encontra qual lane está sob o ponteiro
  private getLaneUnderPointer(x: number, y: number): Lane | null {
    for (const lane of this.laneManager.getLanes()) {
      if (this.laneDisplay.isPointInLaneDropZone(lane, x, y, true)) {
        return lane;
      }
    }
    return null;
  }

  // Mantém as funções existentes para compatibilidade
  private tryPlaceCard(container: CardContainer): boolean {
    const { x, y, cardData } = container;
    for (const lane of this.laneManager.getLanes()) {
      for (const slot of lane.playerSlots) {
        if (!slot.occupied && Phaser.Math.Distance.Between(x, y, slot.x, slot.y) < 60) {
          GameEventManager.instance.emit(GameEvent.PlaceCardOnSlot, { slot, cardData });
          GameEventManager.instance.emit(GameEvent.RemoveCardFromPlayerHand, cardData.index);
          GameEventManager.instance.emit(GameEvent.UpdateEnergy);
          this.laneManager.updateLanePowers();

          return true;
        }
      }
    }
    return false;
  }

  private toggleSlotOverlays(visible: boolean, ignoreSlot: Slot | null = null): void {
    for (const lane of this.laneManager.getLanes()) {
      for (const slot of lane.playerSlots) {
        if (slot !== ignoreSlot) {
          slot.overlay?.setVisible(visible && !slot.occupied);
        }
      }
    }
  }

  private findValidMoveSlot(container: CardContainer): Slot | null {
    const { x, y } = container;
    for (const lane of this.laneManager.getLanes()) {
      for (const slot of lane.playerSlots) {
        if (!slot.occupied && Phaser.Math.Distance.Between(x, y, slot.x, slot.y) < 60) {
          return slot;
        }
      }
    }
    return null;
  }

  private animateCardReturn(container: CardContainer, onComplete?: () => void): void {
    this.scene.tweens.add({ targets: container, scale: 1, duration: 200, ease: 'Back.out' });
    this.scene.tweens.add({
      targets: container,
      x: container.startX,
      y: container.startY,
      duration: 300,
      ease: 'Power2.out',
      onComplete: () => {
        container.list.forEach((child) => {
          if (child instanceof Phaser.GameObjects.Text) child.setVisible(true);
        });
        onComplete?.();
      },
    });
  }
}
