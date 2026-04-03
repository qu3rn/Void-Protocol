# Project Overview

This project is a **2D side-scrolling platformer arena defense prototype** built for the web.

## Core Gameplay Assumptions

- 2D side-scrolling platformer world  
- Side camera with horizontal scroll  
- Map-based combat on procedural platformer levels  
- 1 playable class at MVP stage (Pirate)  
- 3 enemy types (grunt, brute, speeder)  
- 3 upgrade types dropped randomly by enemies  
- Each enemy type can spawn as a boss variant after a defined kill threshold  

The project should prioritize:

- Fast iteration  
- Modular architecture  
- Clean separation between gameplay logic, rendering, and UI  

---

# Recommended Tech Stack

## Core Stack

- TypeScript  
- Vite  
- PixiJS  
- React (UI only)  
- Zustand  
- Vitest  
- ESLint + Prettier  

## Role of Each Tool

### PixiJS

- Rendering  
- Scene updates  
- Map drawing  
- Enemies, towers, projectiles, drops, effects  

### React

- HUD  
- Menus  
- Overlays  
- Settings  
- Pause screen  
- Upgrade selection  
- Debug panels  

### Rules

- Gameplay logic must stay outside React  
- Zustand is for UI/meta state only (NOT frame-by-frame simulation)  
- Vitest should cover deterministic gameplay logic  

---

# Architecture Principles

## Separation of Concerns

- UI separate from gameplay logic  
- Rendering separate from rules/systems  
- Prefer data-driven configuration  
- Avoid hardcoded behavior  

## Runtime Split

### Game Core

- Pure TypeScript  
- Entities, systems, rules, progression  

### Renderer

- PixiJS scene graph  

### UI

- React components  

## Do Not

- ❌ Do not build gameplay state in React  
- ❌ Do not mix Pixi rendering with logic  
- ❌ Do not hardcode enemy or upgrade behavior in scenes  

---

# Folder Structure

src/
  game/
    core/
      entities/       ← Player, Enemy, Barrel, Pirate
      systems/        ← PhysicsSystem, MovementSystem, CombatSystem, SkillSystem, InputHandler, EventBus, ProjectileSystem
      rules/
      generators/     ← mapGenerator (procedural platformer)
      utils/          ← vec2.ts
    renderer/
      pixi/
      scenes/         ← GameScene
      sprites/        ← PlayerSprite, EnemySprite, BarrelSprite, spriteSheetGenerator
    data/
      enemies/
      upgrades/
      towers/
      player/
        pirate/       ← pirateConfig, pirateSkills
  ui/
    components/
    screens/
    hud/
  shared/
    types/
    constants/

## Folder Responsibilities

- `game/core` → gameplay systems  
- `game/renderer` → Pixi rendering  
- `game/data` → configs  
- `ui` → React interface  
- `shared` → shared types/constants  

---

# Gameplay Systems (MVP)

## Player

- Acceleration-based horizontal movement + variable-hold jump  
- Combat interaction via SkillSystem (3 slots)  
- Health, knockback, hurt timer  
- Subclassed per hero (Pirate extends Player)  

## Enemies

Each enemy defines:

- HP  
- Speed  
- Damage  
- Reward value  
- Drop chance  
- Boss variant config  

## Boss System

- Triggered after kill threshold  
- Each enemy type has a boss variant  
- Controlled by:
  - Kill counter  
  - Threshold  
  - Spawn logic  

## Upgrades

- 3 types  
- Random drops  
- Data-driven:
  - id  
  - label  
  - effect  
  - value  
  - rarity  

## Map / World

- Side-scrolling platformer, 2.5× screen width  
- Procedural generation (floating platforms, ground layer)  
- AABB tile collision via PhysicsSystem  
- 16×16 tiles, rendered via spriteSheetGenerator  

## Defense Layer

Use **arena defense (hybrid)** for MVP:

- Player moves freely across platformer level  
- Enemies chase or patrol  
- Expand later into towers  

---

# Visual Style & Color Palette

