export interface GameState {
  currentTurn: number;
  maxTurn: number;
  playerEnergy: number;
  opponentEnergy: number;
  isPlayerTurn: boolean;
  isNextTurn: 0 | 1;
  showOpponentHand: boolean;
  gameEnded: boolean;
}
