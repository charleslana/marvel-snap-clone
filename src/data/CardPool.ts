import { Card } from '@/interfaces/Card';

export const playerDeck: Omit<Card, 'index'>[] = [
  {
    name: 'Homem de Ferro',
    cost: 3,
    power: 2,
    description: 'Dobra o poder total na sua localização.',
  },
  { name: 'Hulk', cost: 6, power: 12, description: 'Força bruta imbatível.' },
  {
    name: 'Viúva Negra',
    cost: 1,
    power: 2,
    description: 'Impede o oponente de comprar mais cartas.',
  },
  {
    name: 'Capitão América',
    cost: 3,
    power: 3,
    description: 'Dá +1 de poder aos aliados na mesma localização.',
  },
  {
    name: 'Nick Fury',
    cost: 5,
    power: 7,
    description: 'Adiciona 3 cartas aleatórias de custo 6 à sua mão.',
  },
  {
    name: 'Gavião Arqueiro',
    cost: 1,
    power: 1,
    description: 'Se outra carta for jogada aqui no próximo turno, +2 de poder.',
  },
  {
    name: 'Feiticeira Escarlate',
    cost: 2,
    power: 3,
    description: 'Substitui a localização atual por outra aleatória.',
  },
  { name: 'Pantera Negra', cost: 4, power: 5, description: 'Ao revelar, duplica o próprio poder.' },
  {
    name: 'Homem-Formiga',
    cost: 1,
    power: 1,
    description: 'Se o local estiver cheio, +3 de poder.',
  },
  {
    name: 'Dr. Estranho',
    cost: 3,
    power: 3,
    description: 'Move sua carta de maior poder para este local.',
  },
  {
    name: 'Shang-Chi',
    cost: 4,
    power: 3,
    description: 'Destrói todas as cartas inimigas com poder 9 ou mais.',
  },
  { name: 'Visão', cost: 5, power: 7, description: 'Pode ser movido a cada turno.' },
];

export const botDeck: Omit<Card, 'index'>[] = [
  {
    name: 'Thanos',
    cost: 6,
    power: 11,
    description: 'Começa com as 6 Joias do Infinito embaralhadas no deck.',
  },
  {
    name: 'Loki',
    cost: 3,
    power: 5,
    description: 'Copia a mão do oponente e substitui suas cartas.',
  },
  {
    name: 'Ultron',
    cost: 6,
    power: 8,
    description: 'Enche as outras localizações com drones de poder 1.',
  },
  {
    name: 'Magneto',
    cost: 6,
    power: 12,
    description: 'Move todas as cartas inimigas de custo 3 ou 4 para este local.',
  },
  { name: 'Thor', cost: 4, power: 6, description: 'Adiciona Mjolnir ao seu deck.' },
  {
    name: 'Gamora',
    cost: 5,
    power: 7,
    description: 'Se o oponente jogou uma carta aqui neste turno, +5 de poder.',
  },
  {
    name: 'Ronan',
    cost: 5,
    power: 3,
    description: '+2 de poder para cada carta na mão do oponente.',
  },
  {
    name: 'Nebulosa',
    cost: 1,
    power: 1,
    description: 'Ganha +2 de poder se o oponente não jogar aqui.',
  },
  {
    name: 'Mysterio',
    cost: 2,
    power: 4,
    description: 'Joga cartas ilusórias nas outras localizações.',
  },
  { name: 'Killmonger', cost: 3, power: 3, description: 'Destrói todas as cartas de custo 1.' },
  {
    name: 'Homem-Areia',
    cost: 4,
    power: 1,
    description: 'O oponente só pode jogar 1 carta por turno.',
  },
  {
    name: 'Professor Xavier',
    cost: 5,
    power: 3,
    description: 'Tranca a localização, impedindo mudanças.',
  },
];
