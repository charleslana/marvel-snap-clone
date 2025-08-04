import Phaser from 'phaser';

export class EnergyDisplay {
  private scene: Phaser.Scene;
  private energyContainer?: Phaser.GameObjects.Container;
  private energyText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  initialize(x: number, y: number, initialEnergy: number): void {
    this.energyText = this.scene.add
      .text(0, 0, 'Energia: ' + initialEnergy, {
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5);

    const padding = 10;
    const rectWidth = this.energyText.width + padding * 2;
    const rectHeight = 40;

    const energyRect = this.scene.add
      .rectangle(0, 0, rectWidth, rectHeight, 0x222222)
      .setOrigin(0, 0.5);

    this.energyContainer = this.scene.add.container(x, y, [energyRect, this.energyText]);
  }

  updateEnergy(energy: number): void {
    if (!this.energyText) return;
    this.energyText.setText(`Energia: ${energy}`);
  }

  getContainer(): Phaser.GameObjects.Container | undefined {
    return this.energyContainer;
  }
}
