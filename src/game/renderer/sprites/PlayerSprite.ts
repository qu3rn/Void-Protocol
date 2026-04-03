import { AnimatedSprite } from 'pixi.js';
import type { Texture } from 'pixi.js';
import type { Player } from '@game/core/entities/Player';
import { buildPlayerTextures } from './spriteSheetGenerator';

export class PlayerAnimSprite {
  readonly sprite: AnimatedSprite;
  private textures: Record<string, Texture[]>;
  private currentState = '';

  constructor() {
    this.textures     = buildPlayerTextures();
    this.sprite       = new AnimatedSprite(this.textures.idle);
    this.sprite.scale.set(2);
    this.sprite.anchor.set(0.5, 1); // pivot at feet-centre
    this.sprite.animationSpeed = 0.12;
    this.sprite.play();
  }

  private setState(state: string): void {
    if (this.currentState === state) return;
    this.currentState         = state;
    this.sprite.textures      = this.textures[state] ?? this.textures.idle;
    this.sprite.currentFrame  = 0;
    this.sprite.play();
  }

  sync(player: Player): void {
    this.sprite.x       = player.state.position.x;
    this.sprite.y       = player.state.position.y;
    this.sprite.scale.x = player.state.facingRight ? 2 : -2;
    this.setState(player.state.animState);
  }
}
