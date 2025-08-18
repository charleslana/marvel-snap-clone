import { Lane } from '@/interfaces/Lane';
import { SlotHelper } from '../helpers/SlotHelper';
import { EffectAction } from '@/interfaces/EffectAction';
import { AntManHandler } from './AntManHandler';
import { PunisherHandler } from './PunisherHandler';
import { NamorHandler } from './NamorHandler';
import { ColossusHandler } from './ColossusHandler';
import { CardEffectType } from '@/enums/CardEffectType';
import { CardEffect } from '@/enums/CardEffect';

export class OngoingHandler {
  static updateAll(lanes: Lane[]): EffectAction[] {
    const actions: EffectAction[] = [];

    lanes.forEach((lane, _laneIndex) => {
      SlotHelper.getAllSlots(lane).forEach((slot) => {
        if (!slot.occupied || !slot.cardData) return;

        slot.power = slot.cardData.power + (slot.permanentBonus ?? 0);

        slot.cardData.effect?.forEach((e) => {
          if (e.type !== CardEffectType.Ongoing) return;

          const friendly = SlotHelper.getFriendlySlots(lane, lane.playerSlots.includes(slot));
          const enemy = SlotHelper.getOpponentSlots(lane, lane.playerSlots.includes(slot));

          const onslaughtCount = friendly.filter((s) =>
            s.cardData?.effect?.some((x) => x.effect === CardEffect.OnslaughtDoubleOngoing)
          ).length;

          const effectMultiplier = Math.pow(2, onslaughtCount);

          switch (e.effect) {
            case CardEffect.AntManBuff:
              actions.push(
                ...AntManHandler.handle(
                  slot,
                  friendly.filter((s) => s.occupied).length,
                  e.value as number,
                  effectMultiplier
                )
              );
              break;
            case CardEffect.PunisherEnemyBuff:
              actions.push(
                ...PunisherHandler.handle(
                  slot,
                  enemy.filter((s) => s.occupied).length,
                  e.value as number,
                  effectMultiplier
                )
              );
              break;
            case CardEffect.NamorBuff:
              NamorHandler.handle(
                slot,
                friendly.filter((s) => s.occupied).length,
                e.value as number
              );
              break;
            case CardEffect.ColossusImmune:
              ColossusHandler.handle(slot);
              break;
          }
        });
      });
    });

    return actions;
  }
}
