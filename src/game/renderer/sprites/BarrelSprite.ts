/**
 * BarrelSprite – pixel-art barrel rendered with PixiJS Graphics.
 * Brown body, orange bands, fuse on top.
 */
import { Graphics } from 'pixi.js';
import type { Barrel } from '@game/core/entities/Barrel';

const W = 12;  // px
const H = 14;  // px

export class BarrelSprite {
  readonly gfx: Graphics;

  constructor() {
    this.gfx = new Graphics();
    this._draw(false);
  }

  /** Re-draw with flash=true to show explosion imminence (optional future use). */
  sync(barrel: Barrel): void {
    const s  = barrel.state;
    const px = s.position.x - W / 2;
    const py = s.position.y - H;
    this.gfx.x = px;
    this.gfx.y = py;
    // Fade out in the last 500ms
    this.gfx.alpha = s.lifetime > 500 ? 1 : s.lifetime / 500;
  }

  private _draw(_exploding: boolean): void {
    const g = this.gfx;
    g.clear();

    // Barrel body (brown)
    g.rect(1, 2, W - 2, H - 2).fill({ color: 0x6b3a1f });
    // Top cap
    g.rect(0, 1, W, 2).fill({ color: 0x8a4f2a });
    // Bottom cap
    g.rect(0, H - 3, W, 2).fill({ color: 0x8a4f2a });
    // Metal bands (orange-brown)
    g.rect(0, 4, W, 2).fill({ color: 0xc46010 });
    g.rect(0, H - 6, W, 2).fill({ color: 0xc46010 });
    // Outline
    g.rect(0, 0, W, H).stroke({ color: 0x080510, width: 1 });
    // Fuse on top (orange)
    g.moveTo(W / 2, 0).lineTo(W / 2 + 3, -4).stroke({ color: 0xf28c28, width: 2 });
  }
}

/** Create a simple cannonball Graphics object. */
export function makeCannonballGfx(): Graphics {
  const g = new Graphics();
  g.circle(0, 0, 5).fill({ color: 0x1a1040 });
  g.circle(0, 0, 5).stroke({ color: 0x4755a0, width: 1 });
  // Small highlight
  g.circle(-1, -1, 1).fill({ color: 0x6c3ba0 });
  return g;
}
