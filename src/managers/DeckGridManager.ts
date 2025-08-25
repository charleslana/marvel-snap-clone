import Phaser from 'phaser';
import { CardContainer } from '@/components/CardContainer';
import { ScrollableContainer } from '@/components/ScrollableContainer';
import { Card } from '@/interfaces/Card';
import { DeckManager } from './DeckManager';
import { GameEventManager } from './GameEventManager';
import { GameEvent } from '@/enums/GameEvent';

export class DeckGridManager {
  private scene: Phaser.Scene;
  private deckManager: DeckManager;

  private deckGridContainer!: Phaser.GameObjects.Container;
  private availableCardsGrid!: ScrollableContainer;

  public onCardHover?: (card: CardContainer) => void;
  public onCardHoverEnd?: () => void;

  constructor(scene: Phaser.Scene, deckManager: DeckManager) {
    this.scene = scene;
    this.deckManager = deckManager;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    console.log('Grid Manager configurando listeners globais');
    const events = GameEventManager.instance;

    events.on(GameEvent.DeckDataChanged, this.updateDeckGrid, this);

    this.scene.events.on('shutdown', () => {
      console.log('🧹 Limpando eventos do DeckGridManager');
      events.off(GameEvent.DeckDataChanged, this.updateDeckGrid, this);
    });
  }

  public createDeckGrid(x: number, y: number, width: number): void {
    this.deckGridContainer = this.scene.add.container(x, y);
    this.deckGridContainer.width = width;
    this.updateDeckGrid();
  }

  public createAvailableCardsGrid(
    x: number,
    y: number,
    width: number,
    height: number,
    allCards: Card[]
  ): void {
    this.availableCardsGrid = new ScrollableContainer(this.scene, x, y, width, height);
    this.updateAvailableCardsGrid(allCards);
  }

  public updateDeckGrid(): void {
    if (!this.deckGridContainer) return;
    this.deckGridContainer.removeAll(true);
    const deckData = this.deckManager.getCurrentDeckData();
    const gridWidth = this.deckGridContainer.width;
    this.populateGrid(this.deckGridContainer, deckData, false, gridWidth);
  }

  public updateAvailableCardsGrid(allCards: Card[]): void {
    if (!this.availableCardsGrid) return;
    this.availableCardsGrid.clearContent();
    const gridWidth = this.availableCardsGrid.viewWidth; // Usar viewWidth ao invés de width
    const cardContainers = this.createCardContainers(allCards, true, gridWidth);
    this.availableCardsGrid.addContent(cardContainers);
  }

  private populateGrid(
    container: Phaser.GameObjects.Container,
    cards: Card[],
    isAvailableCards: boolean,
    gridWidth: number
  ): void {
    const cardContainers = this.createCardContainers(cards, isAvailableCards, gridWidth);
    container.add(cardContainers);
  }

  private createCardContainers(
    cards: Card[],
    isAvailableCards: boolean,
    gridWidth: number
  ): CardContainer[] {
    const cardSize = { w: 80, h: 110 };
    const cardSpacing = 15;
    const padding = 40;
    const cols = Math.floor((gridWidth - padding * 2) / (cardSize.w + cardSpacing));

    return cards.map((card, i) => {
      const x = padding + (i % cols) * (cardSize.w + cardSpacing);
      const y = padding + Math.floor(i / cols) * (cardSize.h + cardSpacing) + 15;

      const cardContainer = new CardContainer(
        this.scene,
        x,
        y,
        cardSize.w,
        cardSize.h,
        0x3a3a3a,
        card,
        i
      );

      this.setupCardInteractivity(cardContainer, isAvailableCards, i);
      this.setupHoverEvents(cardContainer);

      return cardContainer;
    });
  }

  private setupCardInteractivity(
    cardContainer: CardContainer,
    isAvailableCards: boolean,
    index: number
  ): void {
    cardContainer.setInteractivity('hover');
    cardContainer.removeAllListeners('pointerup');
    const isCreatingOrEditing = this.deckManager.isCreatingOrEditing();
    const handleClick = (action: () => void) => {
      action();
      this.onCardHoverEnd?.();
    };

    if (isAvailableCards && isCreatingOrEditing) {
      const canAdd = this.deckManager.canAddCard(cardContainer.cardData);
      if (canAdd) {
        cardContainer.setInteractive({ useHandCursor: true });
        cardContainer.on('pointerup', () =>
          handleClick(() => this.deckManager.addCard(cardContainer.cardData))
        );
      } else {
        cardContainer.setAlpha(0.5);
        cardContainer.disableInteractive();
      }
    } else if (!isAvailableCards && isCreatingOrEditing) {
      cardContainer.setInteractive({ useHandCursor: true });
      cardContainer.on('pointerup', () => handleClick(() => this.deckManager.removeCard(index)));
    }
  }

  private setupHoverEvents(cardContainer: CardContainer): void {
    cardContainer.on('pointerover', () => this.onCardHover?.(cardContainer));
    cardContainer.on('pointerout', () => this.onCardHoverEnd?.());
  }

  public refreshAvailableCards(allCards: Card[]): void {
    this.updateAvailableCardsGrid(allCards);
  }

  public getDeckGridContainer(): Phaser.GameObjects.Container {
    return this.deckGridContainer;
  }

  public getAvailableCardsGrid(): ScrollableContainer {
    return this.availableCardsGrid;
  }
}
