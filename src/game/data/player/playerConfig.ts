import { PLAYER_INITIAL_HP, PLAYER_SPEED } from '@shared/constants';
import type { EntityStats, Vec2 } from '@shared/types';

export interface PlayerConfig {
  initialStats: EntityStats;
  initialPosition: Vec2;
}

export const PLAYER_CONFIG: PlayerConfig = {
  initialStats: {
    hp: PLAYER_INITIAL_HP,
    maxHp: PLAYER_INITIAL_HP,
    speed: PLAYER_SPEED,
    damage: 15,
  },
  initialPosition: { x: 640, y: 360 },
};
