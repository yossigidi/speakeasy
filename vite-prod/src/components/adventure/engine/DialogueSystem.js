import SpeechBubble from '../ui/SpeechBubble.js';

/**
 * Manages story dialogue sequences.
 * Shows speech bubbles over characters and integrates with TTS.
 */
export default class DialogueSystem {
  constructor(engine, options) {
    this.engine = engine;
    this.options = options;
    this.active = false;
    this.queue = [];
    this.currentBubble = null;
    this._resolve = null;
    this._autoAdvanceTimer = null;
  }

  get isActive() { return this.active; }

  /**
   * Play a dialogue sequence.
   * @param {Array} lines - [{ speaker, text, textHe, emotion }]
   * @param {Object} speakers - map of speaker id → { container } (display objects)
   * @returns {Promise} resolves when all lines are done
   */
  async play(lines, speakers = {}) {
    this.active = true;
    this.queue = [...lines];

    return new Promise(resolve => {
      this._resolve = resolve;
      this._showNext(speakers);
    });
  }

  _showNext(speakers) {
    if (this.queue.length === 0) {
      this._cleanup();
      if (this._resolve) {
        const r = this._resolve;
        this._resolve = null;
        r();
      }
      return;
    }

    const line = this.queue.shift();
    const uiLang = this.options.uiLang || 'he';
    const text = uiLang === 'he' ? (line.textHe || line.text) : line.text;

    // Find speaker's display object
    let anchor = null;
    if (line.speaker === 'speakli' && this.engine.speakli) {
      anchor = this.engine.speakli.container;
      // Set Speakli's animation state
      if (line.emotion) this.engine.speakli.setState(line.emotion === 'excited' ? 'talk' : line.emotion);
      else this.engine.speakli.setState('talk');
    } else if (speakers[line.speaker]) {
      const npc = speakers[line.speaker];
      anchor = npc.container || npc;
      if (npc.setState && line.emotion) npc.setState(line.emotion);
    }

    // Remove previous bubble
    if (this.currentBubble) {
      this.currentBubble.destroy();
      this.currentBubble = null;
    }

    // Create speech bubble
    const bubbleX = anchor ? anchor.x : this.engine.width / 2;
    const bubbleY = anchor ? anchor.y - 80 : this.engine.height * 0.3;
    this.currentBubble = new SpeechBubble(this.engine, text, bubbleX, bubbleY);

    // Speak via TTS
    const speakLang = (uiLang === 'he') ? 'he' : 'en-US';
    if (this.options.speak) {
      this.options.speak(text, {
        lang: speakLang,
        rate: speakLang === 'he' ? 0.9 : 0.85,
        onEnd: () => {
          // Auto-advance after TTS finishes + small delay
          this._autoAdvanceTimer = setTimeout(() => {
            this._showNext(speakers);
          }, 600);
        },
      });
    } else {
      // No TTS — auto-advance after text display time
      const readTime = Math.max(1500, text.length * 60);
      this._autoAdvanceTimer = setTimeout(() => {
        this._showNext(speakers);
      }, readTime);
    }
  }

  /**
   * Advance to next line (skip current).
   */
  advance() {
    if (!this.active) return;
    if (this._autoAdvanceTimer) {
      clearTimeout(this._autoAdvanceTimer);
      this._autoAdvanceTimer = null;
    }
    if (this.options.stopSpeaking) this.options.stopSpeaking();
    this._showNext(this._speakers || {});
  }

  _cleanup() {
    this.active = false;
    if (this._autoAdvanceTimer) {
      clearTimeout(this._autoAdvanceTimer);
      this._autoAdvanceTimer = null;
    }
    if (this.currentBubble) {
      this.currentBubble.destroy();
      this.currentBubble = null;
    }
    // Reset Speakli to idle
    if (this.engine.speakli) {
      this.engine.speakli.setState('idle');
    }
  }

  destroy() {
    this._cleanup();
  }
}
