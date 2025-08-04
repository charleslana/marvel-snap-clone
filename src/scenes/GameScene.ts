import Phaser from "phaser";
import { Card, CardData } from "../interfaces/Card";
import { Lane } from "../interfaces/Lane";
import { Slot } from "../interfaces/Slot";

import { CardContainer } from "../components/CardContainer";
import { LaneDisplay } from "../components/LaneDisplay";
import { EnergyDisplay } from "../components/EnergyDisplay";
import { TurnDisplay } from "../components/TurnDisplay";
import { EndTurnButton } from "../components/EndTurnButton";
import { CardDetailsPanel } from "../components/CardDetailsPanel";

import { DragAndDropManager } from "../utils/DragAndDropManager";
import { BotAI } from "../utils/BotAI";
import { GameEndManager } from "../utils/GameEndManager";

export default class GameScene extends Phaser.Scene {
  private playerHand: Omit<Card, "index">[] = [
    {
      name: "Homem de Ferro",
      cost: 2,
      power: 3,
      description: "Um herói inteligente e poderoso com armadura avançada.",
    },
    {
      name: "Hulk",
      cost: 3,
      power: 6,
      description: "Força bruta imbatível quando está com raiva.",
    },
    {
      name: "Viúva Negra",
      cost: 1,
      power: 2,
      description: "Espiã ágil e mestre em combate corpo a corpo.",
    },
    {
      name: "Capitão América",
      cost: 2,
      power: 4,
      description: "Líder nato com escudo indestrutível de vibranium.",
    },
    {
      name: "Nick Fury",
      cost: 5,
      power: 9,
      description: "Diretor da S.H.I.E.L.D. com acesso a recursos ilimitados.",
    },
  ];

  private botHand: Omit<Card, "index">[] = [
    {
      name: "Thanos",
      cost: 3,
      power: 7,
      description: "Titã Louco obcecado em equilibrar o universo.",
    },
    {
      name: "Loki",
      cost: 2,
      power: 4,
      description: "Deus da trapaça com poderes mágicos e ilusões.",
    },
    {
      name: "Ultron",
      cost: 1,
      power: 2,
      description: "IA robótica com capacidade de evolução constante.",
    },
    {
      name: "Capitão América",
      cost: 2,
      power: 4,
      description: "Líder nato com escudo indestrutível de vibranium.",
    },
    {
      name: "Thor",
      cost: 4,
      power: 8,
      description: "Deus do trovão com martelo místico Mjolnir.",
    },
  ];

  private isPlayerTurn = true;
  private lanes: Lane[] = [];
  private playerHandContainers: CardContainer[] = [];
  private botHandContainers: CardContainer[] = [];
  private currentTurn = 1;
  private playerEnergy = 0;
  private botEnergy = 0;

  // Instâncias dos componentes
  private laneDisplay!: LaneDisplay;
  private energyDisplay!: EnergyDisplay;
  private turnDisplay!: TurnDisplay;
  private endTurnButton!: EndTurnButton;
  private cardDetailsPanel!: CardDetailsPanel;
  private dragAndDropManager!: DragAndDropManager;
  private botAI!: BotAI;
  private gameEndManager!: GameEndManager;

  create(): void {
    this.laneDisplay = new LaneDisplay(this);
    this.energyDisplay = new EnergyDisplay(this);
    this.turnDisplay = new TurnDisplay(this);
    this.endTurnButton = new EndTurnButton(this);
    this.cardDetailsPanel = new CardDetailsPanel(this);

    this.initializeGameTitle();
    this.initializeGameLanes();
    this.initializeEnergyDisplay();
    this.initializeTurnDisplay();
    this.initializeEndTurnButton();
    this.initializeCardDetailsPanel();

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

    this.gameEndManager = new GameEndManager(this, this.lanes);
  }

  private initializeGameTitle(): void {
    this.add.text(20, 20, "Marvel Snap Clone Offline", {
      color: "#fff",
      fontSize: "24px",
    });
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

  private initializeCardDetailsPanel(): void {
    const width = 220;
    const height = 320;
    const x = this.scale.width - width / 2 - 20;
    const y = this.scale.height / 2;
    this.cardDetailsPanel.initialize(x, y);
    this.setupCardDetailsEvents();
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
    });
  }

  private animateCardReturn(
    container: CardContainer,
    onComplete?: () => void
  ): void {
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 200,
      ease: "Back.out",
    });

    this.tweens.add({
      targets: container,
      x: container.startX,
      y: container.startY,
      duration: 300,
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

    this.playerEnergy -= cardData.cost;
    this.updateEnergyText();

    (cardContainer as any).placed = true;
    (cardContainer as any).slot = slot;
    (cardContainer as any).cardData = cardData;
    (cardContainer as any).turnPlayed = this.currentTurn;
  }

  private removeCardFromPlayerHand(index: number): void {
    this.playerHand.splice(index, 1);
  }

  private updateEnergyText(): void {
    this.energyDisplay.updateEnergy(this.playerEnergy);
    this.dragAndDropManager.updatePlayerEnergy(this.playerEnergy);
  }

  private updateLanePowers(): void {
    for (const lane of this.lanes) {
      const { botPower, playerPower } = this.calculateLanePower(lane);

      lane.botPowerText?.setText(`Poder Bot: ${botPower}`);
      lane.playerPowerText?.setText(`Poder Jogador: ${playerPower}`);
    }
  }

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
      this.turnDisplay.updateTurn(this.currentTurn);
      this.turnDisplay.animateTurnChange();

      this.playerEnergy = this.currentTurn;
      this.botEnergy = this.currentTurn;
      this.updateEnergyText();

      this.isPlayerTurn = true;
      this.endTurnButton.setVisible(true);

      this.dragAndDropManager.updatePlayerEnergy(this.playerEnergy);
      this.dragAndDropManager.updatePlayerTurnStatus(this.isPlayerTurn);

      if (this.currentTurn >= 6) {
        this.gameEndManager.checkGameEnd();
      } else {
        this.isPlayerTurn = true;
      }
    });
  }

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

    (cardContainer as any).cardData = card;

    slot.occupied = true;
    slot.power = card.power;

    const index = this.botHand.indexOf(card);
    if (index >= 0) {
      this.botHand.splice(index, 1);
    }

    this.botEnergy -= card.cost;
  }

  private removePlacedCard(container: Phaser.GameObjects.Container): void {
    const turnPlayed = (container as any).turnPlayed as number;

    if (turnPlayed !== this.currentTurn) {
      console.log("Carta jogada em turno anterior. Não pode voltar.");
      return;
    }

    if (turnPlayed === this.currentTurn) {
      this.playerEnergy += (container as any).cardData.cost;
      console.log("this.playerEnergy", this.playerEnergy);
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
      "gameobjectover",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        const container = gameObject as Phaser.GameObjects.Container & {
          cardData?: CardData;
        };

        if (!container.cardData) return;

        this.cardDetailsPanel.showCardDetails(container.cardData);
      }
    );

    this.input.on(
      "gameobjectout",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        this.cardDetailsPanel.hideCardDetails();
      }
    );
  }
}
