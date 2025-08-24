import Phaser from 'phaser';
import { SceneEnum } from '@/enums/SceneEnum';
import { opponentDeck, playerDeck } from '@/data/CardPool';

// Managers
import { GameStateManager } from '@/managers/GameStateManager';
import { CardPlacementManager } from '@/managers/CardPlacementManager';
import { RevealManager } from '@/managers/RevealManager';
import { TurnManager } from '@/managers/TurnManager';
import { GameFlowManager } from '@/managers/GameFlowManager';
import { LaneManager } from '@/managers/LaneManager';
import { HandManager } from '@/managers/HandManager';
import { UIManager } from '@/managers/UIManager';
import { DragAndDropManager } from '@/managers/DragAndDropManager';
import { BotAIManager } from '@/managers/BotAIManager';
import { GameEndManager } from '@/managers/GameEndManager';
import { CardEffectManager } from '@/managers/card-effects/CardEffectManager';
import { GameEventManager } from '@/managers/GameEventManager';

// Components
import { LaneDisplay } from '@/components/LaneDisplay';
import { DeckDisplay } from '@/components/DeckDisplay';
import { LogHistoryButton } from '@/components/LogHistoryButton';
import { RetreatButton } from '@/components/RetreatButton';

// Types & Events
import { EffectAction } from '@/interfaces/EffectAction';
import { GameEvent } from '@/enums/GameEvent';
import { CardContainer } from '@/components/CardContainer';
import { Slot } from '@/interfaces/Slot';
import { Lane } from '@/interfaces/Lane';

export default class GameScene extends Phaser.Scene {
  // Core Managers
  private gameStateManager!: GameStateManager;
  private gameFlowManager!: GameFlowManager;
  private turnManager!: TurnManager;
  private revealManager!: RevealManager;
  private cardPlacementManager!: CardPlacementManager;

  // Existing Managers (refactored)
  private laneManager!: LaneManager;
  private handManager!: HandManager;
  private uiManager!: UIManager;
  private dragAndDropManager!: DragAndDropManager;
  private botAI!: BotAIManager;
  private gameEndManager!: GameEndManager;
  private effectManager!: CardEffectManager;

  // UI Components
  private laneDisplay!: LaneDisplay;
  private playerDeckDisplay!: DeckDisplay;
  private enemyDeckDisplay!: DeckDisplay;
  private logHistoryButton!: LogHistoryButton;
  private retreatButton!: RetreatButton;

  constructor() {
    super(SceneEnum.Game);
  }

  init(): void {
    this.removeEvents();
  }

  public create(): void {
    // 1. Inicializa o Estado Central
    this.gameStateManager = new GameStateManager();

    // 2. Inicializa componentes de UI que não dependem de estado complexo
    this.uiManager = new UIManager(this);
    this.laneDisplay = new LaneDisplay(this);
    this.logHistoryButton = new LogHistoryButton(this);
    this.playerDeckDisplay = new DeckDisplay(this, 'Deck jogador');
    this.enemyDeckDisplay = new DeckDisplay(this, 'Deck oponente');

    // 3. Cria as Lanes e as armazena no Estado Central
    this.initializeGameLanes();

    // 4. Inicializa os Managers passando as dependências corretas
    this.laneManager = new LaneManager(this.gameStateManager, this.laneDisplay);
    this.handManager = new HandManager(this, this.laneManager);
    this.effectManager = new CardEffectManager(this.gameStateManager);

    // 5. Inicializa o resto dos managers com os construtores corrigidos
    this.cardPlacementManager = new CardPlacementManager(
      this,
      this.gameStateManager,
      this.handManager,
      this.laneManager
    );

    this.dragAndDropManager = new DragAndDropManager(this, this.gameStateManager, this.laneManager);

    this.botAI = new BotAIManager(this, this.gameStateManager, this.handManager);

    this.gameEndManager = new GameEndManager(this, this.logHistoryButton);

    this.revealManager = new RevealManager(
      this.gameStateManager,
      this.effectManager,
      this.laneManager,
      this.handManager,
      this.logHistoryButton
    );

    this.turnManager = new TurnManager(
      this,
      this.gameStateManager,
      this.botAI,
      this.revealManager,
      this.effectManager,
      this.laneManager,
      this.handManager,
      this.uiManager,
      this.dragAndDropManager,
      this.cardPlacementManager
    );

    this.initializeRetreatButton();

    this.gameFlowManager = new GameFlowManager(
      this,
      this.gameStateManager,
      this.turnManager,
      this.gameEndManager,
      this.handManager,
      this.laneManager,
      this.uiManager,
      this.cardPlacementManager,
      this.dragAndDropManager,
      this.retreatButton,
      this.playerDeckDisplay,
      this.enemyDeckDisplay
    );

    // 6. Configura o layout final e listeners
    this.handManager.initialize(playerDeck, opponentDeck);
    this.initializeGameDecks();
    this.initializeLogHistoryButton();
    this.setupEventListeners();

    // 7. Inicia o jogo
    this.gameFlowManager.initializeGame();
  }

