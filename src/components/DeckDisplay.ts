import Phaser from 'phaser';
import { Card } from '@/interfaces/Card';

export class DeckDisplay {
  private scene: Phaser.Scene;
  private deckText?: Phaser.GameObjects.Text;
  private label: string;
  private modalContainer?: Phaser.GameObjects.Container;
  private deckCards: Omit<Card, 'index'>[] = [];
  private canOpenModal = false; // usado para o adversário

  constructor(scene: Phaser.Scene, label: string) {
    this.scene = scene;
    this.label = label;
  }

  initialize(x: number, y: number, initialDeck: number, cards?: Omit<Card, 'index'>[]): void {
    if (cards) {
      this.deckCards = cards;
    }

    this.deckText = this.scene.add
      .text(x, y, `${this.label}: ${initialDeck}`, {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#222222',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (this.canOpenModal) {
          this.showModal();
        }
      });
  }

  updateDeck(deck: number): void {
    this.deckText?.setText(`${this.label}: ${deck}`);
  }

  setVisible(visible: boolean): void {
    this.deckText?.setVisible(visible);
  }

  getText(): Phaser.GameObjects.Text | undefined {
    return this.deckText;
  }

  setDeckCards(cards: Omit<Card, 'index'>[]): void {
    this.deckCards = cards;
  }

  enableModalOpen(): void {
    this.canOpenModal = true;
  }

  disableModalOpen(): void {
    this.canOpenModal = false;
  }

  private showModal(): void {
    if (this.modalContainer) return;

    const { width, height } = this.scene.cameras.main;

    // Fundo escuro
    const background = this.scene.add
      .rectangle(0, 0, width, height, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setInteractive()
      .on('pointerdown', () => this.closeModal());

    // Caixa da modal
    const modalBox = this.scene.add.rectangle(
      width / 2,
      height / 2,
      width * 0.85,
      height * 0.85,
      0x222222,
      1
    );
    modalBox.setStrokeStyle(2, 0xffffff);

    // Embaralhar as cartas para exibição aleatória
    const shuffled = Phaser.Utils.Array.Shuffle([...this.deckCards]);

    // Criar grid
    const startX = width / 2 - (width * 0.85) / 2 + 30;
    const startY = height / 2 - (height * 0.85) / 2 + 30;
    const cardWidth = 100;
    const cardHeight = 120;
    const spacing = 20;
    const cols = Math.floor((width * 0.85 - 60) / (cardWidth + spacing));

    const cardObjects: Phaser.GameObjects.GameObject[] = [];

    shuffled.forEach((card, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardWidth + spacing);
      const y = startY + row * (cardHeight + spacing);

      const rect = this.scene.add
        .rectangle(x, y, cardWidth, cardHeight, 0x333333, 1)
        .setOrigin(0, 0);
      rect.setStrokeStyle(1, 0xffffff);

      // Nome centralizado na parte inferior
      const nameText = this.scene.add
        .text(x + cardWidth / 2, y + cardHeight - 10, card.name, {
          color: '#ffffff',
          fontSize: '12px',
          align: 'center',
          wordWrap: { width: cardWidth - 10, useAdvancedWrap: true },
        })
        .setOrigin(0.5, 1);

      // Poder canto superior direito (amarelo)
      const powerText = this.scene.add
        .text(x + cardWidth - 5, y + 5, String(card.power), {
          color: '#ffff00',
          fontSize: '12px',
          fontStyle: 'bold',
          align: 'right',
        })
        .setOrigin(1, 0);

      // Custo canto superior esquerdo (branco)
      const costText = this.scene.add
        .text(x + 5, y + 5, String(card.cost), {
          color: '#ffffff',
          fontSize: '12px',
          align: 'left',
        })
        .setOrigin(0, 0);

      cardObjects.push(rect, nameText, powerText, costText);
    });

    // Botão fechar
    const closeButton = this.scene.add
      .text(width / 2, height - height * 0.12, 'Fechar', {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#aa0000',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.closeModal());

    this.modalContainer = this.scene.add.container(0, 0, [
      background,
      modalBox,
      ...cardObjects,
      closeButton,
    ]);
    this.scene.children.bringToTop(this.modalContainer);
  }

  private closeModal(): void {
    if (this.modalContainer) {
      this.modalContainer.destroy(true);
      this.modalContainer = undefined;
    }
  }
}
