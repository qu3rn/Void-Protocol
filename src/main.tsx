import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HUD } from '@ui/hud/HUD';
import { createPixiApp } from '@game/renderer/pixi/PixiApp';
import { GameScene } from '@game/renderer/scenes/GameScene';

async function bootstrap() {
  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) throw new Error('Missing #game-container element in index.html');

  const uiRoot = document.getElementById('ui-root');
  if (!uiRoot) throw new Error('Missing #ui-root element in index.html');

  // Mount React UI (HUD layer — runs on top of Pixi canvas)
  createRoot(uiRoot).render(
    <StrictMode>
      <HUD />
    </StrictMode>,
  );

  // Initialise Pixi and start the game scene
  const app = await createPixiApp(gameContainer);
  new GameScene(app);
}

bootstrap().catch(console.error);
