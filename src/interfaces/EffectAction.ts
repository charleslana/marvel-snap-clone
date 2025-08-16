import { Card } from './Card';

export type AddToHandAction = {
  type: 'ADD_TO_HAND';
  payload: {
    card: Omit<Card, 'index'>;
    isPlayer: boolean;
  };
};

// Você pode adicionar outros tipos de ação aqui no futuro (ex: 'DESTROY_CARD', 'MOVE_CARD')
export type EffectAction = AddToHandAction;
