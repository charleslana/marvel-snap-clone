import { Lane } from '@/interfaces/Lane';
import { LaneEffect } from '@/interfaces/LaneEffect';
import { GameStateManager } from './GameStateManager';
import { LaneEffectsRegistry } from './LaneEffectsRegistry';
import { LogHelper } from './card-effects/helpers/LogHelper';
import { Slot } from '@/interfaces/Slot';
import { LaneDisplay } from '@/components/LaneDisplay';

export class LaneEffectManager {
  private gameState: GameStateManager;
  private laneDisplay: LaneDisplay;
  private effectsForThisGame: (LaneEffect | null)[] = [null, null, null];

  constructor(gameState: GameStateManager, laneDisplay: LaneDisplay) {
    this.gameState = gameState;
    this.laneDisplay = laneDisplay;
  }

  /**
   * Revela o efeito da lane correspondente ao turno atual.
   * Deve ser chamado no início de cada turno.
   */
  public revealLaneEffectForTurn(turn: number): void {
    const laneIndex = turn - 1;

    if (laneIndex >= 0 && laneIndex < this.gameState.lanes.length) {
      const lane = this.gameState.lanes[laneIndex];

      if (lane.effect) {
        lane.isRevealed = true;

        // Delega a atualização da UI para o LaneDisplay
        this.laneDisplay.updateLaneEffectText(lane, lane.effect.name);
        this.laneDisplay.updateLaneEffectImage(lane, lane.effect.image);

        LogHelper.emitLog(`Mundo Revelado: ${lane.effect.name} - ${lane.effect.description}`);

        // --- TRATAMENTO ESPECIAL DO LIMBO ---
        if (lane.effect.id === 'limbo') {
          this.gameState.setMaxTurn(7);
          LogHelper.emitLog('O jogo agora terá 7 turnos por causa do Limbo!');
        }
      }
    }
  }

  /**
   * Calcula o bônus de poder total de todos os efeitos de lane ativos para um lado.
   * @param slots Os slots de um jogador em uma lane.
   * @param lane A lane sendo calculada.
   * @returns O bônus de poder a ser adicionado.
   */
  public getPowerBonusForLane(slots: Slot[], lane: Lane): number {
    // O efeito só se aplica se a lane já foi revelada
    if (lane.effect && lane.isRevealed) {
      return lane.effect.applyPowerBonus(slots, lane);
    }
    return 0;
  }

  public setupLaneEffectsForGame(): void {
    // Renomeado para clareza
    // Verificação de segurança para garantir que as lanes existem.
    if (this.gameState.lanes.length === 0) {
      console.error(
        'LaneEffectManager: Tentativa de configurar efeitos antes da criação das lanes.'
      );
      return;
    }

    const allEffects = LaneEffectsRegistry.getAllEffects();
    Phaser.Utils.Array.Shuffle(allEffects);
    this.effectsForThisGame = allEffects.slice(0, 3);

    // Este loop agora funcionará, pois as lanes já existem.
    for (let i = 0; i < this.gameState.lanes.length; i++) {
      this.gameState.lanes[i].effect = this.effectsForThisGame[i];
    }
    console.log(
      'Efeitos para esta partida:',
      this.effectsForThisGame.map((e) => e?.name)
    );
  }
}
