import Phaser from 'phaser';
import { FontEnum } from '@/enums/FontEnum';

export interface GameButtonConfig {
  width?: number;
  height?: number;
  fontSize?: string;
}

export class GameButton extends Phaser.GameObjects.Container {
  private shadow!: Phaser.GameObjects.Rectangle;
  private content!: Phaser.GameObjects.Rectangle;
  private label!: Phaser.GameObjects.Text;

  private readonly buttonWidth: number;
  private readonly buttonHeight: number;
  private readonly fontSize: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    callback: () => void,
    config: GameButtonConfig = {}
  ) {
    super(scene, x, y);

    this.buttonWidth = config.width ?? 220;
    this.buttonHeight = config.height ?? 60;
    this.fontSize = config.fontSize ?? '40px';

    this.createShadow(scene);
    this.createContent(scene);
    this.createLabel(scene, text);

    this.add([this.shadow, this.content, this.label]);

    this.setSize(this.buttonWidth, this.buttonHeight);
    this.setInteractive({ useHandCursor: true });

    this.setupPointerEvents(callback);

    scene.add.existing(this);
  }

  private createShadow(scene: Phaser.Scene) {
    this.shadow = scene.add
      .rectangle(0, 5, this.buttonWidth, this.buttonHeight, 0x154486, 1)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x0d274d);
  }

  private createContent(scene: Phaser.Scene) {
    this.content = scene.add
      .rectangle(0, 0, this.buttonWidth, this.buttonHeight, 0x3592fe, 1)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x1c5aaa);
  }

  private createLabel(scene: Phaser.Scene, text: string) {
    this.label = scene.add
      .text(0, 0, text, {
        fontFamily: FontEnum.UltimatumHeavyItalic,
        fontSize: this.fontSize,
        color: '#ffffff',
      })
      .setOrigin(0.5);
  }

  private setupPointerEvents(callback: () => void) {
    this.on('pointerover', this.onPointerOver, this);
    this.on('pointerout', this.onPointerOut, this);
    this.on('pointerdown', this.onPointerDown, this);
    this.on('pointerup', () => this.onPointerUp(callback), this);
  }

  private onPointerOver() {
    this.content.setFillStyle(0x4aa3ff);
    this.y -= 2;
  }

  private onPointerOut() {
    this.content.setFillStyle(0x3592fe);
    this.y += 2;
  }

  private onPointerDown() {
    this.content.setFillStyle(0x2c7dd6);
    this.y += 2;
  }

  private onPointerUp(callback: () => void) {
    this.content.setFillStyle(0x4aa3ff);
    this.y -= 2;
    callback();
  }
}
