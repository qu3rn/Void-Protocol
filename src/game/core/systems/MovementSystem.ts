/**
 * MovementSystem – handles acceleration, deceleration, drag, and jump.
 * Pure logic, no rendering imports.
 */

export interface MovableBody {
  velocityX: number;
  velocityY: number;
  isOnGround: boolean;
  /** Whether the jump button is currently held (for variable height). */
  jumpHeld: boolean;
}

export interface MovementConfig {
  /** Ground acceleration per frame. */
  groundAccel  : number;
  /** Air acceleration per frame (reduced for platformer feel). */
  airAccel     : number;
  /** Max horizontal speed. */
  maxSpeed     : number;
  /** Friction multiplier applied per frame when no directional input. */
  drag         : number;
  /** Initial upward velocity on jump. */
  jumpVelocity : number;
  /** Extra upward force applied each frame while jumpHeld is true. */
  jumpHoldForce: number;
  /** Number of frames jumpHoldForce is allowed after jump start. */
  jumpHoldMax  : number;
  /** Gravity per frame (added to vy). */
  gravity      : number;
  /** Terminal fall velocity. */
  maxFall      : number;
}

export const PLAYER_MOVEMENT: MovementConfig = {
  groundAccel  : 0.7,
  airAccel     : 0.35,
  maxSpeed     : 4.0,
  drag         : 0.84,
  jumpVelocity : -9.5,
  jumpHoldForce: 0.45,
  jumpHoldMax  : 12,
  gravity      : 0.45,
  maxFall      : 13,
};

export const ENEMY_MOVEMENT: MovementConfig = {
  groundAccel  : 0.5,
  airAccel     : 0.2,
  maxSpeed     : 2.5,
  drag         : 0.80,
  jumpVelocity : -9.5,
  jumpHoldForce: 0,
  jumpHoldMax  : 0,
  gravity      : 0.45,
  maxFall      : 13,
};

/**
 * Apply horizontal acceleration toward a target direction (-1, 0, +1).
 * Drag is only applied when there is no input (dir === 0).
 */
export function applyHorizontal(
  body  : MovableBody,
  dir   : number,
  config: MovementConfig,
): void {
  const accel = body.isOnGround ? config.groundAccel : config.airAccel;

  if (dir !== 0) {
    body.velocityX += dir * accel;
    // Clamp to max speed but allow knockback to exceed it naturally
    if (Math.abs(body.velocityX) > config.maxSpeed) {
      body.velocityX = Math.sign(body.velocityX) * config.maxSpeed;
    }
  } else {
    // Apply drag
    body.velocityX *= config.drag;
    if (Math.abs(body.velocityX) < 0.05) body.velocityX = 0;
  }
}

/**
 * Apply gravity. Call once per frame before collision resolution.
 */
export function applyGravityStep(body: MovableBody, config: MovementConfig): void {
  if (!body.isOnGround) {
    body.velocityY = Math.min(body.velocityY + config.gravity, config.maxFall);
  }
}

/** Track how many frames into the variable-jump hold we are. */
export function applyJumpHold(
  body      : MovableBody,
  holdFrames: number,
  config    : MovementConfig,
): void {
  if (
    body.jumpHeld &&
    holdFrames > 0 &&
    holdFrames <= config.jumpHoldMax &&
    body.velocityY < 0
  ) {
    body.velocityY -= config.jumpHoldForce;
  }
}
