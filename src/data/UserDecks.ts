import { Deck } from '@/interfaces/Deck';
import { playerDeck, opponentDeck } from './CardPool';

export const userDecks: Deck[] = [
  {
    id: 'deck1',
    name: 'Meu Deck Inicial',
    cards: playerDeck.slice(0, 12),
  },
  {
    id: 'deck2',
    name: 'Deck de Teste Rápido',
    cards: opponentDeck.slice(0, 12),
  },
];
