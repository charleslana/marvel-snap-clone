import Phaser from 'phaser';
import { GameStateManager } from './GameStateManager';
import { TurnManager } from './TurnManager';
import { GameEndManager } from './GameEndManager';
import { HandManager } from './HandManager';
import { LaneManager } from './LaneManager';
import { UIManager } from './UIManager';
import { CardPlacementManager } from './CardPlacementManager';
import { DragAndDropManager } from './DragAndDropManager';
import { RetreatButton } from '@/components/RetreatButton';
import { DeckDisplay } from '@/components/DeckDisplay';
import { GameEventManager } from './GameEventManager';
import { GameEvent } from '@/enums/GameEvent';
import { SceneEnum } from '@/enums/SceneEnum';

export class GameFlowManager {
  private scene: Phaser.Scene;
  private gameState: GameStateManager;
  private turnManager: TurnManager;
  private gameEndManager: GameEndManager;
  private handManager: HandManager;
  private laneManager: LaneManager;
  private uiManager: UIManager;
  private cardPlacementManager: CardPlacementManager;
  private dragAndDropManager: DragAndDropManager;
  private retreatButton: RetreatButton;
  private playerDeckDisplay: DeckDisplay;
  private enemyDeckDisplay: DeckDisplay;

  constructor(
    scene: Phaser.Scene,
    gameState: GameStateManager,
    turnManager: TurnManager,
    gameEndManager: GameEndManager,
    handManager: HandManager,
    laneManager: LaneManager,
    uiManager: UIManager,
    cardPlacementManager: CardPlacementManager,
    dragAndDropManager: DragAndDropManager,
    retreatButton: RetreatButton,
    playerDeckDisplay: DeckDisplay,
    enemyDeckDisplay: DeckDisplay
  ) {
    this.scene = scene;
    this.gameState = gameState;
    this.turnManager = turnManager;
    this.gameEndManager = gameEndManager;
    this.handManager = handManager;
    this.laneManager = laneManager;
    this.uiManager = uiManager;
    this.cardPlacementManager = cardPlacementManager;
    this.dragAndDropManager = dragAndDropManager;
    this.retreatButton = retreatButton;
    this.playerDeckDisplay = playerDeckDisplay;
    this.enemyDeckDisplay = enemyDeckDisplay;

    this.setupEventListeners();
  }

  public initializeGame(): void {
    console.log('Inicializando jogo...');

    this.handManager.renderPlayerHand(this.gameState.playerEnergy);
    this.handManager.renderOpponentHand(this.gameState.showOpponentHand);

    this.uiManager.updateTurnDisplay(this.gameState.currentTurn, this.gameState.maxTurn);
    this.uiManager.updateEnergyDisplay(this.gameState.playerEnergy);

    this.updateDeckDisplays();

    this.turnManager.startPlayerTurn();

    const initialPriority = this.gameState.isNextTurn;
    this.uiManager.updateColorPlayerName(initialPriority === 0);

    console.log('Jogo inicializado com sucesso.');
  }

  public handleGameEnd(): void {
    console.log('Finalizando jogo...');

    this.hideActionButtons();
    this.uiManager.clearColorPlayersNames();
    this.laneManager.updateLaneColors();
    const finalLanePowers = this.calculateFinalLanePowers();
    this.gameEndManager.checkGameEnd(finalLanePowers);
    this.showEndGameUI();
    this.revealOpponentHand();

    console.log('Jogo finalizado.');
  }

  public handleRetreat(): void {
    console.log('Jogador desistiu da partida.');

    // --- CORREÇÃO ADICIONADA AQUI ---
    // Esconde imediatamente os botões de ação, incluindo o de desistir.
    this.hideActionButtons();
    this.laneManager.updateLaneColors();

    const retreatResult = [
      { playerPower: 0, opponentPower: 1 },
      { playerPower: 0, opponentPower: 1 },
      { playerPower: 0, opponentPower: 1 },
    ];

    this.gameEndManager.checkGameEnd(retreatResult);
    this.showEndGameUI();
    this.revealOpponentHand();
  }

  public returnToHome(): void {
    console.log('Retornando para tela inicial...');
    this.scene.scene.start(SceneEnum.Home);
  }

  private setupEventListeners(): void {
    GameEventManager.instance.on(GameEvent.EndTurn, () => {
      this.turnManager.endPlayerTurn();
    });

    GameEventManager.instance.on(GameEvent.EndBattle, () => {
      if (this.gameEndManager.isGameEnded()) {
        this.returnToHome();
      }
    });

    GameEventManager.instance.on(GameEvent.GameEnded, () => {
      this.handleGameEnd();
    });

    GameEventManager.instance.on(GameEvent.UpdateDeckDisplays, () => {
      this.updateDeckDisplays();
    });
  }

  private hideActionButtons(): void {
    this.retreatButton.setVisible(false);
    this.uiManager.endTurnButton.setVisible(false);
    // Mantemos o display de turno e energia visíveis por enquanto,
    // mas podemos movê-los para cá se quisermos uma tela mais limpa.
    // this.uiManager.turnDisplay.setVisible(false);
    // this.uiManager.energyDisplay.setVisible(false);
  }

  private showEndGameUI(): void {
    this.uiManager.endBattleButton.setVisible(true);
    this.enemyDeckDisplay.enableModalOpen();
  }

  private calculateFinalLanePowers(): Array<{ playerPower: number; opponentPower: number }> {
    this.cardPlacementManager.updatePlacedCardsUI();
    this.laneManager.updateLanePowers();

    return this.gameState.lanes.map((lane) => {
      const { playerPower, opponentPower } = this.laneManager.calculateLanePower(lane);
      return { playerPower, opponentPower };
    });
  }

  private revealOpponentHand(): void {
    this.gameState.setShowOpponentHand(true);
    this.handManager.renderOpponentHand(true);

    this.handManager.disablePlayerCardInteraction(
      this.gameState.placedCardContainers,
      this.dragAndDropManager
    );
  }

  private updateDeckDisplays(): void {
    this.playerDeckDisplay.updateDeck(this.handManager.playerDeckMutable.length);
    this.enemyDeckDisplay.updateDeck(this.handManager.opponentDeckMutable.length);
  }
}
