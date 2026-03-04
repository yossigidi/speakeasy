import { Container, Graphics, Text } from 'pixi.js';

/**
 * PixiJS speech bubble with text and a pointer tail.
 */
export default class SpeechBubble {
  constructor(engine, text, x, y, options = {}) {
    this.engine = engine;
    this.container = new Container();
    this.container.label = 'speech-bubble';

    const maxWidth = Math.min(engine.width * 0.7, 280);
    const padding = 14;
    const tailHeight = 12;
    const isRTL = options.rtl ?? /[\u0590-\u05FF\u0600-\u06FF]/.test(text);

    // Text
    const textObj = new Text({
      text,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fontWeight: '600',
        fill: 0x1a1a2e,
        wordWrap: true,
        wordWrapWidth: maxWidth - padding * 2,
        align: isRTL ? 'right' : 'left',
        direction: isRTL ? 'rtl' : 'ltr',
      },
    });

    const bubbleW = Math.max(textObj.width + padding * 2, 60);
    const bubbleH = textObj.height + padding * 2;

    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, bubbleW, bubbleH, 12);
    bg.fill({ color: 0xffffff, alpha: 0.95 });
    bg.stroke({ color: 0xe2e8f0, width: 1.5 });

    // Tail
    const tailX = bubbleW / 2;
    bg.moveTo(tailX - 8, bubbleH);
    bg.lineTo(tailX, bubbleH + tailHeight);
    bg.lineTo(tailX + 8, bubbleH);
    bg.closePath();
    bg.fill({ color: 0xffffff, alpha: 0.95 });

    // Position text
    textObj.x = padding;
    textObj.y = padding;

    this.container.addChild(bg, textObj);

    // Position container (centered above the anchor point)
    this.container.x = x - bubbleW / 2;
    this.container.y = y - bubbleH - tailHeight;

    // Keep on screen
    if (this.container.x < 8) this.container.x = 8;
    if (this.container.x + bubbleW > engine.width - 8) {
      this.container.x = engine.width - bubbleW - 8;
    }
    if (this.container.y < 8) this.container.y = 8;

    // Animate in
    this.container.alpha = 0;
    this.container.scale.set(0.8);
    this._animateIn();

    engine.uiLayer.addChild(this.container);
  }

  _animateIn() {
    const start = performance.now();
    const tick = () => {
      const t = Math.min((performance.now() - start) / 200, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      this.container.alpha = eased;
      this.container.scale.set(0.8 + 0.2 * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    tick();
  }

  destroy() {
    this._destroyed = true;
    // Animate out then remove from display tree
    const start = performance.now();
    const tick = () => {
      if (!this.container?.parent) return;
      const t = Math.min((performance.now() - start) / 150, 1);
      try {
        this.container.alpha = 1 - t;
        this.container.scale.set(1 - 0.2 * t);
      } catch { return; }
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        // Remove from parent and destroy display objects
        if (this.container.parent) {
          this.container.parent.removeChild(this.container);
        }
        this.container.destroy({ children: true });
      }
    };
    tick();
  }
}
