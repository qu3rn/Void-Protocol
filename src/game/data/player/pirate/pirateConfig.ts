import type { PlayerState } from '@shared/types';
import { PLAYER_CONFIG } from '@game/data/player/playerConfig';

/** Pirate-specific overrides on top of the base player config. */
export const PIRATE_CONFIG = {
  ...PLAYER_CONFIG,
  initialStats: {
    ...PLAYER_CONFIG.initialStats,
    maxHp : 120,
    hp    : 120,
    speed : 3.5,
    damage: 18,
  },
} as const;

export type PirateInitialState = typeof PIRATE_CONFIG.initialStats &
  Omit<PlayerState, keyof typeof PIRATE_CONFIG.initialStats>;
