import { Lane } from '@/interfaces/Lane';
import { CardData } from '@/interfaces/Card';
import { EffectAction } from '@/interfaces/EffectAction';
import { OnRevealHandler } from './on-reveal/OnRevealHandler';
import { OngoingHandler } from './ongoing/OngoingHandler';
import { EndOfTurnHandler } from './end-of-turn/EndOfTurnHandler';
import { AngelaHandler } from './on-card-played/AngelaHandler';
import { HawkeyeResolutionHandler } from './timed/HawkeyeResolutionHandler';

export class CardEffectManager {
  constructor(private lanes: Lane[]) {}

  public applyOnRevealEffect(
    card: CardData,
    laneIndex: number,
    slot: any,
    isPlayer: boolean,
    turnPlayed: number,
    revealQueue: readonly {
      card: CardData;
      laneIndex: number;
      turnPlayed: number;
      isPlayer: boolean;
    }[]
  ): EffectAction[] {
    return OnRevealHandler.handle(
      this.lanes,
      card,
      laneIndex,
      slot,
      isPlayer,
      turnPlayed,
      revealQueue
    );
  }

  public updateAllCardPowers(): EffectAction[] {
    return OngoingHandler.updateAll(this.lanes);
  }

  public applyEndOfTurnEffects(): void {
    EndOfTurnHandler.handle(this.lanes);
  }

  public triggerOnCardPlayedEffects(playedCard: CardData, laneIndex: number): EffectAction[] {
    return AngelaHandler.handle(this.lanes[laneIndex], playedCard);
  }

  public checkAllHawkeyeBuffs(
    revealQueue: readonly { card: CardData; laneIndex: number; isPlayer: boolean }[],
    currentTurn: number
  ): EffectAction[] {
    return HawkeyeResolutionHandler.resolve(this.lanes, revealQueue as any, currentTurn);
  }
}
