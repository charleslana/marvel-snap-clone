import { ImageEnum } from '@/enums/ImageEnum';
import { Lane } from './Lane';
import { Slot } from './Slot';

export interface LaneEffect {
  id: string;
  name: string;
  description: string;
  image: ImageEnum;

  applyPowerBonus: (slots: Slot[], lane: Lane) => number;
}
