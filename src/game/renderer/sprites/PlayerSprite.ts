import { Graphics } from 'pixi.js';
import type { Player } from '@game/core/entities/Player';
import { PLAYER_COLOR } from '@shared/constants';

export function createPlayerSprite(player: Player): Graphics {
  const g = new Graphics();
  g.circle(0, 0, 12).fill({ color: PLAYER_COLOR });

  g.x = player.state.position.x;
  g.y = player.state.position.y;

  return g;
}

export function syncPlayerSprite(g: Graphics, player: Player): void {
  g.x = player.state.position.x;
  g.y = player.state.position.y;
}
