import { Container, Graphics, Text, Sprite, Assets } from 'pixi.js';

/**
 * NPC character — sprite image with emoji+circle fallback + name.
 */
export default class NPC {
  constructor(engine, config) {
    this.engine = engine;
    this.config = config;
    this.container = new Container();
    this.container.label = `npc-${config.id}`;
    this.state = 'idle';

    // Build with fallback first, then try sprite
    this._buildFallback(config);

    if (config.position) {
      this.container.x = config.position.x * engine.width;
      this.container.y = config.position.y * engine.height;
    }

    engine.worldLayer.addChild(this.container);

    // Attempt to load sprite image (replaces fallback on success)
    if (config.sprite) {
      this._loadSprite(config);
    }
  }

  async _loadSprite(config) {
    try {
      const tex = await Assets.load(config.sprite);
      if (this._destroyed) return;
      // Remove fallback body + emoji (keep shadow at index 0 and name label at end)
      if (this._body) { this.container.removeChild(this._body); this._body.destroy(); this._body = null; }
      if (this._emoji) { this.container.removeChild(this._emoji); this._emoji.destroy(); this._emoji = null; }

      const sprite = Sprite.from(tex);
      const targetH = 90;
      const scale = targetH / sprite.texture.height;
      sprite.scale.set(scale);
      sprite.anchor.set(0.5, 1); // bottom-center
      sprite.y = 0;
      this._sprite = sprite;

      // Circular portrait mask to hide JPG white background
      const radius = targetH * 0.44;
      const centerY = -targetH / 2;

      // Colored ring behind the sprite
      const ring = new Graphics();
      ring.circle(0, centerY, radius + 3);
      ring.fill({ color: config.bodyColor || 0x8B5CF6, alpha: 0.8 });
      this.container.addChildAt(ring, 1); // after shadow
      this._ring = ring;

      // Insert sprite after ring (index 2)
      this.container.addChildAt(sprite, 2);

      // Circular mask on sprite
      const mask = new Graphics();
      mask.circle(0, centerY, radius);
      mask.fill({ color: 0xffffff });
      this.container.addChild(mask);
      sprite.mask = mask;
      this._mask = mask;
    } catch {
      // Keep fallback rendering
    }
  }

  _buildFallback(config) {
    // Shadow
    const shadow = new Graphics();
    shadow.ellipse(0, 2, 28, 8);
    shadow.fill({ color: 0x000000, alpha: 0.25 });
    this.container.addChild(shadow);

    // Body circle (large)
    const body = new Graphics();
    body.circle(0, -38, 32);
    body.fill({ color: config.bodyColor || 0x8B5CF6 });
    // Highlight
    body.circle(-8, -50, 10);
    body.fill({ color: 0xffffff, alpha: 0.15 });
    this.container.addChild(body);
    this._body = body;

    // Large emoji
    const emoji = new Text({
      text: config.emoji || '❓',
      style: { fontSize: 40 },
    });
    emoji.anchor.set(0.5, 0.5);
    emoji.y = -40;
    this.container.addChild(emoji);
    this._emoji = emoji;

    // Name label with background
    const name = new Text({
      text: config.displayName || config.id,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 13,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
        dropShadow: true,
        dropShadowDistance: 1,
        dropShadowAlpha: 0.6,
      },
    });
    name.anchor.set(0.5, 0);
    name.y = -80;
    this.container.addChild(name);
  }

  setState(state) {
    if (this._destroyed) return;
    this.state = state;
    if (this._talkInterval) { clearInterval(this._talkInterval); this._talkInterval = null; }
    if (state === 'talk' || state === 'excited') {
      let tick = 0;
      this._talkInterval = setInterval(() => {
        if (this._destroyed) { clearInterval(this._talkInterval); return; }
        tick++;
        this.container.scale.y = 1 + Math.sin(tick * 0.4) * 0.05;
        this.container.scale.x = 1 + Math.sin(tick * 0.4 + 1) * 0.02;
      }, 50);
    } else {
      this.container.scale.set(1);
    }
  }

  update(dt) {
    if (this._destroyed) return;
    if (this.state === 'idle') {
      this.container.y += Math.sin(Date.now() * 0.002 + this.config.id.charCodeAt(0)) * 0.12;
    }
  }

  destroy() {
    this._destroyed = true;
    if (this._talkInterval) { clearInterval(this._talkInterval); this._talkInterval = null; }
    if (this._sprite) this._sprite.mask = null;
    if (this._mask) { this._mask.destroy(); this._mask = null; }
    if (this._ring) { this._ring.destroy(); this._ring = null; }
    try { this.container.destroy({ children: true }); } catch {}
  }
}
