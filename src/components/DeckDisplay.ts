import Phaser from 'phaser';

export class DeckDisplay {
  private scene: Phaser.Scene;
  private deckText?: Phaser.GameObjects.Text;
  private label: string;

  constructor(scene: Phaser.Scene, label: string) {
    this.scene = scene;
    this.label = label;
  }

  initialize(x: number, y: number, initialDeck: number): void {
    this.deckText = this.scene.add
      .text(x, y, `${this.label}: ${initialDeck}`, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#222222',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0, 0.5);
  }

  updateDeck(deck: number): void {
    this.deckText?.setText(`${this.label}: ${deck}`);
  }

  getText(): Phaser.GameObjects.Text | undefined {
    return this.deckText;
  }

  setVisible(visible: boolean): void {
    this.deckText?.setVisible(visible);
  }
}
