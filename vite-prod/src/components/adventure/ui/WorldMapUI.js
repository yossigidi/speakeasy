import { Container, Graphics, Text, Sprite, Assets } from 'pixi.js';
import { t } from '../../../utils/translations.js';

/**
 * PixiJS world map — shows world nodes connected by paths.
 * Used within the PixiJS canvas (alternative to the React world map overlay).
 */
export default class WorldMapUI {
  constructor(engine, options) {
    this.engine = engine;
    this.options = options;
    this.container = new Container();
    this.container.label = 'world-map';
    this.nodes = [];

    this._build();
    engine.uiLayer.addChild(this.container);
  }

  _build() {
    const { width: w, height: h } = this.engine;
    const progress = this.options.adventureProgress?.worldProgress || {};

    // Background
    const bg = new Graphics();
    bg.rect(0, 0, w, h);
    bg.fill({ color: 0x0F172A });
    this.container.addChild(bg);

    // Title
    const title = new Text({
      text: ({he: 'ההרפתקה של ספיקלי', ar: 'مغامرة سبيكلي', ru: 'Приключение Спикли'}[this.options.uiLang] || "Speakli's Adventure"),
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 22,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
      },
    });
    title.anchor.set(0.5, 0);
    title.x = w / 2;
    title.y = 40;
    this.container.addChild(title);

    // World nodes
    const worlds = [
      { id: 'forest', emoji: '🌲', color: 0x22C55E, unlocked: true, icon: '/images/adventure/objects/world-icon-forest.jpg' },
      { id: 'ocean', emoji: '🌊', color: 0x0EA5E9, unlocked: false, icon: '/images/adventure/objects/world-icon-ocean.jpg' },
      { id: 'space', emoji: '🚀', color: 0x6366F1, unlocked: false, icon: '/images/adventure/objects/world-icon-space.jpg' },
      { id: 'castle', emoji: '🏰', color: 0xF59E0B, unlocked: false, icon: '/images/adventure/objects/world-icon-castle.jpg' },
    ];

    const startY = 120;
    const spacing = (h - startY - 80) / worlds.length;

    worlds.forEach((world, i) => {
      const x = w / 2 + (i % 2 === 0 ? -40 : 40);
      const y = startY + i * spacing;

      // Path line to next
      if (i < worlds.length - 1) {
        const nextX = w / 2 + ((i + 1) % 2 === 0 ? -40 : 40);
        const nextY = startY + (i + 1) * spacing;
        const line = new Graphics();
        line.moveTo(x, y + 25);
        line.lineTo(nextX, nextY - 25);
        line.stroke({ color: world.unlocked ? 0xffffff : 0x475569, width: 2, alpha: 0.3 });
        this.container.addChild(line);
      }

      // Node
      const node = new Container();
      node.x = x;
      node.y = y;

      // Border ring
      const ring = new Graphics();
      ring.circle(0, 0, 33);
      ring.stroke({ color: world.unlocked ? 0xffffff : 0x475569, width: 2, alpha: world.unlocked ? 0.5 : 0.3 });
      node.addChild(ring);

      // Color circle fallback (visible until sprite loads, or as base for locked)
      const circle = new Graphics();
      circle.circle(0, 0, 30);
      circle.fill({ color: world.unlocked ? world.color : 0x475569 });
      node.addChild(circle);

      // Emoji fallback
      const emoji = new Text({ text: world.emoji, style: { fontSize: 26 } });
      emoji.anchor.set(0.5);
      node.addChild(emoji);

      // Try loading sprite icon
      this._loadWorldIcon(node, world, circle, emoji);

      if (!world.unlocked) {
        const lock = new Text({ text: '🔒', style: { fontSize: 14 } });
        lock.anchor.set(0.5);
        lock.y = 20;
        node.addChild(lock);
      }

      // Progress text
      const wp = progress[world.id];
      if (wp) {
        const prog = new Text({
          text: `${wp.scenesCompleted}/6`,
          style: { fontFamily: 'Arial', fontSize: 10, fill: 0xffffff, fontWeight: 'bold' },
        });
        prog.anchor.set(0.5);
        prog.y = 36;
        node.addChild(prog);
      }

      if (world.unlocked) {
        node.eventMode = 'static';
        node.cursor = 'pointer';
        node.on('pointerdown', () => {
          if (this.onSelectWorld) this.onSelectWorld(world.id);
        });
      }

      this.container.addChild(node);
      this.nodes.push(node);
    });
  }

  async _loadWorldIcon(node, world, fallbackCircle, fallbackEmoji) {
    try {
      const tex = await Assets.load(world.icon);
      const sprite = Sprite.from(tex);
      const diameter = 60;
      const scale = diameter / Math.min(sprite.texture.width, sprite.texture.height);
      sprite.scale.set(scale);
      sprite.anchor.set(0.5);

      // Circle mask
      const mask = new Graphics();
      mask.circle(0, 0, 30);
      mask.fill({ color: 0xffffff });
      node.addChild(mask);
      sprite.mask = mask;
      node.addChild(sprite);

      // Remove fallbacks
      node.removeChild(fallbackCircle);
      fallbackCircle.destroy();
      node.removeChild(fallbackEmoji);
      fallbackEmoji.destroy();
    } catch {
      // Keep emoji + circle fallback
    }
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
