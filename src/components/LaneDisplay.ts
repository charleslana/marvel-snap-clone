// ===== 1. MODIFICAÇÕES NO LaneDisplay.ts =====

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
    const worldImage = this.scene.add.image(0, 0, '').setVisible(false);

    const opponentPowerText = this.createPowerText(-worldRect.height / 2 + 15);
    const playerPowerText = this.createPowerText(worldRect.height / 2 - 15, true);

    const worldContainer = this.scene.add.container(x, y, [
      worldImage,
      worldRect,
      worldText,
      opponentPowerText,
      playerPowerText,
    ]);

    const playerSlots = this.createSlots(x, y, true);
    const opponentSlots = this.createSlots(x, y, false);

    // NOVA IMPLEMENTAÇÃO: Cria as zonas de drop grandes
    const playerDropZone = this.createLaneDropZone(x, y, true);
    const opponentDropZone = this.createLaneDropZone(x, y, false);

    const lane: Lane = {
      index,
      x,
      y,
      playerSlots,
      opponentSlots,
      playerDropZone, // Nova propriedade
      opponentDropZone, // Nova propriedade
      worldText,
      worldImage,
      opponentPowerText,
      playerPowerText,
      worldContainer,
    };

    this.setupLaneMouseEvents(worldContainer, lane);
    return lane;
  }

  // NOVA FUNÇÃO: Cria a zona de drop única que cobre os 4 slots
  private createLaneDropZone(
    x: number,
    y: number,
    isPlayer: boolean
  ): Phaser.GameObjects.Rectangle {
    const cardWidth = 80;
    const cardHeight = 110;
    const cols = 2;
    const rowsPerSide = 2;
    const horizontalSpacing = 5;
    const verticalSpacing = 5;
    const marginFromRect = 10;

    // Calcula as dimensões da zona que cobre todos os 4 slots
    const totalWidth = cols * cardWidth + (cols - 1) * horizontalSpacing;
    const totalHeight = rowsPerSide * cardHeight + (rowsPerSide - 1) * verticalSpacing;

    // Calcula a posição Y da zona
    const rectHalfHeight = 100 / 2;
    const sideMultiplier = isPlayer ? 1 : -1;
    const zoneY = y + sideMultiplier * (rectHalfHeight + marginFromRect + totalHeight / 2);

    // Cria a zona de drop grande
    const dropZone = UIFactory.createRectangle(
      this.scene,
      x,
      zoneY,
      totalWidth,
      totalHeight,
      0x0165c5, // Azul para destacar
      0.3 // Semi-transparente
    )
      .setStrokeStyle(3, 0x0165c5, 0.8)
      .setVisible(false);

    return dropZone;
  }

  // NOVA FUNÇÃO: Mostra a zona de drop da lane
  public showLaneDropZone(lane: Lane, isPlayer: boolean = true): void {
    const dropZone = isPlayer ? lane.playerDropZone : lane.opponentDropZone;

    if (dropZone) {
      dropZone.setVisible(true);

      // Animação para destacar a zona
      this.scene.tweens.add({
        targets: dropZone,
        alpha: { from: 0.3, to: 0.6 },
        scaleX: { from: 1, to: 1.02 },
        scaleY: { from: 1, to: 1.02 },
        duration: 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  // NOVA FUNÇÃO: Esconde a zona de drop da lane
  public hideLaneDropZone(lane: Lane, isPlayer: boolean = true): void {
    const dropZone = isPlayer ? lane.playerDropZone : lane.opponentDropZone;

    if (dropZone) {
      // Para a animação
      this.scene.tweens.killTweensOf(dropZone);
      dropZone.setVisible(false);
      dropZone.setAlpha(0.3);
      dropZone.setScale(1, 1);
    }
  }

  // NOVA FUNÇÃO: Verifica se um ponto está dentro da zona de drop da lane
  public isPointInLaneDropZone(
    lane: Lane,
    x: number,
    y: number,
    isPlayer: boolean = true
  ): boolean {
    const dropZone = isPlayer ? lane.playerDropZone : lane.opponentDropZone;

    if (!dropZone || !dropZone.visible) {
      return false;
    }

    const bounds = dropZone.getBounds();
    return Phaser.Geom.Rectangle.Contains(bounds, x, y);
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

  public updateLaneEffectText(lane: Lane, name: string, description?: string): void {
    if (lane.worldText && lane.worldContainer) {
      const newText = description ? `${name}\n\n${description}` : name;
      lane.worldText.setText(newText);
      this.adjustTextToFit(lane.worldText, lane.worldContainer);
    }
  }

  public updateLaneEffectImage(lane: Lane, textureKey: string): void {
    if (lane.worldImage) {
      lane.worldImage.setTexture(textureKey);
      this.setupWorldImageDisplay(lane.worldImage);
      lane.worldImage.setVisible(true);
    }
  }

  private createWorldRect(): Phaser.GameObjects.Rectangle {
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

  // MODIFICADO: Remove os overlays individuais dos slots
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

        // REMOVIDO: overlay individual - agora usamos a zona única
        slots.push({
          x: slotX,
          y: slotY,
          occupied: false,
          slotIndex: row * cols + col, // Índice sequencial para colocação automática
        });
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

    const maxWidth = container.getBounds().width - 20;
    const maxHeight = container.getBounds().height - 10;

    textObject.setWordWrapWidth(maxWidth);
    textObject.setAlign('center');

    let fontSize = 16;
    textObject.setFontSize(fontSize);

    while (textObject.height > maxHeight && fontSize > 8) {
      fontSize--;
      textObject.setFontSize(fontSize);
    }
  }

  private setupWorldImageDisplay(worldImage: Phaser.GameObjects.Image): void {
    const rectWidth = 160;
    const rectHeight = 100;

    const imageWidth = worldImage.width;
    const imageHeight = worldImage.height;

    if (imageWidth === 0 || imageHeight === 0) {
      worldImage.setDisplaySize(rectWidth, rectHeight);
      return;
    }

    const scaleX = rectWidth / imageWidth;
    const scaleY = rectHeight / imageHeight;
    const scale = Math.max(scaleX, scaleY);

    worldImage.setScale(scale);

    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    if (scaledWidth > rectWidth || scaledHeight > rectHeight) {
      const cropX = Math.max(0, (scaledWidth - rectWidth) / (2 * scale));
      const cropY = Math.max(0, (scaledHeight - rectHeight) / (2 * scale));
      const cropWidth = Math.min(imageWidth, rectWidth / scale);
      const cropHeight = Math.min(imageHeight, rectHeight / scale);

      worldImage.setCrop(cropX, cropY, cropWidth, cropHeight);
    }
  }

  private setupLaneMouseEvents(worldContainer: Phaser.GameObjects.Container, lane: Lane): void {
    worldContainer.setInteractive(
      new Phaser.Geom.Rectangle(-80, -50, 160, 100),
      Phaser.Geom.Rectangle.Contains
    );

    worldContainer.on('pointerover', () => {
      if (this.laneDetailsPanel && lane.effect && lane.isRevealed) {
        this.laneDetailsPanel.showLaneDetails(lane);
      }
    });

    worldContainer.on('pointerout', () => {
      if (this.laneDetailsPanel) {
        this.laneDetailsPanel.hideLaneDetails();
      }
    });
  }
}
