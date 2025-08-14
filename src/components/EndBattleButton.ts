import Phaser from 'phaser';

export class EndBattleButton {
  private scene: Phaser.Scene;
  private button?: Phaser.GameObjects.Text;
  private onEndBattleCallback?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public initialize(x: number, y: number, onEndBattle: () => void): void {
    this.onEndBattleCallback = onEndBattle;
    this.button = this.createButton(x, y, 'Finalizar Batalha');
  }

  public setVisible(visible: boolean): void {
    this.button?.setVisible(visible);
  }

  private createButton(x: number, y: number, text: string): Phaser.GameObjects.Text {
    const btn = this.scene.add
      .text(x, y, text, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#222222',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.handleClick());

    return btn;
  }

  private handleClick(): void {
    if (this.onEndBattleCallback) {
      this.onEndBattleCallback();
    }
  }
}
