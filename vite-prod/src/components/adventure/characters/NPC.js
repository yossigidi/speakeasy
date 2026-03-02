import { Container, Graphics, Text } from 'pixi.js';

/**
 * NPC character — large emoji + colored body circle + name.
 */
export default class NPC {
  constructor(engine, config) {
    this.engine = engine;
    this.config = config;
    this.container = new Container();
    this.container.label = `npc-${config.id}`;
    this.state = 'idle';

    this._build(config);

    if (config.position) {
      this.container.x = config.position.x * engine.width;
      this.container.y = config.position.y * engine.height;
    }

    engine.worldLayer.addChild(this.container);
  }

  _build(config) {
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
    this.state = state;
    if (this._talkInterval) { clearInterval(this._talkInterval); this._talkInterval = null; }
    if (state === 'talk' || state === 'excited') {
      let tick = 0;
      this._talkInterval = setInterval(() => {
        tick++;
        this.container.scale.y = 1 + Math.sin(tick * 0.4) * 0.05;
        this.container.scale.x = 1 + Math.sin(tick * 0.4 + 1) * 0.02;
      }, 50);
    } else {
      this.container.scale.set(1);
    }
  }

  update(dt) {
    if (this.state === 'idle') {
      this.container.y += Math.sin(Date.now() * 0.002 + this.config.id.charCodeAt(0)) * 0.12;
    }
  }

  destroy() {
    if (this._talkInterval) clearInterval(this._talkInterval);
    this.container.destroy({ children: true });
  }
}
