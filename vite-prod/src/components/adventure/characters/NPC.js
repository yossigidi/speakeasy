import { Container, Graphics, Text } from 'pixi.js';

/**
 * NPC base class — drawn with simple shapes + emoji.
 */
export default class NPC {
  constructor(engine, config) {
    this.engine = engine;
    this.config = config;
    this.container = new Container();
    this.container.label = `npc-${config.id}`;
    this.state = 'idle';

    // Draw character
    this._build(config);

    // Position (normalized)
    if (config.position) {
      this.container.x = config.position.x * engine.width;
      this.container.y = config.position.y * engine.height;
    }

    engine.worldLayer.addChild(this.container);
  }

  _build(config) {
    // Override in subclass for specific shapes
    const g = new Graphics();

    // Body circle
    g.circle(0, -20, 18);
    g.fill({ color: config.bodyColor || 0x8B5CF6 });

    // Head circle
    g.circle(0, -45, 14);
    g.fill({ color: config.headColor || config.bodyColor || 0x8B5CF6 });

    // Eyes
    g.circle(-5, -48, 3);
    g.fill({ color: 0xffffff });
    g.circle(-4, -48, 1.5);
    g.fill({ color: 0x000000 });
    g.circle(5, -48, 3);
    g.fill({ color: 0xffffff });
    g.circle(6, -48, 1.5);
    g.fill({ color: 0x000000 });

    this.body = g;
    this.container.addChild(g);

    // Emoji identifier
    if (config.emoji) {
      const emojiText = new Text({
        text: config.emoji,
        style: { fontSize: 28 },
      });
      emojiText.anchor.set(0.5, 0.5);
      emojiText.y = -36;
      this.container.addChild(emojiText);
    }

    // Name label
    const name = new Text({
      text: config.displayName || config.id,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
        dropShadow: true,
        dropShadowAlpha: 0.5,
        dropShadowDistance: 1,
      },
    });
    name.anchor.set(0.5, 1);
    name.y = -65;
    this.container.addChild(name);
  }

  setState(state) {
    this.state = state;
    // Simple placeholder animations
    switch (state) {
      case 'talk':
      case 'excited':
        this._talkPulse(true);
        break;
      default:
        this._talkPulse(false);
        break;
    }
  }

  _talkPulse(on) {
    if (this._talkInterval) {
      clearInterval(this._talkInterval);
      this._talkInterval = null;
    }
    if (on) {
      let tick = 0;
      this._talkInterval = setInterval(() => {
        tick++;
        this.container.scale.y = 1 + Math.sin(tick * 0.4) * 0.04;
      }, 50);
    } else {
      this.container.scale.y = 1;
    }
  }

  update(dt) {
    // Idle bobbing
    if (this.state === 'idle') {
      this.container.y += Math.sin(Date.now() * 0.002 + this.config.id.charCodeAt(0)) * 0.1;
    }
  }

  destroy() {
    if (this._talkInterval) clearInterval(this._talkInterval);
    this.container.destroy({ children: true });
  }
}
