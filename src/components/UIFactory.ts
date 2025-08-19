import Phaser from 'phaser';
import { FontEnum } from '@/enums/FontEnum';

interface TextOptions extends Phaser.Types.GameObjects.Text.TextStyle {}

export class UIFactory {
  public static createText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string | string[],
    options: TextOptions = {}
  ): Phaser.GameObjects.Text {
    const defaultStyle: TextOptions = {
      fontFamily: FontEnum.RedHatDisplay500,
      fontSize: '18px',
      color: '#ffffff',
    };

    const finalStyle = { ...defaultStyle, ...options };

    return scene.add.text(x, y, text, finalStyle);
  }

  public static createRectangle(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: number,
    fillAlpha: number = 1
  ): Phaser.GameObjects.Rectangle {
    return scene.add.rectangle(x, y, width, height, fillColor, fillAlpha);
  }
}
