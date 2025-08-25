import { Lane } from './Lane';
import { Slot } from './Slot';

export interface LaneEffect {
  id: string;
  name: string;
  description: string;

  applyPowerBonus: (slots: Slot[], lane: Lane) => number;
}
