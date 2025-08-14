import { Card } from '@/interfaces/Card';

export const playerDeck: Omit<Card, 'index'>[] = [
  {
    name: 'Homem-Formiga',
    cost: 1,
    power: 1,
    description: 'Constante: se tiver 3 outras cartas aqui, +3 de poder.',
  },
  { name: 'Noturno', cost: 1, power: 2, description: 'Você pode mover isto uma vez.' },
  {
    name: 'Angela',
    cost: 2,
    power: 3,
    description: 'Quando você jogar uma carta aqui, +1 de poder.',
  },
  {
    name: 'Armor',
    cost: 2,
    power: 3,
    description: 'Constante: As cartas aqui não podem ser destruídas.',
  },
  {
    name: 'Colosso',
    cost: 2,
    power: 3,
    description: 'Constante: Não pode ser destruído, movido ou ter seu Poder reduzido.',
  },
  {
    name: 'Senhor Fantástico',
    cost: 3,
    power: 2,
    description: 'Constante: Locais adjacentes tem +3 de Poder.',
  },
  {
    name: 'Cosmo',
    cost: 3,
    power: 3,
    description: 'Constante: As habilidades de revelação não acontecerão aqui.',
  },
  {
    name: 'Namor',
    cost: 4,
    power: 6,
    description: 'Constante: +5 de Poder se esta for sua única carta aqui.',
  },
  {
    name: 'Homem de Ferro',
    cost: 5,
    power: 0,
    description: 'Constante: seu poder total é dobrado aqui.',
  },
  {
    name: 'Klaw',
    cost: 5,
    power: 3,
    description: 'Constante: O local à direita tem +7 de Poder',
  },
  {
    name: 'Espectro',
    cost: 5,
    power: 3,
    description: 'Ao revelar: conceda +2 de Poder ás suas cartas constantes.',
  },
  {
    name: 'Onslaught',
    cost: 5,
    power: 3,
    description: 'Constante: Duplique seus outros efeitos constantes aqui.',
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
