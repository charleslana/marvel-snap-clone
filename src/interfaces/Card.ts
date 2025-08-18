import { CardEffect } from '@/enums/CardEffect';
import { CardEffectType } from '@/enums/CardEffectType';
import { ImageEnum } from '@/enums/ImageEnum';

export interface Card {
  id: number;
  name: string;
  cost: number;
  power: number;
  description: string;
  image?: ImageEnum;
  effects?: { cardEffectType: CardEffectType; cardEffect: CardEffect; value?: number }[];
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
  hasMoved?: boolean;
  laneIndexAtStartOfTurn?: number;
}
