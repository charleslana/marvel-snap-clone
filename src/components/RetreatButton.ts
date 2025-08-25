import Phaser from 'phaser';
import { GameButton } from './GameButton';
import { ButtonColor } from '@/enums/ButtonColor';
import { LogHelper } from '@/managers/card-effects/helpers/LogHelper';
import { ConfirmationModal } from './ConfirmationModal';

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
    const modal = new ConfirmationModal(this.scene, {
      message: 'Deseja desistir?',
      confirmText: 'Desistir',
      onConfirm: () => {
        this.onConfirm();
        LogHelper.emitLog('Jogador desistiu da batalha.');
      },
    });

    modal.show();
  }
}
