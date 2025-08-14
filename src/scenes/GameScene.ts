import Phaser from 'phaser';
import { Card, CardData } from '@/interfaces/Card';
import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';

import { CardContainer } from '@/components/CardContainer';
import { LaneDisplay } from '@/components/LaneDisplay';
import { EnergyDisplay } from '@/components/EnergyDisplay';
import { TurnDisplay } from '@/components/TurnDisplay';
import { EndTurnButton } from '@/components/EndTurnButton';
import { CardDetailsPanel } from '@/components/CardDetailsPanel';

import { DragAndDropManager } from '@/utils/DragAndDropManager';
import { BotAI } from '@/utils/BotAI';
import { GameEndManager } from '@/utils/GameEndManager';
import { EndBattleButton } from '@/components/EndBattleButton';
import { DeckDisplay } from '@/components/DeckDisplay';
import { botDeck, playerDeck } from '@/data/CardPool';
import { LogHistoryButton } from '@/components/LogHistoryButton';

export default class GameScene extends Phaser.Scene {
  private playerHand: Omit<Card, 'index'>[] = [];
  private botHand: Omit<Card, 'index'>[] = [];
  private playerDeckMutable: Omit<Card, 'index'>[] = [];
  private botDeckMutable: Omit<Card, 'index'>[] = [];

  private isPlayerTurn = true;
  private lanes: Lane[] = [];
  private playerHandContainers: CardContainer[] = [];
  private botHandContainers: CardContainer[] = [];
  private currentTurn = 1;
  private playerEnergy = 0;
  private botEnergy = 0;
  private maxTurn = 7;
  private isNextTurn: 0 | 1 = 0;

  // Instâncias dos componentes
  private laneDisplay!: LaneDisplay;
  private energyDisplay!: EnergyDisplay;
  private turnDisplay!: TurnDisplay;
  private endTurnButton!: EndTurnButton;
  private cardDetailsPanel!: CardDetailsPanel;
  private dragAndDropManager!: DragAndDropManager;
  private botAI!: BotAI;
  private gameEndManager!: GameEndManager;
  private endBattleButton!: EndBattleButton;
  private playerDeckDisplay!: DeckDisplay;
  private enemyDeckDisplay!: DeckDisplay;
  private logHistoryButton!: LogHistoryButton;
  private tempPlayerMoves: Array<{ cardName: string; laneIndex: number }> = [];
  private tempBotMoves: Array<{ cardName: string; laneIndex: number }> = [];

  create(): void {
    this.laneDisplay = new LaneDisplay(this);
    this.energyDisplay = new EnergyDisplay(this);
    this.turnDisplay = new TurnDisplay(this);
    this.endTurnButton = new EndTurnButton(this);
    this.cardDetailsPanel = new CardDetailsPanel(this);
    this.endBattleButton = new EndBattleButton(this);
    this.playerDeckDisplay = new DeckDisplay(this, 'Deck jogador');
    this.enemyDeckDisplay = new DeckDisplay(this, 'Deck adversário');
    this.playerDeckMutable = [...playerDeck];
    this.botDeckMutable = [...botDeck];
    this.playerHand = this.drawInitialHand(this.playerDeckMutable, 4);
    this.botHand = this.drawInitialHand(this.botDeckMutable, 4);
    this.logHistoryButton = new LogHistoryButton(this);

    this.initializeGameDecks();
    this.initializeGameLanes();
    this.initializeEnergyDisplay();
    this.initializeTurnDisplay();
    this.initializeEndTurnButton();
    this.initializeEndBattleButton();
    this.initializeCardDetailsPanel();
    this.initializeLogHistoryButton();

    this.dragAndDropManager = new DragAndDropManager(
      this,
      this.lanes,
      this.playerEnergy,
      this.isPlayerTurn,
      this.placeCardOnSlot.bind(this),
      this.removeCardFromPlayerHand.bind(this),
      this.updateEnergyText.bind(this),
      this.updateLanePowers.bind(this),
      this.animateCardReturn.bind(this),
      this.renderPlayerHand.bind(this)
    );

    this.playerEnergy = this.currentTurn;
    this.botEnergy = this.currentTurn;
    this.updateEnergyText();

    this.renderPlayerHand();
    this.renderBotHand();

    this.botAI = new BotAI(this, this.lanes, this.botHand, this.botEnergy);

    this.gameEndManager = new GameEndManager(this, this.lanes, this.logHistoryButton);
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
    this.energyDisplay.initialize(energyX, centerY, this.playerEnergy);
  }

