/**
 * SkillScalingSystem – holds the current weapon and exposes stat multipliers.
 *
 * GameScene (and Pirate) read from this to scale:
 *   - damage dealt
 *   - melee knockback
 *   - AoE radius (barrel/explosion)
 *   - projectile count per Cannon Shot
 *
 * Attack-speed (cooldown multiplier) is applied directly to SkillSystem slots
 * via reequip – call applyToSkillSystem() after setting a new weapon.
 */
import type { WeaponConfig, WeaponMods } from '@shared/types';
import type { SkillSystem } from '@game/core/systems/SkillSystem';
import type { SkillDef } from '@game/core/systems/SkillSystem';

export class SkillScalingSystem {
  private _weapon: WeaponConfig | null = null;

  getWeapon(): WeaponConfig | null {
    return this._weapon;
  }

  setWeapon(weapon: WeaponConfig | null): void {
    this._weapon = weapon;
  }

  private get mods(): WeaponMods {
    return this._weapon?.mods ?? {};
  }

  getDamageMult()     : number { return this.mods.damageMultiplier ?? 1.0; }
  getAttackSpeedMult(): number { return this.mods.attackSpeedMult   ?? 1.0; }
  getProjectileCount(): number { return this.mods.projectileCount   ?? 1;   }
  getAoeRadiusMult()  : number { return this.mods.aoeRadiusMult     ?? 1.0; }
  getKnockbackMult()  : number { return this.mods.knockbackMult     ?? 1.0; }

  /**
   * Re-equip `baseSkills` into `skillSystem` with scaled cooldowns.
   * Call this whenever the equipped weapon changes.
   */
  applyToSkillSystem(
    skillSystem: SkillSystem,
    baseSkills : [SkillDef<unknown>, SkillDef<unknown>, SkillDef<unknown>],
  ): void {
    const cdMult = this.getAttackSpeedMult();
    skillSystem.equip(0, { ...baseSkills[0], cooldownMs: baseSkills[0].cooldownMs * cdMult });
    skillSystem.equip(1, { ...baseSkills[1], cooldownMs: baseSkills[1].cooldownMs * cdMult });
    skillSystem.equip(2, { ...baseSkills[2], cooldownMs: baseSkills[2].cooldownMs * cdMult });
  }
}
