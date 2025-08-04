import Phaser from "phaser";

export class EndTurnButton {
  private scene: Phaser.Scene;
  private button?: Phaser.GameObjects.Text;
  private onEndTurnCallback?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  initialize(x: number, y: number, onEndTurn: () => void): void {
    this.onEndTurnCallback = onEndTurn;

    this.button = this.scene.add
      .text(x, y, "Finalizar Turno", {
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#222222",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (this.onEndTurnCallback) {
          this.onEndTurnCallback();
        }
      });
  }

  setVisible(visible: boolean): void {
    this.button?.setVisible(visible);
  }

  getButton(): Phaser.GameObjects.Text | undefined {
    return this.button;
  }
}
