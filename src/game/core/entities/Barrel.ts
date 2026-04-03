/**
 * Barrel – deployable slow-zone that can be exploded by a Cannon Shot.
 */
import type { BarrelState, Vec2 } from '@shared/types';

let nextBarrelId = 0;

export interface BarrelConfig {
  lifetime      : number;  // ms
  slowMult      : number;  // e.g. 0.4 → 40% speed
  slowRadius    : number;  // px
  explodeRadius : number;  // px
  explodeDamage : number;
}

export const BARREL_CONFIG: BarrelConfig = {
  lifetime      : 6000,
  slowMult      : 0.45,
  slowRadius    : 64,
  explodeRadius : 96,
  explodeDamage : 40,
};

export class Barrel {
  state: BarrelState;

  constructor(position: Vec2, config: BarrelConfig = BARREL_CONFIG) {
    this.state = {
      id           : `barrel_${nextBarrelId++}`,
      position     : { ...position },
      lifetime     : config.lifetime,
      slowMult     : config.slowMult,
      slowRadius   : config.slowRadius,
      explodeRadius: config.explodeRadius,
      explodeDamage: config.explodeDamage,
      exploded     : false,
    };
  }

  /** Tick lifetime down. Returns true if still alive. */
  tick(deltaMs: number): boolean {
    if (this.state.exploded) return false;
    this.state.lifetime -= deltaMs;
    return this.state.lifetime > 0;
  }

  /** True when an enemy centre is inside the slow aura. */
  isInSlowRange(pos: Vec2): boolean {
    if (this.state.exploded) return false;
    const dx = pos.x - this.state.position.x;
    const dy = pos.y - this.state.position.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.state.slowRadius;
  }

  /** True when a point is inside the explosion radius. */
  isInBlastRadius(pos: Vec2): boolean {
    const dx = pos.x - this.state.position.x;
    const dy = pos.y - this.state.position.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.state.explodeRadius;
  }

  /** Mark barrel as exploded (cannot trigger twice). */
  explode(): void {
    this.state.exploded  = true;
    this.state.lifetime  = 0;
  }

  get isAlive(): boolean {
    return !this.state.exploded && this.state.lifetime > 0;
  }
}
