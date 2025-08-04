import Phaser from 'phaser';
import { Card, CardData } from '../interfaces/Card';

export class CardContainer extends Phaser.GameObjects.Container {
  public cardData: CardData;
  public startX: number;
  public startY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, color: number, card: Omit<Card, 'index'>, index: number, isPlayer: boolean) {
    super(scene, x, y);

    const cardRect = scene.add.rectangle(0, 0, width, height, color);

    const nameText = scene.add
      .text(0, 60, card.name, {
        color: '#ffffff',
        fontSize: '14px',
        align: 'center',
      })
      .setOrigin(0.5, 1)
      .setWordWrapWidth(width - 10);

    const powerText = scene.add
      .text(width / 2 - 10, -60, String(card.power), {
        color: '#ffffff',
        fontSize: '14px',
        align: 'right',
      })
      .setOrigin(1, 0);

    const costText = scene.add
      .text(-width / 2 + 10, -60, String(card.cost), {
        color: '#ffff00',
        fontSize: '14px',
        fontStyle: 'bold',
        align: 'left',
      })
      .setOrigin(0, 0);

    this.add([
      cardRect,
      nameText,
      powerText,
      costText,
    ]);

    this.setSize(width, height);
    this.cardData = { ...card, index };
    this.startX = x;
    this.startY = y;

    if (isPlayer) {
      this.setInteractive({ draggable: true });
      scene.input.setDraggable(this);
    }
  }
}

