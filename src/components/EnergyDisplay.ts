import Phaser from 'phaser';

export class EnergyDisplay {
  private scene: Phaser.Scene;
  private energyContainer?: Phaser.GameObjects.Container;
  private energyText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public initialize(x: number, y: number, initialEnergy: number): void {
    this.energyText = this.createEnergyText(initialEnergy);
    const energyRect = this.createEnergyBackground(this.energyText.width, 40);

    this.energyContainer = this.scene.add.container(x, y, [energyRect, this.energyText]);
  }

  public updateEnergy(energy: number): void {
    this.energyText?.setText(`Energia: ${energy}`);
  }

  public setVisible(visible: boolean): void {
    this.energyContainer?.setVisible(visible);
  }

  private createEnergyText(initialEnergy: number): Phaser.GameObjects.Text {
    return this.scene.add
      .text(0, 0, `Energia: ${initialEnergy}`, {
        fontSize: '20px',
        color: '#ffffff',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0, 0.5);
  }

  private createEnergyBackground(textWidth: number, height: number): Phaser.GameObjects.Rectangle {
    const padding = 10;
    return this.scene.add
      .rectangle(0, 0, textWidth + padding * 2, height, 0x222222)
      .setOrigin(0, 0.5);
  }
}
