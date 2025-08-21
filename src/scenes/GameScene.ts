import Phaser from 'phaser';
import { Card, CardData } from '@/interfaces/Card';
import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';

import { CardContainer } from '@/components/CardContainer';
import { LaneDisplay } from '@/components/LaneDisplay';
import { CardDetailsPanel } from '@/components/CardDetailsPanel';

import { DragAndDropManager } from '@/managers/DragAndDropManager';
import { BotAIManager } from '@/managers/BotAIManager';
import { GameEndManager } from '@/managers/GameEndManager';
import { DeckDisplay } from '@/components/DeckDisplay';
import { botDeck, playerDeck } from '@/data/CardPool';
import { LogHistoryButton } from '@/components/LogHistoryButton';
import { CardEffectManager } from '@/managers/card-effects/CardEffectManager';
import { CardEffect } from '@/enums/CardEffect';
import { SceneEnum } from '@/enums/SceneEnum';
import { ImageEnum } from '@/enums/ImageEnum';
import { GameButton } from '@/components/GameButton';
import { ButtonColor } from '@/enums/ButtonColor';
import { UIFactory } from '@/components/UIFactory';
import { RetreatButton } from '@/components/RetreatButton';
import { EffectAction } from '@/interfaces/EffectAction';
import { GameEventManager } from '@/managers/GameEventManager';
import { GameEvent } from '@/enums/GameEvent';
import { LaneManager } from '@/managers/LaneManager';

export default class GameScene extends Phaser.Scene {
  private playerHand: Card[] = [];
  private botHand: Card[] = [];
  private playerDeckMutable: Card[] = [];
  private botDeckMutable: Card[] = [];

  private isPlayerTurn = true;
  private lanes: Lane[] = [];
  private playerHandContainers: CardContainer[] = [];
  private botHandContainers: CardContainer[] = [];
  private currentTurn = 1;
  private playerEnergy = 0;
  private botEnergy = 0;
  private maxTurn = 7;
  private isNextTurn: 0 | 1 = Phaser.Math.Between(0, 1) as 0 | 1;
  private showBotHand = false;
  private playerNameText!: Phaser.GameObjects.Text;
  private opponentNameText!: Phaser.GameObjects.Text;
  private playerName = 'Você';
  private opponentName = 'Oponente';

  private laneDisplay!: LaneDisplay;
  private energyDisplay!: GameButton;
  private turnDisplay!: GameButton;
  private endTurnButton!: GameButton;
  private cardDetailsPanel!: CardDetailsPanel;
  private dragAndDropManager!: DragAndDropManager;
  private botAI!: BotAIManager;
  private gameEndManager!: GameEndManager;
  private endBattleButton!: GameButton;
  private playerDeckDisplay!: DeckDisplay;
  private enemyDeckDisplay!: DeckDisplay;
  private logHistoryButton!: LogHistoryButton;
  private retreatButton!: RetreatButton;
  private revealQueue: {
    card: CardData;
    laneIndex: number;
    slot: Slot;
    isPlayer: boolean;
    turnPlayed: number;
  }[] = [];

  private effectManager!: CardEffectManager;
  private placedCardContainers: CardContainer[] = [];

  // managers
  private laneManager!: LaneManager;

  constructor() {
    super(SceneEnum.Game);
  }

  init(): void {
    this.playerHand = [];
    this.botHand = [];
    this.placedCardContainers = [];
    this.playerDeckMutable = [];
    this.botDeckMutable = [];
    this.currentTurn = 1;
    this.playerEnergy = 1;
    this.lanes = [];
    this.playerHandContainers = [];
    this.botHandContainers = [];
    this.showBotHand = true;
  }

