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
import { CardEffectManager } from '@/utils/CardEffectManager';
import { CardEffect } from '@/enums/CardEffect';
import { SceneEnum } from '@/enums/SceneEnum';

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
  // private isNextTurn: 0 | 1 = 0;
  private isNextTurn: 0 | 1 = Phaser.Math.Between(0, 1) as 0 | 1;

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
  private revealQueue: {
    card: CardData;
    laneIndex: number;
    slot: Slot;
    isPlayer: boolean;
    turnPlayed: number;
  }[] = [];

  private effectManager!: CardEffectManager;
  private placedCardContainers: CardContainer[] = [];

  constructor() {
    super(SceneEnum.Game);
  }

  public create(): void {
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
    this.effectManager = new CardEffectManager(this.lanes);

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
      if (this.isPlayerTurn) this.endTurn();
    });
  }

  private initializeEndBattleButton(): void {
    const centerY = this.scale.height / 2;
    this.endBattleButton.initialize(20, centerY, () => {
      if (this.gameEndManager.isGameEnded()) console.log('Finalizar batalha');
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
      // Mostra a mão do adversário
      cardContainer.setTextsVisible(true);
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

  private adjustTextFontSize(
    textObj: Phaser.GameObjects.Text,
    maxWidth: number,
    maxFontSize = 14,
    minFontSize = 8
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

  private calculateLanePower(lane: Lane): { enemyPower: number; playerPower: number } {
    const playerPower = this.calculateSideTotalPower(lane.playerSlots, lane.index);
    const enemyPower = this.calculateSideTotalPower(lane.botSlots, lane.index);
    return { enemyPower, playerPower };
  }

  private calculateSideTotalPower(slots: Slot[], laneIndex: number): number {
    let totalPower = slots.reduce((sum, slot) => sum + (slot.power ?? 0), 0);
    totalPower += this.getAdjacentLaneBonus(slots, laneIndex);
    totalPower = this.applyMultiplicativeEffects(totalPower, slots, laneIndex);

    return totalPower;
  }

  private getAdjacentLaneBonus(currentLaneSlots: Slot[], currentLaneIndex: number): number {
    let totalBonus = 0;
    const isPlayerSide = this.lanes[currentLaneIndex].playerSlots === currentLaneSlots;

    totalBonus += this.checkNeighboringLaneForBonus(
      this.lanes[currentLaneIndex - 1],
      isPlayerSide,
      [CardEffect.MisterFantasticBuff, CardEffect.KlawRightBuff],
      currentLaneIndex
    );

    totalBonus += this.checkNeighboringLaneForBonus(
      this.lanes[currentLaneIndex + 1],
      isPlayerSide,
      [CardEffect.MisterFantasticBuff],
      currentLaneIndex
    );

    return totalBonus;
  }

  private checkNeighboringLaneForBonus(
    neighborLane: Lane | undefined,
    isCheckingPlayerSide: boolean,
    effectsToLookFor: CardEffect[],
    receivingLaneIndex: number
  ): number {
    if (!neighborLane) return 0;

    let bonusFromThisLane = 0;
    const neighborSlots = isCheckingPlayerSide ? neighborLane.playerSlots : neighborLane.botSlots;
    const sideIdentifier = isCheckingPlayerSide ? 'Jogador' : 'Bot';

    const onslaughtCount = neighborSlots.filter(
      (s) =>
        s.occupied &&
        s.cardData?.effect?.some((e) => e.effect === CardEffect.OnslaughtDoubleOngoing)
    ).length;
    const effectMultiplier = Math.pow(2, onslaughtCount);

    for (const slot of neighborSlots) {
      if (slot.occupied && slot.cardData?.effect) {
        for (const effect of slot.cardData.effect) {
          if (effectsToLookFor.includes(effect.effect)) {
            const value = typeof effect.value === 'number' ? effect.value : 0;

            const finalBonus = value * effectMultiplier;
            bonusFromThisLane += finalBonus;

            console.log(
              `Lane ${receivingLaneIndex + 1} (${sideIdentifier}) recebeu +${finalBonus} de ${slot.cardData.name} da lane ${neighborLane.index + 1}.`
            );
            if (effectMultiplier > 1) {
              console.log(`(Efeito dobrado por Onslaught na lane ${neighborLane.index + 1}!)`);
            }
          }
        }
      }
    }
    return bonusFromThisLane;
  }

  private applyMultiplicativeEffects(
    currentPower: number,
    slots: Slot[],
    laneIndex: number
  ): number {
    const ironManCards = slots.filter(
      (s) =>
        s.occupied && s.cardData?.effect?.some((e) => e.effect === CardEffect.IronManDoublePower)
    );

    const onslaughtCards = slots.filter(
      (s) =>
        s.occupied &&
        s.cardData?.effect?.some((e) => e.effect === CardEffect.OnslaughtDoubleOngoing)
    );

    if (ironManCards.length === 0) {
      return currentPower;
    }

    const ironManEffectApplications = Math.pow(2, onslaughtCards.length);
    const finalMultiplier = Math.pow(2, ironManCards.length * ironManEffectApplications);

    if (finalMultiplier > 1) {
      console.log(
        `Poder da lane ${laneIndex + 1} multiplicado por ${finalMultiplier}x devido a Homem de Ferro e Onslaught!`
      );
      return currentPower * finalMultiplier;
    }

    return currentPower;
  }

  private endTurn(): void {
    this.isPlayerTurn = false;
    this.endTurnButton.setVisible(false);

    this.time.delayedCall(1000, () => {
      this.executeBotTurn();
      this.processRevealQueue();

      this.advanceTurn();
      this.refreshEnergies();
      this.enablePlayerTurnUI();
      this.syncDragState();
      this.updateLaneColors();
      this.isNextTurn = this.getLeadingPlayer();
      this.updatePriorityHighlights();

      if (this.currentTurn >= this.maxTurn) {
        this.handleGameEnd();
      } else {
        this.prepareNextRound();
      }
    });
  }

  private playBotCardOnSlot(slot: Slot, card: Omit<Card, 'index'>): void {
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

    const botLaneIndex = this.lanes.findIndex((lane) => lane.botSlots.includes(slot));
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

  private createNameText(card: Omit<Card, 'index'>): Phaser.GameObjects.Text {
    const nameText = this.add
      .text(0, 45, card.name, {
        color: '#ffffff',
        fontSize: '14px',
        align: 'center',
      })
      .setOrigin(0.5, 1);

    this.adjustTextFontSize(nameText, 70);
    return nameText;
  }

  private createPowerText(card: Omit<Card, 'index'>): Phaser.GameObjects.Text {
    return this.add
      .text(30, -45, String(card.power), {
        color: '#ffff00',
        fontSize: '14px',
        fontStyle: 'bold',
        align: 'right',
      })
      .setOrigin(1, 0);
  }

  private createCostText(card: Omit<Card, 'index'>): Phaser.GameObjects.Text {
    return this.add
      .text(-30, -45, String(card.cost), {
        color: '#ffffff',
        fontSize: '14px',
        align: 'left',
      })
      .setOrigin(0, 0);
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
    const cardToReturn: Omit<Card, 'index'> = {
      name: cardData.name,
      cost: cardData.cost,
      power: cardData.power,
      description: cardData.description,
      effect: cardData.effect,
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
    this.updateLanePowers();
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
    this.playerHandContainers.forEach((container) => {
      container.showPlayableBorder(container.cardData.cost <= this.playerEnergy);
    });
  }

  private disablePlayerCardInteraction(): void {
    this.playerHandContainers.forEach((container) => container.showPlayableBorder(false));
    this.dragAndDropManager.disableDrag();
  }

  private getLeadingPlayer(): 0 | 1 {
    let playerWins = 0;
    let botWins = 0;
    let playerDiff = 0;
    let botDiff = 0;

    for (const lane of this.lanes) {
      const { playerPower, enemyPower } = this.calculateLanePower(lane);
      if (playerPower > enemyPower) {
        playerWins++;
        playerDiff += playerPower - enemyPower;
      } else if (enemyPower > playerPower) {
        botWins++;
        botDiff += enemyPower - playerPower;
      }
    }

    if (playerWins > botWins) return 0;
    if (botWins > playerWins) return 1;
    if (playerDiff > botDiff) return 0;
    if (botDiff > playerDiff) return 1;
    return Phaser.Math.Between(0, 1) as 0 | 1;
  }

  private executeBotTurn(): void {
    this.botAI.updateBotEnergy(this.botEnergy);
    this.botAI.updateBotHand(this.botHand);
    this.botAI.executeTurn(
      this.playBotCardOnSlot.bind(this),
      this.renderBotHand.bind(this),
      this.updateLanePowers.bind(this)
    );
  }

  private advanceTurn(): void {
    this.currentTurn++;
    this.turnDisplay.updateTurn(`${this.currentTurn}/${this.maxTurn - 1}`);
    this.turnDisplay.animateTurnChange();
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

  private updateLaneColors(): void {
    for (const lane of this.lanes) {
      const { enemyPower, playerPower } = this.calculateLanePower(lane);
      this.laneDisplay.updateLanePowerColors(lane, playerPower, enemyPower);
    }
  }

  private handleGameEnd(): void {
    this.playerDeckDisplay.showPriorityBorder(false);
    this.enemyDeckDisplay.showPriorityBorder(false);
    this.effectManager.recalcOngoingEffects();
    this.updatePlacedCardsUI();
    this.updateLanePowers();

    const finalLanePowers = this.lanes.map((lane) => {
      const { playerPower, enemyPower } = this.calculateLanePower(lane);
      return { playerPower, botPower: enemyPower };
    });

    this.gameEndManager.checkGameEnd(finalLanePowers);

    this.endBattleButton.setVisible(true);
    this.endTurnButton.setVisible(false);
    this.turnDisplay.setVisible(false);
    this.energyDisplay.setVisible(false);
    this.disablePlayerCardInteraction();
    this.enemyDeckDisplay.enableModalOpen();
    this.revealBotHand();
  }

  private prepareNextRound(): void {
    this.effectManager.applyEndOfTurnEffects();
    this.effectManager.recalcOngoingEffects();
    this.updateLaneProperties();
    this.updatePlacedCardsUI();
    this.updateLanePowers();

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
    this.botHandContainers.forEach((container) => {
      container.setTextsVisible(true);
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
    const playerRevealsFirst = this.getLeadingPlayer() === 0;
    this.revealQueue.sort((a, b) => {
      if (a.isPlayer === b.isPlayer) return 0;
      return a.isPlayer === playerRevealsFirst ? -1 : 1;
    });

    this.logHistoryButton.addLog(`---------- Turno ${this.currentTurn} ----------`);

    console.log(
      'Ordem de Revelação:',
      this.revealQueue.map((item) => `${item.card.name} (${item.isPlayer ? 'Jogador' : 'Bot'})`)
    );

    for (const item of this.revealQueue) {
      const playerName = item.isPlayer ? 'Jogador' : 'Bot';
      this.logHistoryButton.addLog(
        `${playerName} jogou a carta ${item.card.name} na lane ${item.laneIndex + 1}`
      );

      console.log(`Revelando ${item.card.name}...`);
      if (item.slot.cardData) {
        item.slot.cardData.isRevealed = true;
      }
      const actions = this.effectManager.applyOnRevealEffect(
        item.card,
        item.laneIndex,
        item.slot,
        item.isPlayer,
        item.turnPlayed,
        this.revealQueue
      );

      for (const action of actions) {
        if (action.type === 'ADD_TO_HAND') {
          this.addCardToHand(action.payload.card, action.payload.isPlayer);
        }
      }

      this.effectManager.triggerOnCardPlayedEffects(item.card, item.laneIndex);
      this.updatePlacedCardsUI();
      this.updateLanePowers();
    }
    this.revealQueue = [];

    this.renderPlayerHand();
    this.renderBotHand();

    console.log('Recalculando todos os efeitos Ongoing após as revelações.');
    this.effectManager.recalcOngoingEffects();
    this.updateLaneProperties();
    this.updatePlacedCardsUI();
    this.updateLanePowers();
  }

  private addCardToHand(card: Omit<Card, 'index'>, isPlayer: boolean): void {
    const targetHand = isPlayer ? this.playerHand : this.botHand;

    if (targetHand.length < this.maxTurn) {
      targetHand.push(card);
      console.log(`${card.name} adicionado à mão de ${isPlayer ? 'Jogador' : 'Bot'}.`);
    } else {
      console.log(
        `Mão de ${isPlayer ? 'Jogador' : 'Bot'} está cheia. ${card.name} não foi adicionado.`
      );
    }
  }

  private updatePriorityHighlights(): void {
    const playerHasPriority = this.isNextTurn === 0;

    this.playerDeckDisplay.showPriorityBorder(playerHasPriority);
    this.enemyDeckDisplay.showPriorityBorder(!playerHasPriority);
  }

  private updateLaneProperties(): void {
    for (const lane of this.lanes) {
      if (!lane.properties) lane.properties = {};
      lane.properties.cardsCannotBeDestroyed = false;

      const isArmorPresent = [...lane.playerSlots, ...lane.botSlots].some(
        (s) =>
          s.occupied && s.cardData?.effect?.some((e) => e.effect === CardEffect.ArmorPreventDestroy)
      );
      if (isArmorPresent) {
        lane.properties.cardsCannotBeDestroyed = true;
        console.log(`Lane ${lane.index + 1} está protegida pela Armor!`);
      }
    }
  }
}
