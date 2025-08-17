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

  public setLabel(newText: string): void {
    this.label.setText(newText);
    this.adjustFontSizeToFit();
  }

  private createShadow(scene: Phaser.Scene) {
    let color: number;
    let stroke: number;

    switch (this.color) {
      case ButtonColor.Black:
        color = 0x1f2530;
        stroke = 0x2d3444;
        break;
      case ButtonColor.Purple:
        color = 0x6c3b99;
        stroke = 0x4a296b;
        break;
      case ButtonColor.Blue:
      default:
        color = 0x154486;
        stroke = 0x0d274d;
        break;
    }

    this.shadow = scene.add
      .rectangle(0, 5, this.buttonWidth, this.buttonHeight, color, 1)
      .setOrigin(0.5)
      .setStrokeStyle(2, stroke);
  }

  private createContent(scene: Phaser.Scene) {
    let fillColor: number;
    let strokeColor: number;

    switch (this.color) {
      case ButtonColor.Black:
        fillColor = 0x32384c;
        strokeColor = 0x292d3e;
        break;
      case ButtonColor.Purple:
        fillColor = 0xa35dca;
        strokeColor = 0x8e4bb0;
        break;
      case ButtonColor.Blue:
      default:
        fillColor = 0x3592fe;
        strokeColor = 0x1c5aaa;
        break;
    }

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
    let hoverColor: number;
    switch (this.color) {
      case ButtonColor.Black:
        hoverColor = 0x4a5263;
        break;
      case ButtonColor.Purple:
        hoverColor = 0xb778de;
        break;
      default:
        hoverColor = 0x4aa3ff;
        break;
    }
    this.content.setFillStyle(hoverColor);
    this.y -= 2;
  }

  private onPointerOut() {
    let baseColor: number;
    switch (this.color) {
      case ButtonColor.Black:
        baseColor = 0x32384c;
        break;
      case ButtonColor.Purple:
        baseColor = 0xa35dca;
        break;
      default:
        baseColor = 0x3592fe;
        break;
    }
    this.content.setFillStyle(baseColor);
    this.y += 2;
  }

  private onPointerDown() {
    let downColor: number;
    switch (this.color) {
      case ButtonColor.Black:
        downColor = 0x2a2f40;
        break;
      case ButtonColor.Purple:
        downColor = 0x8e4bb0;
        break;
      default:
        downColor = 0x2c7dd6;
        break;
    }
    this.content.setFillStyle(downColor);
    this.y += 2;
  }

  private onPointerUp(callback: () => void) {
    let hoverColor: number;
    switch (this.color) {
      case ButtonColor.Black:
        hoverColor = 0x4a5263;
        break;
      case ButtonColor.Purple:
        hoverColor = 0xb778de;
        break;
      default:
        hoverColor = 0x4aa3ff;
        break;
    }
    this.content.setFillStyle(hoverColor);
    this.y -= 2;
    callback();
  }
}
