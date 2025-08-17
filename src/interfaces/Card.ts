import { CardEffect } from '@/enums/CardEffect';
import { CardEffectType } from '@/enums/CardEffectType';
import { ImageEnum } from '@/enums/ImageEnum';

export interface Card {
  name: string;
  cost: number;
  power: number;
  index: number;
  description: string;
  image?: ImageEnum;
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
  hawkeyeReadyTurn?: number;
  hawkeyeBonus?: number;
}
