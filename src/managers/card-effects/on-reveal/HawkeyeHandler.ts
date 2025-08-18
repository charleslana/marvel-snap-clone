import { Slot } from '@/interfaces/Slot';
import { EffectAction } from '@/interfaces/EffectAction';
import { LogHelper } from '../helpers/LogHelper';

export class HawkeyeHandler {
  static handle(slot: Slot, laneIndex: number, turnPlayed: number, bonus: number): EffectAction[] {
    if (!slot.cardData) return [];
    slot.cardData.hawkeyeReadyTurn = turnPlayed + 1;
    slot.cardData.hawkeyeBonus = bonus;
    return [
      LogHelper.createLog(
        `Gavião Arqueiro em ${laneIndex + 1} está pronto para receber bônus no turno ${turnPlayed + 1}.`
      ),
    ];
  }
}
