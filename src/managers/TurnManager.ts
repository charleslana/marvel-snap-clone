import Phaser from 'phaser';
import { GameStateManager } from './GameStateManager';
import { BotAIManager } from './BotAIManager';
import { RevealManager } from './RevealManager';
import { CardEffectManager } from './card-effects/CardEffectManager';
import { LaneManager } from './LaneManager';
import { HandManager } from './HandManager';
import { UIManager } from './UIManager';
import { DragAndDropManager } from './DragAndDropManager';
import { CardPlacementManager } from './CardPlacementManager';
import { GameEventManager } from './GameEventManager';
import { GameEvent } from '@/enums/GameEvent';
import { LaneEffectManager } from './LaneEffectManager';

export class TurnManager {
  private scene: Phaser.Scene;
  private gameState: GameStateManager;
  private botAI: BotAIManager;
  private revealManager: RevealManager;
  private effectManager: CardEffectManager;
  private laneManager: LaneManager;
  private handManager: HandManager;
  private uiManager: UIManager;
  private dragAndDropManager: DragAndDropManager;
  private cardPlacementManager: CardPlacementManager;
  private laneEffectManager: LaneEffectManager;

  constructor(
    scene: Phaser.Scene,
    gameState: GameStateManager,
    botAI: BotAIManager,
    revealManager: RevealManager,
    effectManager: CardEffectManager,
    laneManager: LaneManager,
    handManager: HandManager,
    uiManager: UIManager,
    dragAndDropManager: DragAndDropManager,
    cardPlacementManager: CardPlacementManager,
    laneEffectManager: LaneEffectManager
  ) {
    this.scene = scene;
    this.gameState = gameState;
    this.botAI = botAI;
    this.revealManager = revealManager;
    this.effectManager = effectManager;
    this.laneManager = laneManager;
    this.handManager = handManager;
    this.uiManager = uiManager;
    this.dragAndDropManager = dragAndDropManager;
    this.cardPlacementManager = cardPlacementManager;
    this.laneEffectManager = laneEffectManager;
  }

  /**
   * Inicia um turno do jogador.
   */
  public startPlayerTurn(): void {
    this.gameState.setPlayerTurn(true);
    this.gameState.refreshEnergies();
    this.updateUI();
    this.enablePlayerInteractions();
  }

  /**
   * Finaliza o turno do jogador e inicia a sequência de resolução do turno.
   */
  public endPlayerTurn(): void {
    this.disablePlayerInteractions();

    // Delay para melhor UX, dando tempo para o jogador ver que o turno acabou.
    this.scene.time.delayedCall(1000, () => {
      this.executeFullTurnSequence();
    });
  }

  /**
   * Orquestra a sequência completa de eventos que ocorrem após o jogador finalizar o turno.
   * A ordem dos métodos aqui define o fluxo de cada rodada do jogo.
   */
  private executeFullTurnSequence(): void {
    // A sequência de eventos agora é muito mais clara de ler.
    this.executeOpponentTurn();
    this.prepareForRevealPhase();
    this.runRevealPhase();
    this.runEndOfTurnPhase();

    if (this.gameState.isGameOver()) {
      this.endTheGame();
    } else {
      this.prepareForNextTurn();
    }
  }

  // =================================================================
  // MÉTODOS PRIVADOS - As Etapas do Turno
  // =================================================================

  /** Etapa 1: Oponente joga suas cartas. */
  private executeOpponentTurn(): void {
    this.botAI.executeTurn(
      this.cardPlacementManager.placeOpponentCard.bind(this.cardPlacementManager),
      this.laneManager.updateLanePowers.bind(this.laneManager)
    );
  }

  /** Etapa 2: Prepara tudo para a fase de revelação (efeitos de resolução, etc.). */
  private prepareForRevealPhase(): void {
    this.recordInitialCardPositions();
    this.effectManager.checkResolutionEffects(
      this.revealManager.getRevealQueueCopy(),
      this.gameState.currentTurn
    );
  }

  /** Etapa 3: Revela as cartas e aplica seus efeitos imediatos (On Reveal). */
  private runRevealPhase(): void {
    this.revealManager.processRevealQueue();
  }

