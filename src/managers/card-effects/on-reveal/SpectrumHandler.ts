import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';
import { LogHelper } from '../helpers/LogHelper';
import { CardEffectType } from '@/enums/CardEffectType';

export class SpectrumHandler {
  static handle(lanes: Lane[], bonus: number, isPlayer: boolean): void {
    if (bonus <= 0) {
      return;
    }
    const side = isPlayer ? 'Jogador' : 'Adversário';
    LogHelper.emitLog(`Espectro (${side}) ativou seu efeito!`);

    lanes.forEach((lane) => {
      const friendlySlots = isPlayer ? lane.playerSlots : lane.opponentSlots;
      friendlySlots.forEach((slot: Slot) => {
        if (
          slot.occupied &&
          slot.cardData?.effects?.some((effect) => effect.cardEffectType === CardEffectType.Ongoing)
        ) {
          if (slot.permanentBonus === undefined) {
            slot.permanentBonus = 0;
          }
          slot.permanentBonus += bonus;
          LogHelper.emitLog(`${slot.cardData.name} recebeu +${bonus} de poder.`);
        }
      });
    });
  }
}
