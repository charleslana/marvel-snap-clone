import Phaser from 'phaser';
import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';
import { UIFactory } from './UIFactory';
import { FontEnum } from '@/enums/FontEnum';
import { LaneDetailsPanel } from '@/components/LaneDetailsPanel';

export class LaneDisplay {
  private scene: Phaser.Scene;
  private laneDetailsPanel?: LaneDetailsPanel;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public initializeLaneDetailsPanel(): void {
    const width = 220;
    const x = this.scene.scale.width - width / 2 - 20;
    const y = this.scene.scale.height / 2;

    this.laneDetailsPanel = new LaneDetailsPanel(this.scene);
    this.laneDetailsPanel.initialize(x, y);
  }

  public createLane(x: number, y: number, index: number): Lane {
    const worldRect = this.createWorldRect();
    const worldText = this.createWorldText(index);

    // Cria a imagem de fundo que ficará atrás de tudo
    const worldImage = this.scene.add.image(0, 0, '').setVisible(false);

    const opponentPowerText = this.createPowerText(-worldRect.height / 2 + 15);
    const playerPowerText = this.createPowerText(worldRect.height / 2 - 15, true);

    // A ordem é importante: imagem primeiro (atrás), depois retângulo, depois textos
    const worldContainer = this.scene.add.container(x, y, [
      worldImage, // Fundo (atrás)
      worldRect, // Retângulo com borda
      worldText, // Texto principal
      opponentPowerText,
      playerPowerText,
    ]);

    const playerSlots = this.createSlots(x, y, true);
    const opponentSlots = this.createSlots(x, y, false);

    const lane: Lane = {
      index,
      x,
      y,
      playerSlots,
      opponentSlots,
      worldText,
      worldImage,
      opponentPowerText,
      playerPowerText,
      worldContainer,
    };

    // Configura eventos de mouse para o worldContainer
    this.setupLaneMouseEvents(worldContainer, lane);

    return lane;
  }

  public updateLanePowerColors(lane: Lane, playerPower: number, enemyPower: number): void {
    const highlightColor = '#FFA500';
    const defaultColor = '#888888';

    if (playerPower > enemyPower) {
      lane.playerPowerText?.setColor(highlightColor);
      lane.opponentPowerText?.setColor(defaultColor);
    } else if (enemyPower > playerPower) {
      lane.playerPowerText?.setColor(defaultColor);
      lane.opponentPowerText?.setColor(highlightColor);
    } else {
      lane.playerPowerText?.setColor(defaultColor);
      lane.opponentPowerText?.setColor(defaultColor);
    }
  }

  // Nova função pública para atualizar o texto da lane
  public updateLaneEffectText(lane: Lane, name: string, description?: string): void {
    if (lane.worldText && lane.worldContainer) {
      const newText = description ? `${name}\n\n${description}` : name;

      lane.worldText.setText(newText);
      this.adjustTextToFit(lane.worldText, lane.worldContainer);
    }
  }

  // Nova função pública para atualizar a imagem da lane
  public updateLaneEffectImage(lane: Lane, textureKey: string): void {
    if (lane.worldImage) {
      lane.worldImage.setTexture(textureKey);
      this.setupWorldImageDisplay(lane.worldImage); // Reutiliza a lógica
      lane.worldImage.setVisible(true);
    }
  }

  private createWorldRect(): Phaser.GameObjects.Rectangle {
    // Retângulo semi-transparente para mostrar a imagem de fundo
    return UIFactory.createRectangle(this.scene, 0, 0, 160, 100, 0x333333, 0.3).setStrokeStyle(
      2,
      0xffffff
    );
  }

