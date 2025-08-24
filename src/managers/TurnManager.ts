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
    cardPlacementManager: CardPlacementManager
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
  }

  /**
   * Inicia um turno do jogador
   */
  public startPlayerTurn(): void {
    this.gameState.setPlayerTurn(true);
    this.gameState.refreshEnergies();
    this.updateUI();
    this.enablePlayerInteractions();
  }

  /**
   * Finaliza o turno do jogador e executa sequência completa
   */
  public endPlayerTurn(): void {
    this.gameState.setPlayerTurn(false);
    this.uiManager.endTurnButton.setVisible(false);

    // Delay para melhor UX
    this.scene.time.delayedCall(1000, () => {
      this.executeFullTurnSequence();
    });
  }

  /**
   * Executa o turno do oponente
   */
  public executeOpponentTurn(): void {
    this.botAI.executeTurn(
      this.cardPlacementManager.placeOpponentCard.bind(this.cardPlacementManager),
      this.laneManager.updateLanePowers.bind(this.laneManager)
    );
  }

  /**
   * Avança para o próximo turno
   */
  public advanceTurn(): void {
    this.gameState.advanceTurn();
    if (!this.isGameOver()) {
      this.updateTurnDisplay();
      this.animateTurnChange();
    }
  }

  /**
   * Atualiza as energias para o novo turno
   */
  public refreshEnergies(): void {
    this.gameState.refreshEnergies();
    this.updateEnergyDisplay();
  }

  /**
   * Verifica se o jogo deve terminar
   */
  public isGameOver(): boolean {
    return this.gameState.isGameOver();
  }

  /**
   * Prepara o próximo round (depois das revelações)
   */
  public prepareNextRound(): void {
    // Aplica efeitos de fim de turno
    this.effectManager.applyEndOfTurnEffects();
    this.recalculateAllPowers();

    // Atualiza propriedades das lanes
    this.laneManager.updateLaneProperties();
    this.cardPlacementManager.updatePlacedCardsUI();
    this.laneManager.updateLanePowers();

    // Permite jogador jogar novamente
    this.gameState.setPlayerTurn(true);

    // Compra cartas
    this.handManager.drawCardForPlayer(true);
    this.handManager.drawCardForPlayer(false);

    // Atualiza displays dos decks
    this.updateDeckDisplays();

    // Re-renderiza mãos
    this.handManager.renderPlayerHand(this.gameState.playerEnergy);
    this.handManager.renderOpponentHand(this.gameState.showOpponentHand);
  }

  /**
   * Habilita as interações do jogador
   */
  public enablePlayerInteractions(): void {
    this.gameState.setPlayerTurn(true);
    this.uiManager.endTurnButton.setVisible(true);
    this.dragAndDropManager.enableDrag(); // Habilita o drag
  }

  /**
   * Desabilita as interações do jogador
   */
  public disablePlayerInteractions(): void {
    this.gameState.setPlayerTurn(false);
    this.uiManager.endTurnButton.setVisible(false);
    this.dragAndDropManager.disableDrag();
  }

  private executeFullTurnSequence(): void {
    // 1. Executa turno do oponente
    this.executeOpponentTurn();

    // 2. Registra posições iniciais das cartas
    this.recordInitialCardPositions();

    // 3. Verifica efeitos de resolução
    this.effectManager.checkResolutionEffects(
      this.revealManager.getRevealQueueCopy(),
      this.gameState.currentTurn
    );

    // 4. Processa fila de revelação
    this.revealManager.processRevealQueue();

    // 5. Gerencia efeitos de movimento
    this.effectManager.handleMoveEffects();

    // 6. Avança turno e atualiza estado
    this.advanceTurn();
    this.refreshEnergies();
    this.enablePlayerInteractions();

    // 7. Atualiza cores e prioridades
    this.updateLaneColorsAndPriority();

    // 8. Verifica se o jogo terminou ou continua
    if (this.isGameOver()) {
      GameEventManager.instance.emit(GameEvent.GameEnded);
    } else {
      this.prepareNextRound();
    }
  }

  private updateUI(): void {
    this.updateEnergyDisplay();
    this.updateTurnDisplay();
  }

  private updateEnergyDisplay(): void {
    this.uiManager.energyDisplay.setLabel(`Energia: ${this.gameState.playerEnergy}`);
    GameEventManager.instance.emit(GameEvent.UpdateEnergy);
  }

  private updateTurnDisplay(): void {
    this.uiManager.turnDisplay.setLabel(
      `Turno: ${this.gameState.currentTurn}/${this.gameState.maxTurn - 1}`
    );
  }

  private animateTurnChange(): void {
    this.uiManager.animateTurnChange();
  }

  // CORREÇÃO: Método syncDragAndDropState removido, pois não é mais necessário.
  // O DragAndDropManager agora lê o estado diretamente do GameStateManager.
  // As chamadas para enableDrag() e disableDrag() em enable/disablePlayerInteractions
  // são suficientes.

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
