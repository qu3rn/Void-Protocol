export type EnemyType = 'grunt' | 'brute' | 'speeder';

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
}

export interface EnemyState extends EntityStats {
  id: string;
  type: EnemyType;
  position: Vec2;
  reward: number;
  isBoss: boolean;
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
