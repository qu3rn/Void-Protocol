/**
 * LootSystem – decides what drops on enemy death and tracks active drops.
 *
 * Rarity weights: common 60 / rare 30 / epic 10
 * Each drop is a WeaponConfig at a world position.
 * GameScene renders drops as Graphics and calls checkPickup() each frame.
 */
import type { LootDrop, Rarity, Vec2 } from '@shared/types';
import { getWeaponsByRarity } from '@game/data/weapons/weaponConfig';

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 60,
  rare  : 30,
  epic  : 10,
};

let nextDropId = 0;

export class LootSystem {
  private _drops: Map<string, LootDrop> = new Map();

  // ── Drop creation ─────────────────────────────────────────────────────────

  /**
   * Probabilistically create a loot drop at `position`.
   * Returns the drop if one was created, null otherwise.
   */
  tryRoll(position: Vec2, dropChance: number): LootDrop | null {
    if (Math.random() > dropChance) return null;

    const rarity = this._rollRarity();
    const pool   = getWeaponsByRarity(rarity);
    if (pool.length === 0) return null;

    const weapon = pool[Math.floor(Math.random() * pool.length)];
    const drop: LootDrop = {
      id      : `drop_${nextDropId++}`,
      position: { x: position.x, y: position.y - 8 }, // float slightly above ground
      weapon,
      rarity,
    };
    this._drops.set(drop.id, drop);
    return drop;
  }

  // ── Pickup ────────────────────────────────────────────────────────────────

  /**
   * Check if `playerPos` is close enough to any drop.
   * Returns the picked-up drop and removes it from tracking.
   */
  checkPickup(playerPos: Vec2, radius = 28): LootDrop | null {
    for (const drop of this._drops.values()) {
      const dx = playerPos.x - drop.position.x;
      const dy = playerPos.y - drop.position.y;
      if (Math.sqrt(dx * dx + dy * dy) <= radius) {
        this._drops.delete(drop.id);
        return drop;
      }
    }
    return null;
  }

  getDrops(): LootDrop[] {
    return [...this._drops.values()];
  }

  removeDrop(id: string): void {
    this._drops.delete(id);
  }

  clear(): void {
    this._drops.clear();
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  private _rollRarity(): Rarity {
    const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS) as [Rarity, number][]) {
      r -= weight;
      if (r <= 0) return rarity;
    }
    return 'common';
  }
}
