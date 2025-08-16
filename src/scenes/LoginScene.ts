import { FontEnum } from '@/enums/FontEnum';
import { ImageEnum } from '@/enums/ImageEnum';
import { SceneEnum } from '@/enums/SceneEnum';
import Phaser from 'phaser';
import { GameButton } from '@/components/GameButton';
import { TextInput } from '@/components/TextInput';
import { Checkbox } from '@/components/Checkbox';

export class LoginScene extends Phaser.Scene {
  private feedbackText!: Phaser.GameObjects.Text;
  private usernameInput!: TextInput;
  private passwordInput!: TextInput;
  private loginButton!: GameButton;
  private rememberCheckbox!: Checkbox;

  constructor() {
    super(SceneEnum.Login);
  }

  create() {
    this.createBg();
    this.createTitle();
    this.createForm();
    this.createFeedback();
    this.createRegisterLink();
  }

  private createBg() {
    const bg = this.add.image(0, 0, ImageEnum.Background).setOrigin(0);
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
  }

  private createTitle() {
    const { width } = this.scale;
    this.add
      .text(width / 2, 80, 'Fazer Login', {
        fontFamily: FontEnum.UltimatumBoldItalic,
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setStroke('#000000', 3);
  }

  private createForm() {
    const { width } = this.scale;
    const centerX = width / 2;
    let offsetY = 160;

    this.addLabel('Usuário', centerX - 150, offsetY);
    offsetY += 40;
    this.usernameInput = new TextInput(this, centerX, offsetY, { placeholder: 'Usuário' });

    offsetY += 40;
    this.addLabel('Senha', centerX - 150, offsetY);
    offsetY += 40;
    this.passwordInput = new TextInput(this, centerX, offsetY, {
      placeholder: 'Senha',
      type: 'password',
    });

    offsetY += 40;
    const checkboxContainer = this.add.container(centerX - 150, offsetY);
    this.rememberCheckbox = new Checkbox(this, 0, 0);
    const label = this.add
      .text(30, this.rememberCheckbox.height / 2, 'Lembrar-me', {
        fontFamily: FontEnum.RedHatDisplay500,
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0, 0);

    checkboxContainer.add([this.rememberCheckbox, label]);

    offsetY += 100;
    this.loginButton = new GameButton(this, centerX, offsetY, 'Entrar', () => this.handleLogin());
  }

  private addLabel(text: string, x: number, y: number) {
    this.add
      .text(x, y, text, {
        fontFamily: FontEnum.RedHatDisplay500,
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5);
  }

  private createFeedback() {
    const { width } = this.scale;
    this.feedbackText = this.add
      .text(width / 2, 480, '', {
        fontFamily: FontEnum.RedHatDisplay400,
        fontSize: '20px',
        color: '#ff0000',
      })
      .setOrigin(0.5)
      .setStroke('#000000', 2)
      .setVisible(false);
  }

  private createRegisterLink() {
    const { width } = this.scale;
    this.add
      .text(width / 2, 530, 'Fazer Cadastro', {
        fontFamily: FontEnum.RedHatDisplay500,
        fontSize: '20px',
        color: '#00bfff',
      })
      .setOrigin(0.5)
      .setStroke('#000000', 2)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start(SceneEnum.Register);
      });
  }

  private handleLogin() {
    const remember = this.rememberCheckbox.checked;
    console.log('Lembrar-me marcado?', remember);

    this.loginButton.disableInteractive();
    this.showFeedback('Autenticando...', '#ffffff');

    this.time.delayedCall(2000, () => {
      const user = this.usernameInput.getValue();
      const pass = this.passwordInput.getValue();

      if (user === 'admin' && pass === '123') {
        this.showFeedback('Login realizado com sucesso!', '#00ff00');
        this.scene.start(SceneEnum.Home);
      } else {
        this.showFeedback('Usuário ou senha inválidos!', '#ff0000');
      }

      this.loginButton.setInteractive();
    });
  }

  private showFeedback(message: string, color: string) {
    this.feedbackText.setText(message).setColor(color).setVisible(true);
  }
}
