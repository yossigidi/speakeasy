import { getWordsForLevel } from '../../data/kids-vocabulary.js';

/**
 * Adapts hardcoded adventure exercises to be age-appropriate based on child level.
 * Called by SceneManager before running each exercise.
 *
 * @param {object} exerciseDef - The original exercise definition from scene data
 * @param {number} childLevel - 1-4 curriculum level
 * @param {string} uiLang - 'he'|'ar'|'ru'|'en'
 * @returns {object} Adapted exercise definition (same shape, different content)
 */
export function adaptExercise(exerciseDef, childLevel, uiLang) {
  try {
    if (!exerciseDef || !exerciseDef.type) return exerciseDef;

    switch (exerciseDef.type) {
      case 'multipleChoice':
        return adaptMultipleChoice(exerciseDef, childLevel, uiLang);
      case 'wordDoor':
        return adaptWordDoor(exerciseDef, childLevel, uiLang);
      case 'listenFind':
        return adaptListenFind(exerciseDef, childLevel, uiLang);
      case 'spellBridge':
        return adaptSpellBridge(exerciseDef, childLevel, uiLang);
      case 'boss':
        return adaptBoss(exerciseDef, childLevel, uiLang);
      default:
        return exerciseDef;
    }
  } catch (e) {
    console.warn('adaptExercise fallback:', e);
    return exerciseDef;
  }
}

// --- Helpers ---

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n);
}

function getTranslation(wordObj, lang) {
  if (lang === 'ar') return wordObj.translationAr || wordObj.translation;
  if (lang === 'ru') return wordObj.translationRu || wordObj.translation;
  return wordObj.translation; // default Hebrew
}

function getLevelWords(level) {
  return getWordsForLevel(Math.min(level, 4));
}

// --- Multiple Choice ---

function adaptMultipleChoice(def, childLevel, uiLang) {
  const words = getLevelWords(childLevel);
  if (words.length < 4) return def;

  const isEasy = childLevel <= 2;
  const numOptions = isEasy ? 3 : 4;
  const numQuestions = def.config?.questions?.length || 3;

  const selected = pickRandom(words, numQuestions);
  const questions = selected.map(w => {
    const others = shuffle(words.filter(o => o.word !== w.word)).slice(0, numOptions - 1);
    const options = shuffle([w.word, ...others.map(o => o.word)]);

    if (isEasy) {
      // Emoji-based question: "What is this? 🐱"
      return {
        question: `What is this? ${w.emoji}`,
        questionHe: `?${w.emoji} מה זה`,
        questionAr: `ما هذا؟ ${w.emoji}`,
        questionRu: `Что это? ${w.emoji}`,
        answer: w.word,
        options,
        image: w.emoji,
      };
    }
    // Harder question: "Which word means [translation]?"
    const trans = getTranslation(w, uiLang);
    return {
      question: `Which word means "${trans}"?`,
      questionHe: `?${trans}" איזו מילה פירושה"`,
      questionAr: `أي كلمة تعني "${trans}"؟`,
      questionRu: `Какое слово означает "${trans}"?`,
      answer: w.word,
      options,
      image: w.emoji,
    };
  });

  return {
    type: 'multipleChoice',
    config: { ...def.config, questions },
  };
}

// --- Word Door ---

function adaptWordDoor(def, childLevel, uiLang) {
  const words = getLevelWords(childLevel);
  if (words.length < 3) return def;

  const isEasy = childLevel <= 2;
  const numDistractors = isEasy ? 2 : 3;

  const target = pickRandom(words, 1)[0];
  const distractors = shuffle(words.filter(w => w.word !== target.word))
    .slice(0, numDistractors)
    .map(w => w.word);

  return {
    type: 'wordDoor',
    config: {
      ...def.config,
      targetWord: {
        word: target.word,
        translation: target.translation,
        translationAr: target.translationAr,
        translationRu: target.translationRu,
      },
      distractors,
      // Override prompts with emoji hint for easy levels
      ...(isEasy ? {
        prompt: `Choose: ${target.emoji} ${target.word}`,
        promptHe: `${target.emoji} ${target.translation} :בחרו`,
        promptAr: `${target.emoji} ${getTranslation(target, 'ar')} :اختاروا`,
        promptRu: `Выберите: ${target.emoji} ${getTranslation(target, 'ru')}`,
      } : {}),
    },
  };
}

// --- Listen Find ---

function adaptListenFind(def, childLevel, uiLang) {
  const words = getLevelWords(childLevel);
  if (words.length < 4) return def;

  const rounds = childLevel <= 2 ? 3 : (def.config?.rounds || 4);
  const poolSize = Math.max(rounds + 2, 6);
  const selected = pickRandom(words, Math.min(poolSize, words.length));

  return {
    type: 'listenFind',
    config: {
      ...def.config,
      words: selected.map(w => ({
        word: w.word,
        translation: w.translation,
        translationAr: w.translationAr,
        translationRu: w.translationRu,
        emoji: w.emoji,
      })),
      rounds,
    },
  };
}

// --- Spell Bridge ---

function adaptSpellBridge(def, childLevel, uiLang) {
  const words = getLevelWords(childLevel);

  // Filter by word length based on level
  const maxLen = childLevel <= 2 ? 3 : childLevel === 3 ? 4 : 5;
  const eligible = words.filter(w => w.word.length <= maxLen);
  if (eligible.length === 0) return def;

  const target = pickRandom(eligible, 1)[0];
  const trans = getTranslation(target, uiLang);

  return {
    type: 'spellBridge',
    config: {
      ...def.config,
      targetWord: {
        word: target.word,
        translation: target.translation,
        translationAr: target.translationAr,
        translationRu: target.translationRu,
      },
      hint: `Spell the word: ${target.emoji}`,
      hintHe: `${target.emoji} :איייתו את המילה`,
      hintAr: `${target.emoji} :تهجّوا الكلمة`,
      hintRu: `Произнесите слово по буквам: ${target.emoji}`,
    },
  };
}

// --- Boss ---

function adaptBoss(def, childLevel, uiLang) {
  const isEasy = childLevel <= 2;
  const originalRounds = def.config?.rounds || [];

  // Easy: 2 rounds, only multipleChoice + listenFind (no spelling)
  if (isEasy) {
    const easyTypes = ['multipleChoice', 'listenFind'];
    const rounds = originalRounds
      .filter(r => easyTypes.includes(r.type))
      .slice(0, 2);

    // If not enough rounds, create them
    while (rounds.length < 2) {
      rounds.push(rounds.length === 0
        ? { type: 'multipleChoice', config: { questions: [] } }
        : { type: 'listenFind', config: { words: [], rounds: 2 } }
      );
    }

    return {
      type: 'boss',
      config: {
        rounds: rounds.map(r => adaptExercise(r, childLevel, uiLang)),
      },
    };
  }

  // Hard: full 3 rounds with all exercise types
  return {
    type: 'boss',
    config: {
      rounds: originalRounds.map(r => adaptExercise(r, childLevel, uiLang)),
    },
  };
}
