/**
 * Pirate skill definitions.
 *
 * SKILL_CUTLASS   (slot 0) – fast arc melee, returns MeleeResult.
 * SKILL_POWDER_BARREL (slot 1) – drop a barrel at feet, returns spawn Vec2.
 * SKILL_CANNON_SHOT   (slot 2) – fire a cannonball, returns spawn data.
 *
 * GameScene consumes the return values of slots 1 & 2 to create entities.
 */
import type { SkillDef } from '@game/core/systems/SkillSystem';
import type { Vec2 } from '@shared/types';
import { PLAYER_BODY_W, PLAYER_BODY_H, SLASH_COOLDOWN_MS } from '@shared/constants';
import type { MeleeResult } from '@game/data/player/skills';

// ── Re-export for external convenience ────────────────────────────────────────
export type { MeleeResult };

/** Value returned by SKILL_CANNON_SHOT so GameScene can spawn the projectile. */
export interface CannonShotResult {
  spawnPosition: Vec2;
  /** Radians – horizontal, facing-aware. */
  angle        : number;
}

/** Value returned by SKILL_POWDER_BARREL so GameScene can spawn the Barrel. */
export interface BarrelDropResult {
  spawnPosition: Vec2;
}

// ── Slot 0 – Cutlass Slash ────────────────────────────────────────────────────
/** Wider, slightly stronger melee than the generic Bash. */
export const SKILL_CUTLASS: SkillDef<MeleeResult> = {
  id        : 'cutlass',
  label     : 'Cutlass',
  cooldownMs: SLASH_COOLDOWN_MS,
  trigger   : 'attack',
  execute(ctx) {
    const facing   = ctx.facingRight ? 1 : -1;
    const halfW    = (PLAYER_BODY_W / 2 + 36) / 2;           // 36 px reach
    const halfH    = PLAYER_BODY_H * 0.65;
    const hitBoxCX = ctx.position.x + facing * (PLAYER_BODY_W / 2 + halfW);
    const hitBoxCY = ctx.position.y - PLAYER_BODY_H / 2;
    return { hitBoxCX, hitBoxCY, halfW, halfH };
  },
};

// ── Slot 1 – Powder Barrel ────────────────────────────────────────────────────
/** Drop a barrel just ahead of the player; GameScene creates the Barrel entity. */
export const SKILL_POWDER_BARREL: SkillDef<BarrelDropResult> = {
  id        : 'powder_barrel',
  label     : 'Powder Barrel',
  cooldownMs: 4000,
  trigger   : 'skill1',
  execute(ctx) {
    const facing = ctx.facingRight ? 1 : -1;
    return {
      spawnPosition: {
        x: ctx.position.x + facing * 24,
        y: ctx.position.y,
      },
    };
  },
};

// ── Slot 2 – Cannon Shot ──────────────────────────────────────────────────────
/** Fire a cannonball; GameScene uses ProjectileSystem to spawn it. */
export const SKILL_CANNON_SHOT: SkillDef<CannonShotResult> = {
  id        : 'cannon_shot',
  label     : 'Cannon Shot',
  cooldownMs: 1200,
  trigger   : 'skill2',
  execute(ctx) {
    const facing = ctx.facingRight ? 1 : -1;
    // Slight downward arc if airborne, flat otherwise
    const angleY = ctx.isOnGround ? 0 : 0.1;
    return {
      spawnPosition: {
        x: ctx.position.x + facing * (PLAYER_BODY_W / 2 + 10),
        y: ctx.position.y - PLAYER_BODY_H * 0.6,
      },
      angle: facing > 0 ? angleY : Math.PI - angleY,
    };
  },
};
