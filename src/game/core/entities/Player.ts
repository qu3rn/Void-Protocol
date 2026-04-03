import type { PlayerState } from '@shared/types';
import { PLAYER_CONFIG } from '@game/data/player/playerConfig';
import { PLAYER_BODY_H } from '@shared/constants';
import { SkillSystem } from '@game/core/systems/SkillSystem';
import type { SkillDef } from '@game/core/systems/SkillSystem';
import { PLAYER_MOVEMENT, applyHorizontal, applyGravityStep, applyJumpHold } from '@game/core/systems/MovementSystem';
import type { MovableBody } from '@game/core/systems/MovementSystem';
import { decayKnockback } from '@game/core/systems/CombatSystem';
import { SKILL_BASH, SKILL_DASH, SKILL_BURST } from '@game/data/player/skills';
import type { MeleeResult } from '@game/data/player/skills';
import type { InputSnapshot } from '@game/core/systems/InputHandler';

export const PLAYER_MASS = 1.0;
export { PLAYER_BODY_H };

export class Player {
  state: PlayerState;
  readonly skills: SkillSystem;
  protected jumpHoldFrames = 0;

  constructor() {
    this.state = {
      ...PLAYER_CONFIG.initialStats,
      position   : { ...PLAYER_CONFIG.initialPosition },
      lastAttackTime: 0,
      velocityX  : 0,
      velocityY  : 0,
      isOnGround : false,
      facingRight: true,
      animState  : 'idle',
      hurtTimer  : 0,
    };

    this.skills = new SkillSystem();
    this.skills.equip(0, SKILL_BASH  as SkillDef<unknown>);
    this.skills.equip(1, SKILL_DASH  as SkillDef<unknown>);
    this.skills.equip(2, SKILL_BURST as SkillDef<unknown>);
  }

  // ── Input ─────────────────────────────────────────────────────────────────

  processInput(input: InputSnapshot, now: number): void {
    const s    = this.state;
    const dirX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (dirX !== 0) s.facingRight = dirX > 0;

    const body: MovableBody = {
      velocityX : s.velocityX,
      velocityY : s.velocityY,
      isOnGround: s.isOnGround,
      jumpHeld  : input.jumpHeld,
    };

    applyHorizontal(body, dirX, PLAYER_MOVEMENT);
    s.velocityX = body.velocityX;

    // Jump
    if (input.jumpPressed && s.isOnGround) {
      s.velocityY         = PLAYER_MOVEMENT.jumpVelocity;
      s.isOnGround        = false;
      this.jumpHoldFrames = 1;
    } else if (input.jumpHeld && this.jumpHoldFrames > 0) {
      this.jumpHoldFrames++;
    } else {
      this.jumpHoldFrames = 0;
    }

    // Variable jump hold (suppress gravity briefly)
    if (this.jumpHoldFrames > 0) {
      const jbody: MovableBody = {
        velocityX : s.velocityX,
        velocityY : s.velocityY,
        isOnGround: s.isOnGround,
        jumpHeld  : input.jumpHeld,
      };
      applyJumpHold(jbody, this.jumpHoldFrames, PLAYER_MOVEMENT);
      s.velocityY = jbody.velocityY;
    }

    // Skill triggers
    const mutator = this._mutator();
    const ctx     = this._ctx();
    if (input.attack) {
      const res = this.skills.use<MeleeResult>(0, now, ctx, mutator);
      if (res) s.lastAttackTime = now;
    }
    if (input.skill1) this.skills.use(1, now, ctx, mutator);
    if (input.skill2) this.skills.use(2, now, ctx, mutator);
  }

  // ── Physics ───────────────────────────────────────────────────────────────

  applyPhysics(jumpHeld: boolean): void {
    const s    = this.state;
    const body: MovableBody = {
      velocityX : s.velocityX,
      velocityY : s.velocityY,
      isOnGround: s.isOnGround,
      jumpHeld,
    };
    applyGravityStep(body, PLAYER_MOVEMENT);
    s.velocityY = body.velocityY;
    decayKnockback(s);
    if (s.hurtTimer > 0) s.hurtTimer -= 16;
  }

  // ── Animation ─────────────────────────────────────────────────────────────

  updateAnimState(now: number): void {
    const s = this.state;
    if (s.hurtTimer > 0)                    { s.animState = 'hurt';   return; }
    if (now - s.lastAttackTime < 350)       { s.animState = 'attack'; return; }
    s.animState = Math.abs(s.velocityX) > 0.1 ? 'walk' : 'idle';
  }

  // ── Health ────────────────────────────────────────────────────────────────

  takeDamage(amount: number): void {
    const s   = this.state;
    s.hp      = Math.max(0, s.hp - amount);
    s.hurtTimer = 400;
  }

  heal(amount: number): void {
    const s = this.state;
    s.hp    = Math.min(s.maxHp, s.hp + amount);
  }

  get isAlive(): boolean {
    return this.state.hp > 0;
  }

  // ── Skill query ───────────────────────────────────────────────────────────

  /** Returns the melee hit-box if bash is off cooldown (and marks it used). */
  tryBash(now: number): MeleeResult | null {
    return this.skills.use<MeleeResult>(0, now, this._ctx(), this._mutator());
  }

  // ── Protected helpers (available to subclasses) ───────────────────────────

  protected _ctx() {
    const s = this.state;
    return {
      position   : { ...s.position },
      facingRight: s.facingRight,
      velocityX  : s.velocityX,
      velocityY  : s.velocityY,
      isOnGround : s.isOnGround,
    };
  }

  protected _mutator() {
    const s = this.state;
    return {
      setVelocity: (vx: number, vy: number) => { s.velocityX = vx; s.velocityY = vy; },
      addVelocity: (dvx: number, dvy: number) => { s.velocityX += dvx; s.velocityY += dvy; },
    };
  }
}
