import { CardData } from '@/interfaces/Card';
import { OnRevealHandler } from './on-reveal/OnRevealHandler';
import { OngoingHandler } from './ongoing/OngoingHandler';
import { EndOfTurnHandler } from './end-of-turn/EndOfTurnHandler';
import { MoveHandler } from './move/MoveHandler';
import { CardContainer } from '@/components/CardContainer';
import { OnCardPlayedHandler } from './on-card-played/OnCardPlayedHandler';
import { OnResolutionHandler } from './resolution/OnResolutionHandler';
import { Slot } from '@/interfaces/Slot';
import { GameStateManager } from '../GameStateManager';

export class CardEffectManager {
  private gameState: GameStateManager;

  constructor(gameState: GameStateManager) {
    this.gameState = gameState;
  }

  public applyOnRevealEffect(
    card: CardData,
    laneIndex: number,
    slot: Slot,
    isPlayer: boolean,
    turnPlayed: number,
    revealQueue: readonly {
      card: CardData;
      laneIndex: number;
      turnPlayed: number;
      isPlayer: boolean;
    }[]
  ): void {
    OnRevealHandler.handle(
      this.gameState.lanes,
      card,
      laneIndex,
      slot,
      isPlayer,
      turnPlayed,
      revealQueue
    );
  }

  public updateAllCardPowers(): void {
    OngoingHandler.updateAll(this.gameState.lanes);
  }

  public applyEndOfTurnEffects(): void {
    EndOfTurnHandler.handle(this.gameState.lanes);
  }

  public triggerOnCardPlayedEffects(playedCard: CardData, laneIndex: number): void {
    OnCardPlayedHandler.handle(this.gameState.lanes[laneIndex], playedCard);
  }

  public checkResolutionEffects(
    revealQueue: readonly { card: CardData; laneIndex: number; isPlayer: boolean }[],
    currentTurn: number
  ): void {
    OnResolutionHandler.handle(this.gameState.lanes, revealQueue, currentTurn);
  }

  public handleMoveEffects(): void {
    MoveHandler.handle(this.gameState.lanes);
  }

  public updateMoves(containers: CardContainer[]): void {
    MoveHandler.update(containers);
  }
}
