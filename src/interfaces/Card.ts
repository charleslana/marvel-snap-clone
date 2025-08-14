import { CardEffect } from '@/enums/CardEffect';
import { CardEffectType } from '@/enums/CardEffectType';

export interface Card {
  name: string;
  cost: number;
  power: number;
  index: number;
  description: string;
  effect?: { type: CardEffectType; effect: CardEffect }[];
}

export interface CardData extends Card {
  index: number;
}
