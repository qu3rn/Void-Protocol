import type { EnemyState, EnemyType } from '@shared/types';
import { getEnemyConfig } from '@game/data/enemies/enemyConfig';

let nextEnemyId = 0;

export class Enemy {
  state: EnemyState;

  constructor(type: EnemyType, isBoss = false) {
    const config = getEnemyConfig(type);
    const mult = isBoss ? config.bossMultiplier : 1;

    this.state = {
      id: `enemy_${nextEnemyId++}`,
      type,
      isBoss,
      hp: config.hp * mult,
      maxHp: config.hp * mult,
      speed: config.speed * (isBoss ? 0.8 : 1),
      damage: config.damage * mult,
      reward: config.reward * (isBoss ? 5 : 1),
      position: { x: 0, y: 0 },
    };
  }

  moveTo(targetX: number, targetY: number): void {
    const dx = targetX - this.state.position.x;
    const dy = targetY - this.state.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    this.state.position.x += (dx / dist) * this.state.speed;
    this.state.position.y += (dy / dist) * this.state.speed;
  }

  takeDamage(amount: number): void {
    this.state.hp = Math.max(0, this.state.hp - amount);
  }

  get isAlive(): boolean {
    return this.state.hp > 0;
  }
}
