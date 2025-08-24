import { GameStateManager } from './GameStateManager';
import { CardEffectManager } from './card-effects/CardEffectManager';
import { LaneManager } from './LaneManager';
import { HandManager } from './HandManager';
import { LogHistoryButton } from '@/components/LogHistoryButton';
import { LogHelper } from './card-effects/helpers/LogHelper';
import { RevealQueueItem } from '@/interfaces/RevealQueueItem';

export class RevealManager {
  private gameState: GameStateManager;
  private effectManager: CardEffectManager;
  private laneManager: LaneManager;
  private handManager: HandManager;
  private logHistoryButton: LogHistoryButton;

  constructor(
    gameState: GameStateManager,
    effectManager: CardEffectManager,
    laneManager: LaneManager,
    handManager: HandManager,
    logHistoryButton: LogHistoryButton
  ) {
    this.gameState = gameState;
    this.effectManager = effectManager;
    this.laneManager = laneManager;
    this.handManager = handManager;
    this.logHistoryButton = logHistoryButton;
  }

  /**
   * Processa toda a fila de revelação
   */
  public processRevealQueue(): void {
    if (this.gameState.revealQueue.length === 0) {
      return;
    }

    // Ordena a fila baseada na prioridade
    this.sortRevealQueue();

    // Log do início do turno
    this.logTurnStart();

    // Log da ordem de revelação
    this.logRevealOrder();

    // Processa cada carta na fila
    this.processEachReveal();

    // Limpa a fila
    this.gameState.clearRevealQueue();

    // Atualiza renderização
    this.updateAfterReveals();

    console.log('Recalculando todos os efeitos Ongoing após as revelações.');
    this.recalculateAllPowers();
  }

  /**
   * Adiciona uma carta à fila de revelação
   */
  public addToRevealQueue(
    card: any,
    laneIndex: number,
    slot: any,
    isPlayer: boolean,
    turnPlayed: number
  ): void {
    const revealItem: RevealQueueItem = {
      card,
      laneIndex,
      slot,
      isPlayer,
      turnPlayed,
    };

    this.gameState.addToRevealQueue(revealItem);
  }

  /**
   * Remove uma carta específica da fila de revelação
   */
  public removeFromRevealQueue(card: any, slot: any): void {
    const item = this.gameState.revealQueue.find(
      (queueItem) => queueItem.card === card && queueItem.slot === slot
    );

    if (item) {
      this.gameState.removeFromRevealQueue(item);
    }
  }

  /**
   * Verifica se há cartas na fila de revelação
   */
  public hasCardsToReveal(): boolean {
    return this.gameState.revealQueue.length > 0;
  }

  /**
   * Obtém uma cópia da fila atual
   */
  public getRevealQueueCopy(): readonly RevealQueueItem[] {
    return [...this.gameState.revealQueue];
  }

  private sortRevealQueue(): void {
    const playerRevealsFirst = this.laneManager.getLeadingPlayer() === 0;

    this.gameState.revealQueue.sort((a, b) => {
      if (a.isPlayer === b.isPlayer) return 0;
      return a.isPlayer === playerRevealsFirst ? -1 : 1;
    });
  }

  private logTurnStart(): void {
    this.logHistoryButton.addLog(`---------- Turno ${this.gameState.currentTurn} ----------`);
  }

  private logRevealOrder(): void {
    const revealOrder = this.gameState.revealQueue.map(
      (item) => `${item.card.name} (${item.isPlayer ? 'Você' : 'Oponente'})`
    );

    LogHelper.emitLog(`Ordem de Revelação: ${revealOrder.join(', ')}`);
  }

  private processEachReveal(): void {
    for (const item of this.gameState.revealQueue) {
      this.revealSingleCard(item);
    }
  }

  private revealSingleCard(item: RevealQueueItem): void {
    const playerName = item.isPlayer ? 'Você' : 'Oponente';

    // Log da jogada
    this.logHistoryButton.addLog(
      `${playerName} jogou a carta ${item.card.name} na lane ${item.laneIndex + 1}`
    );

    console.log(`Revelando ${item.card.name}...`);

    // Marca carta como revelada
    if (item.slot.cardData) {
      item.slot.cardData.isRevealed = true;
    }

    // Aplica efeito de revelação
    this.effectManager.applyOnRevealEffect(
      item.card,
      item.laneIndex,
      item.slot,
      item.isPlayer,
      item.turnPlayed,
      this.gameState.revealQueue
    );

    // Trigger efeitos de "quando carta é jogada"
    this.effectManager.triggerOnCardPlayedEffects(item.card, item.laneIndex);

    // Atualiza UI e poderes
    this.updateUIAndPowers();
  }

  private updateUIAndPowers(): void {
    // Atualiza UI das cartas colocadas
    this.gameState.placedCardContainers.forEach((container) => {
      const slot = container.slot;
      if (slot && slot.occupied && slot.power !== undefined) {
        container.updatePower(slot.power);
      }
    });

    // Atualiza poderes das lanes
    this.laneManager.updateLanePowers();
  }

  private updateAfterReveals(): void {
    // Re-renderiza as mãos
    this.handManager.renderPlayerHand(this.gameState.playerEnergy);
    this.handManager.renderOpponentHand(this.gameState.showOpponentHand);
  }

  private recalculateAllPowers(): void {
    // Recalcula todos os efeitos e poderes
    this.effectManager.updateAllCardPowers();
    this.laneManager.updateLaneProperties();
    this.updateUIAndPowers();
    this.effectManager.updateMoves(this.gameState.placedCardContainers);
  }
}
