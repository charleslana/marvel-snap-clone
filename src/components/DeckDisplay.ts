import Phaser from 'phaser';
import { Card } from '@/interfaces/Card';
import { CardContainer } from './CardContainer';
import { GameButton } from './GameButton';
import { ButtonColor } from '@/enums/ButtonColor';

export class DeckDisplay {
  private scene: Phaser.Scene;
  private deckButton?: GameButton;
  private label: string;
  private modalContainer?: Phaser.GameObjects.Container;
  private deckCards: Omit<Card, 'index'>[] = [];
  private canOpenModal = false;
  private borderRect?: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, label: string) {
    this.scene = scene;
    this.label = label;
  }

  public initialize(
    x: number,
    y: number,
    initialDeck: number,
    cards?: Omit<Card, 'index'>[]
  ): void {
    if (cards) this.deckCards = cards;
    this.deckButton = this.createDeckButton(x, y, initialDeck);
  }

  public updateDeck(deck: number): void {
    this.deckButton?.setLabel(`${this.label}: ${deck}`);
  }

  public enableModalOpen(): void {
    this.canOpenModal = true;
  }

  public disableModalOpen(): void {
    this.canOpenModal = false;
  }

  public showPriorityBorder(show: boolean): void {
    if (show) {
      this.createPriorityBorder();
    } else {
      this.destroyPriorityBorder();
    }
  }

  private createPriorityBorder(): void {
    if (this.borderRect || !this.deckButton) return;
    this.borderRect = this.scene.add
      .rectangle(
        this.deckButton.x,
        this.deckButton.y,
        this.deckButton.width + 6,
        this.deckButton.height + 6,
        0x000000,
        0
      )
      .setOrigin(0.5)
      .setStrokeStyle(3, 0x00ff00);

    this.scene.children.bringToTop(this.borderRect);
    this.deckButton.parentContainer?.bringToTop(this.deckButton);

    this.scene.tweens.add({
      targets: this.borderRect,
      alpha: { from: 0.5, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private destroyPriorityBorder(): void {
    if (this.borderRect) {
      this.scene.tweens.killTweensOf(this.borderRect);
      this.borderRect.destroy();
      this.borderRect = undefined;
    }
  }

  private createDeckButton(x: number, y: number, initialDeck: number): GameButton {
    const buttonWidth = 180;
    const buttonHeight = 50;
    const buttonCenterX = x + buttonWidth / 2;
    const buttonCenterY = y;

    return new GameButton(
      this.scene,
      buttonCenterX,
      buttonCenterY,
      `${this.label}: ${initialDeck}`,
      () => {
        if (this.canOpenModal) this.showModal();
      },
      {
        color: ButtonColor.Purple,
        width: buttonWidth,
        height: buttonHeight,
        fontSize: '20px',
      }
    );
  }

  private showModal(): void {
    if (this.modalContainer) return;
    const { width, height } = this.scene.cameras.main;
    const background = this.createModalBackground(width, height);
    const modalBox = this.createModalBox(width, height);
    const cardObjects = this.createCardObjects(
      modalBox.x - modalBox.width / 2 + 30,
      modalBox.y - modalBox.height / 2 + 30,
      modalBox.width - 60
    );

    const closeButton = new GameButton(
      this.scene,
      width / 2,
      height - height * 0.12,
      'Fechar',
      () => this.closeModal(),
      {
        width: 150,
        height: 50,
        fontSize: '24px',
        color: ButtonColor.Black,
      }
    );

    this.modalContainer = this.scene.add.container(0, 0, [
      background,
      modalBox,
      ...cardObjects,
      closeButton,
    ]);
    this.scene.children.bringToTop(this.modalContainer);
  }

  private closeModal(): void {
    if (!this.modalContainer) return;
    this.modalContainer.destroy(true);
    this.modalContainer = undefined;
  }

  private createModalBackground(width: number, height: number): Phaser.GameObjects.Rectangle {
    return this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setInteractive()
      .on('pointerdown', () => this.closeModal());
  }

  private createModalBox(width: number, height: number): Phaser.GameObjects.Rectangle {
    const modalBox = this.scene.add.rectangle(
      width / 2,
      height / 2,
      width * 0.85,
      height * 0.85,
      0x222222,
      1
    );
    modalBox.setStrokeStyle(2, 0xffffff);
    return modalBox;
  }

  private createCardObjects(startX: number, startY: number, modalWidth: number): CardContainer[] {
    const spacing = 20;
    const cardWidth = 100;
    const cardHeight = 120;
    const cols = Math.floor(modalWidth / (cardWidth + spacing));
    const shuffled = Phaser.Utils.Array.Shuffle([...this.deckCards]);

    const cardContainers: CardContainer[] = [];

    shuffled.forEach((card, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = startX + col * (cardWidth + spacing) + cardWidth / 2;
      const y = startY + row * (cardHeight + spacing) + cardHeight / 2;

      const cardContainer = new CardContainer(
        this.scene,
        x,
        y,
        cardWidth,
        cardHeight,
        0x333333,
        card,
        i
      );
      cardContainer.setRevealed(true);

      cardContainers.push(cardContainer);
    });

    return cardContainers;
  }

  private createCloseButton(width: number, height: number): Phaser.GameObjects.Text {
    return this.scene.add
      .text(width / 2, height - height * 0.12, 'Fechar', {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#aa0000',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.closeModal());
  }
}
