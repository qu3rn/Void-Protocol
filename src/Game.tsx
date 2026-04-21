/**
 * Game - self-contained component.
 *
 * Drop this into any React project and the full Void-Protocol game renders
 * inside a 1280×720 box. No host HTML IDs required.
 *
 * Usage:
 *   import { Game } from 'void-protocol';
 *   <Game />
 */
import { usePixiApp } from '@ui/hooks/usePixiApp';
import { useGameStore } from '@store/useGameStore';
import { HUD } from '@ui/hud/HUD';
import { MainMenu } from '@ui/screens/MainMenu';
import { PauseMenu } from '@ui/screens/PauseMenu';
import { DeathScreen } from '@ui/screens/DeathScreen';
import { GAME_WIDTH, GAME_HEIGHT } from '@shared/constants';

function GameUI() {
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

export function Game() {
  const canvasRef = usePixiApp();

  return (
    <div
      style={{
        position : 'relative',
        width    : GAME_WIDTH,
        height   : GAME_HEIGHT,
        overflow : 'hidden',
        background: '#0d0a1f',
        cursor   : 'none',
        fontFamily: 'monospace',
        userSelect: 'none',
      }}
    >
      {/* Pixi canvas mounts here */}
      <div ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

      {/* React UI overlay — pointer-events none so canvas gets mouse input */}
      <div
        style={{
          position     : 'absolute',
          inset        : 0,
          pointerEvents: 'none',
        }}
      >
        <GameUI />
      </div>
    </div>
  );
}
