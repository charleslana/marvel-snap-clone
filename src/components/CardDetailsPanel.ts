import Phaser from 'phaser';
import { CardData } from '@/interfaces/Card';
import { UIFactory } from './UIFactory';
import { FontEnum } from '@/enums/FontEnum';

export class CardDetailsPanel {
  private scene: Phaser.Scene;
  private panel?: Phaser.GameObjects.Container;
  private nameText?: Phaser.GameObjects.Text;
  private powerText?: Phaser.GameObjects.Text;
  private costText?: Phaser.GameObjects.Text;
  private descriptionText?: Phaser.GameObjects.Text;
  private cardImage?: Phaser.GameObjects.Image;
  private backgroundRect?: Phaser.GameObjects.Rectangle;

  private readonly width = 220;
  private readonly height = 320;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public initialize(x: number, y: number): void {
    this.nameText = this.createNameText();
    this.powerText = this.createPowerText();
    this.costText = this.createCostText();
    this.descriptionText = this.createDescriptionText();

    this.panel = this.scene.add.container(x, y, [
      this.nameText,
      this.powerText,
      this.costText,
      this.descriptionText,
    ]);

    this.panel.setVisible(false);
  }

  public showCardDetails(card: CardData): void {
    if (!this.panel) return;

    this.cardImage?.destroy();
    this.backgroundRect?.destroy();

    if (card.image) {
      this.cardImage = this.scene.add.image(0, 0, card.image);
      this.cardImage.setDisplaySize(this.width, this.height);
      this.panel.addAt(this.cardImage, 0);
    } else {
      this.backgroundRect = this.createBackground();
      this.panel.addAt(this.backgroundRect, 0);
    }

    this.nameText?.setText(card.name);
    this.powerText?.setText(card.power.toString());
    this.costText?.setText(card.cost.toString());
    this.descriptionText?.setText(card.description);

    this.panel.setVisible(true);
  }

  public hideCardDetails(): void {
    this.panel?.setVisible(false);
  }

  private createBackground(): Phaser.GameObjects.Rectangle {
    return this.scene.add
      .rectangle(0, 0, this.width, this.height, 0x222222, 0.9)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5);
  }

  private createNameText(): Phaser.GameObjects.Text {
    return UIFactory.createText(this.scene, 0, this.height / 2 - 30, 'Nome da Carta', {
      fontSize: '20px',
      align: 'center',
      wordWrap: { width: this.width - 40 },
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0.5);
  }

  private createPowerText(): Phaser.GameObjects.Text {
    return UIFactory.createText(this.scene, this.width / 2 - 20, -this.height / 2 + 20, '0', {
      fontSize: '18px',
      color: '#ffff00',
      fontStyle: 'bold',
      fontFamily: FontEnum.UltimatumHeavyItalic,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0.5);
  }

  private createCostText(): Phaser.GameObjects.Text {
    return UIFactory.createText(this.scene, -this.width / 2 + 20, -this.height / 2 + 20, '0', {
      fontSize: '18px',
      fontStyle: 'bold',
      fontFamily: FontEnum.UltimatumHeavyItalic,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0, 0.5);
  }

  private createDescriptionText(): Phaser.GameObjects.Text {
    return UIFactory.createText(this.scene, 0, 0, 'Descrição detalhada da carta vai aqui.', {
      fontSize: '16px',
      color: '#cccccc',
      align: 'center',
      wordWrap: { width: this.width - 40 },
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
  }
}
