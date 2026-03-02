import { Container } from 'pixi.js';

/**
 * Central game coordinator. Owns the stage hierarchy and manages subsystems.
 *
 * Stage tree:
 *   root
 *     ├── world  (parallax bg, ground, NPCs, Speakli)
 *     ├── ui     (HUD, speech bubbles)
 *     └── overlay (transitions, pause, rewards)
 */
export default class PixiEngine {
  constructor(app, options = {}) {
    this.app = app;
    this.options = options; // { speak, onXP, onProgress, uiLang }

    // Stage layers
    this.root = new Container();
    this.worldLayer = new Container();
    this.uiLayer = new Container();
    this.overlayLayer = new Container();

    this.root.addChild(this.worldLayer, this.uiLayer, this.overlayLayer);
    app.stage.addChild(this.root);

    // Subsystem references (set by respective classes)
    this.sceneManager = null;
    this.camera = null;
    this.touch = null;
    this.particles = null;
    this.hud = null;

    // Game state
    this.paused = false;
    this.coins = 0;
    this.adventureProgress = options.adventureProgress || {};

    // Ticker update loop
    this._boundUpdate = this.update.bind(this);
    app.ticker.add(this._boundUpdate);
  }

  get width() { return this.app.screen.width; }
  get height() { return this.app.screen.height; }

  update(ticker) {
    if (this.paused) return;
    const dt = ticker.deltaTime;
    if (this.sceneManager) this.sceneManager.update(dt);
    if (this.camera) this.camera.update(dt);
    if (this.particles) this.particles.update(dt);
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  resize() {
    // Subsystems that need resize can be notified here
    if (this.sceneManager) this.sceneManager.resize(this.width, this.height);
    if (this.hud) this.hud.resize(this.width, this.height);
  }

  destroy() {
    this.app.ticker.remove(this._boundUpdate);
    this.root.destroy({ children: true });
  }
}