  private initializeGameLanes(): void {
    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;
    const totalLanes = 3;
    const spacing = screenWidth / (totalLanes + 1);
    const laneY = screenHeight / 2;

    const lanes: Lane[] = [];
    for (let i = 0; i < totalLanes; i++) {
      const x = spacing * (i + 1);
      const lane = this.laneDisplay.createLane(x, laneY, i);
      lanes.push(lane);
    }
    this.gameStateManager.setLanes(lanes);
  }

  private setupEventListeners(): void {
    this.events.on('moveCardRequest', this.handleMoveCard, this);

    GameEventManager.instance.on(GameEvent.LogRequest, (action: EffectAction) => {
      this.processLog(action);
    });

    GameEventManager.instance.on(GameEvent.AddCardToHand, (action: EffectAction) => {
      this.processHand(action);
    });

    GameEventManager.instance.on(GameEvent.PlacedCardsUI, () => {
      this.cardPlacementManager.updatePlacedCardsUI();
    });

    GameEventManager.instance.on(
      GameEvent.PlaceCardOnSlot,
      (data: { slot: Slot; cardData: any }) => {
        this.cardPlacementManager.placePlayerCard(data.slot, data.cardData);
      }
    );

    GameEventManager.instance.on(GameEvent.RemoveCardFromPlayerHand, (index: number) => {
      this.handManager.playerHand.splice(index, 1);
    });

    GameEventManager.instance.on(GameEvent.UpdateEnergy, () => {
      this.updateUIElements();
    });
  }

  private initializeGameDecks(): void {
    this.enemyDeckDisplay.initialize(
      20,
      40,
      this.handManager.opponentDeckMutable.length,
      this.handManager.opponentDeckMutable
    );

    this.playerDeckDisplay.initialize(
      20,
      this.scale.height - 40,
      this.handManager.playerDeckMutable.length,
      this.handManager.playerDeckMutable
    );

    this.playerDeckDisplay.updateDeck(this.handManager.playerDeckMutable.length);
    this.playerDeckDisplay.enableModalOpen();
    this.enemyDeckDisplay.updateDeck(this.handManager.opponentDeckMutable.length);
  }

  private initializeLogHistoryButton(): void {
    const screenWidth = this.scale.width;
    this.logHistoryButton.initialize(screenWidth - 20, 60);
  }

  private initializeRetreatButton(): void {
    const energyButtonY = this.uiManager.energyDisplay.y;
    const spacing = 15;
    const buttonHeight = 50;
    const buttonCenterX = this.uiManager.energyDisplay.x;
    const buttonCenterY =
      energyButtonY + this.uiManager.energyDisplay.height / 2 + spacing + buttonHeight / 2;

    this.retreatButton = new RetreatButton(this, buttonCenterX, buttonCenterY, () =>
      this.gameFlowManager.handleRetreat()
    );
  }

  private handleMoveCard(data: {
    cardContainer: CardContainer;
    fromSlot: Slot;
    toSlot: Slot;
  }): void {
    const { cardContainer, fromSlot, toSlot } = data;
    const { cardData } = cardContainer;

    if (cardData.hasMoved) return;

    const fromLaneIndex = this.gameStateManager.lanes.findIndex((l) =>
      l.playerSlots.includes(fromSlot)
    );
    const toLaneIndex = this.gameStateManager.lanes.findIndex((l) =>
      l.playerSlots.includes(toSlot)
    );

    if (fromLaneIndex === toLaneIndex) {
      cardContainer.x = cardContainer.startX;
      cardContainer.y = cardContainer.startY;
      console.log(`${cardData.name} tentou se mover para a mesma lane. Movimento cancelado.`);
      return;
    }

    console.log(
      `${cardData.name} movido da lane ${fromLaneIndex + 1} para a lane ${toLaneIndex + 1}.`
    );

    // Move a carta
    fromSlot.occupied = false;
    delete fromSlot.cardData;
    delete fromSlot.power;
    delete fromSlot.permanentBonus;

    toSlot.occupied = true;
    toSlot.cardData = cardData;
    toSlot.power = fromSlot.power;
    toSlot.permanentBonus = fromSlot.permanentBonus;
    cardContainer.slot = toSlot;

    cardContainer.x = toSlot.x;
    cardContainer.y = toSlot.y;

    // Atualiza poderes
    this.updateAllGamePowers();
  }

  private updateUIElements(): void {
    this.uiManager.energyDisplay.setLabel(`Energia: ${this.gameStateManager.playerEnergy}`);
    this.handManager.updatePlayableCardsBorder(this.gameStateManager.playerEnergy);
  }

  private updateAllGamePowers(): void {
    this.effectManager.updateAllCardPowers();
    this.laneManager.updateLaneProperties();
    this.cardPlacementManager.updatePlacedCardsUI();
    this.laneManager.updateLanePowers();
    this.effectManager.updateMoves(this.gameStateManager.placedCardContainers);
  }

  private processLog(action: EffectAction): void {
    if (action.type === 'LOG_MESSAGE') {
      this.logHistoryButton.addLog(action.payload.message);
    }
  }

  private processHand(action: EffectAction): void {
    if (action.type === 'ADD_TO_HAND') {
      this.handManager.addCardToHand(
        action.payload.card,
        action.payload.isPlayer,
        this.gameStateManager.maxTurn
      );
    }
  }

  private removeEvents(): void {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      GameEventManager.instance.removeAllListeners();
      if (this.handManager) {
        this.handManager.clear();
      }
    });
  }
}
