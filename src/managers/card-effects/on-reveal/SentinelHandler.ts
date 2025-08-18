import { botDeck } from '@/data/CardPool';
import { LogHelper } from '../helpers/LogHelper';
import { GameEventManager } from '@/managers/GameEventManager';
import { EffectAction } from '@/interfaces/EffectAction';
import { GameEvent } from '@/enums/GameEvent';

export class SentinelHandler {
  static handle(isPlayer: boolean): void {
    const sentinelCard = botDeck.find((card) => card.id === 21 && card.name === 'Sentinela');
    if (!sentinelCard) {
      LogHelper.emitLog('Carta Sentinela não encontrada!');
      return;
    }

    const action: EffectAction = { type: 'ADD_TO_HAND', payload: { card: sentinelCard, isPlayer } };
    GameEventManager.instance.emit(GameEvent.AddCardToHand, action);

    LogHelper.emitLog(
      `Ação criada: Adicionado Sentinela à mão de ${isPlayer ? 'Jogador' : 'Adversário'}.`
    );
  }
}
