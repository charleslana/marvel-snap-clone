import Phaser from 'phaser';
import { Card } from '@/interfaces/Card';

export class DeckDisplay {
  private scene: Phaser.Scene;
  private deckText?: Phaser.GameObjects.Text;
  private label: string;
  private modalContainer?: Phaser.GameObjects.Container;
  private deckCards: Omit<Card, 'index'>[] = [];
  private canOpenModal = false;

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

    this.deckText = this.createDeckText(x, y, initialDeck);
  }

  public updateDeck(deck: number): void {
    this.deckText?.setText(`${this.label}: ${deck}`);
  }

  public enableModalOpen(): void {
    this.canOpenModal = true;
  }

  public disableModalOpen(): void {
    this.canOpenModal = false;
  }

  private createDeckText(x: number, y: number, initialDeck: number): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x, y, `${this.label}: ${initialDeck}`, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#222222',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (this.canOpenModal) this.showModal();
      });
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
    const closeButton = this.createCloseButton(width, height);

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

  private createCardObjects(
    startX: number,
    startY: number,
    modalWidth: number
  ): Phaser.GameObjects.GameObject[] {
    const spacing = 20;
    const cardWidth = 100;
    const cardHeight = 120;
    const cols = Math.floor(modalWidth / (cardWidth + spacing));
    const shuffled = Phaser.Utils.Array.Shuffle([...this.deckCards]);

    const objects: Phaser.GameObjects.GameObject[] = [];

    shuffled.forEach((card, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardWidth + spacing);
      const y = startY + row * (cardHeight + spacing);

      const rect = this.createCardRectangle(x, y, cardWidth, cardHeight);
      const nameText = this.createCardNameText(x, y, cardWidth, card.name);
      const powerText = this.createCardPowerText(x, y, cardWidth, card.power);
      const costText = this.createCardCostText(x, y, card.cost);

      objects.push(rect, nameText, powerText, costText);
    });

    return objects;
  }

  private createCardRectangle(
    x: number,
    y: number,
    width: number,
    height: number
  ): Phaser.GameObjects.Rectangle {
    const rect = this.scene.add.rectangle(x, y, width, height, 0x333333, 1).setOrigin(0, 0);
    rect.setStrokeStyle(1, 0xffffff);
    return rect;
  }

  private createCardNameText(
    x: number,
    y: number,
    cardWidth: number,
    name: string
  ): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x + cardWidth / 2, y + 120 - 10, name, {
        color: '#ffffff',
        fontSize: '12px',
        align: 'center',
        wordWrap: { width: cardWidth - 10, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 1);
  }

  private createCardPowerText(
    x: number,
    y: number,
    cardWidth: number,
    power: number
  ): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x + cardWidth - 5, y + 5, String(power), {
        color: '#ffff00',
        fontSize: '12px',
        fontStyle: 'bold',
        align: 'right',
      })
      .setOrigin(1, 0);
  }

  private createCardCostText(x: number, y: number, cost: number): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x + 5, y + 5, String(cost), {
        color: '#ffffff',
        fontSize: '12px',
        align: 'left',
      })
      .setOrigin(0, 0);
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