  private initializeTurnDisplay(): void {
    const screenWidth = this.scale.width;
    const centerY = this.scale.height / 2;
    this.turnDisplay.initialize(screenWidth - 20, centerY, this.currentTurn);
    this.turnDisplay.updateTurn(`${this.currentTurn}/${this.maxTurn - 1}`);
  }

  private initializeEndTurnButton(): void {
    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;
    this.endTurnButton.initialize(screenWidth - 20, screenHeight - 40, () => {
      if (this.isPlayerTurn) {
        this.endTurn();
      }
    });
  }

  private initializeEndBattleButton(): void {
    const centerY = this.scale.height / 2;
    this.endBattleButton.initialize(20, centerY, () => {
      if (this.gameEndManager.isGameEnded()) {
        console.log('Finalizar batalha');
      }
    });
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

  private renderPlayerHand(): void {
    this.playerHandContainers.forEach((c) => c.destroy());
    this.playerHandContainers = [];

    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;
    const totalCards = this.playerHand.length;
    const cardWidth = 100;
    const cardSpacing = 30;
    const totalWidth = cardWidth * totalCards + cardSpacing * (totalCards - 1);
    const startX = (screenWidth - totalWidth) / 2;
    const handY = screenHeight - 120;

    this.playerHand.forEach((card, index) => {
      const x = startX + index * (cardWidth + cardSpacing);
      const y = handY;

      const cardContainer = new CardContainer(
        this,
        x,
        y,
        cardWidth,
        140,
        0x0088ff,
        card,
        index,
        true
      );

      this.add.existing(cardContainer);
      this.playerHandContainers.push(cardContainer);
    });

    this.updatePlayableCardsBorder();
  }

  private renderBotHand(): void {
    this.botHandContainers.forEach((c) => c.destroy());
    this.botHandContainers = [];

    const screenWidth = this.scale.width;
    const totalCards = this.botHand.length;
    const cardWidth = 100;
    const cardSpacing = 30;
    const totalWidth = cardWidth * totalCards + cardSpacing * (totalCards - 1);
    const startX = (screenWidth - totalWidth) / 2;
    const handY = 100;

    this.botHand.forEach((card, index) => {
      const x = startX + index * (cardWidth + cardSpacing);
      const y = handY;

      const cardContainer = new CardContainer(
        this,
        x,
        y,
        cardWidth,
        140,
        0xff0000,
        card,
        index,
        false
      );

      this.add.existing(cardContainer);
      this.botHandContainers.push(cardContainer);
      // Ocultar mão do adversário
      // cardContainer.setTextsVisible(false);
    });
  }

  private animateCardReturn(container: CardContainer, onComplete?: () => void): void {
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 200,
      ease: 'Back.out',
    });

