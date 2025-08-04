import Phaser from "phaser";
import { CardData } from "../interfaces/Card";

export class CardDetailsPanel {
  private scene: Phaser.Scene;
  private cardDetailsPanel?: Phaser.GameObjects.Container;
  private cardNameText?: Phaser.GameObjects.Text;
  private cardPowerText?: Phaser.GameObjects.Text;
  private cardCostText?: Phaser.GameObjects.Text;
  private cardDescriptionText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  initialize(x: number, y: number): void {
    const width = 220;
    const height = 320;

    const background = this.scene.add
      .rectangle(0, 0, width, height, 0x222222, 0.9)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5);

    this.cardNameText = this.scene.add
      .text(0, height / 2 - 30, "Nome da Carta", {
        fontSize: "20px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: width - 40 },
      })
      .setOrigin(0.5, 0.5);

    this.cardPowerText = this.scene.add
      .text(width / 2 - 20, -height / 2 + 20, "0", {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(1, 0.5);

    this.cardCostText = this.scene.add
      .text(-width / 2 + 20, -height / 2 + 20, "0", {
        fontSize: "18px",
        color: "#ffff00",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);

    this.cardDescriptionText = this.scene.add
      .text(0, 0, "Descrição detalhada da carta vai aqui.", {
        fontSize: "16px",
        color: "#cccccc",
        align: "center",
        wordWrap: { width: width - 40 },
      })
      .setOrigin(0.5);

    this.cardDetailsPanel = this.scene.add.container(x, y, [
      background,
      this.cardNameText,
      this.cardPowerText,
      this.cardCostText,
      this.cardDescriptionText,
    ]);

    this.cardDetailsPanel.setVisible(false);
  }

  showCardDetails(card: CardData): void {
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

  hideCardDetails(): void {
    this.cardDetailsPanel?.setVisible(false);
  }

  getPanel(): Phaser.GameObjects.Container | undefined {
    return this.cardDetailsPanel;
  }
}
