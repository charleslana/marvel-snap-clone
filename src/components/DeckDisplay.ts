import Phaser from 'phaser';
import { Card } from '@/interfaces/Card';
import { CardContainer } from './CardContainer';
import { GameButton } from './GameButton';
import { ButtonColor } from '@/enums/ButtonColor';
import { UIFactory } from './UIFactory';

export class DeckDisplay {
  private scene: Phaser.Scene;
  private deckButton?: GameButton;
  private label: string;
  private modalContainer?: Phaser.GameObjects.Container;
  private deckCards: Card[] = [];
  private canOpenModal = false;

  constructor(scene: Phaser.Scene, label: string) {
    this.scene = scene;
    this.label = label;
  }

  public initialize(x: number, y: number, initialDeckSize: number, cards?: Card[]): void {
    if (cards) this.deckCards = cards;
    this.deckButton = this.createDeckButton(x, y, initialDeckSize);
  }

  public updateDeck(deckSize: number): void {
    this.deckButton?.setLabel(`${this.label}: ${deckSize}`);
  }

  public enableModalOpen(): void {
    this.canOpenModal = true;
  }

  public disableModalOpen(): void {
    this.canOpenModal = false;
  }

  private createDeckButton(x: number, y: number, initialDeckSize: number): GameButton {
    const buttonWidth = 180;
    const buttonHeight = 50;
    const buttonCenterX = x + buttonWidth / 2;
    const buttonCenterY = y;

    return new GameButton(
      this.scene,
      buttonCenterX,
      buttonCenterY,
      `${this.label}: ${initialDeckSize}`,
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

    const background = UIFactory.createRectangle(this.scene, 0, 0, width, height, 0x000000, 0.6)
      .setOrigin(0)
      .setInteractive()
      .on('pointerdown', () => this.closeModal());

    const modalBox = UIFactory.createRectangle(
      this.scene,
      width / 2,
      height / 2,
      width * 0.85,
      height * 0.85,
      0x222222,
      1
    ).setStrokeStyle(2, 0xffffff);

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

    this.modalContainer = this.scene.add
      .container(0, 0, [background, modalBox, ...cardObjects, closeButton])
      .setDepth(100);
    this.scene.children.bringToTop(this.modalContainer);
  }

  private closeModal(): void {
    if (!this.modalContainer) return;
    this.modalContainer.destroy(true);
    this.modalContainer = undefined;
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
}
