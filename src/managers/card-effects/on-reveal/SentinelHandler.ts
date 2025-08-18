import { botDeck } from '@/data/CardPool';
import { AddToHandAction } from '@/interfaces/EffectAction';
import { LogHelper } from '../helpers/LogHelper';

export class SentinelHandler {
  static handle(isPlayer: boolean): AddToHandAction[] {
    const sentinelCard = botDeck.find((card) => card.id === 21);
    if (!sentinelCard) {
      LogHelper.createLog('Carta Sentinela não encontrada!');
      return [];
    }
    LogHelper.createLog(
      `Ação criada: Adicionar Sentinela à mão de ${isPlayer ? 'Jogador' : 'Adversário'}.`
    );
    return [
      {
        type: 'ADD_TO_HAND',
        payload: { card: sentinelCard, isPlayer },
      },
    ];
  }
}
