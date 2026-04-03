# CLAUDE.md

## Project overview

This project is a **2D top-down tower defense / arena defense prototype** built for the web.

Core gameplay assumptions:

* 2D generative world
* top-down camera
* map-based combat
* 1 playable class at MVP stage
* 3 enemy types
* 3 upgrade types dropped randomly by enemies
* each enemy type can spawn as a boss variant after a defined kill threshold

The project should prioritize **fast iteration, modular architecture, and clean separation between gameplay logic, rendering, and UI**.

---

## Recommended tech stack

### Core stack

* **TypeScript**
* **Vite**
* **PixiJS**
* **React** for UI only
* **Zustand** for lightweight global/meta state
* **Vitest** for unit testing gameplay logic
* **ESLint + Prettier**

### Role of each tool

* **PixiJS** handles rendering, scene updates, map drawing, enemies, towers, projectiles, drops, and effects.
* **React** handles HUD, menus, overlays, settings, pause screen, upgrade selection, and debug panels.
* **Gameplay logic must stay outside React**.
* **Zustand** should manage UI state and lightweight meta-state, not frame-by-frame gameplay.
* **Vitest** should cover deterministic logic such as spawning rules, drop logic, boss thresholds, and upgrade effects.

---

## Architecture principles

### Separation of concerns

* Keep **UI separate from gameplay logic**.
* Keep **rendering separate from rules/systems**.
* Prefer **data-driven configuration** over hardcoded behavior.
* Build systems so they can scale beyond MVP without major refactors.

### Recommended runtime split

1. **Game core**

   * pure TypeScript
   * entities, systems, rules, progression, spawning, upgrades, boss logic
2. **Renderer**

   * PixiJS scene graph and visuals
3. **UI layer**

   * React components for player-facing interface

### Do not

* Do not build gameplay state directly in React state.
* Do not tightly couple Pixi rendering code with game rules.
* Do not hardcode enemy, boss, or upgrade behavior directly inside scene code.

---

## Recommended folder structure

```txt
src/
  game/
    core/
      entities/
      systems/
      rules/
      generators/
    renderer/
      pixi/
      scenes/
      sprites/
    data/
      enemies/
      upgrades/
      towers/
      player/
    utils/
  ui/
    components/
    screens/
    hud/
  shared/
    types/
    constants/
```

### Folder responsibilities

* `game/core` → gameplay rules and systems
* `game/renderer` → Pixi-specific rendering
* `game/data` → config for enemies, upgrades, towers, and player data
* `ui` → React-based interface
* `shared` → shared types and constants

---

## Gameplay systems required for MVP

### Player

* 1 playable class
* movement
* basic combat interaction
* health and core stats

### Enemies

* 3 enemy types
* each enemy should define:

  * hp
  * speed
  * damage
  * reward value
  * drop chance
  * boss variant config

### Boss system

* bosses appear after killing a defined number of enemies
* each enemy type can have a boss variant
* boss spawning should be controlled by a dedicated system:

  * kill counter
  * threshold config
  * spawn rule
  * boss variant selection

### Upgrades

* 3 upgrade types
* random drops from enemies
* upgrades should be data-driven:

  * id
  * label
  * effect type
  * value
  * rarity or drop weight

### Map / world

* top-down map
* generative world or procedural field generation
* should support enemy spawning, traversal, and combat readability

### Defense layer

For MVP, prefer **arena defense / hybrid defense** over a full classic tower defense grid.

Recommended MVP approach:

* player moves in a top-down space
* enemies attack or pressure the defended zone
* upgrades and structures can expand the defensive layer later

This is faster to prototype and easier to validate than full pathfinding-heavy tower defense.

---

## Why this stack fits the project

### PixiJS

Use PixiJS because it is a strong fit for:

* 2D rendering
* top-down gameplay
* maps, waves, enemies, projectiles, and effects
* better control over rendering than DOM-based approaches

### React

Use React only where React is strong:

* HUD
* menus
* overlays
* upgrade picker
* settings/debug views

### TypeScript

Use TypeScript everywhere for:

* safer entity/system contracts
* scalable data definitions
* more maintainable gameplay code

### Zustand

Use Zustand for:

* UI visibility
* game session metadata
* upgrade selection modal state
* pause/debug toggles

Do not use it for high-frequency per-frame entity simulation.

---

## Testing guidance

Use **Vitest** for unit tests around deterministic systems:

* enemy spawn rules
* boss threshold logic
* drop logic
* upgrade application
* numeric calculations and balancing helpers

Avoid over-testing renderer internals.
Test logic, not frame-by-frame visuals.

---

## Delivery priorities

### MVP priorities

1. core loop working
2. procedural or generative map/field
3. one playable character
4. three enemy types
5. upgrade drops
6. boss threshold system
7. minimal HUD and progression feedback

### Later priorities

* more classes
* more enemy archetypes
* structures or tower placement
* advanced pathing
* visual effects and polish
* save/progression systems

---

## Final recommendation

Build the project with:

* **TypeScript**
* **Vite**
* **PixiJS**
* **React for UI**
* **Zustand**
* **Vitest**

And organize it around:

* gameplay in pure TypeScript
* rendering in PixiJS
* interface in React

This gives the best balance of:

* rapid iteration
* clean architecture
* web delivery
* portfolio value
* room for future expansion
