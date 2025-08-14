import Phaser from 'phaser';

export class TurnDisplay {
  private scene: Phaser.Scene;
  private turnText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public initialize(x: number, y: number, initialTurn: number): void {
    this.turnText = this.createTurnText(x, y, initialTurn);
  }

  public updateTurn(turn: string | number): void {
    this.turnText?.setText(`Turno: ${turn}`);
  }

  public animateTurnChange(): void {
    if (!this.turnText) return;

    this.scene.tweens.add({
      targets: this.turnText,
      scale: 1.4,
      alpha: 0.7,
      duration: 150,
      yoyo: true,
      ease: 'Power2',
      onYoyo: () => {
        if (this.turnText) {
          this.turnText.setScale(1);
          this.turnText.setAlpha(1);
        }
      },
    });
  }

  public setVisible(visible: boolean): void {
    this.turnText?.setVisible(visible);
  }

  private createTurnText(x: number, y: number, turn: number): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x, y, `Turno: ${turn}`, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 0.5);
  }
}
