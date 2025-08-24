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
import { LogHistoryButton } from '@/components/LogHistoryButton';
import { CardEffectManager } from '@/managers/card-effects/CardEffectManager';
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
import { HandManager } from '@/managers/HandManager';
import { opponentDeck, playerDeck } from '@/data/CardPool';

export default class GameScene extends Phaser.Scene {
  private isPlayerTurn = true;
  private lanes: Lane[] = [];
  private currentTurn = 1;
  private playerEnergy = 0;
  private opponentEnergy = 0;
  private maxTurn = 7;
  private isNextTurn: 0 | 1 = Phaser.Math.Between(0, 1) as 0 | 1;
  private showOpponentHand = false;
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
  private handManager!: HandManager;

  constructor() {
    super(SceneEnum.Game);
  }

  init(): void {
    this.placedCardContainers = [];
    this.currentTurn = 1;
    this.playerEnergy = 1;
    this.lanes = [];
    this.showOpponentHand = true;
    this.maxTurn = 7;

    // remove events
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      GameEventManager.instance.off(GameEvent.LogRequest);
      GameEventManager.instance.off(GameEvent.AddCardToHand);
      GameEventManager.instance.off(GameEvent.PlacedCardsUI);
      GameEventManager.instance.off(GameEvent.PlaceCardOnSlot);
      if (this.handManager) {
        this.handManager.clear();
      }
    });
  }

  public create(): void {
    this.laneDisplay = new LaneDisplay(this);
    this.cardDetailsPanel = new CardDetailsPanel(this);
    this.playerDeckDisplay = new DeckDisplay(this, 'Deck jogador');
    this.enemyDeckDisplay = new DeckDisplay(this, 'Deck oponente');
    this.logHistoryButton = new LogHistoryButton(this);
    this.effectManager = new CardEffectManager(this.lanes);

    this.createBackground();
    this.initializePlayerNames();
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
    GameEventManager.instance.on(GameEvent.PlacedCardsUI, () => {
      this.updatePlacedCardsUI();
    });
    GameEventManager.instance.on(
      GameEvent.PlaceCardOnSlot,
      (data: { slot: Slot; cardData: CardData }) => {
        this.placeCardOnSlot(data.slot, data.cardData);
      }
    );

    // managers
    this.laneManager = new LaneManager(this.lanes, this.laneDisplay);
    this.handManager = new HandManager(this, this.laneManager);
    this.handManager.initialize(playerDeck, opponentDeck);

    this.initializeGameDecks();

    this.dragAndDropManager = new DragAndDropManager(
      this,
      this.lanes,
      this.playerEnergy,
      this.isPlayerTurn,
      this.removeCardFromPlayerHand.bind(this),
      this.updateEnergyText.bind(this),
      this.laneManager.updateLanePowers.bind(this.laneManager),
      this.animateCardReturn.bind(this)
    );

    this.playerEnergy = this.currentTurn;
    this.opponentEnergy = this.currentTurn;
    this.updateEnergyText();

    this.handManager.renderPlayerHand(this.playerEnergy);
    this.handManager.renderOpponentHand(this.showOpponentHand);

    this.botAI = new BotAIManager(
      this,
      this.lanes,
      this.handManager.opponentHand,
      this.opponentEnergy
    );
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
    this.enemyDeckDisplay.initialize(
      20,
      40,
      this.handManager.opponentHand.length,
      this.handManager.opponentDeckMutable
    );
    this.playerDeckDisplay.initialize(
      20,
      this.scale.height - 40,
      this.handManager.playerHand.length,
      this.handManager.playerDeckMutable
    );
    this.playerDeckDisplay.updateDeck(this.handManager.playerDeckMutable.length);
    this.playerDeckDisplay.enableModalOpen();
    this.enemyDeckDisplay.updateDeck(this.handManager.opponentDeckMutable.length);
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
    this.handManager.disablePlayerCardInteraction(
      this.placedCardContainers,
      this.dragAndDropManager
    );
    this.enemyDeckDisplay.enableModalOpen();
    this.showOpponentHand = true;
    this.revealOpponentHand();
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
    this.handManager.playerHand.splice(index, 1);
  }

  private updateEnergyText(): void {
    this.energyDisplay.setLabel(`Energia: ${this.playerEnergy}`);
    this.dragAndDropManager.updatePlayerEnergy(this.playerEnergy);
    this.handManager.updatePlayableCardsBorder(this.playerEnergy);
  }

  private endTurn(): void {
    this.isPlayerTurn = false;
    this.endTurnButton.setVisible(false);

    this.time.delayedCall(1000, () => {
      this.executeBotTurn();
      this.recordInitialCardPositions();
      this.effectManager.checkResolutionEffects(this.revealQueue, this.currentTurn);

      this.processRevealQueue();

      this.effectManager.handleMoveEffects();

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

    const indexInHand = this.handManager.opponentHand.indexOf(card);
    if (indexInHand >= 0) this.handManager.opponentHand.splice(indexInHand, 1);
    this.opponentEnergy -= cardData.cost;

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
      this.handManager.playerHand.splice(originalIndex, 0, cardToReturn);
    } else {
      this.handManager.playerHand.push(cardToReturn);
    }
    const containerIndex = this.placedCardContainers.indexOf(container);
    if (containerIndex > -1) {
      this.placedCardContainers.splice(containerIndex, 1);
    }

    container.destroy();
    this.laneManager.updateLanePowers();
    this.handManager.renderPlayerHand(this.playerEnergy);
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

  private executeBotTurn(): void {
    this.botAI.updateBotEnergy(this.opponentEnergy);
    this.botAI.updateBotHand(this.handManager.opponentHand);
    this.botAI.executeTurn(
      this.playBotCardOnSlot.bind(this),
      this.laneManager.updateLanePowers.bind(this.laneManager),
      this.showOpponentHand
    );
  }

  private advanceTurn(): void {
    this.currentTurn++;
    this.turnDisplay.setLabel(`Turno: ${this.currentTurn}/${this.maxTurn - 1}`);
    this.animateTurnChange();
  }

  private refreshEnergies(): void {
    this.playerEnergy = this.currentTurn;
    this.opponentEnergy = this.currentTurn;
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
    this.handManager.disablePlayerCardInteraction(
      this.placedCardContainers,
      this.dragAndDropManager
    );
    this.enemyDeckDisplay.enableModalOpen();
    this.showOpponentHand = true;
    this.revealOpponentHand();
  }

  private prepareNextRound(): void {
    this.effectManager.applyEndOfTurnEffects();
    this.updateAllGamePowers();

    this.laneManager.updateLaneProperties();
    this.updatePlacedCardsUI();
    this.laneManager.updateLanePowers();

    this.isPlayerTurn = true;
    this.handManager.drawCardForPlayer(true);
    this.handManager.drawCardForPlayer(false);
    this.playerDeckDisplay.updateDeck(this.handManager.playerDeckMutable.length);
    this.enemyDeckDisplay.updateDeck(this.handManager.opponentDeckMutable.length);
    this.handManager.renderPlayerHand(this.playerEnergy);
    this.handManager.renderOpponentHand(this.showOpponentHand);
  }

  private revealOpponentHand(): void {
    if (!this.showOpponentHand) return;
    this.handManager.opponentHandContainers.forEach((container) => {
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

      this.effectManager.triggerOnCardPlayedEffects(item.card, item.laneIndex);

      this.updatePlacedCardsUI();
      this.laneManager.updateLanePowers();
    }
    this.revealQueue = [];

    this.handManager.renderPlayerHand(this.playerEnergy);
    this.handManager.renderOpponentHand(this.showOpponentHand);

    console.log('Recalculando todos os efeitos Ongoing após as revelações.');
    this.updateAllGamePowers();
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
        this.handManager.addCardToHand(action.payload.card, action.payload.isPlayer, this.maxTurn);
        break;
    }
  }
}
