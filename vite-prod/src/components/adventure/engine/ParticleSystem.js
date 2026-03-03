import { Container, Graphics } from 'pixi.js';

/**
 * Simple particle system for ambient effects.
 * Types: leaves, sparkle, snow, bubbles.
 */

class Particle {
  constructor(graphic, config) {
    this.graphic = graphic;
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.life = config.life || 3;
    this.maxLife = this.life;
    this.rotSpeed = config.rotSpeed || 0;
    this.gravity = config.gravity || 0;
    this.sway = config.sway || 0;
    this._swayOffset = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.life -= dt * 0.016;
    this.graphic.x += this.vx * dt;
    this.graphic.y += this.vy * dt;
    this.vy += this.gravity * dt;
    this.graphic.rotation += this.rotSpeed * dt;

    // Sway (for leaves)
    if (this.sway) {
      this.graphic.x += Math.sin(Date.now() * 0.001 + this._swayOffset) * this.sway * dt;
    }

    // Fade out
    const lifeRatio = this.life / this.maxLife;
    this.graphic.alpha = Math.min(lifeRatio * 2, 1);

    return this.life > 0;
  }
}

export default class ParticleSystem {
  constructor(engine) {
    this.engine = engine;
    this.container = new Container();
    this.container.label = 'particles';
    this.particles = [];
    this.type = null;
    this.density = 10;
    this.enabled = true;
    this._spawnTimer = 0;

    engine.worldLayer.addChild(this.container);
  }

  configure(config) {
    this.clear();
    this.type = config.type || 'leaves';
    this.density = config.density || 10;
    this.enabled = true;
  }

  update(dt) {
    if (!this.enabled || !this.type) return;

    // Spawn new particles
    this._spawnTimer += dt;
    const interval = 60 / this.density; // frames between spawns
    while (this._spawnTimer >= interval) {
      this._spawnTimer -= interval;
      this._spawn();
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const alive = this.particles[i].update(dt);
      if (!alive) {
        this.container.removeChild(this.particles[i].graphic);
        this.particles[i].graphic.destroy();
        this.particles.splice(i, 1);
      }
    }
  }

  _spawn() {
    const w = this.engine.width;
    const h = this.engine.height;

    let graphic, config;

    switch (this.type) {
      case 'leaves': {
        graphic = new Graphics();
        const size = 3 + Math.random() * 4;
        const colors = [0x22C55E, 0x16A34A, 0x84CC16, 0xFBBF24, 0xEA580C];
        const color = colors[Math.floor(Math.random() * colors.length)];
        graphic.ellipse(0, 0, size, size * 0.6);
        graphic.fill({ color });
        graphic.x = Math.random() * w;
        graphic.y = -10;
        config = {
          vx: (Math.random() - 0.5) * 0.8,
          vy: 0.5 + Math.random() * 0.8,
          life: 4 + Math.random() * 3,
          rotSpeed: (Math.random() - 0.5) * 0.05,
          sway: 0.3 + Math.random() * 0.3,
        };
        break;
      }

      case 'sparkle': {
        graphic = new Graphics();
        const size = 1.5 + Math.random() * 2.5;
        graphic.star(0, 0, 4, size, size * 0.4);
        graphic.fill({ color: 0xFBBF24 });
        graphic.x = Math.random() * w;
        graphic.y = Math.random() * h;
        config = {
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.2 - Math.random() * 0.3,
          life: 1.5 + Math.random() * 2,
          rotSpeed: (Math.random() - 0.5) * 0.1,
        };
        break;
      }

      case 'snow': {
        graphic = new Graphics();
        const size = 1.5 + Math.random() * 3;
        graphic.circle(0, 0, size);
        graphic.fill({ color: 0xffffff, alpha: 0.8 });
        graphic.x = Math.random() * w;
        graphic.y = -10;
        config = {
          vx: (Math.random() - 0.5) * 0.4,
          vy: 0.4 + Math.random() * 0.6,
          life: 5 + Math.random() * 4,
          sway: 0.2 + Math.random() * 0.2,
        };
        break;
      }

      case 'stars': {
        graphic = new Graphics();
        const size = 1 + Math.random() * 2.5;
        const colors = [0xFFFFFF, 0xFDE68A, 0xBAE6FD, 0xE9D5FF];
        const color = colors[Math.floor(Math.random() * colors.length)];
        graphic.star(0, 0, 4, size, size * 0.4);
        graphic.fill({ color });
        graphic.x = Math.random() * w;
        graphic.y = Math.random() * h;
        config = {
          vx: 0,
          vy: 0,
          life: 1.5 + Math.random() * 2.5,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          pulseSpeed: 0.05 + Math.random() * 0.05,
        };
        break;
      }

      case 'bubbles': {
        graphic = new Graphics();
        const size = 2 + Math.random() * 4;
        graphic.circle(0, 0, size);
        graphic.stroke({ color: 0x87CEEB, width: 1, alpha: 0.6 });
        graphic.x = Math.random() * w;
        graphic.y = h + 10;
        config = {
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.5 - Math.random() * 0.5,
          life: 3 + Math.random() * 3,
          sway: 0.1 + Math.random() * 0.2,
        };
        break;
      }

      default:
        return;
    }

    const particle = new Particle(graphic, config);
    this.container.addChild(graphic);
    this.particles.push(particle);
  }

  /**
   * Burst effect — emit many particles at once from a point.
   */
  burst(x, y, count = 20, type = 'sparkle') {
    for (let i = 0; i < count; i++) {
      const graphic = new Graphics();
      const size = 2 + Math.random() * 3;

      if (type === 'sparkle') {
        graphic.star(0, 0, 4, size, size * 0.4);
        graphic.fill({ color: [0xFBBF24, 0xF59E0B, 0x22C55E, 0x3B82F6][Math.floor(Math.random() * 4)] });
      } else {
        graphic.circle(0, 0, size);
        graphic.fill({ color: 0xffffff });
      }

      graphic.x = x;
      graphic.y = y;

      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 2;
      const particle = new Particle(graphic, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.5,
        gravity: 0.05,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      });

      this.container.addChild(graphic);
      this.particles.push(particle);
    }
  }

  clear() {
    for (const p of this.particles) {
      p.graphic.destroy();
    }
    this.particles = [];
    this.container.removeChildren();
    this._spawnTimer = 0;
  }

  destroy() {
    this.clear();
    this.container.destroy();
  }
}
