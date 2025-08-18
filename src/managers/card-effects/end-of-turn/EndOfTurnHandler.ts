import { Lane } from '@/interfaces/Lane';
import { SlotHelper } from '../helpers/SlotHelper';
import { CardEffectType } from '@/enums/CardEffectType';

export class EndOfTurnHandler {
  static handle(lanes: Lane[]): void {
    lanes.forEach((lane) => {
      SlotHelper.getAllSlots(lane).forEach((slot) => {
        if (!slot.occupied || !slot.cardData?.effect) return;

        slot.cardData.effect.forEach((e) => {
          if (e.type === CardEffectType.EndOfTurn) {
            // implementar conforme novos efeitos aparecerem
          }
        });
      });
    });
  }
}