Use the **60–30–10 rule**:

- 60% → deep blue / violet (#281C50, #4755A0)  
- 30% → neutral / lighter tones  
- 10% → orange accent (#F28C28)  

Style:

- Cute high-tech fantasy  
- Neon / cyberpunk feel  

---

# Sprite Sheets & Animations

All sprites are **programmatic pixel art** generated via Canvas API in `spriteSheetGenerator.ts`. 16×16px per frame.

## Player

- Idle: 4 frames  
- Walk: 6 frames  
- Attack: 4 frames  
- Hurt: 2 frames  

## Enemies (grunt, brute, speeder)

- Idle: 4 frames  
- Walk: 4–6 frames  
- Hurt: 2 frames  
- Boss = modified version  

## Effects

- Melee arc (orange, setTimeout cleanup)  
- Double-blink red on hurt  
- Explosion ring (animated grow + fade)  

## Tiles

- 16×16  
- Types: solid, solidTop, solidLeft, solidRight, platform, bg  
- Seamless  

---

# UI

## HUD
- health bar 
- experience bar with small level digit above it
- gameplay time on middle of the screen
- corner boss image and wave progess 2 digits

---

# Movement and Interaction System

## Core Principle

Everything is based on:

- Velocity  
- Acceleration  
- Impulses  

Never directly manipulate position outside physics.

---

## Movement Physics

- Acceleration-based horizontal (groundAccel=0.7, airAccel=0.35)  
- Drag per frame (0.84)  
- Gravity: 0.45/frame, maxFall: 13  
- Jump velocity: -9.5, variable hold up to 12 frames  
- `MovementSystem.ts` — config-driven, shared by player + enemies  

---

## Combat

- AABB melee hit detection (`CombatSystem.ts`)  
- Impulse knockback, friction decay  
- Contact damage with 800ms cooldown  
- Double-blink red hurt feedback  

---

## Skills System

- 3 active skill slots (`SkillSystem.ts`)  
- `SkillDef<T>` — typed result, cooldown, trigger, execute  
- `SkillContext` + `SkillMutator` passed at runtime  
- Results returned to GameScene for entity spawning  

---

## Input

- `InputHandler.ts` — just-pressed vs held, `flush()` end of frame  
- A/D = move · Space/W/↑ = jump · Z = attack · X = skill1 · C = skill2  

---

## EventBus

- Synchronous pub/sub (`EventBus.ts`)  
- `GameEvent` discriminated union  
- Used for: `projectile_hit_barrel` → `barrel_explode` chain  

---

# Game details

## Heroes

- Pirate (`Pirate.ts` extends `Player`)

## Pirate Skills

| Slot | Key | Skill | Cooldown |
|------|-----|-------|----------|
| 0 | Z | Cutlass Slash | 400ms |
| 1 | X | Powder Barrel | 4000ms |
| 2 | C | Cannon Shot | 1200ms |

## Pirate Skills Behavior

- **Cutlass Slash** — wide arc melee, returns `MeleeResult` hitbox  
- **Powder Barrel** — deploy slow-zone barrel ahead; explodes on cannon hit; damages nearby enemies  
- **Cannon Shot** — fires cannonball projectile; detonates barrels on contact  

---

# Testing Guidance

Use Vitest for:

- Spawn rules  
- Boss logic  
- Drops  
- Upgrades  
- Math systems  

Avoid testing rendering.

---

# Delivery Priorities

## MVP

1. Core loop  
2. Procedural map  
3. Player  
4. Enemies  
5. Upgrades  
6. Boss system  
7. HUD  

## Later

- More classes  
- More enemies  
- Towers  
- Pathfinding  
- Visual polish  
- Progression  

---

# Final Recommendation

## Stack

- TypeScript  
- Vite  
- PixiJS  
- React  
- Zustand  
- Vitest  

## Architecture

- Gameplay → TypeScript core  
- Rendering → PixiJS  
- UI → React  

## Goal

- Fast iteration  
- Clean structure  
- Scalable systems  
- Strong portfolio-quality project  
