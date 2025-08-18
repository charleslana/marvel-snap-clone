import { Card } from './Card';
import { Slot } from './Slot';

export type AddToHandAction = {
  type: 'ADD_TO_HAND';
  payload: {
    card: Omit<Card, 'index'>;
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

// Você pode adicionar outros tipos de ação aqui no futuro (ex: 'DESTROY_CARD', 'MOVE_CARD')
export type EffectAction = AddToHandAction | MoveCardAction;
