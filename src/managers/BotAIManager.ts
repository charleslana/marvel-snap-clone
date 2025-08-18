import Phaser from 'phaser';
import { Card } from '@/interfaces/Card';
import { Lane } from '@/interfaces/Lane';
import { Slot } from '@/interfaces/Slot';

export class BotAIManager {
  private scene: Phaser.Scene;
  private lanes: Lane[];
  private botHand: Card[];
  private botEnergy: number;

  constructor(scene: Phaser.Scene, lanes: Lane[], botHand: Card[], botEnergy: number) {
    this.scene = scene;
    this.lanes = lanes;
    this.botHand = botHand;
    this.botEnergy = botEnergy;
  }

  public executeTurn(
    onCardPlayed: (slot: Slot, card: Card) => void,
    onHandUpdated: () => void,
    onLanePowersUpdated: () => void
  ): void {
    const playableCards = this.getPlayableCards();

    for (const card of playableCards) {
      if (card.cost > this.botEnergy) continue;

      const lanesByPriority = this.getLanesByPriority();

      const played = this.tryPlayCardOnPrioritizedLane(card, lanesByPriority, onCardPlayed);

      if (!played) {
        this.playCardOnAnyAvailableSlot(card, onCardPlayed);
      }

      if (this.botEnergy <= 0) break;
    }

    onHandUpdated();
    onLanePowersUpdated();
  }

  public updateBotEnergy(newEnergy: number): void {
    this.botEnergy = newEnergy;
  }

  public updateBotHand(newHand: Card[]): void {
    this.botHand = newHand;
  }

  private getPlayableCards(): Card[] {
    return this.botHand.filter((c) => c.cost <= this.botEnergy).sort((a, b) => b.power - a.power);
  }

  private getLanesByPriority(): Array<{
    lane: Lane;
    botPower: number;
    playerPower: number;
    difference: number;
  }> {
    return this.lanes
      .map((lane) => {
        const { botPower, playerPower } = this.calculateLanePower(lane);
        return { lane, botPower, playerPower, difference: botPower - playerPower };
      })
      .sort((a, b) => a.difference - b.difference);
  }

  private calculateLanePower(lane: Lane): { botPower: number; playerPower: number } {
    const botPower = lane.opponentSlots.reduce((sum, s) => sum + (s.power ?? 0), 0);
    const playerPower = lane.playerSlots.reduce((sum, s) => sum + (s.power ?? 0), 0);
    return { botPower, playerPower };
  }

  private tryPlayCardOnPrioritizedLane(
    card: Card,
    lanesByPriority: Array<{ lane: Lane; botPower: number; playerPower: number }>,
    onCardPlayed: (slot: Slot, card: Card) => void
  ): boolean {
    for (const laneItem of lanesByPriority) {
      const slot = laneItem.lane.opponentSlots.find((s) => !s.occupied);
      if (!slot) continue;

      const willOverpower =
        (laneItem.botPower <= laneItem.playerPower &&
          laneItem.botPower + card.power > laneItem.playerPower) ||
        laneItem.botPower > laneItem.playerPower;

      if (willOverpower) {
        this.playCardOnSlot(slot, card, onCardPlayed);
        return true;
      }
    }
    return false;
  }

  private playCardOnSlot(
    slot: Slot,
    card: Card,
    onCardPlayed: (slot: Slot, card: Card) => void
  ): void {
    onCardPlayed(slot, card);

    slot.occupied = true;
    slot.power = card.power;

    const index = this.botHand.indexOf(card);
    if (index >= 0) this.botHand.splice(index, 1);

    this.botEnergy -= card.cost;
  }

  private playCardOnAnyAvailableSlot(
    card: Card,
    onCardPlayed: (slot: Slot, card: Card) => void
  ): void {
    for (const lane of this.lanes) {
      const slot = lane.opponentSlots.find((s) => !s.occupied);
      if (slot && card.cost <= this.botEnergy) {
        this.playCardOnSlot(slot, card, onCardPlayed);
        break;
      }
    }
  }
}
