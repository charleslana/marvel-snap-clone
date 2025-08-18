import { GameEvent } from '@/enums/GameEvent';
import { EffectAction } from '@/interfaces/EffectAction';
import { GameEventManager } from '@/managers/GameEventManager';

export class LogHelper {
  static emitLog(message: string): void {
    const action: EffectAction = { type: 'LOG_MESSAGE', payload: { message } };

    console.log(message);
    GameEventManager.instance.emit(GameEvent.LogRequest, action);
  }
}
