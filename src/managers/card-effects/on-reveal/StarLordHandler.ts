import { EffectAction } from '@/interfaces/EffectAction';
import { Slot } from '@/interfaces/Slot';
import { BonusHelper } from '../helpers/BonusHelper';
import { LogHelper } from '../helpers/LogHelper';

export class StarLordHandler {
  static handle(
    slot: Slot,
    laneIndex: number,
    bonus: number,
    isPlayerCard: boolean,
    turnPlayed: number,
    revealQueue: readonly { card: any; laneIndex: number; turnPlayed: number; isPlayer: boolean }[]
  ): EffectAction[] {
    const opponentPlayedHere = revealQueue.some(
      (item) =>
        item.isPlayer !== isPlayerCard &&
        item.laneIndex === laneIndex &&
        item.turnPlayed === turnPlayed
    );

    if (!opponentPlayedHere || bonus <= 0) return [];

    BonusHelper.addPermanentBonus(slot, bonus);
    const opponentName = isPlayerCard ? 'Adversário' : 'Jogador';
    return [
      LogHelper.createLog(
        `Senhor das Estrelas ganhou um bônus de +${bonus} porque o ${opponentName} também jogou aqui!`
      ),
    ];
  }
}
