import Phaser from 'phaser';
import { CardData } from '@/interfaces/Card';

export class CardDetailsPanel {
  private scene: Phaser.Scene;
  private panel?: Phaser.GameObjects.Container;
  private nameText?: Phaser.GameObjects.Text;
  private powerText?: Phaser.GameObjects.Text;
  private costText?: Phaser.GameObjects.Text;
  private descriptionText?: Phaser.GameObjects.Text;

  private readonly width = 220;
  private readonly height = 320;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public initialize(x: number, y: number): void {
    const background = this.createBackground();
    this.nameText = this.createNameText();
    this.powerText = this.createPowerText();
    this.costText = this.createCostText();
    this.descriptionText = this.createDescriptionText();

    this.panel = this.scene.add.container(x, y, [
      background,
      this.nameText,
      this.powerText,
      this.costText,
      this.descriptionText,
    ]);

    this.panel.setVisible(false);
  }

  public showCardDetails(card: CardData): void {
    if (!this.panel) return;

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
    return this.scene.add
      .text(0, this.height / 2 - 30, 'Nome da Carta', {
        fontSize: '20px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: this.width - 40 },
      })
      .setOrigin(0.5, 0.5);
  }

  private createPowerText(): Phaser.GameObjects.Text {
    return this.scene.add
      .text(this.width / 2 - 20, -this.height / 2 + 20, '0', {
        fontSize: '18px',
        color: '#ffff00',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0.5);
  }

  private createCostText(): Phaser.GameObjects.Text {
    return this.scene.add
      .text(-this.width / 2 + 20, -this.height / 2 + 20, '0', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);
  }

  private createDescriptionText(): Phaser.GameObjects.Text {
    return this.scene.add
      .text(0, 0, 'Descrição detalhada da carta vai aqui.', {
        fontSize: '16px',
        color: '#cccccc',
        align: 'center',
        wordWrap: { width: this.width - 40 },
      })
      .setOrigin(0.5);
  }
}
