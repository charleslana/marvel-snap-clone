import { CardData } from '@/interfaces/Card';
import { Lane } from '@/interfaces/Lane';
import { CardContainer } from '@/components/CardContainer';
import { GameState } from '@/interfaces/GameState';
import { RevealQueueItem } from '@/interfaces/RevealQueueItem';

export class GameStateManager {
  private state: GameState = {
    currentTurn: 1,
    maxTurn: 6,
    playerEnergy: 1,
    opponentEnergy: 1,
    isPlayerTurn: true,
    isNextTurn: Phaser.Math.Between(0, 1) as 0 | 1,
    showOpponentHand: false,
    gameEnded: false,
  };

  private _lanes: Lane[] = [];
  private _placedCardContainers: CardContainer[] = [];
  private _revealQueue: RevealQueueItem[] = [];

  // Getters para estado readonly
  get currentTurn(): number {
    return this.state.currentTurn;
  }

  get maxTurn(): number {
    return this.state.maxTurn;
  }

  get playerEnergy(): number {
    return this.state.playerEnergy;
  }

  get opponentEnergy(): number {
    return this.state.opponentEnergy;
  }

  get isPlayerTurn(): boolean {
    return this.state.isPlayerTurn;
  }

  get isNextTurn(): 0 | 1 {
    return this.state.isNextTurn;
  }

  get showOpponentHand(): boolean {
    return this.state.showOpponentHand;
  }

  get gameEnded(): boolean {
    return this.state.gameEnded;
  }

  // Getters para arrays
  get lanes(): Lane[] {
    return this._lanes;
  }

  get placedCardContainers(): CardContainer[] {
    return this._placedCardContainers;
  }

  get revealQueue(): RevealQueueItem[] {
    return this._revealQueue;
  }

  // Métodos de modificação de estado
  public setLanes(lanes: Lane[]): void {
    this._lanes = lanes;
  }

  public setPlayerEnergy(energy: number): void {
    this.state.playerEnergy = Math.max(0, energy);
  }

  public setOpponentEnergy(energy: number): void {
    this.state.opponentEnergy = Math.max(0, energy);
  }

  public modifyPlayerEnergy(amount: number): void {
    this.setPlayerEnergy(this.state.playerEnergy + amount);
  }

  public modifyOpponentEnergy(amount: number): void {
    this.setOpponentEnergy(this.state.opponentEnergy + amount);
  }

  public setPlayerTurn(isPlayerTurn: boolean): void {
    this.state.isPlayerTurn = isPlayerTurn;
  }

  public setShowOpponentHand(show: boolean): void {
    this.state.showOpponentHand = show;
  }

  public setNextTurn(nextTurn: 0 | 1): void {
    this.state.isNextTurn = nextTurn;
  }

  public setGameEnded(ended: boolean): void {
    this.state.gameEnded = ended;
  }

  public advanceTurn(): void {
    this.state.currentTurn++;
  }

  public refreshEnergies(): void {
    this.state.playerEnergy = this.state.currentTurn;
    this.state.opponentEnergy = this.state.currentTurn;
  }

  public isGameOver(): boolean {
    return this.state.currentTurn >= this.state.maxTurn || this.state.gameEnded;
  }

  public canAffordCard(card: CardData, isPlayer: boolean): boolean {
    const energy = isPlayer ? this.state.playerEnergy : this.state.opponentEnergy;
    return card.cost <= energy;
  }

  // Métodos para gerenciar containers de cartas
  public addPlacedCardContainer(container: CardContainer): void {
    this._placedCardContainers.push(container);
  }

  public removePlacedCardContainer(container: CardContainer): void {
    const index = this._placedCardContainers.indexOf(container);
    if (index > -1) {
      this._placedCardContainers.splice(index, 1);
    }
  }

  public clearPlacedCardContainers(): void {
    this._placedCardContainers.length = 0;
  }

  // Métodos para gerenciar fila de revelação
  public addToRevealQueue(item: RevealQueueItem): void {
    this._revealQueue.push(item);
  }

  public removeFromRevealQueue(item: RevealQueueItem): void {
    const index = this._revealQueue.findIndex(
      (queueItem) => queueItem.card === item.card && queueItem.slot === item.slot
    );
    if (index > -1) {
      this._revealQueue.splice(index, 1);
    }
  }

  public clearRevealQueue(): void {
    this._revealQueue.length = 0;
  }

  // Método para reset completo do estado
  public reset(): void {
    this.state = {
      currentTurn: 1,
      maxTurn: 6,
      playerEnergy: 1,
      opponentEnergy: 1,
      isPlayerTurn: true,
      isNextTurn: Phaser.Math.Between(0, 1) as 0 | 1,
      showOpponentHand: false,
      gameEnded: false,
    };
    this._lanes = [];
    this._placedCardContainers = [];
    this._revealQueue = [];
  }

  // Método para debug/logging
  public getStateSnapshot(): GameState {
    return { ...this.state };
  }
}
