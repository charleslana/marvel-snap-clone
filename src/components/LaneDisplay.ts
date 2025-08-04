import Phaser from "phaser";
import { Lane } from "../interfaces/Lane";
import { Slot } from "../interfaces/Slot";

export class LaneDisplay {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createLane(x: number, y: number, index: number): Lane {
    // Elementos visuais da lane
    const worldRect = this.scene.add
      .rectangle(0, 0, 160, 100, 0x333333)
      .setStrokeStyle(2, 0xffffff);

    const worldText = this.scene.add
      .text(0, 0, `Mundo ${index + 1}`, {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    const botPowerText = this.scene.add
      .text(0, -100 / 2 + 15, "Poder Bot: 0", {
        fontSize: "14px",
        color: "#ff4444",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);

    const playerPowerText = this.scene.add
      .text(0, 100 / 2 - 15, "Poder Jogador: 0", {
        fontSize: "14px",
        color: "#44ff44",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 1);

    const worldContainer = this.scene.add.container(x, y, [
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

        const overlay = this.scene.add
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
}
