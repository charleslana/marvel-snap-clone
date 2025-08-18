import { Lane } from '@/interfaces/Lane';
import { CardData } from '@/interfaces/Card';
import { Slot } from '@/interfaces/Slot';
import { SlotHelper } from '../helpers/SlotHelper';
import { BonusHelper } from '../helpers/BonusHelper';
import { LogHelper } from '../helpers/LogHelper';

export class HawkeyeResolutionHandler {
  static resolve(
    lanes: Lane[],
    revealQueue: { card: CardData; laneIndex: number; isPlayer: boolean }[],
    currentTurn: number
  ): void {
    for (const playedItem of revealQueue) {
      const lane = lanes[playedItem.laneIndex];
      const friendlySlots = SlotHelper.getFriendlySlots(lane, playedItem.isPlayer);

      for (const hawkeyeSlot of friendlySlots) {
        if (
          hawkeyeSlot.occupied &&
          hawkeyeSlot.cardData &&
          hawkeyeSlot.cardData.hawkeyeReadyTurn === currentTurn
        ) {
          const bonus = hawkeyeSlot.cardData.hawkeyeBonus || 0;

          if (bonus > 0) {
            BonusHelper.addPermanentBonus(hawkeyeSlot as Slot, bonus);
            LogHelper.emitLog(
              `Gavião Arqueiro ativado: ${hawkeyeSlot.cardData.name} em ${playedItem.laneIndex + 1} recebeu um bônus de +${bonus}!`
            );
          }

          delete hawkeyeSlot.cardData.hawkeyeReadyTurn;
          delete hawkeyeSlot.cardData.hawkeyeBonus;
        }
      }
    }
  }
}
