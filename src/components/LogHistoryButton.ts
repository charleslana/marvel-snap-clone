import Phaser from 'phaser';

export class LogHistoryButton {
  private scene: Phaser.Scene;
  private button?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
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
        console.log('Histórico de batalha');
      });
  }

  setVisible(visible: boolean): void {
    this.button?.setVisible(visible);
  }

  getButton(): Phaser.GameObjects.Text | undefined {
    return this.button;
  }
}
