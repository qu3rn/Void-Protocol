/**
 * Programmatic pixel-art sprite sheet generator.
 * All characters are 16×16 pixels per frame, rendered at 2× scale in-game.
 * Palette follows the project's blue-violet + orange accent scheme.
 */
import { Texture, ImageSource } from 'pixi.js';

const FS = 16; // frame size (pixels)

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  T: null as null,   // transparent
  K: '#080510',      // dark outline
  D: '#0D0A1F',      // darkest bg
  B: '#1A1040',      // dark blue
  M: '#281C50',      // mid blue
  V: '#4755A0',      // blue-violet
  P: '#6C3BA0',      // violet
  L: '#A08EC0',      // light violet
  W: '#FFFFFF',      // white
  O: '#F28C28',      // orange
  N: '#FF9A3C',      // orange light
  E: '#C46010',      // orange dark
  R: '#DD1111',      // red (hurt)
} as const;

type PalKey = keyof typeof C;
type Rect = [number, number, number, number, PalKey]; // [x, y, w, h, colorKey]

function makeTexture(rects: Rect[]): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = FS;
  canvas.height = FS;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, FS, FS);
  for (const [x, y, w, h, key] of rects) {
    const color = C[key];
    if (!color) continue;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }
  const src = new ImageSource({ resource: canvas });
  return new Texture({ source: src });
}

// ── Player ────────────────────────────────────────────────────────────────────
// Cute hightech fantasy hero facing right (flip scaleX for left).

/** Shared player body (helmet + torso + arms). */
const PLAYER_BASE: Rect[] = [
  // Helmet outer
  [3, 0, 8, 1,  'M'],
  [2, 1, 10, 1, 'V'],
  [2, 2, 10, 5, 'V'],
  // Visor (orange) + eye (white)
  [3, 2, 3, 3,  'O'],
  [7, 2, 3, 3,  'W'],
  [6, 2, 1, 3,  'M'],  // divider
  // Neck connector
  [5, 7, 4, 1,  'M'],
  // Torso
  [2, 8, 10, 5, 'P'],
  // Chest stripe
  [4, 10, 5, 1, 'O'],
  // Shoulder pads
  [1, 7,  2, 2, 'V'],
  [11, 7, 2, 2, 'V'],
  // Arms
  [0, 8,  2, 4, 'V'],
  [12, 8, 2, 4, 'V'],
];

function playerLegsIdle(): Rect[] {
  return [
    [3, 13, 4, 3, 'V'],
    [8, 13, 4, 3, 'V'],
    [2, 15, 4, 1, 'M'],
    [8, 15, 4, 1, 'M'],
  ];
}

// 6-frame walk: alternating leg strides
const WALK_LEG_OFFSETS: Array<[number, number, number, number]> = [
  [-1, -1,  1,  1],
  [-1,  0,  1,  0],
  [ 0,  0,  0,  0],
  [ 1,  1, -1, -1],
  [ 1,  0, -1,  0],
  [ 0,  0,  0,  0],
];

function playerLegsWalk(frame: number): Rect[] {
  const [lx, ly, rx, ry] = WALK_LEG_OFFSETS[frame % 6];
  return [
    [3 + lx, 13 + ly, 4, 3, 'V'],
    [8 + rx, 13 + ry, 4, 3, 'V'],
    [2 + lx, 15 + ly, 4, 1, 'M'],
    [8 + rx, 15 + ry, 4, 1, 'M'],
  ];
}

// 4-frame attack: right arm extends forward in an arc
const ATTACK_ARM_FRAMES: Rect[][] = [
  [],
  [[12, 5, 3, 3, 'O'], [14, 3, 2, 3, 'O']],
  [[12, 5, 4, 2, 'N'], [13, 4, 3, 3, 'N'], [14, 2, 2, 3, 'O']],
  [[12, 7, 2, 4, 'O']],
];

function tintRects(rects: Rect[], tint: PalKey): Rect[] {
  return rects.map(([x, y, w, h]) => [x, y, w, h, tint]);
}

