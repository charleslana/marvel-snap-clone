import Phaser from "phaser";
import { Lane } from "../interfaces/Lane";

export class GameEndManager {
  private scene: Phaser.Scene;
  private lanes: Lane[];

  constructor(scene: Phaser.Scene, lanes: Lane[]) {
    this.scene = scene;
    this.lanes = lanes;
  }

  public checkGameEnd(): void {
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

  private showResultModal(text: string): void {
    const width = 300;
    const height = 150;
    const x = this.scene.scale.width / 2;
    const y = this.scene.scale.height / 2;

    const background = this.scene.add
      .rectangle(x, y, width, height, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5);

    const message = this.scene.add
      .text(x, y - 30, text, {
        fontSize: "20px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    const button = this.scene.add
      .text(x, y + 30, "Fechar", {
        fontSize: "16px",
        backgroundColor: "#ffffff",
        color: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    // Cria o container com todos os elementos da modal
    const modalContainer = this.scene.add.container(0, 0, [
      background,
      message,
      button,
    ]);

    // Adiciona o evento de clique no botão para fechar a modal
    button.on("pointerdown", () => {
      modalContainer.destroy(); // Remove completamente o container e todos seus filhos
    });

    // Opcional: permitir fechar clicando no fundo da modal
    background.setInteractive();
    background.on("pointerdown", () => {
      modalContainer.destroy();
    });
  }
}
