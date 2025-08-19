import Phaser from 'phaser';
import { FontEnum } from '@/enums/FontEnum';
import { ButtonColor } from '@/enums/ButtonColor';
import { UIFactory } from './UIFactory';

interface GameButtonConfig {
  width?: number;
  height?: number;
  fontSize?: string;
  color?: ButtonColor;
}

interface ButtonColors {
  shadow: number;
  shadowStroke: number;
  fill: number;
  stroke: number;
  hover: number;
  down: number;
}

const buttonColorMap: Record<ButtonColor, ButtonColors> = {
  [ButtonColor.Black]: {
    shadow: 0x1f2530,
    shadowStroke: 0x2d3444,
    fill: 0x32384c,
    stroke: 0x292d3e,
    hover: 0x4a5263,
    down: 0x2a2f40,
  },
  [ButtonColor.Purple]: {
    shadow: 0x6c3b99,
    shadowStroke: 0x4a296b,
    fill: 0xa35dca,
    stroke: 0x8e4bb0,
    hover: 0xb778de,
    down: 0x8e4bb0,
  },
  [ButtonColor.Blue]: {
    shadow: 0x154486,
    shadowStroke: 0x0d274d,
    fill: 0x3592fe,
    stroke: 0x1c5aaa,
    hover: 0x4aa3ff,
    down: 0x2c7dd6,
  },
};

export class GameButton extends Phaser.GameObjects.Container {
  private shadow!: Phaser.GameObjects.Rectangle;
  private content!: Phaser.GameObjects.Rectangle;
  private label!: Phaser.GameObjects.Text;

  private readonly buttonWidth: number;
  private readonly buttonHeight: number;
  private readonly fontSize: string;
  private readonly colors: ButtonColors;

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
    this.colors = buttonColorMap[config.color ?? ButtonColor.Blue];

    this.createShadow();
    this.createContent();
    this.createLabel(text);
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

  private createShadow(): void {
    this.shadow = UIFactory.createRectangle(
      this.scene,
      0,
      5,
      this.buttonWidth,
      this.buttonHeight,
      this.colors.shadow,
      1
    )
      .setOrigin(0.5)
      .setStrokeStyle(2, this.colors.shadowStroke);
  }

  private createContent(): void {
    this.content = UIFactory.createRectangle(
      this.scene,
      0,
      0,
      this.buttonWidth,
      this.buttonHeight,
      this.colors.fill,
      1
    )
      .setOrigin(0.5)
      .setStrokeStyle(2, this.colors.stroke);
  }

  private createLabel(text: string): void {
    this.label = UIFactory.createText(this.scene, 0, 0, text, {
      fontFamily: FontEnum.UltimatumHeavyItalic,
      fontSize: this.fontSize,
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  private adjustFontSizeToFit(): void {
    let fontSize = parseInt(this.fontSize);
    const maxWidth = this.buttonWidth - 20;
    while (this.label.width > maxWidth && fontSize > 10) {
      fontSize -= 1;
      this.label.setFontSize(fontSize);
    }
  }

  private setupPointerEvents(callback: () => void): void {
    this.on('pointerover', this.onPointerOver, this);
    this.on('pointerout', this.onPointerOut, this);
    this.on('pointerdown', this.onPointerDown, this);
    this.on('pointerup', () => this.onPointerUp(callback), this);
  }

  private onPointerOver(): void {
    this.content.setFillStyle(this.colors.hover);
    this.y -= 2;
  }

  private onPointerOut(): void {
    this.content.setFillStyle(this.colors.fill);
    this.y += 2;
  }

  private onPointerDown(): void {
    this.content.setFillStyle(this.colors.down);
    this.y += 2;
  }

  private onPointerUp(callback: () => void): void {
    this.content.setFillStyle(this.colors.hover);
    this.y -= 2;
    callback();
  }
}
