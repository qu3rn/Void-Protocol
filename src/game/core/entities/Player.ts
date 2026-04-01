import type { PlayerState } from '@shared/types';
import { PLAYER_CONFIG } from '@game/data/player/playerConfig';

export class Player {
  state: PlayerState;

  constructor() {
    this.state = {
      ...PLAYER_CONFIG.initialStats,
      position: { ...PLAYER_CONFIG.initialPosition },
    };
  }

  move(dx: number, dy: number): void {
    const { speed } = this.state;
    this.state.position.x += dx * speed;
    this.state.position.y += dy * speed;
  }

  takeDamage(amount: number): void {
    this.state.hp = Math.max(0, this.state.hp - amount);
  }

  heal(amount: number): void {
    this.state.hp = Math.min(this.state.maxHp, this.state.hp + amount);
  }

  get isAlive(): boolean {
    return this.state.hp > 0;
  }
}
