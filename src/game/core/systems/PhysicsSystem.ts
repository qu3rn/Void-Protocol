/**
 * Platformer physics: gravity, AABB tile collision.
 * Entity position (x, y) is the CENTRE-BOTTOM (feet) of the body.
 */
import type { MapData } from '@game/core/generators/mapGenerator';
import { TILE_SIZE, GRAVITY, MAX_FALL_SPEED } from '@shared/constants';

export interface PhysicsBody {
  x: number;
  y: number;         // bottom of entity (feet)
  vx: number;
  vy: number;
  width: number;
  height: number;
  isOnGround: boolean;
}

// Tile value 1 = solid (blocks all sides)
// Anything else = passable
function tileAt(map: MapData, col: number, row: number): number {
  if (col < 0 || col >= map.widthTiles || row < 0 || row >= map.heightTiles) return 1;
  return map.tiles[row][col];
}

function isSolid(map: MapData, col: number, row: number): boolean {
  return tileAt(map, col, row) === 1;
}

export function applyGravity(body: PhysicsBody): void {
  if (!body.isOnGround) {
    body.vy = Math.min(body.vy + GRAVITY, MAX_FALL_SPEED);
  }
}

export function resolveAndMove(body: PhysicsBody, map: MapData): void {
  // Horizontal pass
  body.x += body.vx;
  resolveHorizontal(body, map);

  // Vertical pass
  body.isOnGround = false;
  body.y += body.vy;
  resolveVertical(body, map);
}

function resolveHorizontal(body: PhysicsBody, map: MapData): void {
  const hw     = body.width / 2;
  const topY   = body.y - body.height + 2; // slightly inside top edge
  const midY   = body.y - body.height / 2;
  const botY   = body.y - 2;               // slightly inside bottom edge

  if (body.vx > 0) {
    const rightX = body.x + hw;
    for (const checkY of [topY, midY, botY]) {
      const col = Math.floor(rightX / TILE_SIZE);
      const row = Math.floor(checkY / TILE_SIZE);
      if (isSolid(map, col, row)) {
        body.x  = col * TILE_SIZE - hw;
        body.vx = 0;
        break;
      }
    }
  } else if (body.vx < 0) {
    const leftX = body.x - hw;
    for (const checkY of [topY, midY, botY]) {
      const col = Math.floor(leftX / TILE_SIZE);
      const row = Math.floor(checkY / TILE_SIZE);
      if (isSolid(map, col, row)) {
        body.x  = (col + 1) * TILE_SIZE + hw;
        body.vx = 0;
        break;
      }
    }
  }
}

function resolveVertical(body: PhysicsBody, map: MapData): void {
  const hw   = body.width / 2 - 2; // slightly inside sides
  const leftX  = body.x - hw;
  const midX   = body.x;
  const rightX = body.x + hw;

  if (body.vy >= 0) {
    // Falling / standing: check bottom
    const bottomY = body.y;
    for (const checkX of [leftX, midX, rightX]) {
      const col = Math.floor(checkX / TILE_SIZE);
      const row = Math.floor(bottomY / TILE_SIZE);
      if (isSolid(map, col, row)) {
        body.y          = row * TILE_SIZE; // land on top of tile
        body.vy         = 0;
        body.isOnGround = true;
        break;
      }
    }
  } else {
    // Rising: check top edge
    const topY = body.y - body.height;
    for (const checkX of [leftX, midX, rightX]) {
      const col = Math.floor(checkX / TILE_SIZE);
      const row = Math.floor(topY   / TILE_SIZE);
      if (isSolid(map, col, row)) {
        body.y  = (row + 1) * TILE_SIZE + body.height;
        body.vy = 0;
        break;
      }
    }
  }
}

/** True if the tile directly below a given point is solid (used for edge detection). */
export function tileBelow(map: MapData, worldX: number, worldY: number): boolean {
  const col = Math.floor(worldX / TILE_SIZE);
  const row = Math.floor((worldY + 2) / TILE_SIZE);
  return isSolid(map, col, row);
}