  public create(): void {
    this.laneDisplay = new LaneDisplay(this);
    this.cardDetailsPanel = new CardDetailsPanel(this);
    this.playerDeckDisplay = new DeckDisplay(this, 'Deck jogador');
    this.enemyDeckDisplay = new DeckDisplay(this, 'Deck oponente');
    this.playerDeckMutable = [...playerDeck];
    this.botDeckMutable = [...botDeck];
    this.playerHand = this.drawInitialHand(this.playerDeckMutable, 4);
    this.botHand = this.drawInitialHand(this.botDeckMutable, 4);
    this.logHistoryButton = new LogHistoryButton(this);
    this.effectManager = new CardEffectManager(this.lanes);

    this.createBackground();
    this.initializePlayerNames();
    this.initializeGameDecks();
    this.initializeGameLanes();
    this.initializeEnergyDisplay();
    this.initializeTurnDisplay();
    this.initializeEndTurnButton();
    this.initializeEndBattleButton();
    this.initializeCardDetailsPanel();
    this.initializeLogHistoryButton();
    this.initializeRetreatButton();
    this.events.on('moveCardRequest', this.handleMoveCard, this);

    // Events
    GameEventManager.instance.on(GameEvent.LogRequest, (action: EffectAction) => {
      this.processLog(action);
    });
    GameEventManager.instance.on(GameEvent.AddCardToHand, (action: EffectAction) => {
      this.processHand(action);
    });

    // managers
    this.laneManager = new LaneManager(this.lanes, this.laneDisplay);

    this.dragAndDropManager = new DragAndDropManager(
      this,
      this.lanes,
      this.playerEnergy,
      this.isPlayerTurn,
      this.placeCardOnSlot.bind(this),
      this.removeCardFromPlayerHand.bind(this),
      this.updateEnergyText.bind(this),
      this.laneManager.updateLanePowers.bind(this.laneManager),
      this.animateCardReturn.bind(this),
      this.renderPlayerHand.bind(this)
    );

    this.playerEnergy = this.currentTurn;
    this.botEnergy = this.currentTurn;
    this.updateEnergyText();

    this.renderPlayerHand();
    this.renderBotHand();

    this.botAI = new BotAIManager(this, this.lanes, this.botHand, this.botEnergy);
    this.gameEndManager = new GameEndManager(this, this.logHistoryButton);
  }

  private createBackground() {
    const bg = this.add.image(0, 0, ImageEnum.Background).setOrigin(0);
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
  }

