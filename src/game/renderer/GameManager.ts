/**
 * GameManager – scene lifecycle controller.
 *
 * React UI calls startNewGame() / pauseGame() / resumeGame().
 * GameScene calls onDeath() when the player dies.
 */
import { GameScene } from '@game/renderer/scenes/GameScene';
import { getPixiApp } from '@game/renderer/pixi/PixiApp';
import { useGameStore } from '@store/useGameStore';

let currentScene: GameScene | null = null;

export function startNewGame(): void {
  const app = getPixiApp();

  if (currentScene) {
    currentScene.destroy();
    currentScene = null;
    app.stage.removeChildren();
  }

  useGameStore.getState().resetRun();
  useGameStore.getState().setPhase('playing');
  currentScene = new GameScene(app, _onDeath);
}

export function pauseGame(): void {
  if (useGameStore.getState().phase !== 'playing') return;
  useGameStore.getState().setPhase('paused');
}

export function resumeGame(): void {
  if (useGameStore.getState().phase !== 'paused') return;
  useGameStore.getState().setPhase('playing');
}

function _onDeath(): void {
  useGameStore.getState().setPhase('dead');
}
