/**
 * SpawnSystem – controls when and what enemies spawn.
 *
 * Spawn interval shrinks as difficulty grows.
 * Enemy type is picked via weighted random roll.
 * Spawn position alternates between map left/right edges.
 */
import type { EnemyType } from '@shared/types';

const SPAWN_TABLE: Array<{ type: EnemyType; weight: number }> = [
  { type: 'grunt',   weight: 50 },
  { type: 'speeder', weight: 30 },
  { type: 'brute',   weight: 20 },
];

/** Base spawn interval in ms at difficulty 1.0. */
const BASE_INTERVAL_MS = 3500;
/** Minimum interval regardless of difficulty. */
const MIN_INTERVAL_MS  = 500;

export class SpawnSystem {
  private _lastSpawnMs = 0;
  private _side: 'left' | 'right' = 'right';

  // ── Timing ────────────────────────────────────────────────────────────────

  intervalMs(difficulty: number): number {
    return Math.max(MIN_INTERVAL_MS, BASE_INTERVAL_MS / difficulty);
  }

  shouldSpawn(now: number, difficulty: number): boolean {
    return now - this._lastSpawnMs >= this.intervalMs(difficulty);
  }

  markSpawned(now: number): void {
    this._lastSpawnMs = now;
  }

  reset(now: number): void {
    this._lastSpawnMs = now;
    this._side = 'right';
  }

  // ── Enemy type ────────────────────────────────────────────────────────────

  rollType(): EnemyType {
    const total = SPAWN_TABLE.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    for (const entry of SPAWN_TABLE) {
      r -= entry.weight;
      if (r <= 0) return entry.type;
    }
    return 'grunt';
  }

  // ── Spawn position ────────────────────────────────────────────────────────

  /** Returns the X coordinate for the next spawn. Alternates sides. */
  nextSpawnX(mapWidthPx: number, tileSize: number): number {
    this._side = this._side === 'left' ? 'right' : 'left';
    return this._side === 'left' ? tileSize * 2 : mapWidthPx - tileSize * 2;
  }

  // ── Boss ──────────────────────────────────────────────────────────────────

  shouldSpawnBoss(killCount: number, difficulty: number): boolean {
    return killCount > 0 && killCount % 20 === 0 && difficulty >= 1.5;
  }
}
