export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const TILE_SIZE = 32;

// Platformer physics
export const GRAVITY          = 0.45;
export const MAX_FALL_SPEED   = 12;
export const JUMP_VELOCITY    = -9.5;
export const PLAYER_RUN_SPEED = 3.5;

// Player physics body (game-world pixels)
export const PLAYER_BODY_W = 18;
export const PLAYER_BODY_H = 28;

export const PLAYER_INITIAL_HP = 100;
export const PLAYER_SPEED = 3.5;

export const SLASH_RADIUS = 60;
export const SLASH_COOLDOWN_MS = 400;

export const BASIC_ATTACK_REACH = 40;        // halfW for basic attack hitbox
export const BASIC_ATTACK_COOLDOWN_MS = 280; // fast, repeatable
export const CUTLASS_SLASH_REACH = 72;       // halfW for the big slowing slash
export const CUTLASS_SLASH_COOLDOWN_MS = 900;
export const SLOW_MULT = 0.38;               // velocity multiplier when slowed (lower = slower)
export const SLOW_DURATION_MS = 2000;

export const MAP_BG_COLOR = 0x0d0a1f;
export const TILE_COLOR_DARK = 0x1a1040;
export const TILE_COLOR_LIGHT = 0x1e1550;
export const TILE_ACCENT_COLOR = 0x281c50;

export const PLAYER_COLOR = 0x4755a0;
export const PLAYER_ACCENT_COLOR = 0xf28c28;
export const BOSS_COLOR_TINT = 0xf28c28;
export const ENEMY_COLORS: Record<string, number> = {
  grunt: 0x6c3ba0,
  brute: 0xa08ec0,
  speeder: 0xf28c28,
};
