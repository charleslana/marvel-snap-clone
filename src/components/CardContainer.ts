import Phaser from 'phaser';
import { Card, CardData } from '@/interfaces/Card';

export class CardContainer extends Phaser.GameObjects.Container {
  public cardData: CardData;
  public startX: number;
  public startY: number;

  private nameText: Phaser.GameObjects.Text;
  private costText: Phaser.GameObjects.Text;
  private powerText: Phaser.GameObjects.Text;
  private borderRect?: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    card: Omit<Card, 'index'>,
    index: number,
    isPlayer: boolean
  ) {
    super(scene, x, y);

    const cardRect = scene.add.rectangle(0, 0, width, height, color);

    // Ajustando posições relativas ao tamanho da carta
    this.nameText = scene.add
      .text(0, height / 2 - 10, card.name, {
        color: '#ffffff',
        fontSize: '14px',
        align: 'center',
        wordWrap: { width: width - 10, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 1);

    this.adjustFontSizeToFit(this.nameText, width - 10, 14, 8);

    this.powerText = scene.add
      .text(width / 2 - 10, -height / 2 + 10, String(card.power), {
        color: '#ffff00',
        fontSize: '14px',
        fontStyle: 'bold',
        align: 'right',
      })
      .setOrigin(1, 0);

    this.costText = scene.add
      .text(-width / 2 + 10, -height / 2 + 10, String(card.cost), {
        color: '#ffffff',
        fontSize: '14px',
        align: 'left',
      })
      .setOrigin(0, 0);

    this.add([cardRect, this.nameText, this.powerText, this.costText]);

    this.setSize(width, height);
    this.cardData = { ...card, index };
    this.startX = x;
    this.startY = y;

    if (isPlayer) {
      this.setInteractive({ draggable: true });
      scene.input.setDraggable(this);
    }
  }

  public showPlayableBorder(show: boolean): void {
    if (show) {
      if (!this.borderRect) {
        this.borderRect = this.scene.add
          .rectangle(0, 0, this.width + 6, this.height + 6)
          .setStrokeStyle(3, 0x00ff00)
          .setOrigin(0.5);
        this.addAt(this.borderRect, 0);
        // Animação de pulsar
        this.scene.tweens.add({
          targets: this.borderRect,
          alpha: { from: 0.5, to: 1 },
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    } else {
      if (this.borderRect) {
        this.scene.tweens.killTweensOf(this.borderRect);
        this.borderRect.destroy();
        this.borderRect = undefined;
      }
    }
  }

  public setTextsVisible(visible: boolean): void {
    this.nameText.setVisible(visible);
    this.costText.setVisible(visible);
    this.powerText.setVisible(visible);
  }

  private adjustFontSizeToFit(
    textObj: Phaser.GameObjects.Text,
    maxWidth: number,
    maxFontSize: number,
    minFontSize: number
  ) {
    let fontSize = maxFontSize;

    while (fontSize >= minFontSize) {
      textObj.setFontSize(fontSize);
      if (textObj.width <= maxWidth) break;
      fontSize--;
    }
  }
}
