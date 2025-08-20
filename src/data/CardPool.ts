import { CardEffect } from '@/enums/CardEffect';
import { CardEffectType } from '@/enums/CardEffectType';
import { ImageEnum } from '@/enums/ImageEnum';
import { Card } from '@/interfaces/Card';

export const playerDeck: Card[] = [
  {
    id: 1,
    name: 'Homem-Formiga',
    cost: 1,
    power: 1,
    description: 'Constante: se tiver 3 outras cartas aqui, +3 de poder.',
    image: ImageEnum.CardAntMan,
    effects: [
      { cardEffectType: CardEffectType.Ongoing, cardEffect: CardEffect.AntManBuff, value: 3 },
    ],
  },
  {
    id: 2,
    name: 'Noturno',
    cost: 1,
    power: 2,
    description: 'Você pode mover isto uma vez.',
    image: ImageEnum.CardNightcrawler,
    effects: [{ cardEffectType: CardEffectType.Move, cardEffect: CardEffect.NightcrawlerMove }],
  },
  {
    id: 3,
    name: 'Angela',
    cost: 2,
    power: 3,
    description: 'Quando você jogar uma carta aqui, +1 de poder.',
    image: ImageEnum.CardAngela,
    effects: [
      { cardEffectType: CardEffectType.OnCardPlayed, cardEffect: CardEffect.AngelaBuff, value: 1 },
    ],
  },
  {
    id: 4,
    name: 'Armor',
    cost: 2,
    power: 3,
    description: 'Constante: As cartas aqui não podem ser destruídas.',
    image: ImageEnum.CardArmor,
    effects: [
      { cardEffectType: CardEffectType.Ongoing, cardEffect: CardEffect.ArmorPreventDestroy },
    ],
  },
  {
    id: 5,
    name: 'Colosso',
    cost: 2,
    power: 3,
    description: 'Constante: Não pode ser destruído, movido ou ter seu Poder reduzido.',
    image: ImageEnum.CardColossus,
    effects: [{ cardEffectType: CardEffectType.Ongoing, cardEffect: CardEffect.ColossusImmune }],
  },
  {
    id: 6,
    name: 'Senhor Fantástico',
    cost: 3,
    power: 1,
    description: 'Constante: Locais adjacentes tem +3 de Poder.',
    image: ImageEnum.CardMrFantastic,
    effects: [
      {
        cardEffectType: CardEffectType.Ongoing,
        cardEffect: CardEffect.MisterFantasticBuff,
        value: 3,
      },
    ],
  },
  {
    id: 7,
    name: 'Cosmo',
    cost: 3,
    power: 3,
    description: 'Constante: As habilidades de revelação não acontecerão aqui.',
    image: ImageEnum.CardCosmo,
    effects: [
      { cardEffectType: CardEffectType.Ongoing, cardEffect: CardEffect.CosmoBlockOnReveal },
    ],
  },
  {
    id: 8,
    name: 'Namor',
    cost: 4,
    power: 6,
    description: 'Constante: +5 de Poder se esta for sua única carta aqui.',
    image: ImageEnum.CardNamor,
    effects: [
      { cardEffectType: CardEffectType.Ongoing, cardEffect: CardEffect.NamorBuff, value: 5 },
    ],
  },
  {
    id: 9,
    name: 'Homem de Ferro',
    cost: 5,
    power: 0,
    description: 'Constante: seu poder total é dobrado aqui.',
    image: ImageEnum.CardIronMan,
    effects: [
      { cardEffectType: CardEffectType.Ongoing, cardEffect: CardEffect.IronManDoublePower },
    ],
  },
  {
    id: 10,
    name: 'Klaw',
    cost: 5,
    power: 4,
    description: 'Constante: O local à direita tem +7 de Poder',
    image: ImageEnum.CardKlaw,
    effects: [
      { cardEffectType: CardEffectType.Ongoing, cardEffect: CardEffect.KlawRightBuff, value: 7 },
    ],
  },
  {
    id: 11,
    name: 'Espectro',
    cost: 6,
    power: 7,
    description: 'Ao revelar: conceda +2 de Poder ás suas cartas constantes.',
    image: ImageEnum.CardSpectrum,
    effects: [
      {
        cardEffectType: CardEffectType.OnReveal,
        cardEffect: CardEffect.SpectrumBuffOngoing,
        value: 2,
      },
    ],
  },
  {
    id: 12,
    name: 'Massacre',
    cost: 6,
    power: 8,
    description: 'Constante: Duplique seus outros efeitos constantes aqui.',
    image: ImageEnum.CardOnslaught,
    effects: [
      { cardEffectType: CardEffectType.Ongoing, cardEffect: CardEffect.OnslaughtDoubleOngoing },
    ],
  },
];

