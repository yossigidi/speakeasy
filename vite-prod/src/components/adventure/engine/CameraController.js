/**
 * Camera controller — pans and zooms the world layer.
 * Follows a target (e.g. Speakli) with smooth easing.
 */
export default class CameraController {
  constructor(engine) {
    this.engine = engine;
    this.target = null; // { x, y } or DisplayObject
    this.offsetX = 0;
    this.offsetY = 0;
    this.zoom = 1;
    this._targetZoom = 1;
    this.smoothing = 0.08; // Lower = smoother
    this.bounds = null; // { minX, maxX, minY, maxY } — world bounds
  }

  follow(target, offsetX = 0, offsetY = 0) {
    this.target = target;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  setZoom(zoom, animated = true) {
    if (animated) {
      this._targetZoom = zoom;
    } else {
      this.zoom = zoom;
      this._targetZoom = zoom;
      this.engine.worldLayer.scale.set(zoom);
    }
  }

  panTo(x, y, duration = 500) {
    return new Promise(resolve => {
      const startX = this.engine.worldLayer.x;
      const startY = this.engine.worldLayer.y;
      const targetX = -x * this.zoom + this.engine.width / 2;
      const targetY = -y * this.zoom + this.engine.height / 2;
      const start = performance.now();

      const tick = () => {
        if (this._destroyed) { resolve(); return; }
        const t = Math.min((performance.now() - start) / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        this.engine.worldLayer.x = startX + (targetX - startX) * eased;
        this.engine.worldLayer.y = startY + (targetY - startY) * eased;
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      tick();
    });
  }

  update(dt) {
    // Smooth zoom
    if (Math.abs(this.zoom - this._targetZoom) > 0.001) {
      this.zoom += (this._targetZoom - this.zoom) * this.smoothing * dt;
      this.engine.worldLayer.scale.set(this.zoom);
    }

    // Follow target
    if (!this.target) return;
    const tx = (typeof this.target.x === 'number' ? this.target.x : 0) + this.offsetX;
    const ty = (typeof this.target.y === 'number' ? this.target.y : 0) + this.offsetY;

    const desiredX = -tx * this.zoom + this.engine.width / 2;
    const desiredY = -ty * this.zoom + this.engine.height / 2;

    let newX = this.engine.worldLayer.x + (desiredX - this.engine.worldLayer.x) * this.smoothing * dt;
    let newY = this.engine.worldLayer.y + (desiredY - this.engine.worldLayer.y) * this.smoothing * dt;

    // Clamp to bounds
    if (this.bounds) {
      const maxX = 0;
      const minX = -(this.bounds.maxX * this.zoom - this.engine.width);
      const maxY = 0;
      const minY = -(this.bounds.maxY * this.zoom - this.engine.height);
      newX = Math.min(maxX, Math.max(minX, newX));
      newY = Math.min(maxY, Math.max(minY, newY));
    }

    this.engine.worldLayer.x = newX;
    this.engine.worldLayer.y = newY;
  }

  destroy() {
    this._destroyed = true;
    this.target = null;
  }
}
