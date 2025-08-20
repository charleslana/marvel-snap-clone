import { Lane } from '@/interfaces/Lane';
import { SlotHelper } from '../helpers/SlotHelper';
import { CardEffectType } from '@/enums/CardEffectType';
import { CardEffect } from '@/enums/CardEffect';
import { NightcrawlerHandler } from './NightcrawlerHandler';
import { CardContainer } from '@/components/CardContainer';

const moveHandlers: Partial<Record<CardEffect, (lanes: Lane[]) => void>> = {
  [CardEffect.NightcrawlerMove]: NightcrawlerHandler.checkMoves,
};

const moveUpdateHandlers: Partial<Record<CardEffect, (container: CardContainer) => void>> = {
  [CardEffect.NightcrawlerMove]: (container) => {
    const { cardData } = container;

    if (cardData.isRevealed && !cardData.hasMoved) {
      container.enableMovableBorder();
      container.scene.input.setDraggable(container, true);
    } else {
      container.disableMovableBorder();
      if (container.slot) {
        container.scene.input.setDraggable(container, false);
      }
    }
  },
  // futuramente só adicionar outros updates aqui
};

export class MoveHandler {
  static handle(lanes: Lane[]): void {
    lanes.forEach((lane) => {
      SlotHelper.getAllSlots(lane).forEach((slot) => {
        if (!slot.occupied || !slot.cardData?.effects) return;

        slot.cardData.effects.forEach((effect) => {
          if (effect.cardEffectType !== CardEffectType.Move) return;

          const handler = moveHandlers[effect.cardEffect];
          if (handler) {
            handler(lanes);
          }
        });
      });
    });
  }

  static update(containers: CardContainer[]): void {
    containers.forEach((container) => {
      container.cardData.effects?.forEach((effect) => {
        if (effect.cardEffectType !== CardEffectType.Move) return;

        const updater = moveUpdateHandlers[effect.cardEffect];
        if (updater) {
          updater(container);
        }
      });
    });
  }
}
