import { Slot } from '@/interfaces/Slot';
import { BonusHelper } from '../helpers/BonusHelper';
import { LogHelper } from '../helpers/LogHelper';
import { CardData } from '@/interfaces/Card';

export class StarLordHandler {
  static handle(
    slot: Slot,
    laneIndex: number,
    bonus: number,
    isPlayerCard: boolean,
    turnPlayed: number,
    revealQueue: readonly {
      card: CardData;
      laneIndex: number;
      turnPlayed: number;
      isPlayer: boolean;
    }[]
  ): void {
    const opponentPlayedHere = revealQueue.some(
      (item) =>
        item.isPlayer !== isPlayerCard &&
        item.laneIndex === laneIndex &&
        item.turnPlayed === turnPlayed
    );

    if (!opponentPlayedHere || bonus <= 0) {
      return;
    }

    BonusHelper.addPermanentBonus(slot, bonus);
    const opponentName = isPlayerCard ? 'Oponente' : 'Jogador';
    LogHelper.emitLog(
      `Senhor das Estrelas ganhou um bônus de +${bonus} porque o ${opponentName} também jogou aqui!`
    );
  }
}
