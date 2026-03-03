import { Container, Graphics, TilingSprite, Texture, Assets } from 'pixi.js';

/**
 * Multi-layer parallax background.
 * Each layer scrolls at a different speed relative to camera movement.
 *
 * Uses procedurally generated color gradients as placeholders
 * until real assets are available.
 */
export default class ParallaxBackground {
  constructor(engine) {
    this.engine = engine;
    this.container = new Container();
    this.container.label = 'parallax';
    this.layers = [];
    this._lastCamX = 0;

    // Insert at bottom of world layer
    engine.worldLayer.addChildAt(this.container, 0);
  }

  /**
   * Load a scene's background definition.
   * @param {Object} bgDef - { layers: [{ asset, speed, y, height, color }] }
   */
  async load(bgDef) {
    this.clear();

    const w = this.engine.width;
    const h = this.engine.height;

    for (const layerDef of (bgDef?.layers || [])) {
      let sprite;

      if (layerDef.color) {
        // Procedural gradient layer
        const g = new Graphics();
        const colors = Array.isArray(layerDef.color) ? layerDef.color : [layerDef.color, layerDef.color];
        const layerH = layerDef.height || (h / 3);
        const layerY = layerDef.y || 0;

        // Draw solid color band
        g.rect(0, 0, w * 3, layerH);
        g.fill({ color: colors[0] });

        // Optional gradient overlay
        if (colors[1] !== colors[0]) {
          for (let i = 0; i < layerH; i += 4) {
            const t = i / layerH;
            const r = ((colors[0] >> 16) & 0xff) * (1 - t) + ((colors[1] >> 16) & 0xff) * t;
            const gv = ((colors[0] >> 8) & 0xff) * (1 - t) + ((colors[1] >> 8) & 0xff) * t;
            const b = (colors[0] & 0xff) * (1 - t) + (colors[1] & 0xff) * t;
            g.rect(0, i, w * 3, 4);
            g.fill({ color: (Math.round(r) << 16) | (Math.round(gv) << 8) | Math.round(b) });
          }
        }

        sprite = g;
        sprite.y = layerY;
      } else if (layerDef.asset) {
        // Load texture asset
        try {
          const tex = await Assets.load(layerDef.asset);
          sprite = new TilingSprite({
            texture: tex,
            width: w * 3,
            height: layerDef.height || (h / 3),
          });
          sprite.y = layerDef.y || 0;
        } catch {
          continue;
        }
      }

      if (sprite) {
        sprite._parallaxSpeed = layerDef.speed || 0.5;
        sprite._baseX = 0;
        this.container.addChild(sprite);
        this.layers.push(sprite);
      }
    }

    // Extend last layer to fill screen if there's a gap at the bottom
    if (this.layers.length > 0) {
      const last = this.layers[this.layers.length - 1];
      const lastBottom = last.y + (last.height || 0);
      if (lastBottom < h) {
        if (last instanceof TilingSprite) {
          last.height = h - last.y + 20;
        } else {
          // For Graphics layers, redraw taller
          const extraH = h - last.y + 20;
          last.clear();
          last.rect(0, 0, w * 3, extraH);
          last.fill({ color: 0x3D6B35 }); // forest ground fallback
        }
      }
    }
  }

  /**
   * Update parallax offset based on camera position.
   */
  scrollTo(camX) {
    for (const layer of this.layers) {
      if (layer instanceof TilingSprite) {
        layer.tilePosition.x = -camX * layer._parallaxSpeed;
      } else {
        layer.x = -camX * layer._parallaxSpeed;
      }
    }
    this._lastCamX = camX;
  }

  clear() {
    for (const layer of this.layers) {
      layer.destroy({ children: true });
    }
    this.layers = [];
  }

  resize(w, h) {
    // Resize layers to fill screen
    for (const layer of this.layers) {
      if (layer instanceof TilingSprite) {
        layer.width = w * 3;
      }
    }
  }

  destroy() {
    this.clear();
    this.container.destroy({ children: true });
  }
}
