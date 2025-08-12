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

  initialize(x: number, y: number): void {
    this.button = this.scene.add
      .text(x, y, 'Histórico de batalha', {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#222222',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.showModal();
      });
  }

  setVisible(visible: boolean): void {
    this.button?.setVisible(visible);
  }

  setLogs(logs: string[]): void {
    this.logs = logs;
  }

  addLog(message: string): void {
    this.logs.push(message);
  }

  private showModal(): void {
    if (this.modalContainer) return; // evita abrir mais de uma

    const { width, height } = this.scene.cameras.main;

    // Fundo da modal (clicável para fechar)
    const background = this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setInteractive()
      .on('pointerdown', () => this.closeModal());

    // Caixa principal da modal
    const modalBox = this.scene.add.rectangle(
      width / 2,
      height / 2,
      width * 0.8,
      height * 0.8,
      0x222222,
      1
    );
    modalBox.setStrokeStyle(2, 0xffffff);

    // Texto dos logs
    const logsText = this.scene.add.text(
      width / 2 - (width * 0.8) / 2 + 20,
      height / 2 - (height * 0.8) / 2 + 20,
      '',
      {
        fontSize: '16px',
        color: '#ffffff',
        wordWrap: { width: width * 0.8 - 40 },
      }
    );

    logsText.setText(
      this.logs
        .slice()
        .reverse()
        .map((line) => `• ${line}`)
        .join('\n')
    );

    // Botão fechar
    const closeButton = this.scene.add
      .text(width / 2, height - height * 0.15, 'Fechar', {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#aa0000',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.closeModal());

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
}
