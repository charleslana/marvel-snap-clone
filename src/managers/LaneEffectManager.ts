import { Lane } from '@/interfaces/Lane';
import { LaneEffect } from '@/interfaces/LaneEffect';
import { GameStateManager } from './GameStateManager';
import { LaneEffectsRegistry } from './LaneEffectsRegistry';
import { LogHelper } from './card-effects/helpers/LogHelper';
import Phaser from 'phaser';
import { Slot } from '@/interfaces/Slot';

export class LaneEffectManager {
  private gameState: GameStateManager;
  private effectsForThisGame: (LaneEffect | null)[] = [null, null, null];

  constructor(gameState: GameStateManager) {
    this.gameState = gameState;
  }

  /**
   * Revela o efeito da lane correspondente ao turno atual.
   * Deve ser chamado no início de cada turno.
   */
  public revealLaneEffectForTurn(turn: number): void {
    // Os turnos são 1-6, os índices das lanes são 0-2.
    const laneIndex = turn - 1;

    // Só revela nos turnos 1, 2 e 3.
    if (laneIndex >= 0 && laneIndex < this.gameState.lanes.length) {
      const lane = this.gameState.lanes[laneIndex];
      if (lane.effect && lane.worldText) {
        lane.isRevealed = true;
        // Atualiza a UI para mostrar o nome e a descrição do efeito
        const newText = `${lane.effect.name}\n\n${lane.effect.description}`;
        lane.worldText.setText(newText);

        // --- LÓGICA DE AJUSTE ADICIONADA AQUI ---
        this.adjustTextToFit(lane.worldText, lane.worldContainer);
        LogHelper.emitLog(`Mundo Revelado: ${lane.effect.name} - ${lane.effect.description}`);
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

  private adjustTextToFit(
    textObject: Phaser.GameObjects.Text,
    container?: Phaser.GameObjects.Container
  ): void {
    if (!container) return;

    // Define a largura máxima com um pouco de preenchimento (padding)
    const maxWidth = container.getBounds().width - 20;
    const maxHeight = container.getBounds().height - 10;

    // Aplica a quebra de linha automática
    textObject.setWordWrapWidth(maxWidth);
    textObject.setAlign('center'); // Centraliza o texto de múltiplas linhas

    // Começa com um tamanho de fonte padrão e vai diminuindo
    let fontSize = 16; // Tamanho de fonte inicial
    textObject.setFontSize(fontSize);

    // Reduz o tamanho da fonte até que a altura do texto caiba no contêiner
    while (textObject.height > maxHeight && fontSize > 8) {
      fontSize--;
      textObject.setFontSize(fontSize);
    }
  }
}
