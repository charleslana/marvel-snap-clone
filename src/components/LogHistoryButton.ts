import Phaser from 'phaser';
import { GameButton } from './GameButton';
import { ButtonColor } from '@/enums/ButtonColor';
import { UIFactory } from './UIFactory';

export class LogHistoryButton {
  private scene: Phaser.Scene;
  private modalContainer?: Phaser.GameObjects.Container;
  private logs: string[] = [];

  constructor(scene: Phaser.Scene, logs: string[] = []) {
    this.scene = scene;
    this.logs = logs;
  }

  public initialize(x: number, y: number): void {
    this.createHistoryButton(x, y);
  }

  public addLog(message: string): void {
    this.logs.push(message);
  }

  private createHistoryButton(x: number, y: number): GameButton {
    const buttonWidth = 220;
    const buttonHeight = 50;
    const buttonCenterX = x - buttonWidth / 2;
    const buttonCenterY = y - buttonHeight / 2;

    return new GameButton(
      this.scene,
      buttonCenterX,
      buttonCenterY,
      'Histórico de Batalha',
      () => this.showModal(),
      {
        color: ButtonColor.Black,
        width: buttonWidth,
        height: buttonHeight,
        fontSize: '20px',
      }
    );
  }

  private showModal(): void {
    if (this.modalContainer) return;

    const { width, height } = this.scene.cameras.main;

    const background = UIFactory.createRectangle(this.scene, 0, 0, width, height, 0x000000, 0.6)
      .setOrigin(0)
      .setInteractive()
      .on('pointerdown', () => this.closeModal());

    const modalBox = UIFactory.createRectangle(
      this.scene,
      width / 2,
      height / 2,
      width * 0.8,
      height * 0.8,
      0x222222,
      1
    ).setStrokeStyle(2, 0xffffff);

    const closeButton = new GameButton(
      this.scene,
      width / 2,
      height - height * 0.15,
      'Fechar',
      () => this.closeModal(),
      {
        width: 150,
        height: 50,
        fontSize: '24px',
        color: ButtonColor.Black,
      }
    );

    const modalContentWidth = width * 0.8 - 40;
    const modalTopY = height / 2 - (height * 0.8) / 2 + 20;
    const modalBottomY = closeButton.y - closeButton.height / 2 - 20;
    const modalContentHeight = modalBottomY - modalTopY;

    const logsContainer = this.scene.add.container(width / 2 - modalContentWidth / 2, modalTopY);

    let offsetY = 0;
    this.logs
      .slice()
      .reverse()
      .forEach((log) => {
        const logItem = this.createLogItem(log, modalContentWidth);
        logItem.y = offsetY;
        logsContainer.add(logItem);
        offsetY += logItem.height + 10;
      });

    const maskShape = this.scene.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(
      width / 2 - modalContentWidth / 2,
      modalTopY,
      modalContentWidth,
      modalContentHeight
    );
    const mask = maskShape.createGeometryMask();
    logsContainer.setMask(mask);

    this.scene.input.on('wheel', (_pointer: any, _gameObject: any, _dx: any, dy: number) => {
      logsContainer.y -= dy * 0.5;
      const topBound = modalTopY;
      const bottomBound = modalTopY - (offsetY - modalContentHeight);
      logsContainer.y = Phaser.Math.Clamp(logsContainer.y, bottomBound, topBound);
    });

    this.modalContainer = this.scene.add
      .container(0, 0, [background, modalBox, logsContainer, closeButton])
      .setDepth(100);
  }

  private createLogItem(message: string, width: number): Phaser.GameObjects.Container {
    const timestamp = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let color = '#cccccc';

    if (message.startsWith('Você')) {
      color = '#4da6ff';
    } else if (message.startsWith('Oponente')) {
      color = '#ff4d4d';
    } else if (message.includes('Turno')) {
      color = '#7CFC00';
    } else {
      color = '#ffd633';
    }

    const background = UIFactory.createRectangle(this.scene, 0, 0, width, 40, 0x111111, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x444444);

    const text = this.scene.add.text(10, 10, `[${timestamp}] ${message}`, {
      fontSize: '16px',
      color,
      wordWrap: { width: width - 20 },
    });

    background.height = text.height + 20;

    return this.scene.add.container(0, 0, [background, text]).setSize(width, background.height);
  }

  private closeModal(): void {
    if (this.modalContainer) {
      this.modalContainer.destroy(true);
      this.modalContainer = undefined;
    }
    this.scene.input.off('wheel');
  }
}
