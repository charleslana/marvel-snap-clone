import { EffectAction } from '@/interfaces/EffectAction';

export class LogHelper {
  static createLog(message: string): EffectAction {
    console.log(message);
    return { type: 'LOG_MESSAGE', payload: { message } };
  }
}
