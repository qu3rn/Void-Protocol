/**
 * Built-in skill definitions for the player.
 * Add new skills here; equip them in Player constructor via SkillSystem.equip().
 */
import type { SkillDef } from '@game/core/systems/SkillSystem';
import { PLAYER_BODY_W, PLAYER_BODY_H, SLASH_RADIUS, SLASH_COOLDOWN_MS } from '@shared/constants';

export interface MeleeResult {
  hitBoxCX: number;
  hitBoxCY: number;
  halfW   : number;
  halfH   : number;
}

/** Slot 0 – fast melee bash (chainable). */
export const SKILL_BASH: SkillDef<MeleeResult> = {
  id         : 'bash',
  label      : 'Bash',
  cooldownMs : SLASH_COOLDOWN_MS,
  trigger    : 'attack',
  execute(ctx) {
    const facing  = ctx.facingRight ? 1 : -1;
    const halfW   = SLASH_RADIUS / 2;
    const halfH   = PLAYER_BODY_H * 0.7;
    const hitBoxCX = ctx.position.x + facing * (PLAYER_BODY_W / 2 + halfW);
    const hitBoxCY = ctx.position.y - PLAYER_BODY_H / 2;
    // No self-velocity change for a basic bash
    return { hitBoxCX, hitBoxCY, halfW, halfH };
  },
};

/** Slot 1 – placeholder (forward dash, to be implemented). */
export const SKILL_DASH: SkillDef<void> = {
  id         : 'dash',
  label      : 'Dash',
  cooldownMs : 800,
  trigger    : 'skill1',
  execute(ctx, mutate) {
    const facing = ctx.facingRight ? 1 : -1;
    mutate.setVelocity(facing * 9, ctx.velocityY);
  },
};

/** Slot 2 – placeholder (area burst, to be implemented). */
export const SKILL_BURST: SkillDef<void> = {
  id         : 'burst',
  label      : 'Burst',
  cooldownMs : 3000,
  trigger    : 'skill2',
  execute(_ctx, _mutate) {
    // TODO: implement AoE burst
  },
};
