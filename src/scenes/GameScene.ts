import Phaser from "phaser";
import { Card, CardData } from "../entities/Card";
import { Lane } from "../entities/Lane";
import { Slot } from "../entities/Slot";

// =============================================
// Classe Principal do Jogo
// =============================================

export default class GameScene extends Phaser.Scene {
  // Propriedades do Jogo
  private playerHand: Omit<Card, "index">[] = [
    { name: "Homem de Ferro", cost: 2, power: 3 },
    { name: "Hulk", cost: 3, power: 6 },
    { name: "Viúva Negra", cost: 1, power: 2 },
    { name: "Capitão América", cost: 2, power: 4 },
    { name: "Nick Fury", cost: 5, power: 9 },
  ];

  private botHand: Omit<Card, "index">[] = [
    { name: "Thanos", cost: 3, power: 7 },
    { name: "Loki", cost: 2, power: 4 },
    { name: "Ultron", cost: 1, power: 2 },
    { name: "Capitão América", cost: 2, power: 4 },
    { name: "Thor", cost: 4, power: 8 },
  ];

  private isPlayerTurn = true;
  private lanes: Lane[] = [];
  private playerHandContainers: Phaser.GameObjects.Container[] = [];
  private botHandContainers: Phaser.GameObjects.Container[] = [];
  private endTurnButton?: Phaser.GameObjects.Text;
  private currentTurn = 1;
  private energyContainer?: Phaser.GameObjects.Container;
  private energyText?: Phaser.GameObjects.Text;
  private playerEnergy = 0;
  private botEnergy = 0;
  private turnText!: Phaser.GameObjects.Text;

  // Painel de detalhes da carta
  private cardDetailsPanel?: Phaser.GameObjects.Container;
  private cardNameText?: Phaser.GameObjects.Text;
  private cardPowerText?: Phaser.GameObjects.Text;
  private cardCostText?: Phaser.GameObjects.Text;
  private cardDescriptionText?: Phaser.GameObjects.Text;

  // =============================================
  // Métodos Principais do Phaser
  // =============================================

  create(): void {
    this.initializeGameTitle();
    this.initializeGameLanes();
    this.initializeEnergyDisplay();
    this.initializeTurnDisplay();
    this.initializeEndTurnButton();
    this.initializeCardDetailsPanel();

    this.playerEnergy = this.currentTurn;
    this.botEnergy = this.currentTurn;
    this.updateEnergyText();

    this.renderPlayerHand();
    this.renderBotHand();
  }

  // =============================================
  // Inicialização de Componentes
  // =============================================

  /**
   * Inicializa o título do jogo
   */
  private initializeGameTitle(): void {
    this.add.text(20, 20, "Marvel Snap Clone Offline", {
      color: "#fff",
      fontSize: "24px",
    });
  }

  /**
   * Inicializa as lanes (áreas de jogo)
   */
  private initializeGameLanes(): void {
    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;
    const totalLanes = 3;
    const spacing = screenWidth / (totalLanes + 1);
    const laneY = screenHeight / 2;

    for (let i = 0; i < totalLanes; i++) {
      const x = spacing * (i + 1);
      const y = laneY;

      const lane = this.createLane(x, y, i);
      this.lanes.push(lane);
    }
  }

