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
    this.loadCards();
    this.loadCardBacks();
    this.loadLocations();
  }

  create() {
    this.scene.start(SceneEnum.Game);
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

  private loadCards(): void {
    this.load.image(ImageEnum.CardAntMan, 'images/cards/ant-man.jpg');
    this.load.image(ImageEnum.CardAngela, 'images/cards/angela.jpg');
    this.load.image(ImageEnum.CardArmor, 'images/cards/armor.jpg');
    this.load.image(ImageEnum.CardColossus, 'images/cards/colossus.jpg');
    this.load.image(ImageEnum.CardCosmo, 'images/cards/cosmo.jpg');
    this.load.image(ImageEnum.CardIronMan, 'images/cards/iron-man.jpg');
    this.load.image(ImageEnum.CardMrFantastic, 'images/cards/mr-fantastic.jpg');
    this.load.image(ImageEnum.CardNamor, 'images/cards/namor.jpg');
    this.load.image(ImageEnum.CardNightcrawler, 'images/cards/nightcrawler.jpg');
    this.load.image(ImageEnum.CardKlaw, 'images/cards/klaw.jpg');
    this.load.image(ImageEnum.CardSpectrum, 'images/cards/spectrum.jpg');
    this.load.image(ImageEnum.CardOnslaught, 'images/cards/onslaught.jpg');
    this.load.image(ImageEnum.CardAbomination, 'images/cards/abomination.jpg');
    this.load.image(ImageEnum.CardCyclops, 'images/cards/cyclops.jpg');
    this.load.image(ImageEnum.CardHawkEye, 'images/cards/hawkeye.jpg');
    this.load.image(ImageEnum.CardHulk, 'images/cards/hulk.jpg');
    this.load.image(ImageEnum.CardMedusa, 'images/cards/medusa.jpg');
    this.load.image(ImageEnum.CardMistyKnight, 'images/cards/misty-knight.jpg');
    this.load.image(ImageEnum.CardPunisher, 'images/cards/punisher.jpg');
    this.load.image(ImageEnum.CardQuickSilver, 'images/cards/quick-silver.jpg');
    this.load.image(ImageEnum.CardSentinel, 'images/cards/sentinel.jpg');
    this.load.image(ImageEnum.CardWolfsbane, 'images/cards/wolfsbane.jpg');
    this.load.image(ImageEnum.CardStarlord, 'images/cards/starlord.jpg');
    this.load.image(ImageEnum.CardTheThing, 'images/cards/the-thing.jpg');
  }

  private loadCardBacks(): void {
    this.load.image(ImageEnum.CardBack01, 'images/backs/back01.jpg');
  }

  private loadLocations(): void {
    this.load.image(ImageEnum.LocationAtlantis, 'images/locations/atlantis.jpg');
    this.load.image(ImageEnum.LocationNidavellir, 'images/locations/nidavellir.jpg');
    this.load.image(ImageEnum.LocationSewerSystem, 'images/locations/sewer-system.jpg');
  }
}
