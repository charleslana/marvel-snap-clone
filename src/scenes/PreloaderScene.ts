import { FontEnum } from '@/enums/FontEnum';
import { ImageEnum } from '@/enums/ImageEnum';
import { SceneEnum } from '@/enums/SceneEnum';
import Phaser from 'phaser';

export class PreloaderScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super(SceneEnum.Preloader);
  }

  init() {
    this.createBg();
    this.createTitleText();
    this.createLoadingText();
    this.createProgressBar();
  }

  preload() {
    this.load.setPath('assets');
    for (let i = 0; i < 1; i++) {
      this.load.image(`${ImageEnum.Example}_${i}`, 'images/background.jpg');
    }
  }

  create() {
    this.scene.start(SceneEnum.Deck);
  }

  private createBg(): void {
    const backgroundImage = this.add.image(0, 0, ImageEnum.Background).setOrigin(0);
    backgroundImage.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
  }

  private createTitleText(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 4, 'Marvel Snap Clone\nSimulador', {
        fontFamily: FontEnum.UltimatumBoldItalic,
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setStroke('#000000', 3);
  }

  private createLoadingText(): void {
    const { width, height } = this.scale;
    this.loadingText = this.add
      .text(width / 2, height / 2 + 130, 'Carregando... 0%', {
        fontFamily: FontEnum.RedHatDisplay400,
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setStroke('#000000', 3);
  }

  private createProgressBar(): void {
    const barWidth = 468;
    const barHeight = 32;
    const { width, height } = this.scale;
    const progressBarX = width / 2;
    const progressBarY = height / 2 + barHeight / 2 + 150;
    this.add.rectangle(progressBarX, progressBarY, barWidth, barHeight).setStrokeStyle(2, 0xffffff);
    const progressIndicator = this.add.rectangle(
      progressBarX - barWidth / 2 + 4,
      progressBarY,
      4,
      barHeight - 4,
      0xffffff
    );
    this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) => {
      progressIndicator.width = 4 + (barWidth - 8) * progress;
      this.loadingText.setText(`Carregando... ${Math.round(progress * 100)}%`);
    });
  }
}
