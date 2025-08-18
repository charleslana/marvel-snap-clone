import { EffectAction } from '@/interfaces/EffectAction';
import { Slot } from '@/interfaces/Slot';
import { BonusHelper } from '../helpers/BonusHelper';
import { LogHelper } from '../helpers/LogHelper';
import { Lane } from '@/interfaces/Lane';

export class WolfsbaneHandler {
  static handle(slot: Slot, bonusPerCard: number, isPlayer: boolean, lane: Lane): EffectAction[] {
    const friendlySlots = isPlayer ? lane.playerSlots : lane.opponentSlots;
    const otherCardsCount = friendlySlots.filter((s) => s.occupied && s !== slot).length;
    const totalBonus = otherCardsCount * bonusPerCard;

    if (totalBonus <= 0) return [];

    BonusHelper.addPermanentBonus(slot, totalBonus);
    const side = isPlayer ? 'Jogador' : 'Adversário';
    return [
      LogHelper.createLog(
        `Lupina (${side}) ganhou +${totalBonus} de poder por ${otherCardsCount} outra(s) carta(s) aliada(s).`
      ),
    ];
  }
}
