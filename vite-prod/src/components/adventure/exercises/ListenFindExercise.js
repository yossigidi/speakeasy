import { Graphics, Text, Container } from 'pixi.js';
import ExerciseBase from './ExerciseBase.js';
import { t } from '../../../utils/translations.js';

/**
 * "Listen and Find" exercise.
 * Plays a word via TTS, shows emoji grid, player taps the matching one.
 */
export default class ListenFindExercise extends ExerciseBase {
  constructor(engine, config) {
    super(engine, config);
    this.words = config.words || [];
    this.totalRounds = config.rounds || 3;
    this.currentRound = 0;
    this.score = 0;
    this._targetWord = null;

    this._nextRound();
  }

  _nextRound() {
    this._locked = false;
    this.panel.removeChildren();

    if (this.currentRound >= this.totalRounds) {
      this.complete(true);
      return;
    }

    const { w, h } = this;

    // Pick target word
    const available = [...this.words];
    this._targetWord = available[this.currentRound % available.length];

    // Prompt
    const promptText = t('advListenAndFind', this.uiLang);
    this.showPrompt(promptText);

    // Round indicator
    const roundText = new Text({
      text: `${this.currentRound + 1}/${this.totalRounds}`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 13,
        fill: 0xffffff,
        alpha: 0.6,
      },
    });
    roundText.anchor.set(0.5, 0);
    roundText.x = w / 2;
    roundText.y = h * 0.07;
    this.panel.addChild(roundText);

    // Speaker button
    const speakerBtn = new Container();
    speakerBtn.eventMode = 'static';
    speakerBtn.cursor = 'pointer';
    const speakerBg = new Graphics();
    speakerBg.circle(0, 0, 28);
    speakerBg.fill({ color: 0x2563EB });
    speakerBtn.addChild(speakerBg);
    const speakerIcon = new Text({ text: '🔊', style: { fontSize: 24 } });
    speakerIcon.anchor.set(0.5);
    speakerBtn.addChild(speakerIcon);
    speakerBtn.x = w / 2;
    speakerBtn.y = h * 0.28;
    speakerBtn.on('pointerdown', () => this.speak(this._targetWord.word));
    this.panel.addChild(speakerBtn);

    // Emoji grid — show all words as tappable emojis
    const shuffled = [...this.words].sort(() => Math.random() - 0.5);
    const gridSize = 70;
    const gap = 14;
    const cols = 2;
    const totalW = cols * (gridSize + gap) - gap;
    const startX = w / 2 - totalW / 2;
    const startY = h * 0.40;

    shuffled.forEach((wordObj, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const btn = new Container();
      btn.eventMode = 'static';
      btn.cursor = 'pointer';

      const bg = new Graphics();
      bg.roundRect(0, 0, gridSize, gridSize, 16);
      bg.fill({ color: 0xffffff, alpha: 0.25 });
      bg.stroke({ color: 0xffffff, width: 2, alpha: 0.5 });
      btn.addChild(bg);

      const emoji = new Text({
        text: wordObj.emoji,
        style: { fontSize: 38 },
      });
      emoji.anchor.set(0.5);
      emoji.x = gridSize / 2;
      emoji.y = gridSize * 0.38;
      btn.addChild(emoji);

      // Translation label under emoji for clarity
      const LANG_SUFFIX = {he:'He',ar:'Ar',ru:'Ru'};
      const label = new Text({
        text: wordObj['translation' + (LANG_SUFFIX[this.uiLang] || '')] || wordObj.translation,
        style: {
          fontFamily: 'Arial, Heebo, sans-serif',
          fontSize: 11,
          fill: 0xffffff,
          alpha: 0.9,
          align: 'center',
        },
      });
      label.anchor.set(0.5, 0);
      label.x = gridSize / 2;
      label.y = gridSize * 0.62;
      btn.addChild(label);

      btn.x = startX + col * (gridSize + gap);
      btn.y = startY + row * (gridSize + gap);

      btn.on('pointerdown', () => {
        this._handleChoice(wordObj);
      });

      this.panel.addChild(btn);
    });

    // Auto-speak the target word
    setTimeout(() => this.speak(this._targetWord.word), 600);
  }

  _handleChoice(wordObj) {
    if (this._locked) return;
    if (wordObj.word === this._targetWord.word) {
      this._locked = true;
      this.score++;
      this.showFeedback(true, () => {
        this.currentRound++;
        this._nextRound();
      });
    } else {
      this.showFeedback(false);
      // Re-speak after wrong answer
      setTimeout(() => this.speak(this._targetWord.word), 1000);
    }
  }
}
