import { AnimatedSprite } from 'pixi.js';
import type { Texture } from 'pixi.js';
import type { Enemy } from '@game/core/entities/Enemy';
import type { EnemyType } from '@shared/types';
import {
  buildGruntTextures,
  buildBruteTextures,
  buildSpeederTextures,
} from './spriteSheetGenerator';

// Cache texture sets per type so we only build them once
const textureCache: Partial<Record<EnemyType, Record<string, Texture[]>>> = {};

function getTextures(type: EnemyType): Record<string, Texture[]> {
  if (!textureCache[type]) {
    if      (type === 'grunt')   textureCache[type] = buildGruntTextures();
    else if (type === 'brute')   textureCache[type] = buildBruteTextures();
    else                         textureCache[type] = buildSpeederTextures();
  }
  return textureCache[type]!;
}

export class EnemyAnimSprite {
  readonly sprite: AnimatedSprite;
  private textures: Record<string, Texture[]>;
  private currentState = '';

  constructor(enemy: Enemy) {
    this.textures  = getTextures(enemy.state.type);
    this.sprite    = new AnimatedSprite(this.textures.idle);
    // Bosses render larger
    const scale    = enemy.state.isBoss ? 2.8 : 2;
    this.sprite.scale.set(scale);
    this.sprite.anchor.set(0.5, 1);
    this.sprite.animationSpeed = enemy.state.type === 'speeder' ? 0.18 : 0.1;
    this.sprite.play();
  }

  private setState(state: string): void {
    if (this.currentState === state) return;
    this.currentState         = state;
    this.sprite.textures      = this.textures[state] ?? this.textures.idle;
    this.sprite.currentFrame  = 0;
    this.sprite.play();
  }

  sync(enemy: Enemy): void {
    this.sprite.x       = enemy.state.position.x;
    this.sprite.y       = enemy.state.position.y;
    this.sprite.scale.x = Math.abs(this.sprite.scale.x) * (enemy.state.facingRight ? 1 : -1);
    this.setState(enemy.state.animState);
  }
}
