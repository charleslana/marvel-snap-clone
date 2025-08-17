import Phaser from 'phaser';
import { FontEnum } from '@/enums/FontEnum';

export interface TextOptions extends Phaser.Types.GameObjects.Text.TextStyle {}

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
}
