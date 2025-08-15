import Phaser from 'phaser';
import { Lane } from '@/interfaces/Lane';
import { LogHistoryButton } from '@/components/LogHistoryButton';

export class GameEndManager {
  private scene: Phaser.Scene;
  private lanes: Lane[];
  private gameEnded: boolean = false;
  private logHistoryButton: LogHistoryButton;

  constructor(scene: Phaser.Scene, lanes: Lane[], logHistoryButton: LogHistoryButton) {
    this.scene = scene;
    this.lanes = lanes;
    this.logHistoryButton = logHistoryButton;
  }

  public checkGameEnd(finalLanePowers: { playerPower: number; botPower: number }[]): void {
    const { playerWins, botWins, playerPowerDiff, botPowerDiff } =
      this.calculateGameResult(finalLanePowers);
    const message = this.determineWinnerMessage(playerWins, botWins, playerPowerDiff, botPowerDiff);

    this.logHistoryButton.addLog(message);
    this.gameEnded = true;
    this.showResultModal(message);
  }

  public isGameEnded(): boolean {
    return this.gameEnded;
  }

  private calculateGameResult(finalLanePowers: { playerPower: number; botPower: number }[]): {
    playerWins: number;
    botWins: number;
    playerPowerDiff: number;
    botPowerDiff: number;
  } {
    let playerWins = 0;
    let botWins = 0;
    let playerPowerDiff = 0;
    let botPowerDiff = 0;

    for (const result of finalLanePowers) {
      const { playerPower, botPower } = result;

      if (playerPower > botPower) {
        playerWins++;
        playerPowerDiff += playerPower - botPower;
      } else if (botPower > playerPower) {
        botWins++;
        botPowerDiff += botPower - playerPower;
      }
    }

    return { playerWins, botWins, playerPowerDiff, botPowerDiff };
  }

  private determineWinnerMessage(
    playerWins: number,
    botWins: number,
    playerPowerDiff: number,
    botPowerDiff: number
  ): string {
    if (playerWins > botWins) return 'Você venceu!';
    if (botWins > playerWins) return 'Bot venceu!';
    if (playerPowerDiff > botPowerDiff) return 'Você venceu por diferença de poder!';
    if (botPowerDiff > playerPowerDiff) return 'Bot venceu por diferença de poder!';
    return 'Empate!';
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
    let message: Phaser.GameObjects.Text;

    const createText = (size: number) =>
      this.scene.add
        .text(x, y, text, {
          fontSize: `${size}px`,
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: width - paddingHorizontal * 2, useAdvancedWrap: true },
        })
        .setOrigin(0.5);

    message = createText(fontSize);

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

    button.on('pointerdown', () => modalContainer.destroy());

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

    background.on('pointerdown', () => modalContainer.destroy());
  }
}
