import { Card } from '@/interfaces/Card';

export const playerDeck: Omit<Card, 'index'>[] = [
  {
    name: 'Homem-Formiga',
    cost: 1,
    power: 1,
    description: 'Constante: se tiver 3 outras cartas aqui, +3 de poder.',
  },
  {
    name: 'Elektra',
    cost: 1,
    power: 1,
    description: 'Ao revelar: destrói uma carta inimiga aleatória de custo 1 nesta localização.',
  },
  {
    name: 'Korg',
    cost: 1,
    power: 2,
    description: 'Ao revelar: embaralha uma Rocha no deck do seu oponente.',
  },
  { name: 'Noturno', cost: 1, power: 2, description: '' },
  {
    name: 'Garota Esquilo',
    cost: 1,
    power: 1,
    description: 'Ao revelar: adiciona um Esquilo de 1 de poder a cada outra localização.',
  },
  {
    name: 'Angela',
    cost: 2,
    power: 0,
    description: 'Quando você jogar uma carta aqui, +2 de poder.',
  },
  {
    name: 'Sentinela',
    cost: 2,
    power: 3,
    description: 'Ao revelar: adiciona outro Sentinela à sua mão.',
  },
  {
    name: 'Sr. Fantástico',
    cost: 3,
    power: 2,
    description: 'Constante: dá +2 de poder às localizações adjacentes.',
  },
  {
    name: 'Bishop',
    cost: 3,
    power: 1,
    description: 'Quando você jogar uma carta, este ganha +1 de poder.',
  },
  {
    name: 'Ka-Zar',
    cost: 4,
    power: 4,
    description: 'Constante: suas cartas de custo 1 têm +1 de poder.',
  },
  {
    name: 'Homem de Ferro',
    cost: 5,
    power: 0,
    description: 'Constante: seu poder total aqui é dobrado.',
  },
  {
    name: 'Blue Marvel',
    cost: 5,
    power: 3,
    description: 'Constante: dá +1 de poder a todas as suas outras cartas.',
  },
];

export const botDeck: Omit<Card, 'index'>[] = [
  {
    name: 'Abominável',
    cost: 5,
    power: 9,
    description: 'Rá! Vermes tolos! Vocês estão abaixo de mim!',
  },
  { name: 'Ciclope', cost: 3, power: 4, description: 'Vamos, X-Men.' },
  {
    name: 'Gavião Arqueiro',
    cost: 1,
    power: 1,
    description: 'Ao revelar: se você jogar uma carta aqui no próximo turno, +3 de poder.',
  },
  { name: 'Hulk', cost: 6, power: 12, description: 'HULK ESMAGAR!' },
  {
    name: 'Homem de Ferro',
    cost: 5,
    power: 0,
    description: 'Constante: seu poder total aqui é dobrado.',
  },
  {
    name: 'Medusa',
    cost: 2,
    power: 2,
    description: 'Ao revelar: se esta carta estiver na localização do meio, +3 de poder.',
  },
  { name: 'Misty Knight', cost: 1, power: 2, description: 'Temos que salvar esta cidade.' },
  {
    name: 'Justiceiro',
    cost: 3,
    power: 2,
    description: 'Constante: +1 de poder para cada carta inimiga aqui.',
  },
  { name: 'Mercúrio', cost: 1, power: 2, description: 'Começa na sua mão inicial.' },
  {
    name: 'Sentinela',
    cost: 2,
    power: 3,
    description: 'Ao revelar: adiciona outro Sentinela à sua mão.',
  },
  { name: 'Abalador', cost: 2, power: 3, description: 'Vou acabar com você!' },
  {
    name: 'Senhor das Estrelas',
    cost: 2,
    power: 2,
    description: 'Ao revelar: se seu oponente jogou uma carta aqui neste turno, +4 de poder.',
  },
  { name: 'Coisa', cost: 4, power: 6, description: 'Tá na hora do pau!' },
];
