import Phaser from 'phaser';
import { GameButton } from './GameButton';
import { ButtonColor } from '@/enums/ButtonColor';
import { UIFactory } from './UIFactory';

// Configuração para o modal de alerta
export interface AlertModalConfig {
  message: string;
  okText?: string;
  onOk?: () => void;
}

export class AlertModal {
  private scene: Phaser.Scene;
  private config: AlertModalConfig;
  private modalContainer?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, config: AlertModalConfig) {
    this.scene = scene;
    this.config = config;
  }

  /**
   * Mostra o modal de alerta na tela.
   */
  public show(): void {
    if (this.modalContainer) {
      return;
    }

    const { width, height } = this.scene.scale;

    this.modalContainer = this.scene.add.container(0, 0).setDepth(101); // Profundidade alta

    const overlay = UIFactory.createRectangle(
      this.scene,
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.7
    ).setInteractive();

    const messageText = UIFactory.createText(
      this.scene,
      width / 2,
      height / 2 - 60,
      this.config.message,
      {
        fontSize: '36px',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 5,
        align: 'center',
        wordWrap: { width: width * 0.7 },
      }
    ).setOrigin(0.5);

    // Botão "OK"
    const okButton = new GameButton(
      this.scene,
      width / 2, // Centralizado
      height / 2 + 60,
      this.config.okText ?? 'OK',
      () => {
        this.close();
        if (this.config.onOk) {
          this.config.onOk();
        }
      },
      {
        color: ButtonColor.Blue, // Cor padrão para ações neutras
        width: 180,
        height: 60,
        fontSize: '28px',
      }
    );

    this.modalContainer.add([overlay, messageText, okButton]);
  }

  /**
   * Fecha e destrói o modal.
   */
  private close(): void {
    if (this.modalContainer) {
      this.modalContainer.destroy();
      this.modalContainer = undefined;
    }
  }
}
