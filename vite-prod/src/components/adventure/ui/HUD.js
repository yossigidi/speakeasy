import { Container, Graphics, Text } from 'pixi.js';

/**
 * Heads-Up Display — coins, progress bar, scene title, pause button.
 */
export default class HUD {
  constructor(engine, options) {
    this.engine = engine;
    this.options = options;
    this.container = new Container();
    this.container.label = 'hud';

    this.coins = 0;
    this.sceneIndex = 0;
    this.totalScenes = 6;

    this._build();
    engine.uiLayer.addChild(this.container);
  }

  _build() {
    const w = this.engine.width;
    const safeTop = 16;

    // Background bar
    this.bgBar = new Graphics();
    this.bgBar.roundRect(8, safeTop, w - 16, 40, 20);
    this.bgBar.fill({ color: 0x000000, alpha: 0.3 });
    this.container.addChild(this.bgBar);

    // Coin icon + count
    this.coinIcon = new Text({
      text: '🪙',
      style: { fontSize: 18 },
    });
    this.coinIcon.x = 20;
    this.coinIcon.y = safeTop + 8;
    this.container.addChild(this.coinIcon);

    this.coinText = new Text({
      text: '0',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xfbbf24,
      },
    });
    this.coinText.x = 42;
    this.coinText.y = safeTop + 12;
    this.container.addChild(this.coinText);

    // Progress dots
    this.dotsContainer = new Container();
    this.dotsContainer.x = w / 2;
    this.dotsContainer.y = safeTop + 20;
    this.container.addChild(this.dotsContainer);
    this._buildDots();

    // Pause button
    this.pauseBtn = new Graphics();
    this.pauseBtn.roundRect(0, 0, 32, 32, 16);
    this.pauseBtn.fill({ color: 0xffffff, alpha: 0.2 });
    // Pause icon (two bars)
    this.pauseBtn.rect(10, 8, 4, 16);
    this.pauseBtn.rect(18, 8, 4, 16);
    this.pauseBtn.fill({ color: 0xffffff });
    this.pauseBtn.x = w - 48;
    this.pauseBtn.y = safeTop + 4;
    this.pauseBtn.eventMode = 'static';
    this.pauseBtn.cursor = 'pointer';
    this.pauseBtn.on('pointerdown', () => {
      if (this.options.onPause) this.options.onPause();
      this.engine.pause();
    });
    this.container.addChild(this.pauseBtn);
  }

  _buildDots() {
    this.dotsContainer.removeChildren();
    const spacing = 18;
    const startX = -(this.totalScenes - 1) * spacing / 2;

    for (let i = 0; i < this.totalScenes; i++) {
      const dot = new Graphics();
      if (i < this.sceneIndex) {
        // Completed
        dot.circle(0, 0, 5);
        dot.fill({ color: 0x22c55e });
        dot.circle(0, 0, 2);
        dot.fill({ color: 0xffffff });
      } else if (i === this.sceneIndex) {
        // Current
        dot.circle(0, 0, 6);
        dot.fill({ color: 0xfbbf24 });
        dot.circle(0, 0, 3);
        dot.fill({ color: 0xffffff });
      } else {
        // Future
        dot.circle(0, 0, 4);
        dot.fill({ color: 0xffffff, alpha: 0.3 });
      }
      dot.x = startX + i * spacing;
      this.dotsContainer.addChild(dot);
    }
  }

  setCoins(count) {
    this.coins = count;
    this.coinText.text = String(count);
  }

  addCoins(amount) {
    this.coins += amount;
    this.coinText.text = String(this.coins);
    // Quick scale pop animation
    this.coinText.scale.set(1.3);
    setTimeout(() => { if (!this.coinText.destroyed) this.coinText.scale.set(1); }, 200);
  }

  setScene(index, total) {
    this.sceneIndex = index;
    this.totalScenes = total || this.totalScenes;
    this._buildDots();
  }

  setTitle(text) {
    // Could add scene title, currently using dots for progress
  }

  resize(w, h) {
    // Rebuild at new width
    this.container.removeChildren();
    this._build();
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
