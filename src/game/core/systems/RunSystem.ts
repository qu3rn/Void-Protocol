/**
 * RunSystem – tracks elapsed time and derives difficulty scaling.
 *
 * Difficulty formula: 1.0 + elapsedMs / 60_000
 * (grows by +1.0 per minute, capped at 6.0 — roughly +500% at 5 minutes)
 */
export class RunSystem {
  private _startMs  = 0;
  elapsedMs         = 0;
  difficulty        = 1.0;

  start(now: number): void {
    this._startMs  = now;
    this.elapsedMs = 0;
    this.difficulty = 1.0;
  }

  tick(now: number): void {
    this.elapsedMs  = now - this._startMs;
    this.difficulty = Math.min(6.0, 1.0 + this.elapsedMs / 60_000);
  }

  // ── Stat multipliers for enemies ─────────────────────────────────────────

  /** Enemy HP scales linearly with difficulty. */
  getEnemyHpMult(): number {
    return this.difficulty;
  }

  /** Enemy damage scales as √difficulty for softer scaling. */
  getEnemyDamageMult(): number {
    return Math.sqrt(this.difficulty);
  }

  /** Enemy speed scales very mildly. */
  getEnemySpeedMult(): number {
    return 1.0 + (this.difficulty - 1.0) * 0.08;
  }

  /** Formatted mm:ss string for the HUD. */
  formatTime(): string {
    const totalSec = Math.floor(this.elapsedMs / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
