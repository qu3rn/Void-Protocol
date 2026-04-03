/**
 * ProjectileSystem – manages all active projectiles.
 * Moves them, checks collisions against enemies and barrels, fires events.
 */
import type { ProjectileState, Vec2 } from '@shared/types';
import type { EventBus } from '@game/core/systems/EventBus';
import type { Barrel } from '@game/core/entities/Barrel';

let nextProjectileId = 0;

export interface ProjectileConfig {
  speed    : number;
  damage   : number;
  /** Lifetime in ms before auto-despawn. */
  lifetime : number;
  /** Collision radius in px. */
  radius   : number;
}

export const CANNON_SHOT_CONFIG: ProjectileConfig = {
  speed   : 14,
  damage  : 30,
  lifetime: 2000,
  radius  : 8,
};

export function createProjectile(
  origin  : Vec2,
  angle   : number,
  ownerId : string,
  config  : ProjectileConfig = CANNON_SHOT_CONFIG,
): ProjectileState {
  return {
    id       : `proj_${nextProjectileId++}`,
    position : { ...origin },
    velocityX: Math.cos(angle) * config.speed,
    velocityY: Math.sin(angle) * config.speed,
    damage   : config.damage,
    lifetime : config.lifetime,
    spent    : false,
    ownerId,
  };
}

export interface CollidableEnemy {
  id      : string;
  position: Vec2;
  hp      : number;
  maxHp   : number;
  hurtTimer: number;
  velocityX: number;
  velocityY: number;
  mass    : number;
  halfW   : number;
  halfH   : number;
}

export class ProjectileSystem {
  private projectiles: Map<string, { state: ProjectileState; radius: number }> = new Map();
  private bus: EventBus;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  spawn(state: ProjectileState, radius: number): void {
    this.projectiles.set(state.id, { state, radius });
  }

  /** Update all projectiles. Fills hitResults for caller to consume. */
  update(
    deltaMs    : number,
    enemies    : CollidableEnemy[],
    barrels    : Barrel[],
    hitResults : Array<{ projectileId: string; enemyId: string; damage: number }>,
  ): void {
    for (const [id, proj] of this.projectiles) {
      const s = proj.state;

      if (s.spent || s.lifetime <= 0) {
        this.projectiles.delete(id);
        continue;
      }

      // Move
      s.position.x += s.velocityX;
      s.position.y += s.velocityY;
      s.lifetime   -= deltaMs;

      // Check barrel collisions
      for (const barrel of barrels) {
        if (!barrel.isAlive) continue;
        if (barrel.isInBlastRadius(s.position)) {
          s.spent = true;
          this.bus.emit({
            type         : 'projectile_hit_barrel',
            projectileId : s.id,
            barrelId     : barrel.state.id,
          });
          break;
        }
      }
      if (s.spent) continue;

      // Check enemy collisions
      for (const e of enemies) {
        const dx    = Math.abs(s.position.x - e.position.x);
        const dy    = Math.abs(s.position.y - e.position.y);
        if (dx <= e.halfW + proj.radius && dy <= e.halfH + proj.radius) {
          s.spent = true;
          hitResults.push({ projectileId: s.id, enemyId: e.id, damage: s.damage });
          break;
        }
      }
    }
  }

  getAll(): ProjectileState[] {
    return [...this.projectiles.values()].map((p) => p.state);
  }

  clear(): void {
    this.projectiles.clear();
  }
}
