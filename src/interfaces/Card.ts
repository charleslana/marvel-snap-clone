export interface Card {
  name: string;
  cost: number;
  power: number;
  index: number;
  description: string;
}

export interface CardData extends Card {
  index: number;
}
