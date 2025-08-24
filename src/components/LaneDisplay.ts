import Phaser from 'phaser';
import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';
import { UIFactory } from './UIFactory';
import { FontEnum } from '@/enums/FontEnum';

export class LaneDisplay {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public createLane(x: number, y: number, index: number): Lane {
    const worldRect = this.createWorldRect();
    const worldText = this.createWorldText(index);

    const opponentPowerText = this.createPowerText(-worldRect.height / 2 + 15);
    const playerPowerText = this.createPowerText(worldRect.height / 2 - 15, true);

    const worldContainer = this.scene.add.container(x, y, [
      worldRect,
      worldText,
      opponentPowerText,
      playerPowerText,
    ]);
    // worldContainer.setDepth(2);

    const playerSlots = this.createSlots(x, y, true);
    const botSlots = this.createSlots(x, y, false);

    return {
      index,
      x,
      y,
      playerSlots,
      opponentSlots: botSlots,
      worldText,
      opponentPowerText,
      playerPowerText,
      worldContainer,
    };
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

  private createWorldRect(): Phaser.GameObjects.Rectangle {
    return UIFactory.createRectangle(this.scene, 0, 0, 160, 100, 0x333333).setStrokeStyle(
      2,
      0xffffff
    );
  }

  private createWorldText(index: number): Phaser.GameObjects.Text {
    return UIFactory.createText(this.scene, 0, 0, `Mundo ${index + 1}`, {
      fontSize: '16px',
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
}
