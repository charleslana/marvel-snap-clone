import Phaser from 'phaser';
import { Card, CardData } from '@/interfaces/Card';
import { UIFactory } from './UIFactory';
import { FontEnum } from '@/enums/FontEnum';
import { ImageEnum } from '@/enums/ImageEnum';

export class CardContainer extends Phaser.GameObjects.Container {
  public cardData: CardData;
  public startX: number;
  public startY: number;

  private nameText: Phaser.GameObjects.Text;
  private costText: Phaser.GameObjects.Text;
  private powerText: Phaser.GameObjects.Text;
  private borderRect?: Phaser.GameObjects.Rectangle;
  private cardImage?: Phaser.GameObjects.Image;
  private backgroundRect!: Phaser.GameObjects.Rectangle;
  private cardBackImage!: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    card: Omit<Card, 'index'>,
    index: number
  ) {
    super(scene, x, y);

    this.cardData = { ...card, index };
    this.startX = x;
    this.startY = y;

    this.backgroundRect = this.createCardRectangle(width, height, color);
    this.cardBackImage = scene.add.image(0, 0, ImageEnum.CardBack01).setDisplaySize(width, height);

    const children: Phaser.GameObjects.GameObject[] = [this.backgroundRect, this.cardBackImage];

    if (card.image) {
      this.cardImage = scene.add.image(0, 0, card.image);
      this.cardImage.setDisplaySize(width, height);
      children.push(this.cardImage);
    }

    this.nameText = this.createNameText(card.name, width, height);
    this.powerText = this.createPowerText(card.power, width, height);
    this.costText = this.createCostText(card.cost, width, height);
    children.push(this.nameText, this.powerText, this.costText);

    this.add(children);

    this.setSize(width, height);
  }

  public setInteractivity(type: 'none' | 'hover' | 'draggable'): void {
    this.disableInteractive();

    switch (type) {
      case 'none':
        this.setRevealed(false);
        break;

      case 'hover':
        this.setInteractive({ useHandCursor: true });
        this.setRevealed(true);
        break;

      case 'draggable':
        this.setInteractive({ useHandCursor: true });
        this.scene.input.setDraggable(this, true);
        this.setRevealed(true);
        break;
    }
  }

  public showPlayableBorder(show: boolean): void {
    show ? this.createPlayableBorder() : this.destroyPlayableBorder();
  }

  public setRevealed(isVisible: boolean): void {
    this.nameText.setVisible(isVisible);
    this.costText.setVisible(isVisible);
    this.powerText.setVisible(isVisible);
    this.cardImage?.setVisible(isVisible);
    this.backgroundRect.setVisible(isVisible && !this.cardImage);
    this.cardBackImage.setVisible(!isVisible);
  }

  public updatePower(newPower: number): void {
    if (this.powerText) {
      this.powerText.setText(String(newPower));
      if (newPower > this.cardData.power) {
        this.powerText.setColor('#00ff00');
      } else if (newPower < this.cardData.power) {
        this.powerText.setColor('#ff0000');
      } else {
        this.powerText.setColor('#ffff00');
      }
    }
  }

  private createCardRectangle(
    width: number,
    height: number,
    color: number
  ): Phaser.GameObjects.Rectangle {
    return this.scene.add.rectangle(0, 0, width, height, color);
  }

  private createNameText(cardName: string, width: number, height: number): Phaser.GameObjects.Text {
    const text = UIFactory.createText(this.scene, 0, height / 2 - 10, cardName, {
      fontSize: '14px',
      align: 'center',
      wordWrap: { width: width - 10, useAdvancedWrap: true },
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 1);

    this.adjustFontSizeToFit(text, width - 10, 14, 8);
    return text;
  }

  private createPowerText(power: number, width: number, height: number): Phaser.GameObjects.Text {
    return UIFactory.createText(this.scene, width / 2 - 10, -height / 2 + 10, String(power), {
      color: '#ffff00',
      fontSize: '14px',
      fontStyle: 'bold',
      fontFamily: FontEnum.UltimatumHeavyItalic,
      align: 'right',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0);
  }

  private createCostText(cost: number, width: number, height: number): Phaser.GameObjects.Text {
    return UIFactory.createText(this.scene, -width / 2 + 10, -height / 2 + 10, String(cost), {
      fontSize: '14px',
      fontFamily: FontEnum.UltimatumHeavyItalic,
      align: 'left',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0, 0);
  }

  private adjustFontSizeToFit(
    textObj: Phaser.GameObjects.Text,
    maxWidth: number,
    maxFontSize: number,
    minFontSize: number
  ): void {
    let fontSize = maxFontSize;

    while (fontSize >= minFontSize) {
      textObj.setFontSize(fontSize);
      if (textObj.width <= maxWidth) break;
      fontSize--;
    }
  }

  private createPlayableBorder(): void {
    if (this.borderRect) return;

    this.borderRect = this.scene.add
      .rectangle(0, 0, this.width + 6, this.height + 6)
      .setStrokeStyle(3, 0x00ff00)
      .setOrigin(0.5);

    this.addAt(this.borderRect, 0);

    this.scene.tweens.add({
      targets: this.borderRect,
      alpha: { from: 0.5, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private destroyPlayableBorder(): void {
    if (!this.borderRect) {
      return;
    }
    this.scene.tweens.killTweensOf(this.borderRect);
    this.borderRect.destroy();
    this.borderRect = undefined;
  }
}
