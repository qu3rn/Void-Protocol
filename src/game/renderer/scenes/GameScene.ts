import { Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import type { Application, Texture } from 'pixi.js';
import { Pirate } from '@game/core/entities/Pirate';
import { Enemy, getEnemyMass } from '@game/core/entities/Enemy';
import { Barrel } from '@game/core/entities/Barrel';
import { generateMap } from '@game/core/generators/mapGenerator';
import type { MapData } from '@game/core/generators/mapGenerator';
import { PlayerAnimSprite } from '@game/renderer/sprites/PlayerSprite';
import { EnemyAnimSprite } from '@game/renderer/sprites/EnemySprite';
import { BarrelSprite, makeCannonballGfx } from '@game/renderer/sprites/BarrelSprite';
import { buildMapTextures } from '@game/renderer/sprites/spriteSheetGenerator';
import { resolveAndMove, tileBelow } from '@game/core/systems/PhysicsSystem';
import { InputHandler } from '@game/core/systems/InputHandler';
import { isInMeleeRange, applyHit } from '@game/core/systems/CombatSystem';
import { EventBus } from '@game/core/systems/EventBus';
import { ProjectileSystem, createProjectile, CANNON_SHOT_CONFIG } from '@game/core/systems/ProjectileSystem';
import { RunSystem } from '@game/core/systems/RunSystem';
import { SpawnSystem } from '@game/core/systems/SpawnSystem';
import { LootSystem } from '@game/core/systems/LootSystem';
import { getEnemyConfig } from '@game/data/enemies/enemyConfig';
import { TILE_SIZE, GAME_WIDTH, PLAYER_BODY_W, PLAYER_BODY_H } from '@shared/constants';
import { useGameStore } from '@store/useGameStore';
import type { EnemyType, ProjectileState, LootDrop } from '@shared/types';

const ENEMY_BODY: Record<EnemyType, { w: number; h: number }> = {
  grunt  : { w: 14, h: 24 },
  brute  : { w: 18, h: 28 },
  speeder: { w: 10, h: 24 },
};

const SAME_LEVEL_THRESHOLD = TILE_SIZE * 2;
const CONTACT_DAMAGE_COOLDOWN = 800; // ms between contact-damage ticks
const PLAYER_MASS = 1.0;

/** Flash a sprite 2× red for the double-blink hurt effect. */
function doubleBlink(sprite: { tint: number }, durationMs: number): void {
  const original = sprite.tint;
  let phase = 0;
  const step = () => {
    phase++;
    sprite.tint = phase % 2 === 1 ? 0xff2222 : original;
    if (phase < 4) setTimeout(step, durationMs / 4);
    else sprite.tint = original;
  };
  step();
}

export class GameScene {
  private app         : Application;
  private world       : Container;
  private player      : Pirate;
  private playerAnim  : PlayerAnimSprite;
  private enemies     : Map<string, { entity: Enemy; anim: EnemyAnimSprite }> = new Map();
  private barrels     : Map<string, { entity: Barrel; sprite: BarrelSprite }> = new Map();
  private projectiles : Map<string, { state: ProjectileState; gfx: Graphics }> = new Map();
  private lootDrops   : Map<string, { drop: LootDrop; gfx: Container }> = new Map();
  private map         : MapData;
  private input       : InputHandler;
  private eventBus    : EventBus;
  private projSystem  : ProjectileSystem;
  private runSystem   : RunSystem;
  private spawnSystem : SpawnSystem;
  private lootSystem  : LootSystem;
  private onDeath     : () => void;
  private cameraX     = 0;
  private lastContactDamage = 0;
  private _isDead     = false;
  private readonly _tickFn: () => void;

  constructor(app: Application, onDeath: () => void) {
    this.app     = app;
    this.onDeath = onDeath;
    this.world = new Container();
    app.stage.addChild(this.world);

    this.map = generateMap();
    this.renderMap();

    // ── Systems ─────────────────────────────────────────────────────────────
    this.eventBus   = new EventBus();
    this.projSystem = new ProjectileSystem(this.eventBus);
    this.runSystem  = new RunSystem();
    this.spawnSystem = new SpawnSystem();
    this.lootSystem  = new LootSystem();

    const now = Date.now();
    this.runSystem.start(now);
    this.spawnSystem.reset(now);

    // Barrel detonation chain: projectile hit → explode → AoE
    this.eventBus.on('projectile_hit_barrel', (e) => {
      const barrel = this.barrels.get(e.barrelId);
      if (!barrel || !barrel.entity.isAlive) return;
      barrel.entity.explode();
      this.eventBus.emit({
        type    : 'barrel_explode',
        barrelId: e.barrelId,
        position: { ...barrel.entity.state.position },
      });
    });

    this.eventBus.on('barrel_explode', (e) => {
      const barrel = this.barrels.get(e.barrelId);
      if (!barrel) return;
      const bs      = barrel.entity.state;
      const aoeMult = this.player.skillScaling.getAoeRadiusMult();
      const dmg     = bs.explodeDamage * this.player.skillScaling.getDamageMult();
      for (const { entity, anim } of this.enemies.values()) {
        if (!entity.isAlive) continue;
        // apply scaled blast radius
        const dx = entity.state.position.x - bs.position.x;
        const dy = entity.state.position.y - bs.position.y;
        if (Math.sqrt(dx * dx + dy * dy) <= bs.explodeRadius * aoeMult) {
          entity.state.hp        = Math.max(0, entity.state.hp - dmg);
          entity.state.hurtTimer = 400;
          doubleBlink(anim.sprite, 400);
        }
      }
      // Visual burst
      this._showExplodeFx(e.position.x, e.position.y, bs.explodeRadius);
    });

    const groundY = (this.map.heightTiles - 2) * TILE_SIZE;
    this.player   = new Pirate();
    this.player.state.position.x = TILE_SIZE * 3 + PLAYER_BODY_W / 2;
    this.player.state.position.y = groundY;

    this.playerAnim = new PlayerAnimSprite();
    this.world.addChild(this.playerAnim.sprite);

    this.spawnEnemies();
    this.input = new InputHandler();

    // Bind and register the ticker callback so we can remove it on destroy
    this._tickFn = () => this.update();
    app.ticker.add(this._tickFn);
  }

  // ── Update loop ────────────────────────────────────────────────────────────

  private update(): void {
    // Pause guard
    const phase = useGameStore.getState().phase;
    if (phase === 'paused' || phase === 'dead' || phase === 'menu') return;

    const now   = Date.now();
    const input = this.input.snapshot();

    // ── Escape → pause ───────────────────────────────────────────────────────
    if (input.pause) {
      useGameStore.getState().setPhase('paused');
      this.input.flush();
      return;
    }

    // ── Run + difficulty ─────────────────────────────────────────────────────
    this.runSystem.tick(now);
    const store = useGameStore.getState();
    store.setRunTimeMs(this.runSystem.elapsedMs);
    store.setDifficulty(this.runSystem.difficulty);

    // ── Dynamic spawn ────────────────────────────────────────────────────────
    if (this.spawnSystem.shouldSpawn(now, this.runSystem.difficulty)) {
      this._spawnEnemy();
      this.spawnSystem.markSpawned(now);
    }

    // ── Player: input + physics ──────────────────────────────────────────────
    const ps = this.player.state;

    this.player.processInput(input, now);

    // Consume pirate skill spawn requests
    if (this.player.pendingBarrel) {
      this._spawnBarrel(this.player.pendingBarrel.spawnPosition);
      this.player.pendingBarrel = null;
    }
    if (this.player.pendingShot) {
      const shot    = this.player.pendingShot;
      const count   = this.player.skillScaling.getProjectileCount();
      const spread  = (count - 1) * 0.1; // total arc in radians
      for (let i = 0; i < count; i++) {
        const offset = count > 1 ? -spread / 2 + (spread / (count - 1)) * i : 0;
        const proj   = createProjectile(shot.spawnPosition, shot.angle + offset, 'player', CANNON_SHOT_CONFIG);
        this.projSystem.spawn(proj, CANNON_SHOT_CONFIG.radius);
        const gfx = makeCannonballGfx();
        this.world.addChild(gfx);
        this.projectiles.set(proj.id, { state: proj, gfx });
      }
      this.player.pendingShot = null;
    }
    this.player.applyPhysics(input.jumpHeld);

    const pbody = {
      x: ps.position.x, y: ps.position.y,
      vx: ps.velocityX,  vy: ps.velocityY,
      width: PLAYER_BODY_W, height: PLAYER_BODY_H,
      isOnGround: ps.isOnGround,
    };
    resolveAndMove(pbody, this.map);
    ps.position.x = pbody.x; ps.position.y = pbody.y;
    ps.velocityX  = pbody.vx; ps.velocityY  = pbody.vy;
    ps.isOnGround = pbody.isOnGround;

    // ── Attack: melee bash ───────────────────────────────────────────────────
    if (input.attack) {
      const bash = this.player.tryBash(now);
      if (bash) {
        const scaling = this.player.skillScaling;
        const atk = {
          origin    : ps.position,
          facing    : ps.facingRight ? 1 : -1,
          halfW     : bash.halfW,
          halfH     : bash.halfH,
          offsetX   : Math.abs(bash.hitBoxCX - ps.position.x),
          damage    : ps.damage * scaling.getDamageMult(),
          knockbackX: 5.5 * scaling.getKnockbackMult(),
          knockbackY: 3.5,
        };
        for (const { entity, anim } of this.enemies.values()) {
          if (!entity.isAlive) continue;
          const es      = entity.state;
          const centre  = { x: es.position.x, y: es.position.y - ENEMY_BODY[es.type].h / 2 };
          if (isInMeleeRange(centre, atk)) {
            const target = {
              position : es.position,
              velocityX: es.velocityX,
              velocityY: es.velocityY,
              hp       : es.hp,
              maxHp    : es.maxHp,
              hurtTimer: es.hurtTimer,
              mass     : getEnemyMass(es.type),
            };
            applyHit(ps.position, target, atk);
            es.velocityX = target.velocityX;
            es.velocityY = target.velocityY;
            es.hp        = target.hp;
            es.hurtTimer = target.hurtTimer;
            doubleBlink(anim.sprite, 400);
          }
        }
        this.showSlashFx(bash.hitBoxCX, bash.hitBoxCY, bash.halfW);
      }
    }

    this.player.updateAnimState(now);
    this.playerAnim.sync(this.player);

    // ── Loot pickup ───────────────────────────────────────────────────────────
    const pickedUp = this.lootSystem.checkPickup(ps.position);
    if (pickedUp) {
      this.player.equipWeapon(pickedUp.weapon);
      useGameStore.getState().setEquippedWeapon(pickedUp.weapon);
      const gfxEntry = this.lootDrops.get(pickedUp.id);
      if (gfxEntry) { gfxEntry.gfx.destroy(); this.lootDrops.delete(pickedUp.id); }
    }

    // ── Enemies ──────────────────────────────────────────────────────────────
    for (const [id, { entity, anim }] of this.enemies) {
      if (!entity.isAlive) {
        anim.sprite.destroy();
        this.enemies.delete(id);
        useGameStore.getState().incrementKill(entity.state.reward);
        // Try loot drop
        const drop = this.lootSystem.tryRoll(entity.state.position, entity.state.dropChance ?? 0.15);
        if (drop) this._renderLootDrop(drop);
        continue;
      }

      const es   = entity.state;
      const body = ENEMY_BODY[es.type];

      entity.applyPhysics();

      // AI: chase on same level, patrol otherwise
      const sameLevel = Math.abs(es.position.y - ps.position.y) < SAME_LEVEL_THRESHOLD;
      if (sameLevel) {
        entity.chaseX(ps.position.x);
      } else {
        const lookX = es.position.x + es.patrolDir * (body.w / 2 + 4);
        if (!tileBelow(this.map, lookX, es.position.y)) entity.reversePatrol();
        entity.patrol();
      }

      const ebdy = {
        x: es.position.x, y: es.position.y,
        vx: es.velocityX,  vy: es.velocityY,
        width: body.w,     height: body.h,
        isOnGround: es.isOnGround,
      };
      resolveAndMove(ebdy, this.map);
      es.position.x = ebdy.x; es.position.y = ebdy.y;
      es.velocityX  = ebdy.vx; es.velocityY  = ebdy.vy;
      es.isOnGround = ebdy.isOnGround;

      // Contact damage to player (with cooldown to prevent spam)
      const cdx = Math.abs(es.position.x - ps.position.x);
      const cdy = Math.abs(es.position.y - ps.position.y);
      if (cdx < 20 && cdy < 30 && now - this.lastContactDamage > CONTACT_DAMAGE_COOLDOWN) {
        this.lastContactDamage = now;
        const knockAtk = {
          origin    : es.position,
          facing    : es.facingRight ? 1 : -1,
          halfW     : 16,
          halfH     : 28,
          offsetX   : 0,
          damage    : es.damage,
          knockbackX: 4.0,
          knockbackY: 2.5,
        };
        const playerTarget = {
          position : ps.position,
          velocityX: ps.velocityX,
          velocityY: ps.velocityY,
          hp       : ps.hp,
          maxHp    : ps.maxHp,
          hurtTimer: ps.hurtTimer,
          mass     : PLAYER_MASS,
        };
        applyHit(es.position, playerTarget, knockAtk);
        ps.velocityX = playerTarget.velocityX;
        ps.velocityY = playerTarget.velocityY;
        ps.hp        = playerTarget.hp;
        ps.hurtTimer = playerTarget.hurtTimer;
        doubleBlink(this.playerAnim.sprite, 400);
      }

      entity.updateAnimState();
      anim.sync(entity);
    }

    // ── Barrel slow aura ──────────────────────────────────────────────────────
    const deltaMs = 16; // approximate 60fps frame time
    for (const [bid, { entity: barrel, sprite: bSprite }] of this.barrels) {
      if (!barrel.tick(deltaMs)) {
        bSprite.gfx.destroy();
        this.barrels.delete(bid);
        continue;
      }
      bSprite.sync(barrel);
      // Apply slow to enemies inside aura (override their velocity this frame)
      for (const { entity } of this.enemies.values()) {
        if (barrel.isInSlowRange(entity.state.position)) {
          entity.state.velocityX *= barrel.state.slowMult;
        }
      }
    }

    // ── Projectile update ────────────────────────────────────────────────────
    const aliveBarrels = [...this.barrels.values()].map((b) => b.entity);
    const hitResults: Array<{ projectileId: string; enemyId: string; damage: number }> = [];
    this.projSystem.update(deltaMs, this._buildCollidableEnemies(), aliveBarrels, hitResults);

    // Apply projectile → enemy hits
    for (const hit of hitResults) {
      const enemy = this.enemies.get(hit.enemyId);
      if (!enemy || !enemy.entity.isAlive) continue;
      enemy.entity.state.hp       = Math.max(0, enemy.entity.state.hp - hit.damage);
      enemy.entity.state.hurtTimer = 400;
      doubleBlink(enemy.anim.sprite, 400);
    }

    // Sync/remove projectile visuals
    for (const [pid, { state, gfx }] of this.projectiles) {
      if (state.spent || state.lifetime <= 0) {
        gfx.destroy();
        this.projectiles.delete(pid);
      } else {
        gfx.x = state.position.x;
        gfx.y = state.position.y;
      }
    }

    // ── Camera ────────────────────────────────────────────────────────────────
    const mapPx = this.map.widthTiles * TILE_SIZE;
    this.cameraX   = Math.max(0, Math.min(ps.position.x - GAME_WIDTH / 2, mapPx - GAME_WIDTH));
    this.world.x   = -this.cameraX;

    // ── HUD push ─────────────────────────────────────────────────────────────
    const storeRef = useGameStore.getState();
    storeRef.setPlayerHealth(ps.hp);
    storeRef.setSkillSlots(
      this.player.skills.getSlotStates(now) as Array<import('@shared/types').SkillSlotState | null>,
    );

    // ── Player death ─────────────────────────────────────────────────────────
    if (!this.player.isAlive && !this._isDead) {
      this._isDead = true;
      this.onDeath();
    }

    this.input.flush();
  }

  // ── Destroy (called by GameManager on restart) ────────────────────────────

  destroy(): void {
    this.app.ticker.remove(this._tickFn);
    this.world.destroy({ children: true });
    this.eventBus.clear();
    this.projSystem.clear();
    this.lootSystem.clear();
  }

  // ── Slash FX ──────────────────────────────────────────────────────────────

  private showSlashFx(cx: number, cy: number, halfW: number): void {
    const dir  = this.player.state.facingRight ? 1 : -1;
    const arc  = new Graphics();
    const sa   = dir > 0 ? -Math.PI * 0.6 : Math.PI * 0.4;
    const ea   = dir > 0 ?  Math.PI * 0.1  : Math.PI * 1.6;
    arc.arc(cx, cy, halfW, sa, ea);
    arc.stroke({ color: 0xff9a3c, width: 3 });
    this.world.addChild(arc);
    setTimeout(() => arc.destroy(), 180);
  }

  // ── Barrel spawn ──────────────────────────────────────────────────────────

  private _spawnBarrel(pos: { x: number; y: number }): void {
    const entity = new Barrel(pos);
    const sprite = new BarrelSprite();
    this.world.addChild(sprite.gfx);
    this.barrels.set(entity.state.id, { entity, sprite });
    sprite.sync(entity);
  }

  // ── Explosion FX ─────────────────────────────────────────────────────────

  private _showExplodeFx(cx: number, cy: number, radius: number): void {
    const ring = new Graphics();
    ring.circle(cx, cy, radius).stroke({ color: 0xf28c28, width: 4 });
    this.world.addChild(ring);
    let r = radius;
    const grow = setInterval(() => {
      r += 6;
      ring.clear();
      ring.circle(cx, cy, r).stroke({ color: 0xff9a3c, width: Math.max(1, 4 - (r - radius) / 6) });
      ring.alpha -= 0.15;
      if (ring.alpha <= 0) { clearInterval(grow); ring.destroy(); }
    }, 40);
  }

  // ── Enemy collidable snapshot for ProjectileSystem ────────────────────────

  private _buildCollidableEnemies() {
    return [...this.enemies.values()]
      .filter(({ entity }) => entity.isAlive)
      .map(({ entity }) => {
        const es   = entity.state;
        const body = ENEMY_BODY[es.type];
        return {
          id       : es.id,
          position : es.position,
          hp       : es.hp,
          maxHp    : es.maxHp,
          hurtTimer: es.hurtTimer,
          velocityX: es.velocityX,
          velocityY: es.velocityY,
          mass     : getEnemyMass(es.type),
          halfW    : body.w / 2,
          halfH    : body.h / 2,
        };
      });
  }

  // ── Map rendering ──────────────────────────────────────────────────────────

  private renderMap(): void {
    const textures = buildMapTextures();
    const mapCont  = new Container();
    const { tiles, widthTiles, heightTiles } = this.map;

    for (let row = 0; row < heightTiles; row++) {
      for (let col = 0; col < widthTiles; col++) {
        const val = tiles[row][col];

        if (val === 0) {
          if ((row + col) % 3 === 0) {
            const s = new Sprite(textures.bg as Texture);
            s.width = TILE_SIZE; s.height = TILE_SIZE;
            s.x = col * TILE_SIZE; s.y = row * TILE_SIZE;
            mapCont.addChild(s);
          }
          continue;
        }

        const above    = row > 0             && tiles[row - 1][col] === 0;
        const below    = row < heightTiles-1 && tiles[row + 1][col] === 0;
        const hasLeft  = col > 0             && tiles[row][col - 1] === 1;
        const hasRight = col < widthTiles-1  && tiles[row][col + 1] === 1;

        let tex: Texture;
        if (above && !below && hasLeft && hasRight) tex = textures.solidTop as Texture;
        else if (!hasLeft)                          tex = textures.solidLeft  as Texture;
        else if (!hasRight)                         tex = textures.solidRight as Texture;
        else                                        tex = textures.solid      as Texture;

        const s = new Sprite(tex);
        s.width = TILE_SIZE; s.height = TILE_SIZE;
        s.x = col * TILE_SIZE; s.y = row * TILE_SIZE;
        mapCont.addChild(s);
      }
    }

    this.world.addChild(mapCont);
  }


  // ── Dynamic enemy spawn ───────────────────────────────────────────────────

  private _spawnEnemy(type?: EnemyType, isBoss = false): void {
    const enemyType = type ?? this.spawnSystem.rollType();
    const groundY   = (this.map.heightTiles - 2) * TILE_SIZE;
    const spawnX    = this.spawnSystem.nextSpawnX(this.map.widthTiles * TILE_SIZE, TILE_SIZE);

    const config = getEnemyConfig(enemyType);
    const hpMult  = this.runSystem.getEnemyHpMult();
    const dmgMult = this.runSystem.getEnemyDamageMult();
    const spdMult = this.runSystem.getEnemySpeedMult();

    const enemy = new Enemy(enemyType, isBoss);
    enemy.state.position    = { x: spawnX, y: groundY };
    enemy.state.hp          = Math.round(config.hp  * hpMult  * (isBoss ? 4 : 1));
    enemy.state.maxHp       = enemy.state.hp;
    enemy.state.damage      = Math.round(config.damage * dmgMult * (isBoss ? 2 : 1));
    enemy.state.speed       = config.speed * spdMult;
    if (isBoss) (enemy.state as { isBoss: boolean }).isBoss = true;

    const anim = new EnemyAnimSprite(enemy);
    this.world.addChild(anim.sprite);
    this.enemies.set(enemy.state.id, { entity: enemy, anim });
  }

  // ── Loot drop render ──────────────────────────────────────────────────────

  private _renderLootDrop(drop: LootDrop): void {
    const RARITY_COLOR: Record<string, number> = {
      common: 0xa0a0a0,
      rare  : 0x4488ff,
      epic  : 0xcc44ff,
    };
    const color = RARITY_COLOR[drop.rarity] ?? 0xffffff;

    const cont = new Container();

    // Glowing orb
    const orb = new Graphics();
    orb.circle(0, 0, 8).fill({ color });
    orb.circle(0, 0, 8).stroke({ color: 0xffffff, width: 1 });
    cont.addChild(orb);

    // Weapon name label
    const label = new Text({
      text : drop.weapon.label,
      style: new TextStyle({
        fontFamily: 'monospace',
        fontSize  : 9,
        fill      : color,
      }),
    });
    label.anchor.set(0.5, 1);
    label.y = -12;
    cont.addChild(label);

    cont.x = drop.position.x;
    cont.y = drop.position.y;
    this.world.addChild(cont);
    this.lootDrops.set(drop.id, { drop, gfx: cont });
  }

  // ── Enemy spawning (initial wave) ─────────────────────────────────────────

  private spawnEnemies(): void {
    const types: EnemyType[] = ['grunt', 'brute', 'speeder', 'grunt', 'speeder'];
    for (const type of types) this._spawnEnemy(type);
  }
}
