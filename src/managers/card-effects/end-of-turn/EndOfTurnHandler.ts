import { Lane } from '@/interfaces/Lane';
import { SlotHelper } from '../helpers/SlotHelper';
import { CardEffectType } from '@/enums/CardEffectType';

export class EndOfTurnHandler {
  static handle(lanes: Lane[]): void {
    lanes.forEach((lane) => {
      SlotHelper.getAllSlots(lane).forEach((slot) => {
        if (!slot.occupied || !slot.cardData?.effects) return;

        slot.cardData.effects.forEach((e) => {
          if (e.cardEffectType === CardEffectType.EndOfTurn) {
            // implementar conforme novos efeitos aparecerem
          }
        });
      });
    });
  }
}
