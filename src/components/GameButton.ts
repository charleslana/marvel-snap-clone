import Phaser from 'phaser';
import { FontEnum } from '@/enums/FontEnum';
import { ButtonColor } from '@/enums/ButtonColor';

export interface GameButtonConfig {
  width?: number;
  height?: number;
  fontSize?: string;
  color?: ButtonColor;
}

export class GameButton extends Phaser.GameObjects.Container {
  private shadow!: Phaser.GameObjects.Rectangle;
  private content!: Phaser.GameObjects.Rectangle;
  private label!: Phaser.GameObjects.Text;

  private readonly buttonWidth: number;
  private readonly buttonHeight: number;
  private readonly fontSize: string;
  private readonly color: ButtonColor;

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
    this.color = config.color ?? ButtonColor.Blue;

    this.createShadow(scene);
    this.createContent(scene);
    this.createLabel(scene, text);
    this.adjustFontSizeToFit();

    this.add([this.shadow, this.content, this.label]);
    this.setSize(this.buttonWidth, this.buttonHeight);
    this.setInteractive({ useHandCursor: true });
    this.setupPointerEvents(callback);

    scene.add.existing(this);
  }

  private createShadow(scene: Phaser.Scene) {
    const color = this.color === ButtonColor.Black ? 0x1f2530 : 0x154486;
    const stroke = this.color === ButtonColor.Black ? 0x2d3444 : 0x0d274d;

    this.shadow = scene.add
      .rectangle(0, 5, this.buttonWidth, this.buttonHeight, color, 1)
      .setOrigin(0.5)
      .setStrokeStyle(2, stroke);
  }

  private createContent(scene: Phaser.Scene) {
    const fillColor = this.color === ButtonColor.Black ? 0x32384c : 0x3592fe;
    const strokeColor = this.color === ButtonColor.Black ? 0x292d3e : 0x1c5aaa;

    this.content = scene.add
      .rectangle(0, 0, this.buttonWidth, this.buttonHeight, fillColor, 1)
      .setOrigin(0.5)
      .setStrokeStyle(2, strokeColor);
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

  private adjustFontSizeToFit() {
    let fontSize = parseInt(this.fontSize);
    const maxWidth = this.buttonWidth - 20;
    while (this.label.width > maxWidth && fontSize > 10) {
      fontSize -= 1;
      this.label.setFontSize(fontSize);
    }
  }

  private setupPointerEvents(callback: () => void) {
    this.on('pointerover', this.onPointerOver, this);
    this.on('pointerout', this.onPointerOut, this);
    this.on('pointerdown', this.onPointerDown, this);
    this.on('pointerup', () => this.onPointerUp(callback), this);
  }

  private onPointerOver() {
    this.content.setFillStyle(this.color === ButtonColor.Black ? 0x4a5263 : 0x4aa3ff);
    this.y -= 2;
  }

  private onPointerOut() {
    this.content.setFillStyle(this.color === ButtonColor.Black ? 0x32384c : 0x3592fe);
    this.y += 2;
  }

  private onPointerDown() {
    this.content.setFillStyle(this.color === ButtonColor.Black ? 0x2a2f40 : 0x2c7dd6);
    this.y += 2;
  }

  private onPointerUp(callback: () => void) {
    this.content.setFillStyle(this.color === ButtonColor.Black ? 0x4a5263 : 0x4aa3ff);
    this.y -= 2;
    callback();
  }
}
