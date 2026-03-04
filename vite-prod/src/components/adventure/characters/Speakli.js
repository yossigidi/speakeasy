import { Container, Graphics, Text, Sprite, Assets } from 'pixi.js';

/**
 * Speakli — the main penguin character.
 * Uses the real speakli-icon.webp image as sprite.
 */
export default class Speakli {
  constructor(engine) {
    this.engine = engine;
    this.container = new Container();
    this.container.label = 'speakli';
    this.state = 'idle';
    this._imageLoaded = false;

    // Movement
    this._walkTarget = null;
    this._walkResolve = null;
    this.walkSpeed = 3;

    // Load real image
    this._loadImage();
    engine.worldLayer.addChild(this.container);
  }

  get x() { return this.container.x; }
  set x(v) { this.container.x = v; }
  get y() { return this.container.y; }
  set y(v) { this.container.y = v; }

  async _loadImage() {
    try {
      const texture = await Assets.load('/images/speakli-icon.webp');
      this._sprite = new Sprite(texture);
      this._sprite.anchor.set(0.5, 1);
      this._sprite.width = 90;
      this._sprite.height = 90;
      this.container.addChild(this._sprite);
      this._imageLoaded = true;

      // Circular mask + ring for clean portrait look
      const radius = 38;
      const centerY = -45;
      const ring = new Graphics();
      ring.circle(0, centerY, radius + 3);
      ring.fill({ color: 0x2563EB, alpha: 0.8 });
      this.container.addChildAt(ring, 0);
      this._ring = ring;

      const mask = new Graphics();
      mask.circle(0, centerY, radius);
      mask.fill({ color: 0xffffff });
      this.container.addChild(mask);
      this._sprite.mask = mask;
      this._mask = mask;
    } catch {
      // Fallback: simple colored circle with emoji
      this._buildFallback();
    }

    // Name label
    this._nameLabel = new Text({
      text: 'Speakli',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 13,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
        dropShadow: true,
        dropShadowDistance: 1,
        dropShadowAlpha: 0.5,
      },
    });
    this._nameLabel.anchor.set(0.5, 1);
    this._nameLabel.y = -95;
    this.container.addChild(this._nameLabel);
  }

  _buildFallback() {
    const g = new Graphics();
    g.circle(0, -45, 35);
    g.fill({ color: 0x2563EB });
    g.circle(0, -45, 32);
    g.fill({ color: 0x1a1a2e });
    // White belly
    g.ellipse(0, -35, 18, 22);
    g.fill({ color: 0xffffff });
    // Eyes
    g.circle(-10, -52, 5);
    g.fill({ color: 0xffffff });
    g.circle(-8, -52, 3);
    g.fill({ color: 0x000000 });
    g.circle(10, -52, 5);
    g.fill({ color: 0xffffff });
    g.circle(12, -52, 3);
    g.fill({ color: 0x000000 });
    // Beak
    g.moveTo(-6, -42);
    g.lineTo(6, -42);
    g.lineTo(0, -34);
    g.closePath();
    g.fill({ color: 0xf59e0b });
    // Feet
    g.ellipse(-10, 0, 10, 5);
    g.fill({ color: 0xf59e0b });
    g.ellipse(10, 0, 10, 5);
    g.fill({ color: 0xf59e0b });
    // Scarf
    g.roundRect(-22, -20, 44, 8, 4);
    g.fill({ color: 0x2563eb });

    this.container.addChild(g);
    this._fallback = g;
  }

  setNormalized(nx, ny) {
    this.container.x = nx * this.engine.width;
    this.container.y = ny * this.engine.height;
    this._idleBaseY = this.container.y;
  }

  walkTo(targetX, targetY) {
    return new Promise(resolve => {
      this._walkTarget = { x: targetX, y: targetY };
      this._walkResolve = resolve;
      this.setState('walk');
      if (targetX < this.container.x) {
        this.container.scale.x = -Math.abs(this.container.scale.x || 1);
        if (this._nameLabel) this._nameLabel.scale.x = -1;
      } else {
        this.container.scale.x = Math.abs(this.container.scale.x || 1);
        if (this._nameLabel) this._nameLabel.scale.x = 1;
      }
    });
  }

  walkToNorm(nx, ny) {
    return this.walkTo(nx * this.engine.width, ny * this.engine.height);
  }

  setState(state) {
    if (this.state === state) return;
    this.state = state;
    this._animateState(state);
  }

  _animateState(state) {
    // Clear previous animation
    if (this._talkInterval) { clearInterval(this._talkInterval); this._talkInterval = null; }
    this.container.rotation = 0;

    switch (state) {
      case 'celebrate':
        this._bounceAnim(8, 200);
        break;
      case 'talk':
        this._talkAnim();
        break;
      case 'sad':
        this.container.rotation = -0.12;
        break;
    }
  }

  _bounceAnim(count, interval) {
    let i = 0;
    const baseY = this._idleBaseY ?? this.container.y;
    const bounce = () => {
      if (this._destroyed || i >= count) {
        this.container.y = baseY;
        this._idleBaseY = baseY;
        return;
      }
      this.container.y = baseY - (i % 2 === 0 ? 15 : 0);
      i++;
      this._bounceTimer = setTimeout(bounce, interval);
    };
    bounce();
  }

  _talkAnim() {
    let tick = 0;
    this._talkInterval = setInterval(() => {
      tick++;
      const sy = 1 + Math.sin(tick * 0.5) * 0.04;
      this.container.scale.y = sy;
      if (this.state !== 'talk') {
        clearInterval(this._talkInterval);
        this._talkInterval = null;
        this.container.scale.y = 1;
      }
    }, 50);
  }

  update(dt) {
    // Walk movement
    if (this._walkTarget) {
      const dx = this._walkTarget.x - this.container.x;
      const dy = this._walkTarget.y - this.container.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.walkSpeed * dt) {
        this.container.x = this._walkTarget.x;
        this.container.y = this._walkTarget.y;
        this._walkTarget = null;
        this._idleBaseY = this.container.y;
        this.setState('idle');
        if (this._walkResolve) { this._walkResolve(); this._walkResolve = null; }
      } else {
        this.container.x += (dx / dist) * this.walkSpeed * dt;
        this.container.y += (dy / dist) * this.walkSpeed * dt;
      }
    }
    // Idle bobbing (absolute offset to prevent drift)
    if (this.state === 'idle' && !this._walkTarget) {
      if (this._idleBaseY == null) this._idleBaseY = this.container.y;
      this.container.y = this._idleBaseY + Math.sin(Date.now() * 0.003) * 3;
    }
  }

  destroy() {
    this._destroyed = true;
    if (this._talkInterval) clearInterval(this._talkInterval);
    if (this._bounceTimer) clearTimeout(this._bounceTimer);
    if (this._sprite) this._sprite.mask = null;
    if (this._mask) { this._mask.destroy(); this._mask = null; }
    if (this._ring) { this._ring.destroy(); this._ring = null; }
    this.container.destroy({ children: true });
  }
}
