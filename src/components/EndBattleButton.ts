import Phaser from "phaser";

export class EndBattleButton {
  private scene: Phaser.Scene;
  private button?: Phaser.GameObjects.Text;
  private onEndBattleCallback?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  initialize(x: number, y: number, onEndBattle: () => void): void {
    this.onEndBattleCallback = onEndBattle;

    this.button = this.scene.add
      .text(x, y, "Finalizar Batalha", {
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#222222",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0, 1)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (this.onEndBattleCallback) {
          this.onEndBattleCallback();
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