  /**
   * Cria uma lane individual
   */
  private createLane(x: number, y: number, index: number): Lane {
    // Elementos visuais da lane
    const worldRect = this.add
      .rectangle(0, 0, 160, 100, 0x333333)
      .setStrokeStyle(2, 0xffffff);

    const worldText = this.add
      .text(0, 0, `Mundo ${index + 1}`, {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    const botPowerText = this.add
      .text(0, -100 / 2 + 15, "Poder Bot: 0", {
        fontSize: "14px",
        color: "#ff4444",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);

    const playerPowerText = this.add
      .text(0, 100 / 2 - 15, "Poder Jogador: 0", {
        fontSize: "14px",
        color: "#44ff44",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 1);

    const worldContainer = this.add.container(x, y, [
      worldRect,
      worldText,
      botPowerText,
      playerPowerText,
    ]);

    // Slots para cartas
    const playerSlots = this.createSlots(x, y, true);
    const botSlots = this.createSlots(x, y, false);

    return {
      x,
      y,
      playerSlots,
      botSlots,
      worldText,
      botPowerText,
      playerPowerText,
      worldContainer,
    };
  }

  /**
   * Cria os slots para cartas em uma lane
   */
  private createSlots(x: number, y: number, isPlayer: boolean): Slot[] {
    const slots: Slot[] = [];
    const cardWidth = 80;
    const cardHeight = 110;
    const cols = 2;
    const rowsPerSide = 2;
    const horizontalSpacing = 5;
    const verticalSpacing = 5;
    const marginFromRect = 10;

    const totalCardsWidth = cols * cardWidth + (cols - 1) * horizontalSpacing;
    const firstCardOffsetX = -totalCardsWidth / 2 + cardWidth / 2;

    for (let row = 0; row < rowsPerSide; row++) {
      for (let col = 0; col < cols; col++) {
        const offsetX =
          firstCardOffsetX + col * (cardWidth + horizontalSpacing);
        const slotX = x + offsetX;

        let slotY: number;
        if (isPlayer) {
          slotY =
            y +
            100 / 2 +
            marginFromRect +
            cardHeight / 2 +
            row * (cardHeight + verticalSpacing);
        } else {
          slotY =
            y -
            100 / 2 -
            marginFromRect -
            cardHeight / 2 -
            row * (cardHeight + verticalSpacing);
        }

        const overlay = this.add
          .rectangle(slotX, slotY, cardWidth, cardHeight, 0xffffff, 0.2)
          .setVisible(false);

        slots.push({
          x: slotX,
          y: slotY,
          occupied: false,
          overlay,
        });
      }
    }

    return slots;
  }

  /**
   * Inicializa o display de energia
   */
  private initializeEnergyDisplay(): void {
    const energyX = 20;
    const centerY = this.scale.height / 2;

    this.energyText = this.add
      .text(0, 0, "Energia: " + this.playerEnergy, {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5);

    const padding = 10;
    const rectWidth = this.energyText.width + padding * 2;
    const rectHeight = 40;

    const energyRect = this.add
      .rectangle(0, 0, rectWidth, rectHeight, 0x222222)
      .setOrigin(0, 0.5);

    this.energyContainer = this.add.container(energyX, centerY, [
      energyRect,
      this.energyText,
    ]);
  }

  /**
   * Inicializa o display de turno
   */
  private initializeTurnDisplay(): void {
    const screenWidth = this.scale.width;
    const centerY = this.scale.height / 2;

    this.turnText = this.add
      .text(screenWidth - 20, centerY, `Turno: ${this.currentTurn}`, {
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 0.5);
  }

  /**
   * Inicializa o botão de finalizar turno
   */
  private initializeEndTurnButton(): void {
    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;

    this.endTurnButton = this.add
      .text(screenWidth - 20, screenHeight - 40, "Finalizar Turno", {
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#222222",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (this.isPlayerTurn) {
          this.endTurn();
        }
      });
  }

  /**
   * Inicializa o painel de detalhes da carta
   */
  private initializeCardDetailsPanel(): void {
    const width = 220;
    const height = 320;
    const x = this.scale.width - width / 2 - 20;
    const y = this.scale.height / 2;

    const background = this.add
      .rectangle(0, 0, width, height, 0x222222, 0.9)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5);

    this.cardNameText = this.add
      .text(0, height / 2 - 30, "Nome da Carta", {
        fontSize: "20px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: width - 40 },
      })
      .setOrigin(0.5, 0.5);

    this.cardPowerText = this.add
      .text(width / 2 - 20, -height / 2 + 20, "0", {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(1, 0.5);

    this.cardCostText = this.add
      .text(-width / 2 + 20, -height / 2 + 20, "0", {
        fontSize: "18px",
        color: "#ffff00",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);

    this.cardDescriptionText = this.add
      .text(0, 0, "Descrição detalhada da carta vai aqui.", {
        fontSize: "16px",
        color: "#cccccc",
        align: "center",
        wordWrap: { width: width - 40 },
      })
      .setOrigin(0.5);

    this.cardDetailsPanel = this.add.container(x, y, [
      background,
      this.cardNameText,
      this.cardPowerText,
      this.cardCostText,
      this.cardDescriptionText,
    ]);

    this.cardDetailsPanel.setVisible(false);
    this.setupCardDetailsEvents();
  }

  // =============================================
  // Renderização de Mãos (Jogador e Bot)
  // =============================================

  /**
   * Renderiza a mão do jogador
   */
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

      const cardContainer = this.createCardContainer(
        x,
        y,
        cardWidth,
        140,
        0x0088ff,
        card,
        index,
        true
      );

      this.playerHandContainers.push(cardContainer);
    });

    this.setupDragEvents();
  }

  /**
   * Renderiza a mão do bot
   */
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

      const cardContainer = this.createCardContainer(
        x,
        y,
        cardWidth,
        140,
        0xff0000,
        card,
        index,
        false
      );

      this.botHandContainers.push(cardContainer);
    });
  }

  /**
   * Cria um container de carta genérico
   */
  private createCardContainer(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    card: Omit<Card, "index">,
    index: number,
    isPlayer: boolean
  ): Phaser.GameObjects.Container & {
    cardData: CardData;
    startX: number;
    startY: number;
  } {
    const cardRect = this.add.rectangle(0, 0, width, height, color);

    const nameText = this.add
      .text(0, 60, card.name, {
        color: "#ffffff",
        fontSize: "14px",
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setWordWrapWidth(width - 10);

    const powerText = this.add
      .text(width / 2 - 10, -60, String(card.power), {
        color: "#ffffff",
        fontSize: "14px",
        align: "right",
      })
      .setOrigin(1, 0);

    const costText = this.add
      .text(-width / 2 + 10, -60, String(card.cost), {
        color: "#ffff00",
        fontSize: "14px",
        fontStyle: "bold",
        align: "left",
      })
      .setOrigin(0, 0);

    const container = this.add.container(x, y, [
      cardRect,
      nameText,
      powerText,
      costText,
    ]) as Phaser.GameObjects.Container & {
      cardData: CardData;
      startX: number;
      startY: number;
    };

    container.setSize(width, height);
    container.cardData = { ...card, index };
    container.startX = x;
    container.startY = y;

    if (isPlayer) {
      container.setInteractive({ draggable: true });
      this.input.setDraggable(container);
    }

    return container;
  }

  // =============================================
  // Lógica de Drag and Drop
  // =============================================

  /**
   * Configura os eventos de drag and drop
   */
  private setupDragEvents(): void {
    this.input.on(
      "dragstart",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        this.handleDragStart(gameObject);
      }
    );

    this.input.on(
      "drag",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dragX: number,
        dragY: number
      ) => {
        this.handleDrag(gameObject, dragX, dragY);
      }
    );

    this.input.on(
      "dragend",
      (
        _pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        this.handleDragEnd(gameObject);
      }
    );
  }

  /**
   * Manipula o início do drag
   */
  private handleDragStart(gameObject: Phaser.GameObjects.GameObject): void {
    const container = gameObject as Phaser.GameObjects.Container & {
      cardData: CardData;
      startX: number;
      startY: number;
    };

    container.startX = container.x;
    container.startY = container.y;
    container.setScale(0.8);

    // Mostra overlays de slots disponíveis
    for (const lane of this.lanes) {
      for (const slot of lane.playerSlots) {
        if (!slot.occupied && slot.overlay) {
          slot.overlay.setVisible(true);
        }
      }
    }
  }

  /**
   * Manipula o movimento durante o drag
   */
  private handleDrag(
    gameObject: Phaser.GameObjects.GameObject,
    dragX: number,
    dragY: number
  ): void {
    const container = gameObject as Phaser.GameObjects.Container & {
      cardData: CardData;
      startX: number;
      startY: number;
    };
    container.x = dragX;
    container.y = dragY;
  }

  /**
   * Manipula o fim do drag
   */
  private handleDragEnd(gameObject: Phaser.GameObjects.GameObject): void {
    const container = gameObject as Phaser.GameObjects.Container & {
      cardData: CardData;
      startX: number;
      startY: number;
    };
    const { x, y } = container;
    const { index, name, cost, power } = container.cardData;

    let cardPlaced = false;

    for (const lane of this.lanes) {
      if (!this.isPlayerTurn || cost > this.playerEnergy) continue;

      for (const slot of lane.playerSlots) {
        if (
          !slot.occupied &&
          Phaser.Math.Distance.Between(x, y, slot.x, slot.y) < 60
        ) {
          this.placeCardOnSlot(slot, container.cardData);
          this.removeCardFromPlayerHand(index);

          this.playerEnergy -= cost;
          this.updateEnergyText();
          this.updateLanePowers();

          cardPlaced = true;
          break;
        }
      }
      if (cardPlaced) break;
    }

    if (!cardPlaced) {
      this.animateCardReturn(container);
    }

    this.hideSlotOverlays();

    if (cardPlaced) {
      this.renderPlayerHand();
    }
  }

  /**
   * Animação suave e rápida para retornar a carta à posição original
   * (usada tanto para cancelar colocação quanto para remover da lane)
   */
  private animateCardReturn(
    container: Phaser.GameObjects.Container & {
      cardData: CardData;
      startX: number;
      startY: number;
    },
    onComplete?: () => void
  ): void {
    // Reset rápido da escala
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 200, // Reduzido de 300 para 200
      ease: "Back.out",
    });