  /** Etapa 4: Aplica efeitos que acontecem no final do turno (movimentos, etc.). */
  private runEndOfTurnPhase(): void {
    this.effectManager.handleMoveEffects();
    this.effectManager.applyEndOfTurnEffects();
    this.recalculateAllPowers(); // Recalcula tudo após os efeitos de fim de turno
  }

  /** Etapa 5a: O jogo acabou. Emite o evento para o GameFlowManager cuidar do resto. */
  private endTheGame(): void {
    this.gameState.advanceTurn(); // Avança para o turno 7 para garantir que a UI mostre 6/6
    this.updateTurnDisplay();
    GameEventManager.instance.emit(GameEvent.GameEnded);
  }

  /** Etapa 5b: O jogo continua. Prepara tudo para o próximo turno. */
  private prepareForNextTurn(): void {
    this.gameState.advanceTurn();
    const currentTurn = this.gameState.currentTurn;

    // 1. Revela o efeito da lane para o novo turno que está começando.
    this.laneEffectManager.revealLaneEffectForTurn(currentTurn);

    // --- A CORREÇÃO ESTÁ AQUI ---
    // 2. Força um recálculo de todos os poderes imediatamente após a revelação.
    // Isso garante que os efeitos da nova lane revelada sejam aplicados instantaneamente.
    this.recalculateAllPowers();

    // 3. Continua com o resto da preparação do turno.
    this.gameState.refreshEnergies();
    this.updateUI();
    this.enablePlayerInteractions();
    this.updateLaneColorsAndPriority();
    this.handManager.drawCardForPlayer(true);
    this.handManager.drawCardForPlayer(false);
    this.updateDeckDisplays();
    this.handManager.renderPlayerHand(this.gameState.playerEnergy);
    this.handManager.renderOpponentHand(this.gameState.showOpponentHand);
  }

  // =================================================================
  // MÉTODOS AUXILIARES
  // =================================================================

  /**
   * Habilita as interações do jogador.
   */
  public enablePlayerInteractions(): void {
    this.gameState.setPlayerTurn(true);
    this.uiManager.endTurnButton.setVisible(true);
    this.dragAndDropManager.enableDrag();
  }

  /**
   * Desabilita as interações do jogador.
   */
  public disablePlayerInteractions(): void {
    this.gameState.setPlayerTurn(false);
    this.uiManager.endTurnButton.setVisible(false);
    this.dragAndDropManager.disableDrag();
  }

  /**
   * Atualiza os displays de Energia e Turno na tela.
   */
  private updateUI(): void {
    this.updateEnergyDisplay();
    this.updateTurnDisplay();
    this.animateTurnChange();
  }

  private updateEnergyDisplay(): void {
    this.uiManager.updateEnergyDisplay(this.gameState.playerEnergy);
    GameEventManager.instance.emit(GameEvent.UpdateEnergy);
  }

  private updateTurnDisplay(): void {
    this.uiManager.updateTurnDisplay(this.gameState.currentTurn, this.gameState.maxTurn);
  }

  private animateTurnChange(): void {
    this.uiManager.animateTurnChange();
  }

  private updateLaneColorsAndPriority(): void {
    this.laneManager.updateLaneColors();
    this.gameState.setNextTurn(this.laneManager.getLeadingPlayer());
    this.uiManager.updateColorPlayerName(this.gameState.isNextTurn === 0);
  }

  private recordInitialCardPositions(): void {
    this.gameState.placedCardContainers.forEach((container) => {
      const { cardData, slot } = container;
      if (cardData && slot) {
        const laneIndex = this.gameState.lanes.findIndex(
          (l) => l.playerSlots.includes(slot) || l.opponentSlots.includes(slot)
        );
        if (cardData.laneIndexAtStartOfTurn === undefined) {
          cardData.laneIndexAtStartOfTurn = laneIndex;
        }
      }
    });
  }

  private recalculateAllPowers(): void {
    this.effectManager.updateAllCardPowers();
    this.laneManager.updateLaneProperties();
    this.cardPlacementManager.updatePlacedCardsUI();
    this.laneManager.updateLanePowers();
    this.effectManager.updateMoves(this.gameState.placedCardContainers);
  }

  private updateDeckDisplays(): void {
    GameEventManager.instance.emit(GameEvent.UpdateDeckDisplays);
  }
}
