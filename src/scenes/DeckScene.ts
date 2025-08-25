import Phaser from 'phaser';
import { SceneEnum } from '@/enums/SceneEnum';
import { ImageEnum } from '@/enums/ImageEnum';
import { GameButton } from '@/components/GameButton';
import { ButtonColor } from '@/enums/ButtonColor';
import { CardDetailsPanel } from '@/components/CardDetailsPanel';
import { opponentDeck, playerDeck } from '@/data/CardPool';
import { FontEnum } from '@/enums/FontEnum';
import { UIFactory } from '@/components/UIFactory';
import { DeckManager } from '@/managers/DeckManager';
import { DeckUIManager } from '@/managers/DeckUIManager';
import { DeckGridManager } from '@/managers/DeckGridManager';
import { GameEventManager } from '@/managers/GameEventManager';
import { GameEvent } from '@/enums/GameEvent';

export class DeckScene extends Phaser.Scene {
  private cardDetails!: CardDetailsPanel;
  private allCardsData = [...playerDeck, ...opponentDeck, ...playerDeck, ...opponentDeck];

  private deckManager!: DeckManager;
  private uiManager!: DeckUIManager;
  private gridManager!: DeckGridManager;

  constructor() {
    super(SceneEnum.Deck);
  }

  init(): void {
    console.log('🚀 DeckScene - Iniciando inicialização');
    this.deckManager = new DeckManager();
    this.uiManager = new DeckUIManager(this, this.deckManager);
    this.gridManager = new DeckGridManager(this, this.deckManager);
    this.uiManager.initialize();
    this.setupEventListeners();
    console.log('✅ DeckScene - Inicialização concluída');
  }

  create() {
    console.log('🎨 DeckScene - Criando elementos visuais');
    this.createBackground();
    this.createColumns();
    console.log('✅ DeckScene - Elementos visuais criados');
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

    this.createDeckColumn(col1X, col1Width);
    this.createCardsColumn(col2X, col2Width, height);
    this.createCardDetailsColumn(col3X, col3Width, height);
    this.createBackButton();
  }

  private createDeckColumn(startX: number, width: number) {
    console.log('📋 Criando coluna de decks');
    this.uiManager.createDeckColumn(startX, width);
  }

  private createCardsColumn(startX: number, width: number, height: number) {
    let currentY = 50;
    const sectionSpacing = 30;
    this.uiManager.createDeckTitle(startX, currentY);
    currentY += 40;
    this.gridManager.createDeckGrid(startX, currentY, width);
    currentY += 260 + sectionSpacing;
    UIFactory.createText(this, startX, currentY, 'Filtros', {
      fontSize: '20px',
      fontStyle: 'bold',
    });
    currentY += 90;
    UIFactory.createText(
      this,
      startX,
      currentY,
      `Cartas Disponíveis: ${this.allCardsData.length}`,
      { fontSize: '20px', fontFamily: FontEnum.RedHatDisplay400 }
    );
    currentY += 40;
    const scrollAreaHeight = height - currentY - 20;
    this.gridManager.createAvailableCardsGrid(
      startX,
      currentY,
      width,
      scrollAreaHeight,
      this.allCardsData
    );
  }

  private createCardDetailsColumn(startX: number, width: number, height: number) {
    this.cardDetails = new CardDetailsPanel(this);
    this.cardDetails.initialize(startX + width / 2, height / 2);
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

  private setupEventListeners() {
    console.log('🔧 Configurando listeners de eventos globais');

    const events = GameEventManager.instance;
    events.on(GameEvent.DECK_MODE_CHANGED, this.refreshGrids, this);
    events.on(GameEvent.DECK_DATA_CHANGED, this.refreshGrids, this);

    this.gridManager.onCardHover = (card) => this.cardDetails.showCardDetails(card.cardData);
    this.gridManager.onCardHoverEnd = () => this.cardDetails.hideCardDetails();

    // Limpeza de eventos ao sair da cena
    this.events.on('shutdown', () => {
      console.log('🧹 Limpando eventos da DeckScene');
      events.off(GameEvent.DECK_MODE_CHANGED, this.refreshGrids, this);
      events.off(GameEvent.DECK_DATA_CHANGED, this.refreshGrids, this);
    });

    console.log('✅ Listeners configurados');
  }

  private refreshGrids() {
    console.log('🔄 Atualizando grids a partir de evento global');
    this.gridManager.updateDeckGrid();
    this.gridManager.refreshAvailableCards(this.allCardsData);
  }
}