export function buildPlayerTextures(): Record<string, Texture[]> {
  // Idle – 4 frames, visor flickers O→N
  const idle: Texture[] = [0, 1, 2, 3].map((i) => {
    const visorColor: PalKey = i % 2 === 0 ? 'O' : 'N';
    const body: Rect[] = PLAYER_BASE.map((r) =>
      r[0] === 3 && r[1] === 2 && r[2] === 3 ? [r[0], r[1], r[2], r[3], visorColor] : r,
    );
    return makeTexture([...body, ...playerLegsIdle()]);
  });

  // Walk – 6 frames, legs striding
  const walk: Texture[] = [0, 1, 2, 3, 4, 5].map((i) =>
    makeTexture([...PLAYER_BASE, ...playerLegsWalk(i)]),
  );

  // Attack – 4 frames, arm slash
  const attack: Texture[] = [0, 1, 2, 3].map((i) =>
    makeTexture([...PLAYER_BASE, ...playerLegsIdle(), ...ATTACK_ARM_FRAMES[i]]),
  );

  // Hurt – 2 frames red flash
  const hurtBody = tintRects(PLAYER_BASE, 'R');
  const hurtLegs = tintRects(playerLegsIdle(), 'R');
  const hurt: Texture[] = [
    makeTexture([...hurtBody, ...hurtLegs]),
    makeTexture([...PLAYER_BASE, ...playerLegsIdle()]),
  ];

  return { idle, walk, attack, hurt };
}

// ── Grunt ─────────────────────────────────────────────────────────────────────
// Small round-headed aggressive humanoid. Violet palette.

const GRUNT_WALK_OFFSETS: Array<[number, number, number, number]> = [
  [-1, -1,  1,  1],
  [ 0,  0,  0,  0],
  [ 1,  1, -1, -1],
  [ 0,  0,  0,  0],
];

function buildGruntFrame(legVar: number, hurt: boolean): Texture {
  const col: PalKey = hurt ? 'R' : 'P';
  const leg: PalKey = hurt ? 'R' : 'V';
  const eyeCol: PalKey = hurt ? 'W' : 'R';
  const [lx, ly, rx, ry] = GRUNT_WALK_OFFSETS[legVar % 4];
  const rects: Rect[] = [
    // Round head
    [3,  0, 10, 7, col],
    // Angry eyes
    [4,  2,  2, 2, eyeCol],
    [10, 2,  2, 2, eyeCol],
    // Brow
    [4,  1,  3, 1, 'K'],
    [9,  1,  3, 1, 'K'],
    // Body
    [3,  7, 10, 5, col],
    // Short punching arms
    [1,  8,  2, 3, col],
    [13, 8,  2, 3, col],
    // Fists
    [0,  10, 3, 2, leg],
    [13, 10, 3, 2, leg],
    // Legs
    [4 + lx, 12 + ly, 3, 4, leg],
    [9 + rx, 12 + ry, 3, 4, leg],
  ];
  return makeTexture(rects);
}

export function buildGruntTextures(): Record<string, Texture[]> {
  const idle  = [0, 1, 0, 1].map((v) => buildGruntFrame(v, false));
  const walk  = [0, 1, 2, 3].map((i) => buildGruntFrame(i, false));
  const hurt  = [buildGruntFrame(0, true), buildGruntFrame(0, false)];
  return { idle, walk, hurt };
}

// ── Brute ─────────────────────────────────────────────────────────────────────
// Large blocky tank. Light-violet palette.

const BRUTE_WALK_OFFSETS: Array<[number, number, number, number]> = [
  [-1, 0,  1, 0],
  [ 0, 0,  0, 0],
  [ 1, 0, -1, 0],
  [ 0, 0,  0, 0],
];

function buildBruteFrame(legVar: number, hurt: boolean): Texture {
  const col: PalKey = hurt ? 'R' : 'L';
  const acc: PalKey = hurt ? 'R' : 'P';
  const [lx, ly, rx, ry] = BRUTE_WALK_OFFSETS[legVar % 4];
  const rects: Rect[] = [
    // Wide square head
    [2,  0, 12, 6, col],
    // Eyes
    [4,  2,  2, 2, 'B'],
    [10, 2,  2, 2, 'B'],
    // Grim mouth
    [5,  4,  6, 1, 'B'],
    // Wide body
    [1,  6, 14, 6, col],
    // Arms
    [0,  6,  2, 5, col],
    [14, 6,  2, 5, col],
    // Big fists
    [0,  11, 4, 3, acc],
    [12, 11, 4, 3, acc],
    // Thick legs
    [3 + lx, 12 + ly, 4, 4, acc],
    [9 + rx, 12 + ry, 4, 4, acc],
  ];
  return makeTexture(rects);
}

