export type EnemyType = 'grunt' | 'brute' | 'speeder';
export type PlayerAnimState = 'idle' | 'walk' | 'attack' | 'hurt';
export type EnemyAnimState  = 'idle' | 'walk' | 'hurt';

export interface Vec2 {
  x: number;
  y: number;
}

export interface EntityStats {
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
}

export interface PlayerState extends EntityStats {
  position: Vec2;
  lastAttackTime: number;
  velocityX: number;
  velocityY: number;
  isOnGround: boolean;
  facingRight: boolean;
  animState: PlayerAnimState;
  hurtTimer: number;
}

export interface EnemyState extends EntityStats {
  id: string;
  type: EnemyType;
  position: Vec2;
  reward: number;
  isBoss: boolean;
  velocityX: number;
  velocityY: number;
  isOnGround: boolean;
  facingRight: boolean;
  animState: EnemyAnimState;
  hurtTimer: number;
  patrolDir: 1 | -1;
}

export interface EnemyConfig {
  type: EnemyType;
  hp: number;
  speed: number;
  damage: number;
  reward: number;
  dropChance: number;
  bossMultiplier: number;
  bossThreshold: number;
}

export interface UpgradeType {
  id: string;
  label: string;
  effectType: 'damage' | 'speed' | 'health';
  value: number;
  dropWeight: number;
}

export interface GameSessionMeta {
  waveNumber: number;
  score: number;
  killCount: number;
  isPaused: boolean;
}

// ── Pirate-specific entities ─────────────────────────────────────────────────

export interface BarrelState {
  id       : string;
  position : Vec2;
  /** Remaining lifetime in ms. */
  lifetime : number;
  /** Slow multiplier applied to enemies in range (0.0–1.0, lower = slower). */
  slowMult : number;
  /** Radius of the slow aura in px. */
  slowRadius     : number;
  /** Explosion radius in px. */
  explodeRadius  : number;
  /** Damage dealt on explosion. */
  explodeDamage  : number;
  /** Whether this barrel has already exploded. */
  exploded : boolean;
}

export interface ProjectileState {
  id        : string;
  position  : Vec2;
  velocityX : number;
  velocityY : number;
  damage    : number;
  /** Remaining lifetime in ms. */
  lifetime  : number;
  /** Whether it has already hit something. */
  spent     : boolean;
  /** Owner id for friendly-fire exclusion. */
  ownerId   : string;
}

/** Interaction events fired between entities. */
export type GameEvent =
  | { type: 'projectile_hit_barrel'; projectileId: string; barrelId: string }
  | { type: 'barrel_explode'; barrelId: string; position: Vec2 }
  | { type: 'enemy_slowed'; enemyId: string; slowMult: number };
