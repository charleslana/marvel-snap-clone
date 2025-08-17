import Phaser from 'phaser';
import { Lane } from '@/interfaces/Lane';
import { LogHistoryButton } from '@/components/LogHistoryButton';
import { UIFactory } from '@/components/UIFactory';
import { GameButton } from '@/components/GameButton';
import { ButtonColor } from '@/enums/ButtonColor';

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

  private showResultModal(text: string): void {
    const { width, height } = this.scene.scale;

    const modalContainer = this.scene.add.container(0, 0);

    const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0);
    // overlay.setInteractive();
    overlay.on('pointerdown', () => {
      modalContainer.destroy();
    });

    const messageText = UIFactory.createText(this.scene, width / 2, height / 2 - 50, text, {
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center',
      shadow: {
        offsetX: 5,
        offsetY: 5,
        color: '#000',
        blur: 10,
        stroke: true,
        fill: true,
      },
    }).setOrigin(0.5);

    const closeButton = new GameButton(
      this.scene,
      width / 2,
      height / 2 + 80,
      'Fechar',
      () => {
        modalContainer.destroy();
      },
      {
        color: ButtonColor.Black,
        width: 180,
        height: 60,
        fontSize: '28px',
      }
    );

    modalContainer.add([overlay, messageText, closeButton]);
    modalContainer.setDepth(100);
  }
}