export function buildBruteTextures(): Record<string, Texture[]> {
  const idle  = [0, 1, 0, 1].map((v) => buildBruteFrame(v, false));
  const walk  = [0, 1, 2, 3].map((i) => buildBruteFrame(i, false));
  const hurt  = [buildBruteFrame(0, true), buildBruteFrame(0, false)];
  return { idle, walk, hurt };
}

// ── Speeder ───────────────────────────────────────────────────────────────────
// Lithe high-speed runner. Orange palette, elongated silhouette.

const SPEEDER_WALK_OFFSETS: Array<[number, number, number, number]> = [
  [-1, -2,  1,  2],
  [-1, -1,  1,  1],
  [ 0,  0,  0,  0],
  [ 1,  2, -1, -2],
  [ 1,  1, -1, -1],
  [ 0,  0,  0,  0],
];

function buildSpeederFrame(legVar: number, hurt: boolean): Texture {
  const col: PalKey = hurt ? 'R' : 'O';
  const acc: PalKey = hurt ? 'R' : 'E';
  const [lx, ly, rx, ry] = SPEEDER_WALK_OFFSETS[legVar % 6];
  const rects: Rect[] = [
    // Narrow head
    [5, 0, 6, 5, col],
    // Eye slits
    [5, 2, 2, 1, 'W'],
    [9, 2, 2, 1, 'W'],
    // Slim body
    [5, 5, 6, 6, col],
    [6, 6, 4, 4, acc],
    // Thin arms
    [3, 5, 2, 4, col],
    [11, 5, 2, 4, col],
    // Thin legs
    [6 + lx, 11 + ly, 2, 5, acc],
    [9 + rx, 11 + ry, 2, 5, acc],
  ];
  return makeTexture(rects);
}

export function buildSpeederTextures(): Record<string, Texture[]> {
  const idle  = [0, 2, 0, 2].map((v) => buildSpeederFrame(v, false));
  const walk  = [0, 1, 2, 3, 4, 5].map((i) => buildSpeederFrame(i, false));
  const hurt  = [buildSpeederFrame(0, true), buildSpeederFrame(0, false)];
  return { idle, walk, hurt };
}

// ── Map Tiles ─────────────────────────────────────────────────────────────────

export function buildMapTextures(): Record<string, Texture> {
  // Solid floor / wall interior
  const solid = makeTexture([
    [0,  0,  16, 16, 'B'],
    [1,  1,  14, 14, 'M'],
    [2,  2,  12, 12, 'B'],
    [3,  3,  10, 10, 'M'],
  ]);

  // Solid top-face (exposed top edge is bright)
  const solidTop = makeTexture([
    [0,  0,  16, 16, 'B'],
    [1,  1,  14, 14, 'M'],
    [0,  0,  16,  2, 'V'],   // bright top surface
    [1,  0,  14,  1, 'L'],   // highlight
  ]);

  // Left wall face
  const solidLeft = makeTexture([
    [0,  0,  16, 16, 'B'],
    [2,  0,  14, 16, 'M'],
    [0,  0,   2, 16, 'V'],
  ]);

  // Right wall face
  const solidRight = makeTexture([
    [0,  0,  16, 16, 'B'],
    [0,  0,  14, 16, 'M'],
    [14, 0,   2, 16, 'V'],
  ]);

  // Platform (passable from below, collision only from above)
  const platform = makeTexture([
    [0,  0,  16, 16, 'D'],   // transparent background
    [0,  0,  16,  4, 'M'],   // platform slab
    [1,  0,  14,  2, 'V'],   // bright top
    [0,  0,  16,  1, 'L'],   // top highlight
    [0,  4,  16,  2, 'B'],   // underside shadow
  ]);

  // Background (non-solid decoration)
  const bg = makeTexture([
    [0,  0,  16, 16, 'D'],
    [7,  7,   2,  2, 'B'],   // subtle dot
  ]);

  return { solid, solidTop, solidLeft, solidRight, platform, bg };
}
