import { Card } from './Card';
import { Slot } from './Slot';

export type AddToHandAction = {
  type: 'ADD_TO_HAND';
  payload: {
    card: Card;
    isPlayer: boolean;
  };
};

export type MoveCardAction = {
  type: 'MOVE_CARD';
  payload: {
    fromSlot: Slot;
    toSlot: Slot;
  };
};

export type PowerBuffAction = {
  type: 'POWER_BUFF';
  payload: {
    cardName: string;
    targetCardName: string;
    bonus: number;
    reason: string;
  };
};

export type LogMessageAction = {
  type: 'LOG_MESSAGE';
  payload: {
    message: string;
  };
};

export type EffectAction = AddToHandAction | MoveCardAction | PowerBuffAction | LogMessageAction;
