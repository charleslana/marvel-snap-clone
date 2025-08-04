export interface Card {
  name: string;
  cost: number;
  power: number;
  index: number;
}

export interface CardData extends Card {
  index: number;
}