export const botDeck: Card[] = [
  {
    id: 13,
    name: 'Abominável',
    cost: 5,
    power: 9,
    description: 'Rá! Vermes tolos! Vocês estão abaixo de mim!',
    image: ImageEnum.CardAbomination,
    effects: [{ cardEffectType: CardEffectType.None, cardEffect: CardEffect.None }],
  },
  {
    id: 14,
    name: 'Ciclope',
    cost: 3,
    power: 4,
    description: 'Vamos, X-Men.',
    image: ImageEnum.CardCyclops,
    effects: [{ cardEffectType: CardEffectType.None, cardEffect: CardEffect.None }],
  },
  {
    id: 15,
    name: 'Gavião Arqueiro',
    cost: 1,
    power: 1,
    description: 'Ao revelar: se você jogar uma carta aqui no próximo turno, +3 de poder.',
    image: ImageEnum.CardHawkEye,
    effects: [
      {
        cardEffectType: CardEffectType.OnReveal,
        cardEffect: CardEffect.HawkeyeNextTurnBuff,
        value: 3,
      },
    ],
  },
  {
    id: 16,
    name: 'Hulk',
    cost: 6,
    power: 12,
    description: 'HULK ESMAGAR!',
    image: ImageEnum.CardHulk,
    effects: [{ cardEffectType: CardEffectType.None, cardEffect: CardEffect.None }],
  },
  {
    id: 17,
    name: 'Medusa',
    cost: 2,
    power: 2,
    description: 'Ao revelar: se esta carta estiver na localização do meio, +3 de poder.',
    image: ImageEnum.CardMedusa,
    effects: [
      {
        cardEffectType: CardEffectType.OnReveal,
        cardEffect: CardEffect.MedusaCenterBuff,
        value: 3,
      },
    ],
  },
  {
    id: 18,
    name: 'Misty Knight',
    cost: 1,
    power: 2,
    description: 'Temos que salvar esta cidade.',
    image: ImageEnum.CardMistyKnight,
    effects: [{ cardEffectType: CardEffectType.None, cardEffect: CardEffect.None }],
  },
  {
    id: 19,
    name: 'Justiceiro',
    cost: 3,
    power: 2,
    description: 'Constante: +1 de poder para cada carta inimiga aqui.',
    image: ImageEnum.CardPunisher,
    effects: [
      {
        cardEffectType: CardEffectType.Ongoing,
        cardEffect: CardEffect.PunisherEnemyBuff,
        value: 1,
      },
    ],
  },
  {
    id: 20,
    name: 'Mercúrio',
    cost: 1,
    power: 2,
    description: 'Começa na sua mão inicial.',
    image: ImageEnum.CardQuickSilver,
    effects: [
      { cardEffectType: CardEffectType.None, cardEffect: CardEffect.QuicksilverStartInHand },
    ],
  },
  {
    id: 21,
    name: 'Sentinela',
    cost: 2,
    power: 3,
    description: 'Ao revelar: adiciona outro Sentinela à sua mão.',
    image: ImageEnum.CardSentinel,
    effects: [
      { cardEffectType: CardEffectType.OnReveal, cardEffect: CardEffect.SentinelAddToHand },
    ],
  },
  {
    id: 22,
    name: 'Lupina',
    cost: 2,
    power: 3,
    description: 'Ao revelar: +2 de poder para cada outra carta que voce tiver aqui.',
    image: ImageEnum.CardWolfsbane,
    effects: [
      { cardEffectType: CardEffectType.OnReveal, cardEffect: CardEffect.WolfsbaneBuff, value: 2 },
    ],
  },
  {
    id: 23,
    name: 'Senhor das Estrelas',
    cost: 2,
    power: 2,
    description: 'Ao revelar: se seu oponente jogou uma carta aqui neste turno, +4 de poder.',
    image: ImageEnum.CardStarlord,
    effects: [
      {
        cardEffectType: CardEffectType.OnReveal,
        cardEffect: CardEffect.StarLordOpponentPlayedBuff,
        value: 4,
      },
    ],
  },
  {
    id: 24,
    name: 'Coisa',
    cost: 4,
    power: 7,
    description: 'Tá na hora do pau!',
    image: ImageEnum.CardTheThing,
    effects: [{ cardEffectType: CardEffectType.None, cardEffect: CardEffect.None }],
  },
];
