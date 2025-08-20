import { Lane } from '@/interfaces/Lane';
import { CardData } from '@/interfaces/Card';
import { OnRevealHandler } from './on-reveal/OnRevealHandler';
import { OngoingHandler } from './ongoing/OngoingHandler';
import { EndOfTurnHandler } from './end-of-turn/EndOfTurnHandler';
import { AngelaHandler } from './on-card-played/AngelaHandler';
import { HawkeyeResolutionHandler } from './timed/HawkeyeResolutionHandler';
import { MoveHandler } from './move/MoveHandler';
import { CardContainer } from '@/components/CardContainer';

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
  ): void {
    OnRevealHandler.handle(this.lanes, card, laneIndex, slot, isPlayer, turnPlayed, revealQueue);
  }

  public updateAllCardPowers(): void {
    OngoingHandler.updateAll(this.lanes);
  }

  public applyEndOfTurnEffects(): void {
    EndOfTurnHandler.handle(this.lanes);
  }

  public triggerOnCardPlayedEffects(playedCard: CardData, laneIndex: number): void {
    AngelaHandler.handle(this.lanes[laneIndex], playedCard);
  }

  public checkAllHawkeyeBuffs(
    revealQueue: readonly { card: CardData; laneIndex: number; isPlayer: boolean }[],
    currentTurn: number
  ): void {
    HawkeyeResolutionHandler.resolve(this.lanes, revealQueue as any, currentTurn);
  }

  public handleMoveEffects(): void {
    MoveHandler.handle(this.lanes);
  }

  public updateMoves(containers: CardContainer[]): void {
    MoveHandler.update(containers);
  }
}
