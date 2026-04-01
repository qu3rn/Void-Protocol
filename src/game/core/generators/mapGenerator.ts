import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '@shared/constants';
import type { Vec2 } from '@shared/types';

export interface MapData {
  widthTiles: number;
  heightTiles: number;
  tiles: number[][];
  spawnPoints: Vec2[];
}

/**
 * Generates a simple flat map with border walls and
 * randomised enemy spawn positions along the edges.
 */
export function generateMap(): MapData {
  const widthTiles = Math.ceil(GAME_WIDTH / TILE_SIZE);
  const heightTiles = Math.ceil(GAME_HEIGHT / TILE_SIZE);

  const tiles: number[][] = [];
  for (let row = 0; row < heightTiles; row++) {
    tiles[row] = [];
    for (let col = 0; col < widthTiles; col++) {
      const isBorder = row === 0 || row === heightTiles - 1 || col === 0 || col === widthTiles - 1;
      tiles[row][col] = isBorder ? 1 : 0;
    }
  }

  const spawnPoints: Vec2[] = [
    { x: TILE_SIZE, y: TILE_SIZE },
    { x: GAME_WIDTH - TILE_SIZE * 2, y: TILE_SIZE },
    { x: TILE_SIZE, y: GAME_HEIGHT - TILE_SIZE * 2 },
    { x: GAME_WIDTH - TILE_SIZE * 2, y: GAME_HEIGHT - TILE_SIZE * 2 },
  ];

  return { widthTiles, heightTiles, tiles, spawnPoints };
}
