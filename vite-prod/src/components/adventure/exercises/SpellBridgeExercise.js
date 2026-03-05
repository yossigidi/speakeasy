import { Graphics, Text, Container } from 'pixi.js';
import ExerciseBase from './ExerciseBase.js';

/**
 * "Arrange letters to spell a word" exercise.
 * Shows a broken bridge; each correct letter adds a plank.
 */
export default class SpellBridgeExercise extends ExerciseBase {
  constructor(engine, config) {
    super(engine, config);
    this.targetWord = config.targetWord;
    this.letters = config.targetWord.word.split('');
    this.placed = [];
    this.letterButtons = [];

    this._build();
  }

  _build() {
    const { w, h } = this;
    const suffix = {he:'He',ar:'Ar',ru:'Ru'}[this.uiLang] || '';
    const hint = this.config['hint' + suffix] || this.config.hint || 'Arrange the letters!';
    this.showPrompt(hint);

    // Bridge graphic
    this._bridgeY = h * 0.38;
    this._drawBridge();

    // Translation
    const LANG_SUFFIX = {he:'He',ar:'Ar',ru:'Ru'};
    const trans = new Text({
      text: this.targetWord['translation' + (LANG_SUFFIX[this.uiLang] || '')] || this.targetWord.translation,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xFBBF24,
        align: 'center',
      },
    });
    trans.anchor.set(0.5);
    trans.x = w / 2;
    trans.y = h * 0.26;
    this.panel.addChild(trans);

    // Target slots (empty boxes for each letter)
    this.slotContainers = [];
    const slotSize = 40;
    const slotGap = 8;
    const totalSlotsW = this.letters.length * (slotSize + slotGap) - slotGap;
    const slotsStartX = w / 2 - totalSlotsW / 2;

    for (let i = 0; i < this.letters.length; i++) {
      const slot = new Graphics();
      const sx = slotsStartX + i * (slotSize + slotGap);
      slot.roundRect(sx, this._bridgeY - 50, slotSize, slotSize, 8);
      slot.stroke({ color: 0xffffff, width: 2 });
      slot.fill({ color: 0xffffff, alpha: 0.1 });
      this.panel.addChild(slot);

      // Letter text (hidden until placed)
      const letterText = new Text({
        text: '',
        style: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 22,
          fontWeight: 'bold',
          fill: 0xffffff,
        },
      });
      letterText.anchor.set(0.5);
      letterText.x = sx + slotSize / 2;
      letterText.y = this._bridgeY - 50 + slotSize / 2;
      this.panel.addChild(letterText);
      this.slotContainers.push({ slot, letterText });
    }

    // Scrambled letter buttons
    const scrambled = [...this.letters].sort(() => Math.random() - 0.5);
    const btnSize = 44;
    const btnGap = 10;
    const totalBtnsW = scrambled.length * (btnSize + btnGap) - btnGap;
    const btnsStartX = w / 2 - totalBtnsW / 2;
    const btnsY = h * 0.58;

    scrambled.forEach((letter, i) => {
      const btn = new Container();
      btn.eventMode = 'static';
      btn.cursor = 'pointer';

      const bg = new Graphics();
      bg.roundRect(0, 0, btnSize, btnSize, 10);
      bg.fill({ color: 0x6366F1 });
      btn.addChild(bg);

      const label = new Text({
        text: letter.toUpperCase(),
        style: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 22,
          fontWeight: 'bold',
          fill: 0xffffff,
        },
      });
      label.anchor.set(0.5);
      label.x = btnSize / 2;
      label.y = btnSize / 2;
      btn.addChild(label);

      btn.x = btnsStartX + i * (btnSize + btnGap);
      btn.y = btnsY;

      btn._letter = letter;
      btn._used = false;
      btn.on('pointerdown', () => this._handleLetterTap(btn));

      this.panel.addChild(btn);
      this.letterButtons.push(btn);
    });

    // Speak the word
    setTimeout(() => this.speak(this.targetWord.word), 500);
  }

  _drawBridge() {
    const { w, h } = this;
    const bridge = new Graphics();
    const bw = w * 0.6;
    const bx = w / 2 - bw / 2;

    // Bridge sides
    bridge.rect(bx, this._bridgeY, 8, 40);
    bridge.fill({ color: 0x8B4513 });
    bridge.rect(bx + bw - 8, this._bridgeY, 8, 40);
    bridge.fill({ color: 0x8B4513 });

    // Planks (one per letter)
    const plankW = bw / (this.letters.length + 1);
    for (let i = 0; i < this.letters.length; i++) {
      if (i < this.placed.length) {
        // Placed plank
        bridge.rect(bx + 10 + i * plankW, this._bridgeY + 10, plankW - 4, 8);
        bridge.fill({ color: 0xD2691E });
      } else {
        // Gap
        bridge.rect(bx + 10 + i * plankW, this._bridgeY + 10, plankW - 4, 8);
        bridge.fill({ color: 0xffffff, alpha: 0.1 });
      }
    }

    if (this._bridgeGraphic) {
      this.panel.removeChild(this._bridgeGraphic);
      this._bridgeGraphic.destroy();
    }
    this._bridgeGraphic = bridge;
    this.panel.addChild(bridge);
  }

  _handleLetterTap(btn) {
    if (this._locked || btn._used) return;

    const expected = this.letters[this.placed.length];
    if (btn._letter === expected) {
      // Correct letter
      btn._used = true;
      btn.alpha = 0.3;

      this.placed.push(btn._letter);
      const slotIdx = this.placed.length - 1;
      if (this.slotContainers[slotIdx]) {
        this.slotContainers[slotIdx].letterText.text = btn._letter.toUpperCase();
      }

      this._drawBridge();

      // Check completion
      if (this.placed.length === this.letters.length) {
        this._locked = true;
        this.showFeedback(true, () => this.complete(true));
      } else {
        try { import('../../../utils/gameSounds.js').then(m => m.playTap()); } catch {}
      }
    } else {
      // Wrong letter — shake
      this.showFeedback(false);
      this._shakeButton(btn);
    }
  }

  _shakeButton(btn) {
    const origX = btn.x;
    let tick = 0;
    const shake = () => {
      tick++;
      btn.x = origX + Math.sin(tick * 1.5) * 4;
      if (tick < 6) requestAnimationFrame(shake);
      else btn.x = origX;
    };
    shake();
  }
}
