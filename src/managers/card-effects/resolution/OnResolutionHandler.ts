import { Lane } from '@/interfaces/Lane';
import { CardData } from '@/interfaces/Card';
import { HawkeyeResolutionHandler } from './HawkeyeResolutionHandler';

export class OnResolutionHandler {
  static handle(
    lanes: Lane[],
    revealQueue: readonly { card: CardData; laneIndex: number; isPlayer: boolean }[],
    currentTurn: number
  ): void {
    HawkeyeResolutionHandler.resolve(lanes, revealQueue, currentTurn);
  }
}
