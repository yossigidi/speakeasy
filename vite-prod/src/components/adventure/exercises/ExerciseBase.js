import { Container, Graphics, Text } from 'pixi.js';
import { playCorrect, playWrong, playTap } from '../../../utils/gameSounds.js';
import { t } from '../../../utils/translations.js';

/**
 * Base class for all adventure exercises.
 * Provides shared UI (backdrop, prompt, result feedback) and lifecycle.
 */
export default class ExerciseBase {
  constructor(engine, config) {
    this.engine = engine;
    this.config = config;
    this.options = config.options || {};
    this.onComplete = config.onComplete;
    this.container = new Container();
    this.container.label = 'exercise';
    this.destroyed = false;

    // Light full-screen dim (click blocker)
    this.backdrop = new Graphics();
    this.backdrop.rect(0, 0, engine.width, engine.height);
    this.backdrop.fill({ color: 0x000000, alpha: 0.25 });
    this.backdrop.eventMode = 'static'; // Block clicks through
    this.container.addChild(this.backdrop);

    // Centered card panel
    this.cardPanel = new Graphics();
    const pw = engine.width * 0.92;
    const ph = engine.height * 0.75;
    const px = (engine.width - pw) / 2;
    const py = engine.height * 0.06;
    this.cardPanel.roundRect(px, py, pw, ph, 24);
    this.cardPanel.fill({ color: 0x1E1B4B, alpha: 0.88 });
    this.cardPanel.roundRect(px, py, pw, ph, 24);
    this.cardPanel.stroke({ width: 1.5, color: 0xffffff, alpha: 0.12 });
    this.container.addChild(this.cardPanel);

    // Exercise panel
    this.panel = new Container();
    this.container.addChild(this.panel);

    engine.uiLayer.addChild(this.container);

    // Animate in
    this.container.alpha = 0;
    this._fadeIn();
  }

  get uiLang() { return this.options.uiLang || 'he'; }
  get w() { return this.engine.width; }
  get h() { return this.engine.height; }

  _fadeIn() {
    const start = performance.now();
    const tick = () => {
      if (this.destroyed) return;
      const t = Math.min((performance.now() - start) / 300, 1);
      this.container.alpha = t;
      if (t < 1) requestAnimationFrame(tick);
    };
    tick();
  }

  /**
   * Show a prompt text at the top of the panel.
   */
  showPrompt(text) {
    const prompt = new Text({
      text,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: this.w * 0.8,
        align: 'center',
      },
    });
    prompt.anchor.set(0.5, 0);
    prompt.x = this.w / 2;
    prompt.y = this.h * 0.12;
    this.panel.addChild(prompt);
    return prompt;
  }

  /**
   * Create a rounded button.
   */
  createButton(text, x, y, width, height, color, onClick) {
    const btn = new Container();
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, height / 2);
    bg.fill({ color });
    btn.addChild(bg);

    const label = new Text({
      text,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: Math.min(18, height * 0.5),
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
      },
    });
    label.anchor.set(0.5);
    label.x = width / 2;
    label.y = height / 2;
    btn.addChild(label);

    btn.x = x - width / 2;
    btn.y = y;

    btn.on('pointerdown', () => {
      try { playTap(); } catch {}
      // Quick press animation
      btn.scale.set(0.92);
      setTimeout(() => { if (!btn.destroyed) btn.scale.set(1); }, 100);
      if (onClick) onClick();
    });

    this.panel.addChild(btn);
    return btn;
  }

  /**
   * Show correct/wrong feedback.
   */
  showFeedback(correct, callback) {
    try {
      if (correct) playCorrect();
      else playWrong();
    } catch {}

    const text = correct
      ? t('advCorrect', this.uiLang)
      : t('advTryAgain', this.uiLang);

    const feedback = new Text({
      text,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 28,
        fontWeight: 'bold',
        fill: correct ? 0x22C55E : 0xEF4444,
        align: 'center',
        dropShadow: true,
        dropShadowDistance: 2,
        dropShadowAlpha: 0.3,
      },
    });
    feedback.anchor.set(0.5);
    feedback.x = this.w / 2;
    feedback.y = this.h * 0.45;
    this.panel.addChild(feedback);

    // Scale pop animation
    feedback.scale.set(0);
    const start = performance.now();
    const tick = () => {
      if (this.destroyed) return;
      const t = Math.min((performance.now() - start) / 300, 1);
      // Elastic out
      const p = 0.4;
      const s = t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
      feedback.scale.set(s);
      if (t < 1) requestAnimationFrame(tick);
    };
    tick();

    if (callback) {
      setTimeout(() => {
        if (!this.destroyed) callback();
      }, correct ? 1200 : 800);
    }
  }

  /**
   * Speak a word via TTS.
   */
  speak(text, lang = 'en-US') {
    if (this.options.speak) {
      this.options.speak(text, { lang, rate: 0.8 });
    }
  }

  complete(success = true) {
    if (this.onComplete) this.onComplete(success);
  }

  update(dt) {
    // Override in subclass if needed
  }

  destroy() {
    this.destroyed = true;
    if (this.container?.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy({ children: true });
  }
}
