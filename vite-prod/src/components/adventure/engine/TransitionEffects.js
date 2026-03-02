import { Graphics } from 'pixi.js';

/**
 * Screen transition effects (fade, slide, circle-wipe).
 * Rendered on the overlay layer.
 */
export default class TransitionEffects {
  constructor(engine) {
    this.engine = engine;
    this.overlay = new Graphics();
    this.overlay.visible = false;
    engine.overlayLayer.addChild(this.overlay);
  }

  /**
   * Fade to black and back.
   * @param {Function} onMidpoint - called when screen is fully black
   * @param {number} duration - total duration in ms (half fade-out, half fade-in)
   */
  async fade(onMidpoint, duration = 800) {
    const half = duration / 2;
    this.overlay.visible = true;

    // Fade out (to black)
    await this._animateAlpha(0, 1, half);
    if (onMidpoint) await onMidpoint();
    // Fade in (from black)
    await this._animateAlpha(1, 0, half);

    this.overlay.visible = false;
  }

  /**
   * Circle wipe (iris out/in).
   */
  async circleWipe(onMidpoint, duration = 1000, cx, cy) {
    const w = this.engine.width;
    const h = this.engine.height;
    const maxR = Math.sqrt(w * w + h * h);
    cx = cx ?? w / 2;
    cy = cy ?? h / 2;
    const half = duration / 2;

    this.overlay.visible = true;

    // Iris close
    await this._animateCircle(cx, cy, maxR, 0, half, w, h);
    if (onMidpoint) await onMidpoint();
    // Iris open
    await this._animateCircle(cx, cy, 0, maxR, half, w, h);

    this.overlay.visible = false;
  }

  _animateAlpha(from, to, duration) {
    return new Promise(resolve => {
      const w = this.engine.width;
      const h = this.engine.height;
      const start = performance.now();

      const tick = () => {
        const elapsed = performance.now() - start;
        const t = Math.min(elapsed / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const alpha = from + (to - from) * eased;

        this.overlay.clear();
        this.overlay.rect(0, 0, w, h);
        this.overlay.fill({ color: 0x000000, alpha });

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      tick();
    });
  }

  _animateCircle(cx, cy, fromR, toR, duration, w, h) {
    return new Promise(resolve => {
      const start = performance.now();

      const tick = () => {
        const elapsed = performance.now() - start;
        const t = Math.min(elapsed / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const r = fromR + (toR - fromR) * eased;

        this.overlay.clear();
        // Draw full screen black
        this.overlay.rect(0, 0, w, h);
        this.overlay.fill({ color: 0x000000 });
        // Cut out circle
        this.overlay.circle(cx, cy, Math.max(r, 1));
        this.overlay.cut();

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          resolve();
        }
      };
      tick();
    });
  }

  destroy() {
    this.overlay.destroy();
  }
}
