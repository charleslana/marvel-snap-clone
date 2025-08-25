import Phaser from 'phaser';
import { UIFactory } from './UIFactory';

export class LoadingOverlay {
  private scene: Phaser.Scene;
  private overlayContainer?: Phaser.GameObjects.Container;
  private loadingIcon?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Mostra o overlay de loading.
   * @param message A mensagem a ser exibida, ex: "Salvando..."
   */
  public show(message: string): void {
    if (this.overlayContainer) {
      return;
    }

    const { width, height } = this.scene.scale;

    this.overlayContainer = this.scene.add.container(0, 0).setDepth(102); // Profundidade máxima

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
      height / 2 + 40, // Posição abaixo do ícone
      message,
      {
        fontSize: '32px',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5);

    // Ícone de loading animado (usando texto que gira)
    this.loadingIcon = UIFactory.createText(
      this.scene,
      width / 2,
      height / 2 - 30, // Posição acima do texto
      '◓', // Você pode usar outros caracteres como: ◑ ◒ ◐
      {
        fontSize: '64px',
      }
    ).setOrigin(0.5);

    // Animação de rotação
    this.scene.tweens.add({
      targets: this.loadingIcon,
      angle: 360,
      duration: 1000,
      repeat: -1, // Repetir para sempre
      ease: 'Linear',
    });

    this.overlayContainer.add([overlay, this.loadingIcon, messageText]);
  }

  /**
   * Esconde e destrói o overlay de loading.
   */
  public hide(): void {
    // --- A CORREÇÃO ESTÁ AQUI ---
    // Primeiro, verificamos se o ícone de loading existe antes de tentar parar sua animação.
    if (this.loadingIcon) {
      this.scene.tweens.killTweensOf(this.loadingIcon);
    }

    // A verificação do container já estava correta, mas a mantemos.
    if (this.overlayContainer) {
      this.overlayContainer.destroy();
      this.overlayContainer = undefined;
    }
  }
}
