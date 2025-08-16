import { ImageEnum } from '@/enums/ImageEnum';
import { SceneEnum } from '@/enums/SceneEnum';
import Phaser from 'phaser';
import { GameButton } from '@/components/GameButton';
import { ButtonColor } from '@/enums/ButtonColor';

export class HomeScene extends Phaser.Scene {
  private playButton!: GameButton;
  private decksButton!: GameButton;
  private settingsButton!: GameButton;
  private logoutButton!: GameButton;

  constructor() {
    super(SceneEnum.Home);
  }

  create() {
    this.createBackground();
    this.createButtons();
    this.createLogoutButton();
  }

  private createBackground() {
    const bg = this.add.image(0, 0, ImageEnum.Background).setOrigin(0);
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
  }

  private createButtons() {
    const { width, height } = this.scale;

    const playY = height / 2 - 50;
    this.playButton = new GameButton(this, width / 2, playY, 'Jogar', () => this.handlePlay(), {
      color: ButtonColor.Black,
      width: 300,
      height: 80,
      fontSize: '50px',
    });

    const decksY = height / 2 + 50;
    const decksX = width / 2 - 150;
    this.decksButton = new GameButton(this, decksX, decksY, 'Decks', () => this.handleDecks());

    const settingsX = width / 2 + 150;
    this.settingsButton = new GameButton(
      this,
      settingsX,
      decksY,
      'Configurações',
      () => this.handleSettings(),
      {
        color: ButtonColor.Black,
      }
    );
  }

  private createLogoutButton() {
    const { width } = this.scale;
    const margin = 20;

    this.logoutButton = new GameButton(
      this,
      width - 80,
      margin + 30,
      'Sair',
      () => this.handleLogout(),
      {
        color: ButtonColor.Black,
        width: 120,
        height: 50,
        fontSize: '24px',
      }
    );
  }

  private handleLogout() {
    console.log('Logout clicado!');
    this.scene.start(SceneEnum.Login);
  }

  private handlePlay() {
    console.log('Jogar clicado!');
    this.scene.start(SceneEnum.Game);
  }

  private handleDecks() {
    console.log('Decks clicado!');
    this.scene.start(SceneEnum.Deck);
  }

  private handleSettings() {
    console.log('Configurações clicado!');
    // this.scene.start(SceneEnum.Settings);
  }
}
