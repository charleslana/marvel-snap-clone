import { Lane } from '@/interfaces/Lane';
import { CardEffect } from '@/enums/CardEffect';
import { LogHelper } from '../helpers/LogHelper';

export class NightcrawlerHandler {
  static checkMoves(lanes: Lane[]): void {
    for (const lane of lanes) {
      const allSlots = [...lane.playerSlots, ...lane.opponentSlots];

      for (const slot of allSlots) {
        const card = slot.cardData;
        if (!card) {
          continue;
        }

        const hasNightcrawlerEffect = card.effects?.some(
          (effect) => effect.cardEffect === CardEffect.NightcrawlerMove
        );
        if (!hasNightcrawlerEffect || card.hasMoved) {
          continue;
        }

        const currentLaneIndex = lanes.indexOf(lane);

        if (currentLaneIndex !== card.laneIndexAtStartOfTurn) {
          card.hasMoved = true;
          LogHelper.emitLog(`${card.name} gastou seu movimento neste turno ao mudar de lane.`);
          LogHelper.emitLog(
            `${card.name} moveu-se da lane ${currentLaneIndex + 1} para a lane ${
              card.laneIndexAtStartOfTurn! + 1
            }.`
          );
          return;
        }
        LogHelper.emitLog(`${card.name} terminou o turno na mesma lane, movimento não gasto.`);
      }
    }
  }
}
