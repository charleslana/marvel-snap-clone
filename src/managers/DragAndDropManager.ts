import Phaser from 'phaser';
import { Slot } from '@/interfaces/Slot';
import { CardContainer } from '@/components/CardContainer';
import { CardEffect } from '@/enums/CardEffect';
import { GameEventManager } from './GameEventManager';
import { GameEvent } from '@/enums/GameEvent';
import { LaneManager } from './LaneManager';
import { GameStateManager } from './GameStateManager';
import { Lane } from '@/interfaces/Lane';
import { SlotManager } from './SlotManager';
import { LaneDisplay } from '@/components/LaneDisplay';

export class DragAndDropManager {
  private scene: Phaser.Scene;
  private gameState: GameStateManager;
  private laneManager: LaneManager;
  private laneDisplay: LaneDisplay;
  private enabled: boolean = true;
  private draggedFromSlot: Slot | null | undefined = null;

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

      // MODIFICAÇÃO: Usa zonas de drop para movimento também
      this.showAvailableMovementLaneDropZones(container);
      return;
    }

    container.startX = container.x;
    container.startY = container.y;
    container.setScale(0.8);

    // Mostra as zonas de drop das lanes para cartas novas
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

    // MODIFICAÇÃO: Usa o novo sistema para movimento do Nightcrawler
    if (this.draggedFromSlot) {
      const targetLane = this.getLaneUnderPointer(container.x, container.y);

      if (targetLane) {
        const targetSlot = SlotManager.getNextAvailableSlot(targetLane, true);

        if (targetSlot && targetSlot !== this.draggedFromSlot) {
          // Usa o sistema de eventos para mover a carta
          this.scene.events.emit('moveCardRequest', {
            cardContainer: container,
            fromSlot: this.draggedFromSlot,
            toSlot: targetSlot,
          });
        } else {
          // Retorna para a posição original
          container.x = container.startX;
          container.y = container.startY;
        }
      } else {
        // Retorna para a posição original se não encontrou lane válida
        container.x = container.startX;
        container.y = container.startY;
      }

      this.draggedFromSlot = null;
      this.hideAllLaneDropZones();
      return;
    }

    const { cardData } = container;
    const { cost } = cardData;
    let cardPlaced = false;

    if (this.gameState.isPlayerTurn && cost <= this.gameState.playerEnergy) {
      cardPlaced = this.tryPlaceCardInLane(container);
    }

    if (!cardPlaced) {
      this.animateCardReturn(container);
    } else {
      GameEventManager.instance.emit(GameEvent.RenderPlayerHand, this.gameState.playerEnergy);
    }

    this.hideAllLaneDropZones();
  }

  // NOVA FUNÇÃO: Mostra zonas de drop disponíveis para movimento do Nightcrawler
  private showAvailableMovementLaneDropZones(container: CardContainer): void {
    const currentSlot = container.slot;
    if (!currentSlot) return;

    // Encontra a lane atual do Nightcrawler
    const currentLane = this.laneManager
      .getLanes()
      .find(
        (lane) => lane.playerSlots.includes(currentSlot) || lane.opponentSlots.includes(currentSlot)
      );

    const isPlayerCard = currentLane?.playerSlots.includes(currentSlot) || false;

    for (const lane of this.laneManager.getLanes()) {
      // Pula a lane atual
      if (lane === currentLane) continue;

      // Verifica se tem espaço disponível na lane
      const hasAvailableSlot = isPlayerCard
        ? lane.playerSlots.some((slot) => !slot.occupied)
        : lane.opponentSlots.some((slot) => !slot.occupied);

      if (hasAvailableSlot) {
        // Mostra a zona de drop apropriada (player ou opponent)
        this.laneDisplay.showLaneDropZone(lane, isPlayerCard);
      }
    }
  }

  // Mostra as zonas de drop das lanes disponíveis para cartas novas
  private showAvailableLaneDropZones(): void {
    for (const lane of this.laneManager.getLanes()) {
      if (!SlotManager.isLaneFull(lane, true)) {
        this.laneDisplay.showLaneDropZone(lane, true);
      }
    }
  }

  // Esconde todas as zonas de drop das lanes
  private hideAllLaneDropZones(): void {
    for (const lane of this.laneManager.getLanes()) {
      this.laneDisplay.hideLaneDropZone(lane, true);
      this.laneDisplay.hideLaneDropZone(lane, false); // Esconde também do oponente
    }
  }

  // Tenta colocar a carta em uma lane usando o sistema de zona única
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

  // Encontra qual lane está sob o ponteiro
  private getLaneUnderPointer(x: number, y: number): Lane | null {
    for (const lane of this.laneManager.getLanes()) {
      // Verifica tanto a zona do player quanto do oponente
      if (
        this.laneDisplay.isPointInLaneDropZone(lane, x, y, true) ||
        this.laneDisplay.isPointInLaneDropZone(lane, x, y, false)
      ) {
        return lane;
      }
    }
    return null;
  }

  // === FUNÇÕES REMOVIDAS/SUBSTITUÍDAS ===
  // Estas funções não são mais necessárias com o novo sistema:

  // REMOVIDA: toggleSlotOverlays - não usamos mais overlays individuais
  // REMOVIDA: findValidMoveSlot - substituída por getLaneUnderPointer + SlotManager
  // REMOVIDA: tryPlaceCard - substituída por tryPlaceCardInLane

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
