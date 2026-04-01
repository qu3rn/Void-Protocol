import type { EnemyConfig } from '@shared/types';

export const ENEMY_CONFIGS: EnemyConfig[] = [
  {
    type: 'grunt',
    hp: 40,
    speed: 1.2,
    damage: 8,
    reward: 10,
    dropChance: 0.15,
    bossMultiplier: 4,
    bossThreshold: 20,
  },
  {
    type: 'brute',
    hp: 120,
    speed: 0.6,
    damage: 25,
    reward: 25,
    dropChance: 0.3,
    bossMultiplier: 3,
    bossThreshold: 15,
  },
  {
    type: 'speeder',
    hp: 20,
    speed: 3.0,
    damage: 5,
    reward: 15,
    dropChance: 0.2,
    bossMultiplier: 2,
    bossThreshold: 30,
  },
];

export function getEnemyConfig(type: EnemyConfig['type']): EnemyConfig {
  const config = ENEMY_CONFIGS.find((c) => c.type === type);
  if (!config) throw new Error(`Unknown enemy type: ${type}`);
  return config;
}
