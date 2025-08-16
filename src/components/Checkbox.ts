import Phaser from 'phaser';

export class Checkbox extends Phaser.GameObjects.Container {
  private box: Phaser.GameObjects.Rectangle;
  private check: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  private _checked: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, size = 26) {
    super(scene, x, y);

    // Caixa
    this.box = scene.add
      .rectangle(0, 0, size, size, 0x1b1e29)
      .setStrokeStyle(1, 0x292d3e)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    // Check (usando Graphics)
    this.check = scene.add.graphics();
    this.drawCheck(false);

    this.add([this.box, this.check]);

    this.box.on('pointerdown', () => {
      this.toggle();
    });

    scene.add.existing(this);
  }

  private drawCheck(visible: boolean) {
    const g = this.check as Phaser.GameObjects.Graphics;
    g.clear();
    if (visible) {
      g.fillStyle(0xffffff, 1);
      g.fillRect(5, 5, this.box.width - 10, this.box.height - 10);
    }
  }

  get checked() {
    return this._checked;
  }

  set checked(value: boolean) {
    this._checked = value;
    this.drawCheck(value);
  }

  toggle() {
    this.checked = !this.checked;
  }
}
