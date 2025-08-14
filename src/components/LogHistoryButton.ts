import Phaser from 'phaser';

export class LogHistoryButton {
  private scene: Phaser.Scene;
  private button?: Phaser.GameObjects.Text;
  private modalContainer?: Phaser.GameObjects.Container;
  private logs: string[] = [];

  constructor(scene: Phaser.Scene, logs: string[] = []) {
    this.scene = scene;
    this.logs = logs;
  }

  public initialize(x: number, y: number): void {
    this.button = this.createButton(x, y, 'Histórico de batalha', () => this.showModal());
  }

  public addLog(message: string): void {
    this.logs.push(message);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void
  ): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x, y, text, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#222222',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick);
  }

  private showModal(): void {
    if (this.modalContainer) return;

    const { width, height } = this.scene.cameras.main;

    const background = this.createModalBackground(width, height);
    const modalBox = this.createModalBox(width, height);
    const logsText = this.createLogsText(width, height);
    const closeButton = this.createCloseButton(width, height);

    this.modalContainer = this.scene.add.container(0, 0, [
      background,
      modalBox,
      logsText,
      closeButton,
    ]);
    this.scene.children.bringToTop(this.modalContainer);
  }

  private closeModal(): void {
    if (this.modalContainer) {
      this.modalContainer.destroy(true);
      this.modalContainer = undefined;
    }
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

  private createLogsText(width: number, height: number): Phaser.GameObjects.Text {
    const logsText = this.scene.add.text(
      width / 2 - (width * 0.8) / 2 + 20,
      height / 2 - (height * 0.8) / 2 + 20,
      this.formatLogs(),
      {
        fontSize: '16px',
        color: '#ffffff',
        wordWrap: { width: width * 0.8 - 40 },
      }
    );
    return logsText;
  }

  private createCloseButton(width: number, height: number): Phaser.GameObjects.Text {
    return this.scene.add
      .text(width / 2, height - height * 0.15, 'Fechar', {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#aa0000',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.closeModal());
  }

  private formatLogs(): string {
    return this.logs
      .slice()
      .reverse()
      .map((line) => `• ${line}`)
      .join('\n');
  }
}
