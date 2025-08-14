import Phaser from 'phaser';

export class TurnDisplay {
  private scene: Phaser.Scene;
  private turnText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  initialize(x: number, y: number, initialTurn: number): void {
    this.turnText = this.scene.add
      .text(x, y, `Turno: ${initialTurn}`, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 0.5);
  }

  updateTurn(turn: string): void {
    if (!this.turnText) return;
    this.turnText.setText(`Turno: ${turn}`);
  }

  animateTurnChange(): void {
    if (!this.turnText) return;

    this.scene.tweens.add({
      targets: this.turnText,
      scale: 1.4,
      alpha: 0.7,
      duration: 150,
      yoyo: true,
      ease: 'Power2',
      onYoyo: () => {
        this.turnText!.setScale(1);
        this.turnText!.setAlpha(1);
      },
    });
  }

  setVisible(visible: boolean): void {
    if (!this.turnText) return;
    this.turnText.setVisible(visible);
  }

  getText(): Phaser.GameObjects.Text | undefined {
    return this.turnText;
  }
}
