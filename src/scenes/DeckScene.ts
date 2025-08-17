import Phaser from 'phaser';
import { SceneEnum } from '@/enums/SceneEnum';
import { ImageEnum } from '@/enums/ImageEnum';
import { GameButton } from '@/components/GameButton';
import { ButtonColor } from '@/enums/ButtonColor';
import { CardContainer } from '@/components/CardContainer';
import { CardDetailsPanel } from '@/components/CardDetailsPanel';
import { botDeck, playerDeck } from '@/data/CardPool';
import { ScrollableContainer } from '@/components/ScrollableContainer';
import { Card } from '@/interfaces/Card';
import { FontEnum } from '@/enums/FontEnum';
import { Select } from '@/components/Select';
import { userDecks } from '@/data/UserDecks';

export class DeckScene extends Phaser.Scene {
  private cardDetails!: CardDetailsPanel;
  private allCardsData = [...playerDeck, ...botDeck, ...playerDeck, ...botDeck];
  private currentDeckData: Omit<Card, 'index'>[] = [];
  private deckGridContainer!: Phaser.GameObjects.Container;
  private deckTitleText!: Phaser.GameObjects.Text;
  private deckSelect!: Select;

  constructor() {
    super(SceneEnum.Deck);
  }

  create() {
    this.createBackground();
    this.createColumns();
  }

  private createBackground() {
    const bg = this.add.image(0, 0, ImageEnum.Background).setOrigin(0);
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
  }

  private createColumns() {
    const { width, height } = this.scale;
    const padding = width * 0.02;

    const col1Width = width * 0.2;
    const col2Width = width * 0.5;
    const col3Width = width * 0.28;

    const col1X = 0;
    const col2X = col1X + col1Width + padding;
    const col3X = col2X + col2Width + padding;

    this.createDeckColumn(col1X, col1Width, height);
    this.createCardsColumn(col2X, col2Width, height);
    this.createCardDetailsColumn(col3X, col3Width, height);
    this.createBackButton();
  }

  private createDeckColumn(startX: number, width: number, _height: number) {
    const centerX = startX + width / 2;
    let currentY = 50;

    this.add
      .text(centerX, 50, 'Decks', {
        fontSize: '24px',
        fontStyle: 'bold',
        fontFamily: FontEnum.RedHatDisplay500,
      })
      .setOrigin(0.5);

    currentY += 50;

    this.add.text(centerX, currentY, 'Selecionar Deck', { fontSize: '18px' }).setOrigin(0.5);
    currentY += 40;

    const deckOptions = userDecks.map((deck) => ({
      value: deck.id,
      text: deck.name,
    }));

    this.deckSelect = new Select(this, centerX, currentY, {
      width: 220,
      options: deckOptions,
      defaultValue: 'Selecione um Deck...',
    });

    this.deckSelect.on('change', (event: Event) => {
      const selectElement = event.target as HTMLSelectElement;
      const selectedDeckId = selectElement.value;
      const selectedDeck = userDecks.find((d) => d.id === selectedDeckId);

      if (selectedDeck) {
        this.currentDeckData = selectedDeck.cards;
      } else {
        this.currentDeckData = [];
      }

      this.updateDeckGrid();
    });

    currentY += 80;

    new GameButton(this, centerX, currentY, 'Criar Novo Deck', () => {}, {
      color: ButtonColor.Blue,
      width: 200,
      height: 50,
      fontSize: '20px',
    });
  }

  private createCardsColumn(startX: number, width: number, height: number) {
    let currentY = 50;
    const sectionSpacing = 30;

    this.deckTitleText = this.add.text(startX, currentY, '', {
      fontSize: '20px',
      fontStyle: 'normal',
      fontFamily: FontEnum.RedHatDisplay400,
    });
    currentY += 40;

    this.deckGridContainer = this.add.container(startX, currentY);
    this.deckGridContainer.width = width;

    this.updateDeckGrid();

    currentY += 260 + sectionSpacing;

    this.add.text(startX, currentY, 'Filtros', {
      fontSize: '20px',
      fontStyle: 'bold',
      fontFamily: FontEnum.RedHatDisplay500,
    });
    currentY += 90;

    this.add.text(startX, currentY, `Cartas Disponíveis: ${this.allCardsData.length}`, {
      fontSize: '20px',
      fontStyle: 'normal',
      fontFamily: FontEnum.RedHatDisplay400,
    });
    currentY += 40;

    const scrollAreaHeight = height - currentY - 20;
    const availableCardsGrid = new ScrollableContainer(
      this,
      startX,
      currentY,
      width,
      scrollAreaHeight
    );
    this.populateCardGrid(availableCardsGrid, this.allCardsData);
    this.setupCardHover(this.deckGridContainer);
    this.setupCardHover(availableCardsGrid);
  }

  private populateCardGrid(
    container: Phaser.GameObjects.Container | ScrollableContainer,
    cardsData: Omit<Card, 'index'>[]
  ) {
    const gridWidth = container.width;

    const cardSize = { w: 80, h: 110 };
    const cardSpacing = 15;
    const padding = 40;
    const cols = Math.floor((gridWidth - padding * 2) / (cardSize.w + cardSpacing));

    cardsData.forEach((card, i) => {
      const x = padding + (i % cols) * (cardSize.w + cardSpacing);
      const y = padding + Math.floor(i / cols) * (cardSize.h + cardSpacing) + 15;

      const cardContainer = new CardContainer(
        this,
        x,
        y,
        cardSize.w,
        cardSize.h,
        0x3a3a3a,
        card,
        i
      );
      cardContainer.setInteractivity('hover');

      if (container instanceof ScrollableContainer) {
        container.addContent(cardContainer);
      } else {
        container.add(cardContainer);
      }
    });
  }

  private createCardDetailsColumn(startX: number, width: number, height: number) {
    this.cardDetails = new CardDetailsPanel(this);
    this.cardDetails.initialize(startX + width / 2, height / 2);
  }

  private setupCardHover(container: Phaser.GameObjects.Container | ScrollableContainer) {
    const showDetails = (card: CardContainer) => this.cardDetails.showCardDetails(card.cardData);
    const hideDetails = () => this.cardDetails.hideCardDetails();

    let cardList: Phaser.GameObjects.GameObject[] = [];
    if (container instanceof ScrollableContainer) {
      cardList = container.getContent();
    } else {
      cardList = container.list;
    }

    cardList.forEach((card) => {
      card.on('pointerover', () => showDetails(card as CardContainer));
      card.on('pointerout', hideDetails);
    });
  }

  private createBackButton() {
    const { width } = this.scale;
    new GameButton(this, width - 80, 55, 'Voltar', () => this.scene.start(SceneEnum.Home), {
      color: ButtonColor.Black,
      width: 120,
      height: 50,
      fontSize: '24px',
    });
  }

  private updateDeckGrid() {
    this.deckGridContainer.removeAll(true);
    const selectedDeck = userDecks.find((d) => d.id === this.deckSelect.getValue());
    const deckName = selectedDeck ? selectedDeck.name : 'Nenhum';
    this.deckTitleText.setText(`Deck: ${deckName} ${this.currentDeckData.length}/12`);
    this.populateCardGrid(this.deckGridContainer, this.currentDeckData);
    this.setupCardHover(this.deckGridContainer);
  }
}
