/**
 * CombatSystem – melee hit detection and impulse-based knockback.
 * Pure logic, no rendering imports.
 */
import type { Vec2 } from '@shared/types';
import { directionTo, clamp } from '@game/core/utils/vec2';

export interface Hittable {
  position : Vec2;
  velocityX: number;
  velocityY: number;
  hp       : number;
  maxHp    : number;
  hurtTimer: number;
  /** Knockback received is divided by mass (higher = harder to push). */
  mass     : number;
}

export interface MeleeAttack {
  /** Centre of the attacker. */
  origin     : Vec2;
  /** Facing direction (+1 right / -1 left). */
  facing     : number;
  /** Half-width of the attack rectangle. */
  halfW      : number;
  /** Half-height of the attack rectangle. */
  halfH      : number;
  /** Horizontal offset from origin to rectangle centre. */
  offsetX    : number;
  /** Raw damage to deal. */
  damage     : number;
  /** Horizontal impulse magnitude to apply on hit. */
  knockbackX : number;
  /** Upward impulse magnitude to apply on hit (always upward). */
  knockbackY : number;
}

export interface KnockbackConfig {
  /** Friction multiplier applied per frame to knockback velocity. */
  friction: number;
}

export const DEFAULT_KNOCKBACK: KnockbackConfig = {
  friction: 0.82,
};

/** HURT_DURATION in ms for the double-blink effect. */
export const HURT_DURATION_MS = 400;

/**
 * Test whether a target centre falls within the melee attack rectangle.
 */
export function isInMeleeRange(target: Vec2, atk: MeleeAttack): boolean {
  const cx = atk.origin.x + atk.facing * atk.offsetX;
  const cy = atk.origin.y;
  return (
    Math.abs(target.x - cx) <= atk.halfW &&
    Math.abs(target.y - cy) <= atk.halfH
  );
}

/**
 * Apply damage + impulse knockback to a target.
 * The knockback direction is from attacker origin → target.
 */
export function applyHit(source: Vec2, target: Hittable, atk: MeleeAttack): void {
  target.hp = Math.max(0, target.hp - atk.damage);
  target.hurtTimer = HURT_DURATION_MS;

  const dir = directionTo(source, target.position);
  const impulseX = dir.x * atk.knockbackX;
  const impulseY = clamp(dir.y, -1, 0) * atk.knockbackY - 1.5; // always slightly upward

  target.velocityX += impulseX / target.mass;
  target.velocityY += impulseY / target.mass;
}

/**
 * Decay knockback velocity toward zero each frame.
 * Call this every frame for every entity that can receive knockback.
 * Normal movement acceleration will fight this naturally, so we only
 * apply extra friction when the entity is in a hurt state.
 */
export function decayKnockback(
  body  : { velocityX: number; velocityY: number; hurtTimer: number },
  config: KnockbackConfig = DEFAULT_KNOCKBACK,
): void {
  if (body.hurtTimer > 0) {
    body.velocityX *= config.friction;
  }
}
