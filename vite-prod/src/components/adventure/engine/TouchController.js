/**
 * Unified pointer/touch event handler for the PixiJS canvas.
 * Normalizes mouse + touch into a single API.
 */
export default class TouchController {
  constructor(app) {
    this.app = app;
    this.enabled = true;
    this._listeners = { tap: [], drag: [], swipe: [] };
    this._startPos = null;
    this._startTime = 0;

    // Bind to stage
    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;

    this._onDown = this._handleDown.bind(this);
    this._onUp = this._handleUp.bind(this);
    this._onMove = this._handleMove.bind(this);

    app.stage.on('pointerdown', this._onDown);
    app.stage.on('pointerup', this._onUp);
    app.stage.on('pointermove', this._onMove);
  }

  on(event, callback) {
    if (this._listeners[event]) {
      this._listeners[event].push(callback);
    }
    return this;
  }

  off(event, callback) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }
    return this;
  }

  _emit(event, data) {
    if (!this.enabled) return;
    for (const cb of this._listeners[event]) {
      cb(data);
    }
  }

  _handleDown(e) {
    const pos = e.global;
    this._startPos = { x: pos.x, y: pos.y };
    this._startTime = Date.now();
  }

  _handleUp(e) {
    if (!this._startPos) return;
    const pos = e.global;
    const dx = pos.x - this._startPos.x;
    const dy = pos.y - this._startPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const elapsed = Date.now() - this._startTime;

    if (dist < 15 && elapsed < 300) {
      // Tap
      this._emit('tap', {
        x: pos.x,
        y: pos.y,
        // Normalized 0-1 coords
        nx: pos.x / this.app.screen.width,
        ny: pos.y / this.app.screen.height,
      });
    } else if (dist > 50 && elapsed < 400) {
      // Swipe
      const angle = Math.atan2(dy, dx);
      let dir = 'right';
      if (angle > 2.35 || angle < -2.35) dir = 'left';
      else if (angle > 0.78 && angle < 2.35) dir = 'down';
      else if (angle > -2.35 && angle < -0.78) dir = 'up';
      this._emit('swipe', { dir, dx, dy });
    }

    this._startPos = null;
  }

  _handleMove(e) {
    if (!this._startPos) return;
    const pos = e.global;
    this._emit('drag', {
      x: pos.x,
      y: pos.y,
      dx: pos.x - this._startPos.x,
      dy: pos.y - this._startPos.y,
    });
  }

  destroy() {
    this.app.stage.off('pointerdown', this._onDown);
    this.app.stage.off('pointerup', this._onUp);
    this.app.stage.off('pointermove', this._onMove);
  }
}
