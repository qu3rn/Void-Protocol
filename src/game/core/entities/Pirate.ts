/**
 * Pirate – first playable character class.
 *
 * Extends Player with:
 *   Slot 0 – Cutlass Slash  (melee, returns MeleeResult)
 *   Slot 1 – Powder Barrel  (drop deployable, result stored in pendingBarrel)
 *   Slot 2 – Cannon Shot    (fire projectile, result stored in pendingShot)
 *
 * GameScene polls `pendingBarrel` and `pendingShot` after processInput() and
 * creates the appropriate entities, then clears the pending fields by setting
 * them back to null.
 */
import { Player } from '@game/core/entities/Player';
import { PIRATE_CONFIG } from '@game/data/player/pirate/pirateConfig';
import {
  SKILL_CUTLASS,
  SKILL_POWDER_BARREL,
  SKILL_CANNON_SHOT,
  type BarrelDropResult,
  type CannonShotResult,
} from '@game/data/player/pirate/pirateSkills';
import type { SkillDef } from '@game/core/systems/SkillSystem';
import type { MeleeResult } from '@game/data/player/skills';
import type { InputSnapshot } from '@game/core/systems/InputHandler';
import {
  PLAYER_MOVEMENT,
  applyHorizontal,
  applyJumpHold,
} from '@game/core/systems/MovementSystem';
import type { MovableBody } from '@game/core/systems/MovementSystem';
import { SkillScalingSystem } from '@game/core/systems/SkillScalingSystem';
import type { WeaponConfig } from '@shared/types';
import { BASIC_ATTACK_REACH, BASIC_ATTACK_COOLDOWN_MS, PLAYER_BODY_W, PLAYER_BODY_H } from '@shared/constants';

/** The three base skills in slot order – used when re-equipping with scaled cooldowns. */
const BASE_SKILLS = [SKILL_CUTLASS, SKILL_POWDER_BARREL, SKILL_CANNON_SHOT] as const;

export class Pirate extends Player {
  /** Set by processInput when the cutlass slash fires; null it after consuming. */
  pendingCutlass: MeleeResult      | null = null;
  /** Set by processInput when the barrel skill fires; null it after consuming. */
  pendingBarrel : BarrelDropResult | null = null;
  /** Set by processInput when the cannon skill fires; null it after consuming. */
  pendingShot   : CannonShotResult | null = null;

  readonly skillScaling = new SkillScalingSystem();

  private lastBasicAttackTime = 0;

  constructor() {
    super();

    // Override base stats with pirate values
    Object.assign(this.state, PIRATE_CONFIG.initialStats);

    // Equip pirate-specific skills
    this.skills.equip(0, SKILL_CUTLASS       as SkillDef<unknown>);
    this.skills.equip(1, SKILL_POWDER_BARREL as SkillDef<unknown>);
    this.skills.equip(2, SKILL_CANNON_SHOT   as SkillDef<unknown>);
  }

  // ── Weapon equip ──────────────────────────────────────────────────────────

  equipWeapon(weapon: WeaponConfig | null): void {
    this.skillScaling.setWeapon(weapon);
    this.skillScaling.applyToSkillSystem(
      this.skills,
      BASE_SKILLS as unknown as [SkillDef<unknown>, SkillDef<unknown>, SkillDef<unknown>],
    );
  }

  override processInput(input: InputSnapshot, now: number): void {
    const s    = this.state;
    const dirX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    // facingRight is set each frame from mouse position in GameScene — do not override here

    // Horizontal movement
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

    // ── Skills ────────────────────────────────────────────────────────────────
    const mutator = this._mutator();
    const ctx     = this._ctx();

    if (input.attack) {
      const res = this.skills.use<MeleeResult>(0, now, ctx, mutator);
      if (res) {
        s.lastAttackTime  = now;
        this.pendingCutlass = res;
      }
    }

    if (input.skill1) {
      const res = this.skills.use<BarrelDropResult>(1, now, ctx, mutator);
      if (res) this.pendingBarrel = res;
    }

    if (input.skill2) {
      const res = this.skills.use<CannonShotResult>(2, now, ctx, mutator);
      if (res) this.pendingShot = res;
    }
  }

  performBasicAttack(now: number): MeleeResult | null {
    if (now - this.lastBasicAttackTime < BASIC_ATTACK_COOLDOWN_MS) return null;
    this.lastBasicAttackTime = now;
    const s      = this.state;
    const facing = s.facingRight ? 1 : -1;
    const halfW  = BASIC_ATTACK_REACH;
    const halfH  = PLAYER_BODY_H * 0.6;
    const hitBoxCX = s.position.x + facing * (PLAYER_BODY_W / 2 + halfW);
    const hitBoxCY = s.position.y - PLAYER_BODY_H / 2;
    s.lastAttackTime = now;
    return { hitBoxCX, hitBoxCY, halfW, halfH };
  }
}
