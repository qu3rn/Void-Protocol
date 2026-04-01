import { Graphics } from 'pixi.js';
import type { Enemy } from '@game/core/entities/Enemy';
import { ENEMY_COLORS, BOSS_COLOR_TINT } from '@shared/constants';

export function createEnemySprite(enemy: Enemy): Graphics {
  const g = new Graphics();
  const baseColor = ENEMY_COLORS[enemy.state.type] ?? 0xff0000;
  const color = enemy.state.isBoss ? BOSS_COLOR_TINT : baseColor;
  const radius = enemy.state.isBoss ? 18 : 10;

  g.circle(0, 0, radius).fill({ color });

  g.x = enemy.state.position.x;
  g.y = enemy.state.position.y;

  return g;
}

export function syncEnemySprite(g: Graphics, enemy: Enemy): void {
  g.x = enemy.state.position.x;
  g.y = enemy.state.position.y;
}
