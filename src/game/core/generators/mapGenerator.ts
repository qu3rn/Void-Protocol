import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '@shared/constants';
import type { Vec2 } from '@shared/types';

export interface MapData {
  widthTiles: number;
  heightTiles: number;
  tiles: number[][];   // 0 = air, 1 = solid
  spawnPoints: Vec2[];
}

/** Procedurally generated side-scrolling platformer arena. */
export function generateMap(): MapData {
  // Map is 2.5× the screen width and slightly taller than the viewport
  const widthTiles  = Math.ceil((GAME_WIDTH * 2.5) / TILE_SIZE);
  const heightTiles = Math.ceil(GAME_HEIGHT / TILE_SIZE);

  // Fill with air
  const tiles: number[][] = Array.from({ length: heightTiles }, () =>
    Array(widthTiles).fill(0),
  );

  // Ceiling (row 0)
  for (let col = 0; col < widthTiles; col++) tiles[0][col] = 1;

  // Floor (bottom 2 rows)
  for (let row = heightTiles - 2; row < heightTiles; row++) {
    for (let col = 0; col < widthTiles; col++) tiles[row][col] = 1;
  }

  // Side walls
  for (let row = 0; row < heightTiles; row++) {
    tiles[row][0]               = 1;
    tiles[row][widthTiles - 1]  = 1;
  }

  // Procedural platforms
  const floorRow   = heightTiles - 2;
  const minRow     = 4;
  const maxRow     = floorRow - 3;
  const numPlats   = 12 + Math.floor(Math.random() * 8);
  let cursor       = 4; // starting column

  for (let i = 0; i < numPlats; i++) {
    const platW = 3 + Math.floor(Math.random() * 6);   // 3–8 tiles wide
    const gap   = 2 + Math.floor(Math.random() * 4);   // 2–5 tile gap
    const col   = cursor + gap;
    const row   = minRow + Math.floor(Math.random() * (maxRow - minRow));

    if (col + platW >= widthTiles - 2) break;

    for (let c = col; c < col + platW; c++) {
      tiles[row][c] = 1;
    }
    cursor = col + platW;
  }

  // Spawn points on the ground, spaced across the map
  const groundY = (floorRow) * TILE_SIZE;
  const spawnPoints: Vec2[] = [
    { x: TILE_SIZE * 3,        y: groundY },
    { x: TILE_SIZE * 15,       y: groundY },
    { x: TILE_SIZE * 30,       y: groundY },
    { x: TILE_SIZE * 50,       y: groundY },
    { x: TILE_SIZE * 70,       y: groundY },
  ];

  return { widthTiles, heightTiles, tiles, spawnPoints };
}
