import { Lane } from '@/interfaces/Lane';
import { SlotHelper } from '../helpers/SlotHelper';
import { AntManHandler } from './AntManHandler';
import { PunisherHandler } from './PunisherHandler';
import { NamorHandler } from './NamorHandler';
import { ColossusHandler } from './ColossusHandler';
import { CardEffectType } from '@/enums/CardEffectType';
import { CardEffect } from '@/enums/CardEffect';

export class OngoingHandler {
  static updateAll(lanes: Lane[]): void {
    lanes.forEach((lane, _laneIndex) => {
      SlotHelper.getAllSlots(lane).forEach((slot) => {
        if (!slot.occupied || !slot.cardData) {
          return;
        }

        slot.power = slot.cardData.power + (slot.permanentBonus ?? 0);

        slot.cardData.effects?.forEach((effect) => {
          if (effect.cardEffectType !== CardEffectType.Ongoing) {
            return;
          }

          const friendly = SlotHelper.getFriendlySlots(lane, lane.playerSlots.includes(slot));
          const enemy = SlotHelper.getOpponentSlots(lane, lane.playerSlots.includes(slot));

          const onslaughtCount = friendly.filter((slot) =>
            slot.cardData?.effects?.some(
              (effect) => effect.cardEffect === CardEffect.OnslaughtDoubleOngoing
            )
          ).length;

          const effectMultiplier = Math.pow(2, onslaughtCount);

          switch (effect.cardEffect) {
            case CardEffect.AntManBuff:
              if (effect.value === undefined) {
                return;
              }
              AntManHandler.handle(
                slot,
                friendly.filter((s) => s.occupied).length,
                effect.value,
                effectMultiplier
              );
              break;
            case CardEffect.PunisherEnemyBuff:
              if (effect.value === undefined) {
                return;
              }
              PunisherHandler.handle(
                slot,
                enemy.filter((s) => s.occupied).length,
                effect.value,
                effectMultiplier
              );
              break;
            case CardEffect.NamorBuff:
              if (effect.value === undefined) {
                return;
              }
              NamorHandler.handle(slot, friendly.filter((s) => s.occupied).length, effect.value);
              break;
            case CardEffect.ColossusImmune:
              ColossusHandler.handle(slot);
              break;
          }
        });
      });
    });
  }
}
