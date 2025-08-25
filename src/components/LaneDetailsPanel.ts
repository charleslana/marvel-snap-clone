import Phaser from 'phaser';
import { Lane } from '@/interfaces/Lane';
import { UIFactory } from '@/components/UIFactory';

export class LaneDetailsPanel {
  private scene: Phaser.Scene;
  private panel?: Phaser.GameObjects.Container;
  private nameText?: Phaser.GameObjects.Text;
  private descriptionText?: Phaser.GameObjects.Text;
  private laneImage?: Phaser.GameObjects.Image; // Adicionado
  private backgroundRect?: Phaser.GameObjects.Rectangle;

  private readonly width = 220;
  private readonly height = 150; // Ajustado para o conteúdo da lane

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public initialize(x: number, y: number): void {
    this.nameText = this.createNameText();
    this.descriptionText = this.createDescriptionText();
    this.backgroundRect = this.createBackground();
    this.laneImage = this.scene.add.image(0, 0, '').setVisible(false); // Inicializa a imagem

    this.panel = this.scene.add.container(x, y, [
      this.backgroundRect,
      this.laneImage, // Adiciona a imagem ao container
    ]);

    // Adiciona os textos separadamente para garantir a ordem de renderização
    this.panel.add(this.nameText);
    this.panel.add(this.descriptionText);

    this.panel.setDepth(1000); // Garante que o painel apareça acima de outros elementos
    this.panel.setVisible(false);
  }

  public showLaneDetails(lane: Lane): void {
    if (!this.panel || !lane.effect) return;

    // Destrói a imagem ou background anterior, se existirem
    this.laneImage?.destroy();
    this.backgroundRect?.destroy();

    // Cria a nova imagem ou background
    if (lane.effect.image) {
      this.laneImage = this.scene.add.image(0, 0, lane.effect.image);
      this.laneImage.setDisplaySize(this.width, this.height); // Ajusta ao tamanho do painel
      this.panel.addAt(this.laneImage, 0); // Adiciona ao fundo do container
    } else {
      this.backgroundRect = this.createBackground();
      this.panel.addAt(this.backgroundRect, 0);
    }

    this.nameText?.setText(lane.effect.name);
    this.descriptionText?.setText(lane.effect.description);

    this.panel.setVisible(true);
  }

  public hideLaneDetails(): void {
    this.panel?.setVisible(false);
  }

  private createBackground(): Phaser.GameObjects.Rectangle {
    return this.scene.add
      .rectangle(0, 0, this.width, this.height, 0x222222, 0.9)
      .setStrokeStyle(2, 0xffffff)
      .setOrigin(0.5);
  }

  private createNameText(): Phaser.GameObjects.Text {
    return UIFactory.createText(this.scene, 0, -this.height / 2 + 20, 'Nome do Mundo', {
      fontSize: '20px',
      align: 'center',
      wordWrap: { width: this.width - 40 },
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0.5);
  }

  private createDescriptionText(): Phaser.GameObjects.Text {
    return UIFactory.createText(
      this.scene,
      0,
      this.height / 2 - 40,
      'Descrição detalhada do mundo vai aqui.',
      {
        fontSize: '16px',
        color: '#cccccc',
        align: 'center',
        wordWrap: { width: this.width - 40 },
        stroke: '#000000',
        strokeThickness: 3,
      }
    ).setOrigin(0.5);
  }
}
