import type { EnemyType } from '@shared/types';
import { getEnemyConfig } from '@game/data/enemies/enemyConfig';

/**
 * Returns true when the kill count for a given enemy type
 * has reached or exceeded the boss spawn threshold.
 */
export function shouldSpawnBoss(type: EnemyType, killCount: number): boolean {
  const config = getEnemyConfig(type);
  return killCount > 0 && killCount % config.bossThreshold === 0;
}

/**
 * Returns the boss threshold for a given enemy type.
 */
export function getBossThreshold(type: EnemyType): number {
  return getEnemyConfig(type).bossThreshold;
}
