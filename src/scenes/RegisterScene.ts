import { FontEnum } from '@/enums/FontEnum';
import { ImageEnum } from '@/enums/ImageEnum';
import { SceneEnum } from '@/enums/SceneEnum';
import Phaser from 'phaser';
import { GameButton } from '@/components/GameButton';
import { TextInput } from '@/components/TextInput';
import { Checkbox } from '@/components/Checkbox';

export class RegisterScene extends Phaser.Scene {
  private feedbackText!: Phaser.GameObjects.Text;
  private usernameInput!: TextInput;
  private passwordInput!: TextInput;
  private registerButton!: GameButton;
  private termsCheckbox!: Checkbox;

  constructor() {
    super(SceneEnum.Register);
  }

  create() {
    this.createBg();
    this.createTitle();
    this.createForm();
    this.createFeedback();
    this.createBackToLoginLink();
  }

  private createBg() {
    const bg = this.add.image(0, 0, ImageEnum.Background).setOrigin(0);
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
  }

  private createTitle() {
    const { width } = this.scale;
    this.add
      .text(width / 2, 80, 'Fazer Cadastro', {
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
    this.termsCheckbox = new Checkbox(this, 0, 0, 26);
    this.termsCheckbox.checked = true;

    const label = this.add
      .text(30, this.termsCheckbox.height / 2, 'Aceito os termos', {
        fontFamily: FontEnum.RedHatDisplay500,
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0, 0);

    checkboxContainer.add([this.termsCheckbox, label]);

    offsetY += 100;
    this.registerButton = new GameButton(this, centerX, offsetY, 'Cadastrar', () =>
      this.handleRegister()
    );
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

  private createBackToLoginLink() {
    const { width } = this.scale;
    this.add
      .text(width / 2, 530, 'Voltar para Login', {
        fontFamily: FontEnum.RedHatDisplay500,
        fontSize: '20px',
        color: '#00bfff',
      })
      .setOrigin(0.5)
      .setStroke('#000000', 2)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start(SceneEnum.Login);
      });
  }

  private handleRegister() {
    const accepted = this.termsCheckbox.checked;
    console.log('Aceito os termos?', accepted);

    if (!accepted) {
      this.showFeedback('Você precisa aceitar os termos para continuar.', '#ff0000');
      return;
    }

    this.registerButton.disableInteractive();
    this.showFeedback('Registrando...', '#ffffff');

    this.time.delayedCall(2000, () => {
      const user = this.usernameInput.getValue();
      const pass = this.passwordInput.getValue();

      if (user && pass) {
        this.showFeedback('Cadastro realizado com sucesso!', '#00ff00');
        // this.scene.start(SceneEnum.Home);
      } else {
        this.showFeedback('Preencha todos os campos!', '#ff0000');
      }

      this.registerButton.setInteractive();
    });
  }

  private showFeedback(message: string, color: string) {
    this.feedbackText.setText(message).setColor(color).setVisible(true);
  }
}
