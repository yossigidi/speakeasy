import { Graphics, Text, Container } from 'pixi.js';
import ExerciseBase from './ExerciseBase.js';

/**
 * Multiple choice exercise — answer a series of questions.
 */
export default class MultipleChoiceExercise extends ExerciseBase {
  constructor(engine, config) {
    super(engine, config);
    this.questions = config.questions || [];
    this.currentQ = 0;
    this.score = 0;

    this._showQuestion();
  }

  _showQuestion() {
    this._locked = false;
    // Clear previous question UI
    this.panel.removeChildren();

    if (this.currentQ >= this.questions.length) {
      // All done
      this.complete(true);
      return;
    }

    const q = this.questions[this.currentQ];
    const { w, h } = this;

    // Progress text
    const progress = new Text({
      text: `${this.currentQ + 1}/${this.questions.length}`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 13,
        fill: 0xffffff,
        alpha: 0.6,
      },
    });
    progress.anchor.set(0.5, 0);
    progress.x = w / 2;
    progress.y = h * 0.08;
    this.panel.addChild(progress);

    if (q.pictureMode && q.pictureOptions) {
      // --- Picture mode for levels 1-2 ---
      const SUFFIX = { he: 'He', ar: 'Ar', ru: 'Ru' };
      const suffix = SUFFIX[this.uiLang] || '';

      // Speaker button — tap to replay
      const targetObj = q.pictureOptions.find(o => o.word === q.answer) || q.pictureOptions[0];
      this.createSpeakerButton(w / 2, h * 0.2, () => {
        this.speakWithTranslation(q.answer, targetObj);
      });

      // 2×2 picture card grid
      const cardSize = 88;
      const cardGap = 14;
      const totalW = cardSize * 2 + cardGap;
      const startX = (w - totalW) / 2;
      const startY = h * 0.32;

      const shuffled = [...q.pictureOptions].sort(() => Math.random() - 0.5);
      shuffled.forEach((opt, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = startX + col * (cardSize + cardGap);
        const y = startY + row * (cardSize + 15 + cardGap);
        const label = opt['translation' + suffix] || opt.translation;

        this.createPictureCard(opt.emoji, label, x, y, cardSize, () => {
          this._handlePictureAnswer(opt.word, q.answer, targetObj);
        });
      });

      // Auto-speak English + translation
      setTimeout(() => this.speakWithTranslation(q.answer, targetObj), 300);
    } else {
      // --- Standard text mode (levels 3-4) ---

      // Image/emoji
      if (q.image) {
        const img = new Text({
          text: q.image,
          style: { fontSize: 56 },
        });
        img.anchor.set(0.5);
        img.x = w / 2;
        img.y = h * 0.22;
        this.panel.addChild(img);
      }

      // Question text
      const questionText = q['question' + ({he:'He',ar:'Ar',ru:'Ru'}[this.uiLang] || '')] || q.question;
      const qText = new Text({
        text: questionText,
        style: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 16,
          fontWeight: 'bold',
          fill: 0xffffff,
          wordWrap: true,
          wordWrapWidth: w * 0.8,
          align: 'center',
        },
      });
      qText.anchor.set(0.5, 0);
      qText.x = w / 2;
      qText.y = h * 0.32;
      this.panel.addChild(qText);

      // Option buttons
      const shuffled = [...q.options].sort(() => Math.random() - 0.5);
      const btnW = Math.min(w * 0.38, 140);
      const btnH = 44;
      const gap = 10;
      const cols = 2;
      const startY = h * 0.48;

      // Map color words to their actual colors for color-related questions
      const colorWordMap = {
        red: 0xEF4444, blue: 0x3B82F6, green: 0x22C55E, yellow: 0xEAB308,
        orange: 0xF97316, purple: 0x8B5CF6, pink: 0xEC4899, black: 0x374151,
        white: 0xD1D5DB, brown: 0x92400E,
      };
      const defaultColors = [0x3B82F6, 0x8B5CF6, 0xF59E0B, 0x22C55E];

      shuffled.forEach((option, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = w / 2 + (col === 0 ? -btnW / 2 - gap / 2 : btnW / 2 + gap / 2);
        const y = startY + row * (btnH + gap);

        const btnColor = colorWordMap[option.toLowerCase()] || defaultColors[i % defaultColors.length];
        this.createButton(option, x, y, btnW, btnH, btnColor, () => {
          this._handleAnswer(option, q.answer);
        });
      });

      // Speak the question
      if (q.question) {
        setTimeout(() => this.speak(q.question), 300);
      }
    }
  }

  _handleAnswer(selected, correct) {
    if (this._locked) return;
    if (selected === correct) {
      this._locked = true;
      this.score++;
      this.showFeedback(true, () => {
        this.currentQ++;
        this._showQuestion();
      });
    } else {
      this.showFeedback(false);
    }
  }

  _handlePictureAnswer(selected, correct, targetObj) {
    if (this._locked) return;
    if (selected === correct) {
      this._locked = true;
      this.score++;
      this.showFeedback(true, () => {
        this.currentQ++;
        this._showQuestion();
      });
    } else {
      this.showFeedback(false);
      // Re-speak the target word after wrong answer
      setTimeout(() => {
        if (!this.destroyed) this.speakWithTranslation(correct, targetObj);
      }, 900);
    }
  }
}
