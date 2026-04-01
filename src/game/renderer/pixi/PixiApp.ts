import { Application } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from '@shared/constants';

let app: Application | null = null;

export async function createPixiApp(container: HTMLElement): Promise<Application> {
  app = new Application();

  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 0x0a0a0f,
    antialias: false,
    resizeTo: container,
  });

  container.appendChild(app.canvas);
  return app;
}

export function getPixiApp(): Application {
  if (!app) throw new Error('Pixi app has not been initialised. Call createPixiApp first.');
  return app;
}

export function destroyPixiApp(): void {
  app?.destroy(true, { children: true });
  app = null;
}
