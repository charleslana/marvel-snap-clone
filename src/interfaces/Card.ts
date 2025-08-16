import { CardEffect } from '@/enums/CardEffect';
import { CardEffectType } from '@/enums/CardEffectType';

export interface Card {
  name: string;
  cost: number;
  power: number;
  index: number;
  description: string;
  effect?: { type: CardEffectType; effect: CardEffect; value?: number | number[] }[];
}

export interface CardData extends Card {
  index: number;
  isRevealed?: boolean;
  immunities?: {
    cannotBeDestroyed?: boolean;
    cannotBeMoved?: boolean;
    cannotHavePowerReduced?: boolean;
  };
}
