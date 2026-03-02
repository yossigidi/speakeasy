import { Container, Graphics, Text } from 'pixi.js';

/**
 * Reward animation — coins/stars flying to HUD, confetti burst.
 */
export default class RewardAnimation {
  constructor(engine) {
    this.engine = engine;
    this.container = new Container();
    this.container.label = 'reward-anim';
    engine.overlayLayer.addChild(this.container);
  }

  /**
   * Play a reward animation.
   * @param {number} xp - XP earned
   * @param {number} coins - Coins earned
   * @param {number} originX - Start X position
   * @param {number} originY - Start Y position
   */
  async play(xp, coins, originX, originY) {
    const promises = [];

    // Confetti burst
    if (this.engine.particles) {
      this.engine.particles.burst(originX, originY, 30, 'sparkle');
    }

    // XP text floating up
    if (xp > 0) {
      promises.push(this._floatText(`+${xp} XP`, originX - 30, originY, 0xFBBF24));
    }

    // Coin text floating up
    if (coins > 0) {
      promises.push(this._floatText(`+${coins} 🪙`, originX + 30, originY, 0xF59E0B));
    }

    // Star burst
    promises.push(this._starBurst(originX, originY));

    await Promise.all(promises);
  }

  _floatText(text, x, y, color) {
    return new Promise(resolve => {
      const t = new Text({
        text,
        style: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 24,
          fontWeight: 'bold',
          fill: color,
          dropShadow: true,
          dropShadowDistance: 2,
          dropShadowAlpha: 0.3,
        },
      });
      t.anchor.set(0.5);
      t.x = x;
      t.y = y;
      this.container.addChild(t);

      const start = performance.now();
      const tick = () => {
        const elapsed = (performance.now() - start) / 1200;
        if (elapsed >= 1) {
          t.destroy();
          resolve();
          return;
        }
        t.y = y - elapsed * 60;
        t.alpha = 1 - elapsed;
        t.scale.set(1 + elapsed * 0.3);
        requestAnimationFrame(tick);
      };
      tick();
    });
  }

  _starBurst(x, y) {
    return new Promise(resolve => {
      const stars = [];
      for (let i = 0; i < 8; i++) {
        const star = new Graphics();
        star.star(0, 0, 5, 8, 3);
        star.fill({ color: [0xFBBF24, 0xF59E0B, 0x22C55E, 0x3B82F6, 0xEF4444][i % 5] });
        star.x = x;
        star.y = y;
        this.container.addChild(star);
        const angle = (Math.PI * 2 * i) / 8;
        stars.push({ graphic: star, angle, speed: 2 + Math.random() * 1.5 });
      }

      const start = performance.now();
      const tick = () => {
        const elapsed = (performance.now() - start) / 800;
        if (elapsed >= 1) {
          stars.forEach(s => s.graphic.destroy());
          resolve();
          return;
        }
        stars.forEach(s => {
          s.graphic.x = x + Math.cos(s.angle) * s.speed * elapsed * 60;
          s.graphic.y = y + Math.sin(s.angle) * s.speed * elapsed * 60;
          s.graphic.alpha = 1 - elapsed;
          s.graphic.scale.set(1 - elapsed * 0.5);
          s.graphic.rotation += 0.1;
        });
        requestAnimationFrame(tick);
      };
      tick();
    });
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
