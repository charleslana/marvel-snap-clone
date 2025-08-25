import Phaser from 'phaser';
import { GameButton } from './GameButton';
import { ButtonColor } from '@/enums/ButtonColor';
import { UIFactory } from './UIFactory';

// Configurações para tornar o modal flexível
interface ConfirmationModalConfig {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export class ConfirmationModal {
  private scene: Phaser.Scene;
  private config: ConfirmationModalConfig;
  private modalContainer?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, config: ConfirmationModalConfig) {
    this.scene = scene;
    this.config = config;
  }

  /**
   * Mostra o modal de confirmação na tela.
   */
  public show(): void {
    // Impede que múltiplos modais sejam abertos
    if (this.modalContainer) {
      return;
    }

    const { width, height } = this.scene.scale;

    // O container principal do modal, com alta profundidade para ficar sobre tudo
    this.modalContainer = this.scene.add.container(0, 0).setDepth(100);

    // Overlay escuro para focar a atenção no modal
    const overlay = UIFactory.createRectangle(
      this.scene,
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.7
    ).setInteractive(); // Interativo para bloquear cliques fora do modal

    // Texto da mensagem, vindo da configuração
    const messageText = UIFactory.createText(
      this.scene,
      width / 2,
      height / 2 - 60,
      this.config.message,
      {
        fontSize: '40px', // Um pouco menor para caber mais texto
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center', // Alinha o texto caso tenha múltiplas linhas
        wordWrap: { width: width * 0.8 }, // Quebra de linha para mensagens longas
      }
    ).setOrigin(0.5);

    // Botão de Confirmação
    const confirmButton = new GameButton(
      this.scene,
      width / 2 - 110,
      height / 2 + 60, // Ajustado para dar mais espaço ao texto
      this.config.confirmText ?? 'Confirmar', // Usa texto padrão se não for fornecido
      () => {
        this.close();
        this.config.onConfirm(); // Executa a ação de confirmação
      },
      {
        color: ButtonColor.Red, // Vermelho por padrão para ações perigosas
        width: 180,
        height: 60,
        fontSize: '28px',
      }
    );

    // Botão de Cancelar
    const cancelButton = new GameButton(
      this.scene,
      width / 2 + 110,
      height / 2 + 60, // Ajustado para dar mais espaço ao texto
      this.config.cancelText ?? 'Cancelar', // Usa texto padrão
      () => {
        this.close();
        if (this.config.onCancel) {
          this.config.onCancel(); // Executa a ação de cancelar, se houver
        }
      },
      {
        color: ButtonColor.Black,
        width: 180,
        height: 60,
        fontSize: '28px',
      }
    );

    this.modalContainer.add([overlay, messageText, confirmButton, cancelButton]);
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
