import { useEffect, useRef } from 'react';
import { createPixiApp, destroyPixiApp } from '@game/renderer/pixi/PixiApp';

export function usePixiApp() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    let alive = true;
    createPixiApp(el).then(() => {
      if (!alive) destroyPixiApp();
    });

    return () => {
      alive = false;
      destroyPixiApp();
    };
  }, []);

  return canvasRef;
}
