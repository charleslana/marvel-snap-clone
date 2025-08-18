import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';
import { EffectAction } from '@/interfaces/EffectAction';
import { LogHelper } from '../helpers/LogHelper';
import { CardEffectType } from '@/enums/CardEffectType';

export class SpectrumHandler {
  static handle(lanes: Lane[], bonus: number, isPlayer: boolean): EffectAction[] {
    if (bonus <= 0) return [];
    const side = isPlayer ? 'Jogador' : 'Adversário';
    const actions: EffectAction[] = [LogHelper.createLog(`Espectro (${side}) ativou seu efeito!`)];

    lanes.forEach((lane) => {
      const friendlySlots = isPlayer ? lane.playerSlots : lane.opponentSlots;
      friendlySlots.forEach((slot: Slot) => {
        if (
          slot.occupied &&
          slot.cardData?.effect?.some((e) => e.type === CardEffectType.Ongoing)
        ) {
          if (slot.permanentBonus === undefined) slot.permanentBonus = 0;
          slot.permanentBonus += bonus;
          LogHelper.createLog(`${slot.cardData.name} recebeu +${bonus} de poder.`);
        }
      });
    });

    return actions;
  }
}
