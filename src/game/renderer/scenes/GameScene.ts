import { Container, Graphics } from 'pixi.js';
import type { Application } from 'pixi.js';
import { Player } from '@game/core/entities/Player';
import { Enemy } from '@game/core/entities/Enemy';
import { generateMap } from '@game/core/generators/mapGenerator';
import { createPlayerSprite, syncPlayerSprite } from '@game/renderer/sprites/PlayerSprite';
import { createEnemySprite, syncEnemySprite } from '@game/renderer/sprites/EnemySprite';
import { TILE_SIZE } from '@shared/constants';
import { useGameStore } from '@store/useGameStore';
import type { EnemyType } from '@shared/types';

export class GameScene {
  private container: Container;
  private player: Player;
  private enemies: Map<string, { entity: Enemy; sprite: Graphics }> = new Map();
  private playerSprite: Graphics;

  constructor(app: Application) {
    this.container = new Container();
    app.stage.addChild(this.container);

    this.renderMap();

    this.player = new Player();
    this.playerSprite = createPlayerSprite(this.player);
    this.container.addChild(this.playerSprite);

    this.spawnInitialEnemies();

    app.ticker.add(() => this.update());
  }

  private renderMap(): void {
    const map = generateMap();
    const mapContainer = new Container();

    for (let row = 0; row < map.heightTiles; row++) {
      for (let col = 0; col < map.widthTiles; col++) {
        const tile = map.tiles[row][col];
        const g = new Graphics();
        const color = tile === 1 ? 0x223344 : 0x111118;
        g.rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill({ color });
        mapContainer.addChild(g);
      }
    }

    this.container.addChild(mapContainer);
  }

  private spawnInitialEnemies(): void {
    const spawnData: Array<{ type: EnemyType; x: number; y: number }> = [
      { type: 'grunt', x: 200, y: 150 },
      { type: 'brute', x: 1000, y: 200 },
      { type: 'speeder', x: 600, y: 500 },
    ];

    for (const spawn of spawnData) {
      const enemy = new Enemy(spawn.type);
      enemy.state.position = { x: spawn.x, y: spawn.y };
      const sprite = createEnemySprite(enemy);
      this.container.addChild(sprite);
      this.enemies.set(enemy.state.id, { entity: enemy, sprite });
    }
  }

  private update(): void {
    const { position } = this.player.state;

    for (const [id, { entity, sprite }] of this.enemies) {
      if (!entity.isAlive) {
        sprite.destroy();
        this.enemies.delete(id);
        useGameStore.getState().incrementKill(entity.state.reward);
        continue;
      }
      entity.moveTo(position.x, position.y);
      syncEnemySprite(sprite, entity);
    }

    syncPlayerSprite(this.playerSprite, this.player);
  }
}