  private initializePlayerNames(): void {
    const spacing = 25;

    const opponentDeckY = 40;
    const opponentNameY = opponentDeckY + 40 + spacing;
    this.opponentNameText = UIFactory.createText(this, 20, opponentNameY, this.opponentName, {
      fontSize: '22px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    const playerDeckY = this.scale.height - 40;
    const playerNameY = playerDeckY - 40 - spacing;
    this.playerNameText = UIFactory.createText(this, 20, playerNameY, this.playerName, {
      fontSize: '22px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
  }

  private initializeGameDecks(): void {
    this.enemyDeckDisplay.initialize(20, 40, this.botHand.length, this.botDeckMutable);
    this.playerDeckDisplay.initialize(
      20,
      this.scale.height - 40,
      this.playerHand.length,
      this.playerDeckMutable
    );
    this.playerDeckDisplay.updateDeck(this.playerDeckMutable.length);
    this.playerDeckDisplay.enableModalOpen();
    this.enemyDeckDisplay.updateDeck(this.botDeckMutable.length);
    this.updatePriorityHighlights();
  }

  private initializeGameLanes(): void {
    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;
    const totalLanes = 3;
    const spacing = screenWidth / (totalLanes + 1);
    const laneY = screenHeight / 2;

    for (let i = 0; i < totalLanes; i++) {
      const x = spacing * (i + 1);
      const y = laneY;
      const lane = this.laneDisplay.createLane(x, y, i);
      this.lanes.push(lane);
    }
  }

  private initializeEnergyDisplay(): void {
    const energyX = 20;
    const centerY = this.scale.height / 2;

    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonCenterX = energyX + buttonWidth / 2;

    this.energyDisplay = new GameButton(
      this,
      buttonCenterX,
      centerY,
      `Energia: ${this.playerEnergy}`,
      () => {},
      {
        width: buttonWidth,
        height: buttonHeight,
        fontSize: '20px',
      }
    );
  }

  private initializeTurnDisplay(): void {
    const screenWidth = this.scale.width;
    const centerY = this.scale.height / 2;

    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonCenterX = screenWidth - buttonWidth / 2 - 20;

    this.turnDisplay = new GameButton(
      this,
      buttonCenterX,
      centerY,
      `Turno: ${this.currentTurn}/${this.maxTurn - 1}`,
      () => {},
      {
        color: ButtonColor.Black,
        width: buttonWidth,
        height: buttonHeight,
        fontSize: '20px',
      }
    );
  }

  private initializeEndTurnButton(): void {
    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;

    const buttonWidth = 180;
    const buttonHeight = 50;
    const buttonCenterX = screenWidth - buttonWidth / 2 - 20;
    const buttonCenterY = screenHeight - buttonHeight / 2 - 20;

    this.endTurnButton = new GameButton(
      this,
      buttonCenterX,
      buttonCenterY,
      'Finalizar Turno',
      () => {
        if (this.isPlayerTurn) this.endTurn();
      },
      {
        color: ButtonColor.Purple,
        width: buttonWidth,
        height: buttonHeight,
        fontSize: '20px',
      }
    );
  }

  private initializeEndBattleButton(): void {
    const centerY = this.scale.height / 2;
    const buttonWidth = 220;
    const buttonHeight = 60;
    const buttonCenterX = 20 + buttonWidth / 2;

    this.endBattleButton = new GameButton(
      this,
      buttonCenterX,
      centerY,
      'Finalizar Batalha',
      () => {
        if (this.gameEndManager.isGameEnded()) {
          this.scene.start(SceneEnum.Home);
        }
      },
      {
        width: buttonWidth,
        height: buttonHeight,
        fontSize: '24px',
        color: ButtonColor.Black,
      }
    );

    this.endBattleButton.setVisible(false);
  }

  private initializeCardDetailsPanel(): void {
    const width = 220;
    const x = this.scale.width - width / 2 - 20;
    const y = this.scale.height / 2;
    this.cardDetailsPanel.initialize(x, y);
    this.setupCardDetailsEvents();
  }

  private initializeLogHistoryButton(): void {
    const screenWidth = this.scale.width;
    this.logHistoryButton.initialize(screenWidth - 20, 60);
  }

  private initializeRetreatButton(): void {
    const energyButtonY = this.energyDisplay.y;
    const spacing = 15;
    const buttonHeight = 50;
    const buttonCenterX = this.energyDisplay.x;
    const buttonCenterY =
      energyButtonY + this.energyDisplay.height / 2 + spacing + buttonHeight / 2;

    this.retreatButton = new RetreatButton(this, buttonCenterX, buttonCenterY, () =>
      this.handleRetreat()
    );
  }

  private handleRetreat(): void {
    const retreatResult = [
      { playerPower: 0, opponentPower: 1 },
      { playerPower: 0, opponentPower: 1 },
      { playerPower: 0, opponentPower: 1 },
    ];
    this.gameEndManager.checkGameEnd(retreatResult);

    this.endBattleButton.setVisible(true);
    this.endTurnButton.setVisible(false);
    this.turnDisplay.setVisible(false);
    this.energyDisplay.setVisible(false);
    this.retreatButton.setVisible(false);
    this.disablePlayerCardInteraction();
    this.enemyDeckDisplay.enableModalOpen();
    this.showBotHand = true;
    this.revealBotHand();
  }

  private renderPlayerHand(): void {
    this.clearContainers(this.playerHandContainers);
    const { width, height } = this.scale;
    const handY = height - 120;
    this.playerHand.forEach((card, index) => {
      const x = this.cardXPosition(width, this.playerHand.length, index);
      const cardContainer = new CardContainer(this, x, handY, 100, 140, 0x0088ff, card, index);
      cardContainer.setInteractivity('draggable');
      this.add.existing(cardContainer);
      this.playerHandContainers.push(cardContainer);
    });
    this.updatePlayableCardsBorder();
  }

  private renderBotHand(): void {
    this.clearContainers(this.botHandContainers);
    const { width } = this.scale;
    const handY = 100;
    this.botHand.forEach((card, index) => {
      const x = this.cardXPosition(width, this.botHand.length, index);
      const cardContainer = new CardContainer(this, x, handY, 100, 140, 0xff0000, card, index);
      cardContainer.setInteractivity('none');
      this.add.existing(cardContainer);
      this.botHandContainers.push(cardContainer);
      this.revealBotHand();
    });
  }

  private animateCardReturn(container: CardContainer, onComplete?: () => void): void {
    this.tweens.add({ targets: container, scale: 1, duration: 200, ease: 'Back.out' });
    this.tweens.add({
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

  private placeCardOnSlot(slot: Slot, cardData: CardData): void {
    const cardContainer = new CardContainer(this, slot.x, slot.y, 80, 110, 0x0088ff, cardData, -1);
    cardContainer.setInteractivity('hover');
    this.add.existing(cardContainer);
    this.placedCardContainers.push(cardContainer);
    cardContainer.setInteractive({ useHandCursor: true });
    cardContainer.on('pointerdown', () => this.removePlacedCard(cardContainer));

    slot.occupied = true;
    slot.power = cardData.power;
    slot.cardData = cardData;
    slot.permanentBonus = 0;

    this.playerEnergy -= cardData.cost;
    this.updateEnergyText();

    (cardContainer as any).placed = true;
    (cardContainer as any).slot = slot;
    (cardContainer as any).cardData = cardData;
    (cardContainer as any).turnPlayed = this.currentTurn;

    const playerLaneIndex = this.lanes.findIndex((lane) => lane.playerSlots.includes(slot));
    if (playerLaneIndex !== -1) {
      this.revealQueue.push({
        card: cardData,
        laneIndex: playerLaneIndex,
        slot,
        isPlayer: true,
        turnPlayed: this.currentTurn,
      });
    }
  }

  private removeCardFromPlayerHand(index: number): void {
    this.playerHand.splice(index, 1);
  }

  private updateEnergyText(): void {
    this.energyDisplay.setLabel(`Energia: ${this.playerEnergy}`);
    this.dragAndDropManager.updatePlayerEnergy(this.playerEnergy);
    this.updatePlayableCardsBorder();
  }

  private endTurn(): void {
    this.isPlayerTurn = false;
    this.endTurnButton.setVisible(false);

    this.time.delayedCall(1000, () => {
      this.executeBotTurn();
      this.recordInitialCardPositions();
      this.processRevealQueue();

      this.effectManager.handleMoveEffects();

      this.effectManager.checkResolutionEffects(this.revealQueue, this.currentTurn);

      this.advanceTurn();
      this.refreshEnergies();
      this.enablePlayerTurnUI();
      this.syncDragState();
      this.laneManager.updateLaneColors();
      this.isNextTurn = this.laneManager.getLeadingPlayer();
      this.updatePriorityHighlights();

      if (this.currentTurn >= this.maxTurn) {
        this.handleGameEnd();
      } else {
        this.prepareNextRound();
      }
    });
  }

  private playBotCardOnSlot(slot: Slot, card: Card): void {
    const cardData: CardData = { ...card, index: -1 };
    const cardContainer = new CardContainer(
      this,
      slot.x,
      slot.y,
      80,
      110,
      0xff0000,
      cardData,
      cardData.index
    );
    cardContainer.setInteractivity('hover');
    this.add.existing(cardContainer);

    this.placedCardContainers.push(cardContainer);

    (cardContainer as any).slot = slot;
    (cardContainer as any).turnPlayed = this.currentTurn;

    slot.occupied = true;
    slot.power = cardData.power;
    slot.cardData = cardData;

    const indexInHand = this.botHand.indexOf(card);
    if (indexInHand >= 0) this.botHand.splice(indexInHand, 1);
    this.botEnergy -= cardData.cost;

    const botLaneIndex = this.lanes.findIndex((lane) => lane.opponentSlots.includes(slot));
    if (botLaneIndex !== -1) {
      this.revealQueue.push({
        card: cardData,
        laneIndex: botLaneIndex,
        slot,
        isPlayer: false,
        turnPlayed: this.currentTurn,
      });
    }
  }

  private removePlacedCard(container: CardContainer): void {
    const turnPlayed = (container as any).turnPlayed as number;
    if (turnPlayed !== this.currentTurn) {
      console.log('Carta jogada em turno anterior. Não pode voltar.');
      return;
    }

    if (turnPlayed === this.currentTurn) {
      this.playerEnergy += (container as any).cardData.cost;
      this.updateEnergyText();
    }

    const slot = (container as any).slot as Slot;
    const cardData = (container as any).cardData as Card;

    const queueIndex = this.revealQueue.findIndex(
      (item) => item.card === cardData && item.slot === slot
    );
    if (queueIndex > -1) {
      this.revealQueue.splice(queueIndex, 1);
      console.log(`Carta ${cardData.name} removida da fila de revelação.`);
    }
    slot.occupied = false;
    delete slot.power;
    delete slot.cardData;

    const originalIndex = (container as any).cardData.index as number | undefined;
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
      this.playerHand.splice(originalIndex, 0, cardToReturn);
    } else {
      this.playerHand.push(cardToReturn);
    }
    const containerIndex = this.placedCardContainers.indexOf(container);
    if (containerIndex > -1) {
      this.placedCardContainers.splice(containerIndex, 1);
    }

    container.destroy();
    this.laneManager.updateLanePowers();
    this.renderPlayerHand();
    this.endTurnButton.setVisible(true);
    this.cardDetailsPanel.hideCardDetails();
  }

  private setupCardDetailsEvents(): void {
    this.input.on(
      'gameobjectover',
      (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
        const container = gameObject as Phaser.GameObjects.Container & { cardData?: CardData };
        if (!container.cardData) return;
        this.cardDetailsPanel.showCardDetails(container.cardData);
      }
    );

    this.input.on(
      'gameobjectout',
      (_pointer: Phaser.Input.Pointer, _gameObject: Phaser.GameObjects.GameObject) => {
        this.cardDetailsPanel.hideCardDetails();
      }
    );
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
      console.log(`${quicksilverCard.name} foi garantido na mão inicial.`);
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

  private drawCardForPlayer(hand: Card[], deck: Card[]): void {
    if (hand.length >= 7) return;
    if (deck.length === 0) return;
    const card = deck.shift()!;
    hand.push(card);
  }

  private updatePlayableCardsBorder(): void {
    this.playerHandContainers.forEach((container) => {
      container.cardData.cost <= this.playerEnergy
        ? container.enablePlayableBorder()
        : container.disablePlayableBorder();
    });
  }

  private disablePlayerCardInteraction(): void {
    this.playerHandContainers.forEach((container) => container.disablePlayableBorder());
    this.dragAndDropManager.disableDrag();
    this.placedCardContainers.forEach((container) => container.disableMovableBorder());
  }

  private executeBotTurn(): void {
    this.botAI.updateBotEnergy(this.botEnergy);
    this.botAI.updateBotHand(this.botHand);
    this.botAI.executeTurn(
      this.playBotCardOnSlot.bind(this),
      this.renderBotHand.bind(this),
      this.laneManager.updateLanePowers.bind(this.laneManager)
    );
  }

  private advanceTurn(): void {
    this.currentTurn++;
    this.turnDisplay.setLabel(`Turno: ${this.currentTurn}/${this.maxTurn - 1}`);
    this.animateTurnChange();
  }

  private refreshEnergies(): void {
    this.playerEnergy = this.currentTurn;
    this.botEnergy = this.currentTurn;
    this.updateEnergyText();
  }

  private enablePlayerTurnUI(): void {
    this.isPlayerTurn = true;
    this.endTurnButton.setVisible(true);
  }

  private syncDragState(): void {
    this.dragAndDropManager.updatePlayerEnergy(this.playerEnergy);
    this.dragAndDropManager.updatePlayerTurnStatus(this.isPlayerTurn);
  }

  private handleGameEnd(): void {
    this.retreatButton.setVisible(false);
    this.playerNameText.setColor('#ffffff');
    this.opponentNameText.setColor('#ffffff');

    this.updatePlacedCardsUI();
    this.laneManager.updateLanePowers();

    const finalLanePowers = this.lanes.map((lane) => {
      const { playerPower, opponentPower } = this.laneManager.calculateLanePower(lane);
      return { playerPower, opponentPower };
    });

    this.gameEndManager.checkGameEnd(finalLanePowers);

    this.endBattleButton.setVisible(true);
    this.endTurnButton.setVisible(false);
    this.turnDisplay.setVisible(false);
    this.energyDisplay.setVisible(false);
    this.disablePlayerCardInteraction();
    this.enemyDeckDisplay.enableModalOpen();
    this.showBotHand = true;
    this.revealBotHand();
  }

  private prepareNextRound(): void {
    this.effectManager.applyEndOfTurnEffects();
    this.updateAllGamePowers();

    this.laneManager.updateLaneProperties();
    this.updatePlacedCardsUI();
    this.laneManager.updateLanePowers();

    this.isPlayerTurn = true;
    this.drawCardForPlayer(this.playerHand, this.playerDeckMutable);
    this.drawCardForPlayer(this.botHand, this.botDeckMutable);
    this.playerDeckDisplay.updateDeck(this.playerDeckMutable.length);
    this.enemyDeckDisplay.updateDeck(this.botDeckMutable.length);
    this.renderPlayerHand();
    this.renderBotHand();
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

  private revealBotHand(): void {
    if (!this.showBotHand) return;
    this.botHandContainers.forEach((container) => {
      container.setRevealed(true);
      container.setInteractivity('hover');
    });
  }

  private updatePlacedCardsUI(): void {
    this.placedCardContainers.forEach((container) => {
      const slot = (container as any).slot as Slot;
      if (slot && slot.occupied && slot.power !== undefined) {
        container.updatePower(slot.power);
      }
    });
  }

  private processRevealQueue(): void {
    const playerRevealsFirst = this.laneManager.getLeadingPlayer() === 0;
    this.revealQueue.sort((a, b) => {
      if (a.isPlayer === b.isPlayer) return 0;
      return a.isPlayer === playerRevealsFirst ? -1 : 1;
    });

    this.logHistoryButton.addLog(`---------- Turno ${this.currentTurn} ----------`);

    console.log(
      'Ordem de Revelação:',
      this.revealQueue.map((item) => `${item.card.name} (${item.isPlayer ? 'Você' : 'Oponente'})`)
    );

    for (const item of this.revealQueue) {
      const playerName = item.isPlayer ? 'Você' : 'Oponente';
      this.logHistoryButton.addLog(
        `${playerName} jogou a carta ${item.card.name} na lane ${item.laneIndex + 1}`
      );

      console.log(`Revelando ${item.card.name}...`);
      if (item.slot.cardData) {
        item.slot.cardData.isRevealed = true;
      }
      this.effectManager.applyOnRevealEffect(
        item.card,
        item.laneIndex,
        item.slot,
        item.isPlayer,
        item.turnPlayed,
        this.revealQueue
      );

      // Log removido e adicionado no event
      this.effectManager.triggerOnCardPlayedEffects(item.card, item.laneIndex);

      this.updatePlacedCardsUI();
      this.laneManager.updateLanePowers();
    }
    this.revealQueue = [];

    this.renderPlayerHand();
    this.renderBotHand();

    console.log('Recalculando todos os efeitos Ongoing após as revelações.');
    this.updateAllGamePowers();
  }

  private addCardToHand(card: Card, isPlayer: boolean): void {
    const targetHand = isPlayer ? this.playerHand : this.botHand;

    if (targetHand.length < this.maxTurn) {
      targetHand.push(card);
      console.log(`${card.name} adicionado à mão de ${isPlayer ? 'Jogador' : 'Bot'}.`);
      this.updatePlacedCardsUI();
      this.laneManager.updateLanePowers();
      return;
    }
    console.log(
      `Mão de ${isPlayer ? 'Jogador' : 'Bot'} está cheia. ${card.name} não foi adicionado.`
    );
  }

  private updatePriorityHighlights(): void {
    const playerHasPriority = this.isNextTurn === 0;

    this.playerNameText.setColor('#ffffff');
    this.opponentNameText.setColor('#ffffff');
    const targetText = playerHasPriority ? this.playerNameText : this.opponentNameText;

    targetText.setColor('#00ff00');
  }

  private animateTurnChange(): void {
    this.tweens.add({
      targets: this.turnDisplay,
      scale: 1.2,
      alpha: 0.7,
      duration: 200,
      yoyo: true,
      ease: 'Power2',
    });
  }

  private handleMoveCard(data: {
    cardContainer: CardContainer;
    fromSlot: Slot;
    toSlot: Slot;
  }): void {
    const { cardContainer, fromSlot, toSlot } = data;
    const { cardData } = cardContainer;

    if (cardData.hasMoved) return;

    const fromLaneIndex = this.lanes.findIndex((l) => l.playerSlots.includes(fromSlot));
    const toLaneIndex = this.lanes.findIndex((l) => l.playerSlots.includes(toSlot));

    if (fromLaneIndex === toLaneIndex) {
      cardContainer.x = cardContainer.startX;
      cardContainer.y = cardContainer.startY;
      console.log(`${cardData.name} tentou se mover para a mesma lane. Movimento cancelado.`);
      return;
    }

    console.log(
      `${cardData.name} movido da lane ${fromLaneIndex + 1} para a lane ${toLaneIndex + 1}.`
    );

    fromSlot.occupied = false;
    delete fromSlot.cardData;
    delete fromSlot.power;
    delete fromSlot.permanentBonus;

    toSlot.occupied = true;
    toSlot.cardData = cardData;
    toSlot.power = fromSlot.power;
    toSlot.permanentBonus = fromSlot.permanentBonus;
    (cardContainer as any).slot = toSlot;

    cardContainer.x = toSlot.x;
    cardContainer.y = toSlot.y;
    this.updateAllGamePowers();
  }

  private updateAllGamePowers(): void {
    this.effectManager.updateAllCardPowers();

    this.laneManager.updateLaneProperties();
    this.updatePlacedCardsUI();
    this.laneManager.updateLanePowers();

    this.effectManager.updateMoves(this.placedCardContainers);
  }

  private recordInitialCardPositions(): void {
    this.placedCardContainers.forEach((container) => {
      const { cardData, slot } = container as any;
      if (cardData && slot) {
        const laneIndex = this.lanes.findIndex(
          (l) => l.playerSlots.includes(slot) || l.opponentSlots.includes(slot)
        );
        if (cardData.laneIndexAtStartOfTurn === undefined) {
          cardData.laneIndexAtStartOfTurn = laneIndex;
          console.log(`${cardData.name} iniciou o turno na lane ${laneIndex}.`);
        }
      }
    });
  }

  private processLog(action: EffectAction): void {
    switch (action.type) {
      case 'LOG_MESSAGE':
        this.logHistoryButton.addLog(action.payload.message);
        break;
    }
  }

  private processHand(action: EffectAction): void {
    switch (action.type) {
      case 'ADD_TO_HAND':
        this.addCardToHand(action.payload.card, action.payload.isPlayer);
        break;
    }
  }
}