  private createWorldText(index: number): Phaser.GameObjects.Text {
    const rectWidth = 160;

    return UIFactory.createText(this.scene, 0, 0, `Mundo ${index + 1}`, {
      fontSize: '16px',
      align: 'center',
      wordWrap: { width: rectWidth - 20, useAdvancedWrap: true },
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0.5);
  }

  private createPowerText(y: number, isPlayer: boolean = false): Phaser.GameObjects.Text {
    const originY = isPlayer ? 1 : 0;
    return UIFactory.createText(this.scene, 0, y, '0', {
      fontSize: '14px',
      color: '#888888',
      fontStyle: 'bold',
      fontFamily: FontEnum.UltimatumHeavyItalic,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, originY);
  }

  private createSlots(x: number, y: number, isPlayer: boolean): Slot[] {
    const slots: Slot[] = [];
    const cardWidth = 80;
    const cardHeight = 110;
    const cols = 2;
    const rowsPerSide = 2;
    const horizontalSpacing = 5;
    const verticalSpacing = 5;
    const marginFromRect = 10;
    const totalCardsWidth = cols * cardWidth + (cols - 1) * horizontalSpacing;
    const firstCardOffsetX = -totalCardsWidth / 2 + cardWidth / 2;

    for (let row = 0; row < rowsPerSide; row++) {
      for (let col = 0; col < cols; col++) {
        const offsetX = firstCardOffsetX + col * (cardWidth + horizontalSpacing);
        const slotX = x + offsetX;
        const slotY = this.calculateSlotY(
          y,
          row,
          cardHeight,
          verticalSpacing,
          marginFromRect,
          isPlayer
        );

        const overlay = UIFactory.createRectangle(
          this.scene,
          slotX,
          slotY,
          cardWidth,
          cardHeight,
          0xffffff,
          0.2
        ).setVisible(false);

        slots.push({ x: slotX, y: slotY, occupied: false, overlay });
      }
    }

    return slots;
  }

  private calculateSlotY(
    baseY: number,
    row: number,
    cardHeight: number,
    verticalSpacing: number,
    margin: number,
    isPlayer: boolean
  ): number {
    const sideMultiplier = isPlayer ? 1 : -1;
    const rectHalfHeight = 100 / 2;
    return (
      baseY +
      sideMultiplier *
        (rectHalfHeight + margin + cardHeight / 2 + row * (cardHeight + verticalSpacing))
    );
  }

  private adjustTextToFit(
    textObject: Phaser.GameObjects.Text,
    container?: Phaser.GameObjects.Container
  ): void {
    if (!container) return;

    // Define a largura máxima com um pouco de preenchimento (padding)
    const maxWidth = container.getBounds().width - 20;
    const maxHeight = container.getBounds().height - 10;

    // Aplica a quebra de linha automática
    textObject.setWordWrapWidth(maxWidth);
    textObject.setAlign('center'); // Centraliza o texto de múltiplas linhas

    // Começa com um tamanho de fonte padrão e vai diminuindo
    let fontSize = 16; // Tamanho de fonte inicial
    textObject.setFontSize(fontSize);

    // Reduz o tamanho da fonte até que a altura do texto caiba no contêiner
    while (textObject.height > maxHeight && fontSize > 8) {
      fontSize--;
      textObject.setFontSize(fontSize);
    }
  }

  /**
   * Configura a exibição da imagem de fundo da lane
   */
  private setupWorldImageDisplay(worldImage: Phaser.GameObjects.Image): void {
    const rectWidth = 160;
    const rectHeight = 100;

    // Obtém as dimensões originais da imagem
    const imageWidth = worldImage.width;
    const imageHeight = worldImage.height;

    if (imageWidth === 0 || imageHeight === 0) {
      // Se a imagem não carregou ainda, usa displaySize como fallback
      worldImage.setDisplaySize(rectWidth, rectHeight);
      return;
    }

    // Calcula as escalas necessárias
    const scaleX = rectWidth / imageWidth;
    const scaleY = rectHeight / imageHeight;

    // Usa a maior escala para garantir que a imagem cubra toda a área
    const scale = Math.max(scaleX, scaleY);

    // Aplica a escala
    worldImage.setScale(scale);

    // Se a imagem escalada for maior que o retângulo, aplica crop
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    if (scaledWidth > rectWidth || scaledHeight > rectHeight) {
      // Calcula o crop necessário
      const cropX = Math.max(0, (scaledWidth - rectWidth) / (2 * scale));
      const cropY = Math.max(0, (scaledHeight - rectHeight) / (2 * scale));
      const cropWidth = Math.min(imageWidth, rectWidth / scale);
      const cropHeight = Math.min(imageHeight, rectHeight / scale);

      worldImage.setCrop(cropX, cropY, cropWidth, cropHeight);
    }
  }

  private setupLaneMouseEvents(worldContainer: Phaser.GameObjects.Container, lane: Lane): void {
    // Torna o container interativo
    worldContainer.setInteractive(
      new Phaser.Geom.Rectangle(-80, -50, 160, 100),
      Phaser.Geom.Rectangle.Contains
    );

    // Evento de mouse over
    worldContainer.on('pointerover', () => {
      if (this.laneDetailsPanel && lane.effect && lane.isRevealed) {
        this.laneDetailsPanel.showLaneDetails(lane);
      }
    });

    // Evento de mouse out
    worldContainer.on('pointerout', () => {
      if (this.laneDetailsPanel) {
        this.laneDetailsPanel.hideLaneDetails();
      }
    });
  }
}
