import { Slot } from '@/interfaces/Slot';
import { LogHelper } from '../helpers/LogHelper';

export class HawkeyeHandler {
  static handle(slot: Slot, laneIndex: number, turnPlayed: number, bonus: number): void {
    if (!slot.cardData) {
      return;
    }
    slot.cardData.hawkeyeReadyTurn = turnPlayed + 1;
    slot.cardData.hawkeyeBonus = bonus;
    LogHelper.emitLog(
      `Gavião Arqueiro em ${laneIndex + 1} está pronto para receber bônus no turno ${turnPlayed + 1}.`
    );
  }
}
