import { FontEnum } from '@/enums/FontEnum';
import { ImageEnum } from '@/enums/ImageEnum';
import { SceneEnum } from '@/enums/SceneEnum';
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneEnum.Boot);
  }

  preload() {
    this.load.image(ImageEnum.Background, 'assets/images/background.jpg');
    this.load.font(
      FontEnum.RedHatDisplay400,
      'assets/fonts/red-hat-display-v4-latin-regular-B0APsxK4.woff2'
    );
    this.load.font(
      FontEnum.RedHatDisplay500,
      'assets/fonts/red-hat-display-v4-latin-500-CCexb-Ef.woff2'
    );
    this.load.font(
      FontEnum.RedHatDisplay700,
      'assets/fonts/red-hat-display-v4-latin-700-CgRC5kAc.woff2'
    );
    this.load.font(
      FontEnum.UltimatumHeavyItalic,
      'assets/fonts/cc-ultimatum-heavy-italic-webfont-D2ipOI9a.woff2'
    );
    this.load.font(
      FontEnum.UltimatumBoldItalic,
      'assets/fonts/ultimatum_bold_italic-webfont-PNsbgyaG.woff2'
    );
  }

  create() {
    this.createLoadingText();
    this.scene.start(SceneEnum.Preloader);
  }

  private createLoadingText(): void {
    const { centerX, centerY } = this.cameras.main;
    this.add
      .text(centerX, centerY, 'Carregando...', {
        fontFamily: FontEnum.RedHatDisplay700,
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setAlpha(1)
      .setStroke('#000000', 3);
  }
}
