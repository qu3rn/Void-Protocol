import { Application } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from '@shared/constants';

let app: Application | null = null;

export async function createPixiApp(
  container: HTMLElement,
  width  = GAME_WIDTH,
  height = GAME_HEIGHT,
): Promise<Application> {
  const instance = new Application();

  await instance.init({
    width,
    height,
    backgroundColor: 0x0d0a1f,
    antialias: false,
  });

  app = instance;
  container.appendChild(app.canvas);
  return app;
}

export function getPixiApp(): Application
{
  if (!app) throw new Error('Pixi app has not been initialised. Call createPixiApp first.');
  return app;
}

export function destroyPixiApp(): void
{
  app?.destroy(true, { children: true });
  app = null;
}
