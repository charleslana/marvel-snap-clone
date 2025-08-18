import Phaser from 'phaser';
import { GameButton } from './GameButton';
import { ButtonColor } from '@/enums/ButtonColor';
import { UIFactory } from './UIFactory';

export class LogHistoryButton {
  private scene: Phaser.Scene;
  private button?: GameButton;
  private modalContainer?: Phaser.GameObjects.Container;
  private logs: string[] = [];

  constructor(scene: Phaser.Scene, logs: string[] = []) {
    this.scene = scene;
    this.logs = logs;
  }

  public initialize(x: number, y: number): void {
    this.button = this.createHistoryButton(x, y);
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

    const background = this.createModalBackground(width, height);
    const modalBox = this.createModalBox(width, height);

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

    const logsText = UIFactory.createText(
      this.scene,
      width / 2 - modalContentWidth / 2,
      modalTopY,
      this.formatLogs(),
      {
        fontSize: '16px',
        wordWrap: { width: modalContentWidth },
      }
    );
    logsText.setLineSpacing(8);

    const maskShape = this.scene.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.beginPath();
    maskShape.fillRect(
      width / 2 - modalContentWidth / 2,
      modalTopY,
      modalContentWidth,
      modalContentHeight
    );
    const mask = maskShape.createGeometryMask();
    logsText.setMask(mask);

    this.scene.input.on('wheel', (_pointer: any, _gameObject: any, _dx: any, dy: number) => {
      logsText.y -= dy * 0.5;
      const topBound = modalTopY;
      const bottomBound = modalTopY - (logsText.height - modalContentHeight);
      logsText.y = Phaser.Math.Clamp(logsText.y, bottomBound, topBound);
    });

    this.modalContainer = this.scene.add
      .container(0, 0, [background, modalBox, logsText, closeButton])
      .setDepth(100);
    this.scene.children.bringToTop(this.modalContainer);
  }

  private closeModal(): void {
    if (this.modalContainer) {
      this.modalContainer.destroy(true);
      this.modalContainer = undefined;
    }
    this.scene.input.off('wheel');
  }

  private createModalBackground(width: number, height: number): Phaser.GameObjects.Rectangle {
    return this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setInteractive()
      .on('pointerdown', () => this.closeModal());
  }

  private createModalBox(width: number, height: number): Phaser.GameObjects.Rectangle {
    const box = this.scene.add.rectangle(
      width / 2,
      height / 2,
      width * 0.8,
      height * 0.8,
      0x222222,
      1
    );
    box.setStrokeStyle(2, 0xffffff);
    return box;
  }

  private formatLogs(): string {
    return this.logs
      .slice()
      .reverse()
      .map((line) => `• ${line}`)
      .join('\n');
  }
}
