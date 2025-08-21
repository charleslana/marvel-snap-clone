import Phaser from 'phaser';
import { LogHistoryButton } from '@/components/LogHistoryButton';
import { UIFactory } from '@/components/UIFactory';
import { GameButton } from '@/components/GameButton';
import { ButtonColor } from '@/enums/ButtonColor';

export class GameEndManager {
  private scene: Phaser.Scene;
  private gameEnded: boolean = false;
  private logHistoryButton: LogHistoryButton;

  constructor(scene: Phaser.Scene, logHistoryButton: LogHistoryButton) {
    this.scene = scene;
    this.logHistoryButton = logHistoryButton;
  }

  public checkGameEnd(finalLanePowers: { playerPower: number; opponentPower: number }[]): void {
    const { playerWins, opponentWins, playerPowerDiff, opponentPowerDiff } =
      this.calculateGameResult(finalLanePowers);
    const message = this.determineWinnerMessage(
      playerWins,
      opponentWins,
      playerPowerDiff,
      opponentPowerDiff
    );

    this.logHistoryButton.addLog(message);
    this.gameEnded = true;
    this.showResultModal(message);
  }

  public isGameEnded(): boolean {
    return this.gameEnded;
  }

  private calculateGameResult(finalLanePowers: { playerPower: number; opponentPower: number }[]): {
    playerWins: number;
    opponentWins: number;
    playerPowerDiff: number;
    opponentPowerDiff: number;
  } {
    let playerWins = 0;
    let opponentWins = 0;
    let playerPowerDiff = 0;
    let opponentPowerDiff = 0;

    for (const result of finalLanePowers) {
      const { playerPower, opponentPower } = result;

      if (playerPower > opponentPower) {
        playerWins++;
        playerPowerDiff += playerPower - opponentPower;
      } else if (opponentPower > playerPower) {
        opponentWins++;
        opponentPowerDiff += opponentPower - playerPower;
      }
    }

    return { playerWins, opponentWins, playerPowerDiff, opponentPowerDiff };
  }

  private determineWinnerMessage(
    playerWins: number,
    opponentWins: number,
    playerPowerDiff: number,
    opponentPowerDiff: number
  ): string {
    if (playerWins > opponentWins) return 'Você venceu!';
    if (opponentWins > playerWins) return 'Oponente venceu!';
    if (playerPowerDiff > opponentPowerDiff) return 'Você venceu por diferença de poder!';
    if (opponentPowerDiff > playerPowerDiff) return 'Oponente venceu por diferença de poder!';
    return 'Empate!';
  }

  private showResultModal(text: string): void {
    const { width, height } = this.scene.scale;

    const modalContainer = this.scene.add.container(0, 0);

    const overlay = UIFactory.createRectangle(
      this.scene,
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0
    );

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
