import Phaser from "phaser";
import { Card } from "../interfaces/Card";
import { Lane } from "../interfaces/Lane";
import { Slot } from "../interfaces/Slot";

export class BotAI {
  private scene: Phaser.Scene;
  private lanes: Lane[];
  private botHand: Omit<Card, "index">[];
  private botEnergy: number;

  constructor(
    scene: Phaser.Scene,
    lanes: Lane[],
    botHand: Omit<Card, "index">[],
    botEnergy: number
  ) {
    this.scene = scene;
    this.lanes = lanes;
    this.botHand = botHand;
    this.botEnergy = botEnergy;
  }

  public executeTurn(
    onCardPlayed: (slot: Slot, card: Omit<Card, "index">) => void,
    onHandUpdated: () => void,
    onLanePowersUpdated: () => void
  ): void {
    const playableCards = this.botHand.filter((c) => c.cost <= this.botEnergy);

    if (playableCards.length === 0) {
      return;
    }

    playableCards.sort((a, b) => b.power - a.power);

    for (const card of playableCards) {
      if (card.cost > this.botEnergy) continue;

      const lanesByPriority = this.getLanesByPriority();

      let cardPlayed = false;

      for (const laneItem of lanesByPriority) {
        const lane = laneItem.lane;
        const slot = lane.botSlots.find((s) => !s.occupied);
        if (!slot) continue;

        const { botPower, playerPower } = laneItem;
        const powerWithCard = botPower + card.power;

        if (
          (botPower <= playerPower && powerWithCard > playerPower) ||
          botPower > playerPower
        ) {
          this.playCardOnSlot(slot, card, onCardPlayed);
          cardPlayed = true;
          break;
        }
      }

      if (!cardPlayed) {
        this.playCardOnAnyAvailableSlot(card, onCardPlayed);
      }

      if (this.botEnergy <= 0) break;
    }

    onHandUpdated();
    onLanePowersUpdated();
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
        return {
          lane,
          botPower,
          playerPower,
          difference: botPower - playerPower,
        };
      })
      .sort((a, b) => a.difference - b.difference);
  }

  private calculateLanePower(lane: Lane): {
    botPower: number;
    playerPower: number;
  } {
    let botPower = 0;
    for (const slot of lane.botSlots) {
      botPower += slot.power ?? 0;
    }

    let playerPower = 0;
    for (const slot of lane.playerSlots) {
      playerPower += slot.power ?? 0;
    }

    return { botPower, playerPower };
  }

  private playCardOnSlot(
    slot: Slot,
    card: Omit<Card, "index">,
    onCardPlayed: (slot: Slot, card: Omit<Card, "index">) => void
  ): void {
    onCardPlayed(slot, card);

    slot.occupied = true;
    slot.power = card.power;

    const index = this.botHand.indexOf(card);
    if (index >= 0) {
      this.botHand.splice(index, 1);
    }

    this.botEnergy -= card.cost;
  }

  private playCardOnAnyAvailableSlot(
    card: Omit<Card, "index">,
    onCardPlayed: (slot: Slot, card: Omit<Card, "index">) => void
  ): void {
    for (const lane of this.lanes) {
      const slot = lane.botSlots.find((s) => !s.occupied);
      if (slot && card.cost <= this.botEnergy) {
        this.playCardOnSlot(slot, card, onCardPlayed);
        break;
      }
    }
  }

  public updateBotEnergy(newEnergy: number): void {
    this.botEnergy = newEnergy;
  }

  public updateBotHand(newHand: Omit<Card, "index">[]): void {
    this.botHand = newHand;
  }
}
