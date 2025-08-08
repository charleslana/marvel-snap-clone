import Phaser from 'phaser';
import { Lane } from '@/interfaces/Lane';

export class GameEndManager {
  private scene: Phaser.Scene;
  private lanes: Lane[];
  private gameEnded: boolean = false;

  constructor(scene: Phaser.Scene, lanes: Lane[]) {
    this.scene = scene;
    this.lanes = lanes;
  }

  public checkGameEnd(): void {
    let playerWins = 0;
    let botWins = 0;
    let playerTotalPowerDifference = 0;
    let botTotalPowerDifference = 0;

    for (const lane of this.lanes) {
      const { playerPower, botPower } = this.calculateLanePower(lane);

      if (playerPower > botPower) {
        playerWins++;
        playerTotalPowerDifference += playerPower - botPower;
      } else if (botPower > playerPower) {
        botWins++;
        botTotalPowerDifference += botPower - playerPower;
      }
    }

    let message = '';
    if (playerWins > botWins) {
      message = 'Você venceu!';
    } else if (botWins > playerWins) {
      message = 'Bot venceu!';
    } else {
      // Empate no número de lanes vencidas
      if (playerTotalPowerDifference > botTotalPowerDifference) {
        message = 'Você venceu por diferença de poder!';
      } else if (botTotalPowerDifference > playerTotalPowerDifference) {
        message = 'Bot venceu por diferença de poder!';
      } else {
        message = 'Empate!';
      }
    }

    this.gameEnded = true;
    this.showResultModal(message);
  }

  public forceGameEnd(): void {
    this.checkGameEnd();
  }

  public isGameEnded(): boolean {
    return this.gameEnded;
  }

  public resetGameState(): void {
    this.gameEnded = false;
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

  private createBackground(
    x: number,
    y: number,
    width: number,
    height: number
  ): Phaser.GameObjects.Rectangle {
    return this.scene.add
      .rectangle(x, y, width, height, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5)
      .setInteractive();
  }

  private createAdjustedText(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    maxFontSize: number = 20,
    minFontSize: number = 12,
    paddingHorizontal: number = 20,
    paddingVertical: number = 40
  ): Phaser.GameObjects.Text {
    let fontSize = maxFontSize;

    const createText = (size: number) => {
      return this.scene.add
        .text(x, y, text, {
          fontSize: `${size}px`,
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: width - paddingHorizontal * 2, useAdvancedWrap: true },
        })
        .setOrigin(0.5);
    };

    let message = createText(fontSize);

    while (message.height > height - paddingVertical && fontSize > minFontSize) {
      message.destroy();
      fontSize--;
      message = createText(fontSize);
    }

    return message;
  }

  private createCloseButton(
    x: number,
    y: number,
    modalContainer: Phaser.GameObjects.Container
  ): Phaser.GameObjects.Text {
    const button = this.scene.add
      .text(x, y, 'Fechar', {
        fontSize: '16px',
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    button.on('pointerdown', () => {
      modalContainer.destroy();
    });

    return button;
  }

  private showResultModal(text: string): void {
    const width = 300;
    const height = 150;
    const x = this.scene.scale.width / 2;
    const y = this.scene.scale.height / 2;

    const background = this.createBackground(x, y, width, height);
    const message = this.createAdjustedText(x, y - 30, width, height, text);
    const modalContainer = this.scene.add.container(0, 0, [background, message]);

    const button = this.createCloseButton(x, y + 30, modalContainer);
    modalContainer.add(button);

    background.on('pointerdown', () => {
      modalContainer.destroy();
    });
  }
}
