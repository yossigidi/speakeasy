import { Graphics, Text, Container } from 'pixi.js';
import ExerciseBase from './ExerciseBase.js';

/**
 * "Say the word to open the door" exercise.
 * Shows the target word + translation, with distractor buttons.
 * Correct answer "opens the door" with animation.
 */
export default class WordDoorExercise extends ExerciseBase {
  constructor(engine, config) {
    super(engine, config);
    this.targetWord = config.targetWord;
    this.distractors = config.distractors || [];
    this.attempts = 0;

    this._build();
  }

  _build() {
    const { w, h } = this;
    const prompt = this.uiLang === 'he'
      ? (this.config.promptHe || 'בחרו את המילה הנכונה!')
      : (this.config.prompt || 'Choose the right word!');
    this.showPrompt(prompt);

    // Door graphic
    const door = new Graphics();
    const doorW = 100;
    const doorH = 140;
    const doorX = w / 2 - doorW / 2;
    const doorY = h * 0.18;
    door.roundRect(doorX, doorY, doorW, doorH, 8);
    door.fill({ color: 0x8B4513 });
    // Door frame
    door.roundRect(doorX - 4, doorY - 4, doorW + 8, doorH + 8, 10);
    door.stroke({ color: 0x5C3317, width: 3 });
    // Door handle
    door.circle(doorX + doorW - 18, doorY + doorH / 2, 5);
    door.fill({ color: 0xFBBF24 });
    // Lock icon
    const lockText = new Text({ text: '🔒', style: { fontSize: 24 } });
    lockText.anchor.set(0.5);
    lockText.x = w / 2;
    lockText.y = doorY + doorH / 2 - 15;
    this.panel.addChild(door, lockText);
    this._lockIcon = lockText;
    this._door = door;

    // Translation hint
    const translationText = new Text({
      text: this.targetWord.translation,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xFBBF24,
        align: 'center',
      },
    });
    translationText.anchor.set(0.5);
    translationText.x = w / 2;
    translationText.y = h * 0.18 + 150;
    this.panel.addChild(translationText);

    // Shuffle options
    const allOptions = [this.targetWord.word, ...this.distractors];
    const shuffled = allOptions.sort(() => Math.random() - 0.5);

    // Option buttons
    const btnW = Math.min(w * 0.38, 140);
    const btnH = 48;
    const gap = 12;
    const cols = 2;
    const startY = h * 0.55;

    shuffled.forEach((word, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = w / 2 + (col === 0 ? -btnW / 2 - gap / 2 : btnW / 2 + gap / 2);
      const y = startY + row * (btnH + gap);

      this.createButton(word, x, y, btnW, btnH, 0x3B82F6, () => {
        this._handleChoice(word);
      });
    });

    // Speak the translation
    setTimeout(() => this.speak(this.targetWord.word), 500);
  }

  _handleChoice(word) {
    this.attempts++;
    if (word === this.targetWord.word) {
      // Correct! Open the door
      this._lockIcon.text = '🔓';
      this.showFeedback(true, () => {
        this._animateDoorOpen(() => {
          this.complete(true);
        });
      });
    } else {
      this.showFeedback(false);
    }
  }

  _animateDoorOpen(callback) {
    const start = performance.now();
    const tick = () => {
      const t = Math.min((performance.now() - start) / 600, 1);
      if (this._door) {
        this._door.alpha = 1 - t;
        this._door.scale.x = 1 - t * 0.5;
      }
      if (t < 1) {
        requestAnimationFrame(tick);
      } else if (callback) {
        callback();
      }
    };
    tick();
  }
}
