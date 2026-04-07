import type { EnemyState, EnemyType } from '@shared/types';
import { getEnemyConfig } from '@game/data/enemies/enemyConfig';
import { ENEMY_MOVEMENT, applyHorizontal, applyGravityStep } from '@game/core/systems/MovementSystem';
import type { MovableBody } from '@game/core/systems/MovementSystem';
import { decayKnockback } from '@game/core/systems/CombatSystem';

let nextEnemyId = 0;

const ENEMY_MASS: Record<EnemyType, number> = {
  grunt  : 1.0,
  brute  : 2.2,
  speeder: 0.7,
};

export function getEnemyMass(type: EnemyType): number {
  return ENEMY_MASS[type];
}

export class Enemy {
  state: EnemyState;

  constructor(type: EnemyType, isBoss = false) {
    const config = getEnemyConfig(type);
    const mult   = isBoss ? config.bossMultiplier : 1;

    this.state = {
      id   : `enemy_${nextEnemyId++}`,
      type,
      isBoss,
      hp        : config.hp     * mult,
      maxHp     : config.hp     * mult,
      speed     : config.speed  * (isBoss ? 0.8 : 1),
      damage    : config.damage * mult,
      reward    : config.reward * (isBoss ? 5 : 1),
      dropChance: config.dropChance * (isBoss ? 3 : 1),
      position  : { x: 0, y: 0 },
      velocityX: 0,
      velocityY: 0,
      isOnGround : false,
      facingRight: true,
      animState  : 'idle',
      hurtTimer  : 0,
      patrolDir  : 1,
      activeEffects: {},
    };
  }

  // ── AI movement ────────────────────────────────────────────────────────────

  /** Chase a target X on the same platform using acceleration. */
  chaseX(targetX: number): void {
    const dx  = targetX - this.state.position.x;
    const dir = Math.abs(dx) < 4 ? 0 : Math.sign(dx);
    if (dir !== 0) this.state.facingRight = dir > 0;
    const body = this._body();
    applyHorizontal(body, dir, { ...ENEMY_MOVEMENT, maxSpeed: this.state.speed });
    this.state.velocityX = body.velocityX;
  }

  /** Patrol back and forth. */
  patrol(): void {
    const body = this._body();
    applyHorizontal(body, this.state.patrolDir, { ...ENEMY_MOVEMENT, maxSpeed: this.state.speed * 0.5 });
    this.state.velocityX   = body.velocityX;
    this.state.facingRight = this.state.patrolDir > 0;
  }

  reversePatrol(): void {
    this.state.patrolDir = (this.state.patrolDir * -1) as 1 | -1;
  }

  // ── Physics ────────────────────────────────────────────────────────────────

  applyPhysics(): void {
    const s    = this.state;
    const body = this._body();
    applyGravityStep(body, ENEMY_MOVEMENT);
    s.velocityY = body.velocityY;
    decayKnockback(s);
    if (s.hurtTimer > 0) s.hurtTimer -= 16;
  }

  // ── Damage ─────────────────────────────────────────────────────────────────

  takeDamage(amount: number): void {
    this.state.hp        = Math.max(0, this.state.hp - amount);
    this.state.hurtTimer = 400;
  }

  // ── Animation ──────────────────────────────────────────────────────────────

  updateAnimState(): void {
    const s = this.state;
    if (s.hurtTimer > 0) { s.animState = 'hurt'; return; }
    s.animState = Math.abs(s.velocityX) > 0.1 ? 'walk' : 'idle';
  }

  get isAlive(): boolean {
    return this.state.hp > 0;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private _body(): MovableBody {
    const s = this.state;
    return {
      velocityX : s.velocityX,
      velocityY : s.velocityY,
      isOnGround: s.isOnGround,
      jumpHeld  : false,
    };
  }
}
