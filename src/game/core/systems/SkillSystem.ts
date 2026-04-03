/**
 * SkillSystem – data-driven active skill slots.
 * Each skill has a cooldown, a trigger, and an execute callback.
 * New skills (dash, ranged, AoE) can be added without touching the player class.
 */
import type { Vec2 } from '@shared/types';

export type SkillTrigger = 'attack' | 'skill1' | 'skill2';

export interface SkillContext {
  position   : Vec2;
  facingRight: boolean;
  velocityX  : number;
  velocityY  : number;
  isOnGround : boolean;
}

/**
 * A skill definition.
 * `execute` receives the context and a mutator for applying side-effects
 * (velocity changes, spawning projectiles, etc.). It returns any data the
 * caller needs (e.g. list of hit positions for the renderer).
 */
export interface SkillDef<TResult = void> {
  id           : string;
  label        : string;
  cooldownMs   : number;
  trigger      : SkillTrigger;
  execute      : (ctx: SkillContext, mutate: SkillMutator) => TResult;
}

export interface SkillMutator {
  setVelocity(vx: number, vy: number): void;
  addVelocity(dvx: number, dvy: number): void;
}

export interface SkillSlot {
  def          : SkillDef<unknown>;
  lastUsedMs   : number;
}

export class SkillSystem {
  private slots: [SkillSlot | null, SkillSlot | null, SkillSlot | null] = [null, null, null];

  /** Assign a skill to a slot (0, 1, or 2). */
  equip(index: 0 | 1 | 2, def: SkillDef<unknown>): void {
    this.slots[index] = { def, lastUsedMs: 0 };
  }

  /** Returns true if the skill can be used right now. */
  isReady(index: 0 | 1 | 2, now: number): boolean {
    const slot = this.slots[index];
    if (!slot) return false;
    return now - slot.lastUsedMs >= slot.def.cooldownMs;
  }

  /**
   * Execute a skill by slot index.
   * Returns the skill's result, or null if on cooldown / empty.
   */
  use<T = unknown>(
    index  : 0 | 1 | 2,
    now    : number,
    ctx    : SkillContext,
    mutator: SkillMutator,
  ): T | null {
    const slot = this.slots[index];
    if (!slot || !this.isReady(index, now)) return null;
    slot.lastUsedMs = now;
    return slot.def.execute(ctx, mutator) as T;
  }

  /** Remaining cooldown in ms for a slot (0 if ready or empty). */
  cooldownRemaining(index: 0 | 1 | 2, now: number): number {
    const slot = this.slots[index];
    if (!slot) return 0;
    return Math.max(0, slot.def.cooldownMs - (now - slot.lastUsedMs));
  }

  /** Snapshot of all slot states for the HUD. */
  getSlotStates(now: number): Array<{ id: string; label: string; readyFraction: number } | null> {
    return this.slots.map((slot) => {
      if (!slot) return null;
      const elapsed  = now - slot.lastUsedMs;
      const fraction = Math.min(1, elapsed / slot.def.cooldownMs);
      return { id: slot.def.id, label: slot.def.label, readyFraction: fraction };
    });
  }
}