    // Movimento de volta mais rápido
    this.tweens.add({
      targets: container,
      x: container.startX,
      y: container.startY,
      duration: 300, // Reduzido de 500 para 300
      ease: "Power2.out",
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

  /**
   * Coloca uma carta em um slot
   */
  private placeCardOnSlot(slot: Slot, cardData: CardData): void {
    const { name, cost, power } = cardData;

    const cardContainer = this.add.container(slot.x, slot.y);
    const cardRect = this.add.rectangle(0, 0, 80, 110, 0x00ccff);

    const nameText = this.add
      .text(0, 45, name, {
        color: "#ffffff",
        fontSize: "14px",
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setWordWrapWidth(70);

    const powerText = this.add
      .text(30, -45, String(power), {
        color: "#ffffff",
        fontSize: "14px",
        align: "right",
      })
      .setOrigin(1, 0);

    const costText = this.add
      .text(-30, -45, String(cost), {
        color: "#ffff00",
        fontSize: "14px",
        fontStyle: "bold",
        align: "left",
      })
      .setOrigin(0, 0);

    cardContainer.add([cardRect, nameText, powerText, costText]);
    cardContainer.setSize(80, 110);
    cardContainer.setInteractive({ useHandCursor: true });

    cardContainer.on("pointerdown", () => {
      this.removePlacedCard(cardContainer);
    });

    slot.occupied = true;
    slot.power = power;

    // Armazena metadados no container
    (cardContainer as any).placed = true;
    (cardContainer as any).slot = slot;
    (cardContainer as any).cardData = cardData;
    (cardContainer as any).turnPlayed = this.currentTurn;
  }

  /**
   * Remove uma carta da mão do jogador
   */
  private removeCardFromPlayerHand(index: number): void {
    this.playerHand.splice(index, 1);
  }

  /**
   * Reseta a posição da carta se não foi colocada em um slot
   */
  private resetCardPosition(
    container: Phaser.GameObjects.Container & {
      cardData: CardData;
      startX: number;
      startY: number;
    }
  ): void {
    container.setScale(1);
    container.x = container.startX;
    container.y = container.startY;

    container.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Text) {
        child.setVisible(true);
      }
    });
  }

  /**
   * Esconde os overlays dos slots
   */
  private hideSlotOverlays(): void {
    for (const lane of this.lanes) {
      for (const slot of lane.playerSlots) {
        slot.overlay?.setVisible(false);
      }
    }
  }

  // =============================================
  // Lógica de Turno
  // =============================================

  /**
   * Finaliza o turno do jogador e inicia o turno do bot
   */
  private endTurn(): void {
    this.isPlayerTurn = false;
    this.endTurnButton?.setVisible(false);

    this.time.delayedCall(1000, () => {
      this.botTurn();

      this.currentTurn++;
      this.turnText.setText(`Turno: ${this.currentTurn}`);
      this.animateTurnText();

      this.playerEnergy = this.currentTurn;
      this.botEnergy = this.currentTurn;
      this.updateEnergyText();

      this.isPlayerTurn = true;
      this.endTurnButton?.setVisible(true);

      if (this.currentTurn >= 6) {
        this.checkGameEnd();
      } else {
        this.isPlayerTurn = true;
      }
    });
  }

  /**
   * Animação do texto de turno
   */
  private animateTurnText(): void {
    this.tweens.add({
      targets: this.turnText,
      scale: 1.4,
      alpha: 0.7,
      duration: 150,
      yoyo: true,
      ease: "Power2",
      onYoyo: () => {
        this.turnText.setScale(1);
        this.turnText.setAlpha(1);
      },
    });
  }

  /**
   * Turno do bot - lógica de IA
   */
  private botTurn(): void {
    const playableCards = this.botHand.filter((c) => c.cost <= this.botEnergy);

    if (playableCards.length === 0) {
      this.isPlayerTurn = true;
      this.endTurnButton?.setVisible(true);
      return;
    }

    // Ordena cartas por poder (maiores primeiro)
    playableCards.sort((a, b) => b.power - a.power);

    for (const card of playableCards) {
      if (card.cost > this.botEnergy) continue;

      const lanesByPriority = this.getLanesByPriority();

      let cardPlayed = false;

      for (const laneItem of lanesByPriority) {
        const lane = laneItem.lane;
        const slot = lane.botSlots.find((s) => !s.occupied);
        if (!slot) continue;

        const { botPower, playerPower } = laneItem;
        const powerWithCard = botPower + card.power;

        if (
          (botPower <= playerPower && powerWithCard > playerPower) ||
          botPower > playerPower
        ) {
          this.playBotCardOnSlot(slot, card);
          cardPlayed = true;
          break;
        }
      }

      if (!cardPlayed) {
        this.playBotCardOnAnyAvailableSlot(card);
      }

      if (this.botEnergy <= 0) break;
    }

    this.isPlayerTurn = true;
    this.endTurnButton?.setVisible(true);
  }

  /**
   * Ordena lanes por prioridade (onde o bot está em desvantagem)
   */
  private getLanesByPriority(): Array<{
    lane: Lane;
    botPower: number;
    playerPower: number;
    difference: number;
  }> {
    return this.lanes
      .map((lane) => {
        const { botPower, playerPower } = this.calculateLanePower(lane);
        return {
          lane,
          botPower,
          playerPower,
          difference: botPower - playerPower,
        };
      })
      .sort((a, b) => a.difference - b.difference);
  }

  /**
   * Joga uma carta do bot em um slot específico
   */
  private playBotCardOnSlot(slot: Slot, card: Omit<Card, "index">): void {
    const cardContainer = this.add.container(slot.x, slot.y);
    const cardRect = this.add.rectangle(0, 0, 80, 110, 0xff0000);

    const nameText = this.add
      .text(0, 45, card.name, {
        color: "#ffffff",
        fontSize: "14px",
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setWordWrapWidth(70);

    const powerText = this.add
      .text(30, -45, String(card.power), {
        color: "#ffffff",
        fontSize: "14px",
        align: "right",
      })
      .setOrigin(1, 0);

    const costText = this.add
      .text(-30, -45, String(card.cost), {
        color: "#ffff00",
        fontSize: "14px",
        fontStyle: "bold",
        align: "left",
      })
      .setOrigin(0, 0);

    cardContainer.add([cardRect, nameText, powerText, costText]);
    cardContainer.setSize(80, 110);
    cardContainer.setInteractive({ useHandCursor: true });

    // Guarda dados da carta para mostrar no painel de detalhes
    (cardContainer as any).cardData = card;

    slot.occupied = true;
    slot.power = card.power;

    const index = this.botHand.indexOf(card);
    if (index >= 0) {
      this.botHand.splice(index, 1);
    }

    this.botEnergy -= card.cost;
    this.renderBotHand();
    this.updateLanePowers();
  }

  /**
   * Joga uma carta do bot em qualquer slot disponível
   */
  private playBotCardOnAnyAvailableSlot(card: Omit<Card, "index">): void {
    for (const lane of this.lanes) {
      const slot = lane.botSlots.find((s) => !s.occupied);
      if (slot && card.cost <= this.botEnergy) {
        this.playBotCardOnSlot(slot, card);
        break;
      }
    }
  }

  // =============================================
  // Manipulação de Cartas Posicionadas
  // =============================================

  /**
   * Remove uma carta posicionada e a devolve para a mão
   */
  private removePlacedCard(container: Phaser.GameObjects.Container): void {
    const turnPlayed = (container as any).turnPlayed as number;

    if (turnPlayed !== this.currentTurn) {
      console.log("Carta jogada em turno anterior. Não pode voltar.");
      return;
    }

    if (turnPlayed === this.currentTurn) {
      this.playerEnergy += (container as any).cardData.cost;
      this.updateEnergyText();
    }

    const slot = (container as any).slot as Slot;
    if (!slot) return;

    slot.occupied = false;
    delete slot.power;

    const cardData = (container as any).cardData as Card;
    const originalIndex = (container as any).cardData.index;

    if (originalIndex !== undefined && originalIndex >= 0) {
      this.playerHand.splice(originalIndex, 0, {
        name: cardData.name,
        cost: cardData.cost,
        power: cardData.power,
      });
    } else {
      this.playerHand.push({
        name: cardData.name,
        cost: cardData.cost,
        power: cardData.power,
      });
    }

    container.destroy();
    this.updateLanePowers();
    this.renderPlayerHand();
    this.endTurnButton?.setVisible(true);
    this.cardDetailsPanel?.setVisible(false);
  }

  // =============================================
  // Atualização de Estado do Jogo
  // =============================================

  /**
   * Atualiza o texto de energia
   */
  private updateEnergyText(): void {
    if (!this.energyText) return;

    const currentEnergy = this.isPlayerTurn
      ? this.playerEnergy
      : this.botEnergy;
    this.energyText.setText(`Energia: ${currentEnergy}`);
  }

  /**
   * Atualiza os poderes das lanes
   */
  private updateLanePowers(): void {
    for (const lane of this.lanes) {
      const { botPower, playerPower } = this.calculateLanePower(lane);

      lane.botPowerText?.setText(`Poder Bot: ${botPower}`);
      lane.playerPowerText?.setText(`Poder Jogador: ${playerPower}`);
    }
  }

  /**
   * Calcula o poder total de uma lane
   */
  private calculateLanePower(lane: Lane): {
    botPower: number;
    playerPower: number;
  } {
    let botPower = 0;
    for (const slot of lane.botSlots) {
      botPower += slot.power ?? 0;
    }

    let playerPower = 0;
    for (const slot of lane.playerSlots) {
      playerPower += slot.power ?? 0;
    }

    return { botPower, playerPower };
  }

  // =============================================
  // Final de Jogo
  // =============================================

  /**
   * Verifica se o jogo terminou e mostra o resultado
   */
  private checkGameEnd(): void {
    let playerWins = 0;
    let botWins = 0;

    for (const lane of this.lanes) {
      const { playerPower, botPower } = this.calculateLanePower(lane);

      if (playerPower > botPower) playerWins++;
      else if (botPower > playerPower) botWins++;
    }

    let message = "";
    if (playerWins > botWins) message = "Você venceu!";
    else if (botWins > playerWins) message = "Bot venceu!";
    else message = "Empate!";

    this.showResultModal(message);
  }

  /**
   * Mostra o modal de resultado
   */
  private showResultModal(text: string): void {
    const width = 300;
    const height = 150;
    const x = this.scale.width / 2;
    const y = this.scale.height / 2;

    const background = this.add
      .rectangle(x, y, width, height, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5);

    const message = this.add
      .text(x, y - 30, text, {
        fontSize: "20px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    const button = this.add
      .text(x, y + 30, "Jogar Novamente", {
        fontSize: "16px",
        backgroundColor: "#ffffff",
        color: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    button.on("pointerdown", () => this.scene.restart());

    this.add.container(0, 0, [background, message, button]);
  }

  // =============================================
  // Painel de Detalhes da Carta
  // =============================================

  /**
   * Configura os eventos do painel de detalhes
   */
  private setupCardDetailsEvents(): void {
    this.input.on(
      "gameobjectover",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        const container = gameObject as Phaser.GameObjects.Container & {
          cardData?: CardData;
        };

        if (!container.cardData) return;

        this.showCardDetails(container.cardData);
      }
    );

    this.input.on(
      "gameobjectout",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        this.hideCardDetails();
      }
    );
  }

  /**
   * Mostra os detalhes da carta
   */
  private showCardDetails(card: CardData): void {
    if (!this.cardDetailsPanel) return;

    this.cardNameText?.setText(card.name);
    this.cardPowerText?.setText(card.power.toString());
    this.cardCostText?.setText(card.cost.toString());

    let description = "";

    switch (card.name) {
      case "Homem de Ferro":
        description = "Um herói inteligente e poderoso com armadura avançada.";
        break;
      case "Hulk":
        description = "Força bruta imbatível quando está com raiva.";
        break;
      case "Viúva Negra":
        description = "Espiã ágil e mestre em combate corpo a corpo.";
        break;
      default:
        description = "Carta sem descrição disponível.";
    }

    this.cardDescriptionText?.setText(description);
    this.cardDetailsPanel.setVisible(true);
  }

  /**
   * Esconde os detalhes da carta
   */
  private hideCardDetails(): void {
    this.cardDetailsPanel?.setVisible(false);
  }
}
