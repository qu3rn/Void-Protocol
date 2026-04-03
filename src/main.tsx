import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useGameStore } from '@store/useGameStore';
import { HUD } from '@ui/hud/HUD';
import { MainMenu } from '@ui/screens/MainMenu';
import { PauseMenu } from '@ui/screens/PauseMenu';
import { DeathScreen } from '@ui/screens/DeathScreen';
import { createPixiApp } from '@game/renderer/pixi/PixiApp';

/** Root UI component — renders the correct overlay for each game phase. */
function App() {
  const phase = useGameStore((s) => s.phase);
  return (
    <>
      {(phase === 'playing' || phase === 'paused') && <HUD />}
      {phase === 'menu'   && <MainMenu />}
      {phase === 'paused' && <PauseMenu />}
      {phase === 'dead'   && <DeathScreen />}
    </>
  );
}

async function bootstrap() {
  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) throw new Error('Missing #game-container');

  const uiRoot = document.getElementById('ui-root');
  if (!uiRoot) throw new Error('Missing #ui-root');

  // Always mount React first so store + phase are available
  createRoot(uiRoot).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  // Initialise Pixi canvas (no GameScene yet — created on START RUN)
  await createPixiApp(gameContainer);
}

bootstrap().catch(console.error);