    this.tweens.add({
      targets: container,
      x: container.startX,
      y: container.startY,
      duration: 300,
      ease: 'Power2.out',
      onComplete: () => {
        container.list.forEach((child) => {
          if (child instanceof Phaser.GameObjects.Text) {
            child.setVisible(true);
          }
        });
        onComplete?.();
      },
    });
  }

  private adjustTextFontSize(
    textObj: Phaser.GameObjects.Text,
    maxWidth: number,
    maxFontSize: number = 14,
    minFontSize: number = 8
  ): void {
    textObj.setWordWrapWidth(maxWidth, true);

    let fontSize = maxFontSize;
    while (fontSize >= minFontSize) {
      textObj.setFontSize(fontSize);
      if (textObj.width <= maxWidth) break;
      fontSize--;
    }
  }

  private placeCardOnSlot(slot: Slot, cardData: CardData): void {
    const cardWidth = 80;
    const cardHeight = 110;
    const cardColor = 0x0088ff;

    const cardContainer = new CardContainer(
      this,
      slot.x,
      slot.y,
      cardWidth,
      cardHeight,
      cardColor,
      cardData,
      -1,
      false
    );

    this.add.existing(cardContainer);

    cardContainer.setInteractive({ useHandCursor: true });

    cardContainer.on('pointerdown', () => {
      this.removePlacedCard(cardContainer);
    });

    slot.occupied = true;
    slot.power = cardData.power;

    this.playerEnergy -= cardData.cost;
    this.updateEnergyText();

    (cardContainer as any).placed = true;
    (cardContainer as any).slot = slot;
    (cardContainer as any).cardData = cardData;
    (cardContainer as any).turnPlayed = this.currentTurn;

    // Substituir o log imediato por armazenamento temporário
    const playerLaneIndex = this.lanes.findIndex((lane) => lane.playerSlots.includes(slot));
    if (playerLaneIndex !== -1) {
      this.tempPlayerMoves.push({
        cardName: cardData.name,
        laneIndex: playerLaneIndex + 1,
      });
    }
  }

  private removeCardFromPlayerHand(index: number): void {
    this.playerHand.splice(index, 1);
  }

  private updateEnergyText(): void {
    this.energyDisplay.updateEnergy(this.playerEnergy);
    this.dragAndDropManager.updatePlayerEnergy(this.playerEnergy);
    this.updatePlayableCardsBorder();
  }

  private updateLanePowers(): void {
    for (const lane of this.lanes) {
      const { enemyPower, playerPower } = this.calculateLanePower(lane);

      lane.enemyPowerText?.setText(enemyPower.toString());
      lane.playerPowerText?.setText(playerPower.toString());
    }
  }

  private calculateLanePower(lane: Lane): {
    enemyPower: number;
    playerPower: number;
  } {
    let enemyPower = 0;
    for (const slot of lane.botSlots) {
      enemyPower += slot.power ?? 0;
    }

    let playerPower = 0;
    for (const slot of lane.playerSlots) {
      playerPower += slot.power ?? 0;
    }

    return { enemyPower, playerPower };
  }

  private endTurn(): void {
    this.isPlayerTurn = false;
    this.endTurnButton.setVisible(false);

    this.time.delayedCall(1000, () => {
      this.botAI.updateBotEnergy(this.botEnergy);
      this.botAI.updateBotHand(this.botHand);
      this.botAI.executeTurn(
        this.playBotCardOnSlot.bind(this),
        this.renderBotHand.bind(this),
        this.updateLanePowers.bind(this)
      );

      this.currentTurn++;
      this.turnDisplay.updateTurn(`${this.currentTurn}/${this.maxTurn - 1}`);
      this.turnDisplay.animateTurnChange();

      this.playerEnergy = this.currentTurn;
      this.botEnergy = this.currentTurn;
      this.updateEnergyText();

      this.isPlayerTurn = true;
      this.endTurnButton.setVisible(true);

      this.dragAndDropManager.updatePlayerEnergy(this.playerEnergy);
      this.dragAndDropManager.updatePlayerTurnStatus(this.isPlayerTurn);

      this.logMovesInOrder();

      for (const lane of this.lanes) {
        const { enemyPower, playerPower } = this.calculateLanePower(lane);
        this.laneDisplay.updateLanePowerColors(lane, playerPower, enemyPower);
      }

      if (this.currentTurn >= this.maxTurn) {
        console.log(this.currentTurn);
        this.gameEndManager.checkGameEnd();
        // Habilita o botão de fim de batalha
        this.endBattleButton.setVisible(true);
        // Desabilita o botão de fim de turno
        this.endTurnButton.setVisible(false);
        this.turnDisplay.setVisible(false);
        this.energyDisplay.setVisible(false);
        this.disablePlayerCardInteraction();
        this.enemyDeckDisplay.enableModalOpen();
      } else {
        this.isPlayerTurn = true;
        this.drawCardForPlayer(this.playerHand, this.playerDeckMutable);
        this.drawCardForPlayer(this.botHand, this.botDeckMutable);
        this.playerDeckDisplay.updateDeck(this.playerDeckMutable.length);
        this.enemyDeckDisplay.updateDeck(this.botDeckMutable.length);
        this.renderPlayerHand();
        this.renderBotHand();
      }
    });
  }

  private playBotCardOnSlot(slot: Slot, card: Omit<Card, 'index'>): void {
    const cardContainer = this.add.container(slot.x, slot.y);
    const cardRect = this.add.rectangle(0, 0, 80, 110, 0xff0000);

    const nameText = this.add
      .text(0, 45, card.name, {
        color: '#ffffff',
        fontSize: '14px',
        align: 'center',
      })
      .setOrigin(0.5, 1);

    this.adjustTextFontSize(nameText, 70);

    const powerText = this.add
      .text(30, -45, String(card.power), {
        color: '#ffff00',
        fontSize: '14px',
        fontStyle: 'bold',
        align: 'right',
      })
      .setOrigin(1, 0);

    const costText = this.add
      .text(-30, -45, String(card.cost), {
        color: '#ffffff',
        fontSize: '14px',
        align: 'left',
      })
      .setOrigin(0, 0);

    cardContainer.add([cardRect, nameText, powerText, costText]);
    cardContainer.setSize(80, 110);
    cardContainer.setInteractive({ useHandCursor: true });

    (cardContainer as any).cardData = card;

    slot.occupied = true;
    slot.power = card.power;

    const index = this.botHand.indexOf(card);
    if (index >= 0) {
      this.botHand.splice(index, 1);
    }

    this.botEnergy -= card.cost;

    // Substituir o log imediato por armazenamento temporário
    const botLaneIndex = this.lanes.findIndex((lane) => lane.botSlots.includes(slot));
    if (botLaneIndex !== -1) {
      this.tempBotMoves.push({
        cardName: card.name,
        laneIndex: botLaneIndex + 1,
      });
    }
  }

  private removePlacedCard(container: Phaser.GameObjects.Container): void {
    const turnPlayed = (container as any).turnPlayed as number;

    if (turnPlayed !== this.currentTurn) {
      console.log('Carta jogada em turno anterior. Não pode voltar.');
      return;
    }

    if (turnPlayed === this.currentTurn) {
      this.playerEnergy += (container as any).cardData.cost;
      console.log('this.playerEnergy', this.playerEnergy);
      this.updateEnergyText();
    }

    // Remover a jogada do registro temporário se a carta for removida
    const slot = (container as any).slot as Slot;
    const cardData = (container as any).cardData as Card;
    const playerLaneIndex = this.lanes.findIndex((lane) => lane.playerSlots.includes(slot));

    if (playerLaneIndex !== -1) {
      this.tempPlayerMoves = this.tempPlayerMoves.filter(
        (move) => !(move.cardName === cardData.name && move.laneIndex === playerLaneIndex + 1)
      );
    }

    slot.occupied = false;
    delete slot.power;

    const originalIndex = (container as any).cardData.index;

    if (originalIndex !== undefined && originalIndex >= 0) {
      this.playerHand.splice(originalIndex, 0, {
        name: cardData.name,
        cost: cardData.cost,
        power: cardData.power,
        description: cardData.description,
      });
    } else {
      this.playerHand.push({
        name: cardData.name,
        cost: cardData.cost,
        power: cardData.power,
        description: cardData.description,
      });
    }

    container.destroy();
    this.updateLanePowers();
    this.renderPlayerHand();
    this.endTurnButton.setVisible(true);
    this.cardDetailsPanel.hideCardDetails();
  }

  private setupCardDetailsEvents(): void {
    this.input.on(
      'gameobjectover',
      (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
        const container = gameObject as Phaser.GameObjects.Container & {
          cardData?: CardData;
        };

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

  private drawInitialHand(deck: Omit<Card, 'index'>[], count: number): Omit<Card, 'index'>[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Phaser.Math.Between(0, i);
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const hand: Omit<Card, 'index'>[] = [];
    for (let i = 0; i < count; i++) {
      if (deck.length === 0) break;
      hand.push(deck.shift()!);
    }
    return hand;
  }

  private drawCardForPlayer(hand: Omit<Card, 'index'>[], deck: Omit<Card, 'index'>[]): void {
    if (hand.length >= 7) return;
    if (deck.length === 0) return;

    const card = deck.shift()!;
    hand.push(card);
  }

  private updatePlayableCardsBorder(): void {
    this.playerHandContainers.forEach((cardContainer) => {
      if (cardContainer.cardData.cost <= this.playerEnergy) {
        cardContainer.showPlayableBorder(true);
      } else {
        cardContainer.showPlayableBorder(false);
      }
    });
  }

  private disablePlayerCardInteraction(): void {
    this.playerHandContainers.forEach((cardContainer) => {
      cardContainer.showPlayableBorder(false);
    });

    this.dragAndDropManager.disableDrag();
  }

  private logMovesInOrder(): void {
    // separador do turno (o turno que acabou é currentTurn - 1)
    this.logHistoryButton.addLog(`---------- Turno ${this.currentTurn - 1} ----------`);

    // Define ordem pelo estado atual de isNextTurn
    let firstMoves: Array<{ cardName: string; laneIndex: number }>;
    let secondMoves: Array<{ cardName: string; laneIndex: number }>;
    let firstLabel: string;
    let secondLabel: string;

    if (this.isNextTurn === 0) {
      firstMoves = this.tempPlayerMoves;
      firstLabel = 'Jogador';
      secondMoves = this.tempBotMoves;
      secondLabel = 'Bot';
    } else {
      firstMoves = this.tempBotMoves;
      firstLabel = 'Bot';
      secondMoves = this.tempPlayerMoves;
      secondLabel = 'Jogador';
    }

    // Função para registrar logs
    const registerLogs = (
      moves: Array<{ cardName: string; laneIndex: number }>,
      label: string
    ): void => {
      moves.forEach((move) => {
        this.logHistoryButton.addLog(
          `${label} jogou a carta ${move.cardName} na lane ${move.laneIndex}`
        );
      });
    };

    registerLogs(firstMoves, firstLabel);
    registerLogs(secondMoves, secondLabel);

    // Limpa buffers temporários do turno que acabou
    this.tempPlayerMoves = [];
    this.tempBotMoves = [];

    // Agora define quem começa a logar no próximo turno baseado no estado final do jogo
    this.isNextTurn = this.getLeadingPlayer();
  }

  private getLeadingPlayer(): 0 | 1 {
    let playerWins = 0;
    let botWins = 0;
    let playerTotalPowerDifference = 0;
    let botTotalPowerDifference = 0;

    for (const lane of this.lanes) {
      const { playerPower, enemyPower } = this.calculateLanePower(lane);

      if (playerPower > enemyPower) {
        playerWins++;
        playerTotalPowerDifference += playerPower - enemyPower;
      } else if (enemyPower > playerPower) {
        botWins++;
        botTotalPowerDifference += enemyPower - playerPower;
      }
    }

    if (playerWins > botWins) {
      return 0; // jogador
    } else if (botWins > playerWins) {
      return 1; // bot
    } else {
      if (playerTotalPowerDifference > botTotalPowerDifference) {
        return 0;
      } else if (botTotalPowerDifference > playerTotalPowerDifference) {
        return 1;
      } else {
        return Phaser.Math.Between(0, 1) as 0 | 1; // empate total, random
      }
    }
  }
}
