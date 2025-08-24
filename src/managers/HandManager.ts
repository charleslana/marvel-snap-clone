import { CardContainer } from '@/components/CardContainer';
import { CardEffect } from '@/enums/CardEffect';
import { Card } from '@/interfaces/Card';
import { LogHelper } from './card-effects/helpers/LogHelper';
import { GameEvent } from '@/enums/GameEvent';
import { GameEventManager } from './GameEventManager';
import { LaneManager } from './LaneManager';
import { DragAndDropManager } from './DragAndDropManager';

export class HandManager {
  public playerHand: Card[] = [];
  public playerDeckMutable: Card[] = [];
  public opponentHand: Card[] = [];
  public opponentDeckMutable: Card[] = [];
  public playerHandContainers: CardContainer[] = [];
  public opponentHandContainers: CardContainer[] = [];

  private scene: Phaser.Scene;
  private laneManager: LaneManager;
  private initialHandSize = 4;

  constructor(scene: Phaser.Scene, laneManager: LaneManager) {
    this.scene = scene;
    this.laneManager = laneManager;
  }

  public initialize(playerDeck: Card[], opponentDeck: Card[]): void {
    this.playerDeckMutable = [...playerDeck];
    this.opponentDeckMutable = [...opponentDeck];
    this.playerHand = this.drawInitialHand(this.playerDeckMutable, this.initialHandSize);
    this.opponentHand = this.drawInitialHand(this.opponentDeckMutable, this.initialHandSize);

    // events
    GameEventManager.instance.on(GameEvent.RenderPlayerHand, (playerEnergy: number) => {
      this.renderPlayerHand(playerEnergy);
    });
    GameEventManager.instance.on(GameEvent.RenderOpponentHand, (showOpponentHand: boolean) => {
      this.renderOpponentHand(showOpponentHand);
    });
  }

  public clear(): void {
    this.playerHand = [];
    this.opponentHand = [];
    this.playerDeckMutable = [];
    this.opponentDeckMutable = [];
    this.playerHandContainers = [];
    this.opponentHandContainers = [];
    GameEventManager.instance.off(GameEvent.RenderPlayerHand);
    GameEventManager.instance.off(GameEvent.RenderOpponentHand);
  }

  public renderPlayerHand(playerEnergy: number): void {
    this.clearContainers(this.playerHandContainers);
    const { width, height } = this.scene.scale;
    const handY = height - 120;
    this.playerHand.forEach((card, index) => {
      const x = this.cardXPosition(width, this.playerHand.length, index);
      const cardContainer = new CardContainer(
        this.scene,
        x,
        handY,
        100,
        140,
        0x0088ff,
        card,
        index
      );
      cardContainer.setInteractivity('draggable');
      this.scene.add.existing(cardContainer);
      this.playerHandContainers.push(cardContainer);
    });
    this.updatePlayableCardsBorder(playerEnergy);
  }

  public renderOpponentHand(showOpponentHand: boolean): void {
    this.clearContainers(this.opponentHandContainers);
    const { width } = this.scene.scale;
    const handY = 100;
    this.opponentHand.forEach((card, index) => {
      const x = this.cardXPosition(width, this.opponentHand.length, index);
      const cardContainer = new CardContainer(
        this.scene,
        x,
        handY,
        100,
        140,
        0xff0000,
        card,
        index
      );
      cardContainer.setInteractivity('none');
      this.scene.add.existing(cardContainer);
      this.opponentHandContainers.push(cardContainer);
      this.revealOpponentHand(showOpponentHand);
    });
  }

  public drawCardForPlayer(isPlayer: boolean): void {
    const hand = isPlayer ? this.playerHand : this.opponentHand;
    const deck = isPlayer ? this.playerDeckMutable : this.opponentDeckMutable;
    if (hand.length >= 7) return;
    if (deck.length === 0) return;
    const card = deck.shift()!;
    hand.push(card);
  }

  public addCardToHand(card: Card, isPlayer: boolean, maxTurn: number): void {
    const targetHand = isPlayer ? this.playerHand : this.opponentHand;

    if (targetHand.length < maxTurn) {
      targetHand.push(card);
      console.log(`${card.name} adicionado à mão de ${isPlayer ? 'Jogador' : 'Bot'}.`);
      GameEventManager.instance.emit(GameEvent.PlacedCardsUI);
      this.laneManager.updateLanePowers();
      return;
    }
    LogHelper.emitLog(
      `Mão de ${isPlayer ? 'Jogador' : 'Bot'} está cheia. ${card.name} não foi adicionado.`
    );
  }

  public disablePlayerCardInteraction(
    placedCardContainers: CardContainer[],
    dragAndDropManager: DragAndDropManager
  ): void {
    this.playerHandContainers.forEach((container) => container.disablePlayableBorder());
    dragAndDropManager.disableDrag();
    placedCardContainers.forEach((container) => container.disableMovableBorder());
  }

  public updatePlayableCardsBorder(playerEnergy: number): void {
    this.playerHandContainers.forEach((container) => {
      container.cardData.cost <= playerEnergy
        ? container.enablePlayableBorder()
        : container.disablePlayableBorder();
    });
  }

  private drawInitialHand(deck: Card[], count: number): Card[] {
    const hand: Card[] = [];
    const deckCopy = [...deck];

    const quicksilverIndex = deckCopy.findIndex((card) =>
      card.effects?.some((effect) => effect.cardEffect === CardEffect.QuicksilverStartInHand)
    );

    if (quicksilverIndex > -1) {
      const [quicksilverCard] = deckCopy.splice(quicksilverIndex, 1);
      hand.push(quicksilverCard);
      LogHelper.emitLog(`${quicksilverCard.name} foi garantido na mão inicial.`);
    }

    for (let i = deckCopy.length - 1; i > 0; i--) {
      const j = Phaser.Math.Between(0, i);
      [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
    }

    const cardsToDraw = count - hand.length;
    for (let i = 0; i < cardsToDraw; i++) {
      if (deckCopy.length > 0) {
        hand.push(deckCopy.shift()!);
      }
    }

    deck.length = 0;
    Array.prototype.push.apply(deck, deckCopy);

    return hand;
  }

  private clearContainers(list: CardContainer[]): void {
    list.forEach((c) => c.destroy());
    list.length = 0;
  }

  private cardXPosition(screenWidth: number, totalCards: number, index: number): number {
    const cardWidth = 100;
    const cardSpacing = 30;
    const totalWidth = cardWidth * totalCards + cardSpacing * (totalCards - 1);
    const startX = (screenWidth - totalWidth) / 2;
    return startX + index * (cardWidth + cardSpacing);
  }

  private revealOpponentHand(showOpponentHand: boolean): void {
    if (!showOpponentHand) return;
    this.opponentHandContainers.forEach((container) => {
      container.setRevealed(true);
      container.setInteractivity('hover');
    });
  }
}
