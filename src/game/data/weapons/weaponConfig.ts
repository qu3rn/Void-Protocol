import type { WeaponConfig } from '@shared/types';

export const WEAPON_CONFIGS: WeaponConfig[] = [
  // ── Common ───────────────────────────────────────────────────────────────
  {
    id    : 'rusty_cutlass',
    label : 'Rusty Cutlass',
    rarity: 'common',
    mods  : { damageMultiplier: 1.25, attackSpeedMult: 0.9 },
  },
  {
    id    : 'double_barrel',
    label : 'Double Barrel',
    rarity: 'common',
    mods  : { projectileCount: 2 },
  },
  {
    id    : 'heavy_flint',
    label : 'Heavy Flint',
    rarity: 'common',
    mods  : { knockbackMult: 1.8, damageMultiplier: 1.1 },
  },
  {
    id    : 'blasting_powder',
    label : 'Blasting Powder',
    rarity: 'common',
    mods  : { aoeRadiusMult: 1.5 },
  },

  // ── Rare ─────────────────────────────────────────────────────────────────
  {
    id    : 'tri_cannon',
    label : 'Triple Cannon',
    rarity: 'rare',
    mods  : { projectileCount: 3, damageMultiplier: 1.15 },
  },
  {
    id    : 'tempered_blade',
    label : 'Tempered Blade',
    rarity: 'rare',
    mods  : { damageMultiplier: 1.6, attackSpeedMult: 0.8 },
  },
  {
    id    : 'powder_heart',
    label : 'Powder Heart',
    rarity: 'rare',
    mods  : { aoeRadiusMult: 2.0, damageMultiplier: 1.2 },
  },
  {
    id    : 'swift_blade',
    label : 'Swift Blade',
    rarity: 'rare',
    mods  : { attackSpeedMult: 0.6, damageMultiplier: 1.1 },
  },

  // ── Epic ──────────────────────────────────────────────────────────────────
  {
    id    : 'elder_cannon',
    label : 'Elder Cannon',
    rarity: 'epic',
    mods  : { projectileCount: 5, damageMultiplier: 1.4, aoeRadiusMult: 1.6 },
  },
  {
    id    : 'deathblade',
    label : 'Deathblade',
    rarity: 'epic',
    mods  : { damageMultiplier: 2.2, attackSpeedMult: 0.65 },
  },
  {
    id    : 'storm_cannon',
    label : 'Storm Cannon',
    rarity: 'epic',
    mods  : { projectileCount: 4, attackSpeedMult: 0.7, knockbackMult: 2.0 },
  },
];

/** Pool of weapons filtered by rarity. */
export function getWeaponsByRarity(rarity: WeaponConfig['rarity']): WeaponConfig[] {
  return WEAPON_CONFIGS.filter((w) => w.rarity === rarity);
}
