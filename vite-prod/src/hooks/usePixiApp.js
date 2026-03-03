import { useEffect, useRef } from 'react';
import { Application } from 'pixi.js';

/**
 * React hook that manages a PixiJS v8 Application lifecycle.
 * Returns a ref to attach to a container div — the canvas is appended/removed automatically.
 */
export default function usePixiApp(onReady, deps = []) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const destroyedRef = useRef(false);

  useEffect(() => {
    destroyedRef.current = false;
    let app;

    (async () => {
      app = new Application();
      await app.init({
        background: '#1a1a2e',
        resizeTo: containerRef.current,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        powerPreference: 'low-power',
      });

      if (destroyedRef.current) {
        try { app.destroy(true, { children: true }); } catch {}
        return;
      }

      appRef.current = app;
      containerRef.current?.appendChild(app.canvas);
      app.canvas.style.touchAction = 'none';

      if (onReady) onReady(app);
    })();

    return () => {
      destroyedRef.current = true;
      if (appRef.current) {
        try { appRef.current.destroy(true, { children: true }); } catch {}
        appRef.current = null;
      }
    };
  }, deps);

  return { containerRef, appRef };
}
