import Phaser from 'phaser';
import { GameButton } from './GameButton';
import { ButtonColor } from '@/enums/ButtonColor';
import { UIFactory } from './UIFactory';
import { LogHelper } from '@/managers/card-effects/helpers/LogHelper';

export class RetreatButton {
  private scene: Phaser.Scene;
  private button: GameButton;
  private onConfirm: () => void;
  private modalContainer?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, onConfirm: () => void) {
    this.scene = scene;
    this.onConfirm = onConfirm;

    this.button = new GameButton(scene, x, y, 'Desistir', () => this.showConfirmationModal(), {
      color: ButtonColor.Black,
      width: 150,
      height: 50,
      fontSize: '20px',
    });
  }

  public setVisible(isVisible: boolean): void {
    this.button.setVisible(isVisible);
  }

  private showConfirmationModal(): void {
    if (this.modalContainer) return;

    const { width, height } = this.scene.scale;

    this.modalContainer = this.scene.add.container(0, 0).setDepth(100);

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
      'Deseja desistir?',
      {
        fontSize: '48px',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
      }
    ).setOrigin(0.5);

    const confirmButton = new GameButton(
      this.scene,
      width / 2 - 110,
      height / 2 + 40,
      'Desistir',
      () => {
        this.closeModal();
        this.onConfirm();
        LogHelper.emitLog('Jogador desistiu da batalha.');
      },
      {
        color: ButtonColor.Blue,
        width: 180,
        height: 60,
        fontSize: '28px',
      }
    );

    const cancelButton = new GameButton(
      this.scene,
      width / 2 + 110,
      height / 2 + 40,
      'Cancelar',
      () => this.closeModal(),
      {
        color: ButtonColor.Black,
        width: 180,
        height: 60,
        fontSize: '28px',
      }
    );

    this.modalContainer.add([overlay, messageText, confirmButton, cancelButton]);
  }

  private closeModal(): void {
    if (this.modalContainer) {
      this.modalContainer.destroy();
      this.modalContainer = undefined;
    }
  }
}
